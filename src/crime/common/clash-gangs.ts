import { NS } from "@ns";

export const activedClash = (ns: NS) => {
  const otherGangs = ns.gang.getOtherGangInformation();
  const ownGang = ns.gang.getGangInformation();

  let minChance = 1; // start at 100%

  for (const gangName of Object.keys(otherGangs)) {
    const chance = ns.gang.getChanceToWinClash(gangName);
    const gang = ns.gang.getOtherGangInformation()[gangName];

    if (gang.territory != 0 && gangName != ownGang.faction) {
      minChance = Math.min(minChance, chance);
    }
  }

  const threshold = 0.9;

  if (minChance >= threshold) {
    ns.gang.setTerritoryWarfare(true);
  } else {
    ns.gang.setTerritoryWarfare(false);
  }
};
