import { NS, SleevePerson } from "@ns";
import { openTail, disableLogs } from "/models/debug";

let map = new Map<Number, SleevePerson>();

const updateSleeveMap = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    let sleeve = ns.sleeve.getSleeve(x);
    map.set(x, sleeve);
  }

  return map;
};

const recoverAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    ns.sleeve.setToShockRecovery(x);
  }
};

const syncAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    ns.sleeve.setToSynchronize(x);
  }
};

export async function main(ns: NS): Promise<void> {
  openTail(ns);
  disableLogs(ns);

  updateSleeveMap(ns)
  recoverAllSleeves(ns);
  syncAllSleeves(ns)


}
