import { NS } from "@ns";

export const recoverAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    ns.sleeve.setToShockRecovery(x);
  }
};


export const isAllRecovered = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();

  for (let x = 0; x < all; x++) {
    if (ns.sleeve.getSleeve(x).shock > 0) {
      return false;
    }
  }

  return true;
};
