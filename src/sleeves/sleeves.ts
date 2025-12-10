import { NS, SleevePerson } from "@ns";
import { openTail, disableLogs } from "/models/debug";
import { isAllSynced, syncAllSleeves } from "./sync";
import { isAllRecovered, recoverAllSleeves } from "./recover";
import { trainAllSleevesForMugging } from "./train";

let map = new Map<Number, SleevePerson>();

const updateSleeveMap = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    let sleeve = ns.sleeve.getSleeve(x);
    map.set(x, sleeve);
  }

  return map;
};

export async function main(ns: NS): Promise<void> {
  openTail(ns);
  disableLogs(ns);
  updateSleeveMap(ns);

  // Try not to loop this as to save RAM since this is quite expense

  let isSynced = isAllSynced(ns);
  let isRecovered = isAllRecovered(ns);
  let inGang = ns.gang.inGang();

  // Prepare sleeves first
  if (!isSynced) {
    syncAllSleeves(ns);
  } else if (!isRecovered) {
    recoverAllSleeves(ns);
  } else if (isSynced && isRecovered) {
    ns.tprint("not in gang, YOU SHOULD GET IN A GANG QUICKLY");

    trainAllSleevesForMugging(ns);

    //TODO: Starting mugging people
  }
  let scriptName = ns.getScriptName();
  ns.scriptKill(scriptName, ns.getHostname());
  ns.spawn(scriptName, {
    threads: 1,
    temporary: true,
    spawnDelay: 10000,
  });
}
