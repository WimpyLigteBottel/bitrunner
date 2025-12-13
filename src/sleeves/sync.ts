import { NS } from "@ns";

/**
 * Checks if all sleeves are synced
 * @param ns
 * @returns boolean
 */
export const isAllSynced = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    if (ns.sleeve.getSleeve(x).sync < 100) {
      return false;
    }
  }

  return true;
};

/**
 * Syncs all sleeves
 *
 * @param ns
 * @returns
 */
export const syncAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    if (ns.sleeve.getSleeve(x).sync != 100) {
      ns.sleeve.setToSynchronize(x);
    }
  }
};