import { NS } from "@ns";

export const activedClash = (ns: NS) => {
  const otherGangs = ns.gang.getOtherGangInformation();

  let minChance = 1; // start at 100%

  for (const gangName of Object.keys(otherGangs)) {
    const chance = ns.gang.getChanceToWinClash(gangName);
    minChance = Math.min(minChance, chance);
  }

  const threshold = 0.9;

  if (minChance >= threshold) {
    ns.print("Clashes ENABLED (safe).");
    ns.gang.setTerritoryWarfare(true);
  } else {
    ns.gang.setTerritoryWarfare(false);
  }
};
