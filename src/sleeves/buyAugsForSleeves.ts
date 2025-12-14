import { NS } from "@ns";

export const buyAugsForSleeves = (ns: NS) => {
  for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
    ns.sleeve.getSleevePurchasableAugs(i).forEach((x) => {
      if (ns.sleeve.purchaseSleeveAug(i, x.name)) {
        ns.print(`Bought  sleeve ${i} the ${x.name}`)
      }
    });
  }
};
