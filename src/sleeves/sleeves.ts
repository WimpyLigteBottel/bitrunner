import { NS, SleevePerson } from "@ns";
import { openTail, disableLogs } from "/models/debug";
import { isAllSynced, syncAllSleeves } from "./sync";
import { isAllRecovered, recoverAllSleeves } from "./recover";
import { trainAllSleeves } from "./train";

let map = new Map<Number, SleevePerson>();


/** @param {NS} ns **/
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

  // Try not to loop this as to save RAM since this is quite expense

  while (true) {
    updateSleeveMap(ns);
    let isSynced = isAllSynced(ns);
    let isRecovered = isAllRecovered(ns);
    let inGang = ns.gang.inGang();

    ns.print({
      isSynced,
      isRecovered,
      inGang,
    });

    recoverAllSleeves(ns);
    syncAllSleeves(ns);
    trainAllSleeves(ns);


    respawnScript(ns);
    await ns.sleep(5000);
  }
}

const respawnScript = (ns: NS) => {
  if (ns.getServer("home").maxRam < 64) {
    let scriptName = ns.getScriptName();
    ns.scriptKill(scriptName, ns.getHostname());
    ns.spawn(scriptName, {
      threads: 1,
      temporary: true,
      spawnDelay: 10000,
    });
  }
};
