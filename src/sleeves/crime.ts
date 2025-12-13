import { CrimeType, NS } from "@ns";

export const recoverAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    let currentSleeve = ns.sleeve.getSleeve(x);

    ns.sleeve.setToCommitCrime(x,CrimeType.mug)

    ns.sleeve.getTask(x)
    if (currentSleeve.shock > 0) {
      ns.sleeve.setToShockRecovery(x);
    }
  }
};

export const isAllRecovered = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();

  for (let x = 0; x < all; x++) {
    let currentSleeve = ns.sleeve.getSleeve(x);

    if (currentSleeve.shock > 0) {
      return false;
    }
  }

  return true;
};
