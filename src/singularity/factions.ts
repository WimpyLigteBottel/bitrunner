import { NS } from "@ns";
import { disableLogs } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();

  if (ns.getPlayer().money > 200_000 * 6) {
    travelToEachCity(ns);
  }

  // small buffer for faction invites
  await ns.sleep(1000);

  while (true) {
    let factions = ns.getPlayer().factions.filter((x) => {
      let isInGang = ns.gang.inGang();
      return (
        !isInGang || (isInGang && ns.gang.getGangInformation().faction != x)
      );
    });

    for (const faction of factions) {
      joinFactions(ns); // always run so that i am in factions
      clearSleevesIfAtFaction(ns, faction); // This will make sure no one is working for this faction

      // Early exit because i am already at needed faction rep
      if (atNeededFactionRep(ns, faction)) {
        continue;
      }

      let sleeveNumber = findSleeveNumberToAssign(ns, faction);

      if (sleeveNumber != undefined) {
        const worked =
          ns.sleeve.setToFactionWork(sleeveNumber, faction, "security") ||
          ns.sleeve.setToFactionWork(sleeveNumber, faction, "field") ||
          ns.sleeve.setToFactionWork(sleeveNumber, faction, "hacking");

        if (worked) {
          ns.print(
            `sleeve '${sleeveNumber}' Is working for faction ${faction}`
          );
          continue;
        }
      }

      const worked =
        ns.singularity.workForFaction(faction, "security", false) ||
        ns.singularity.workForFaction(faction, "field", false) ||
        ns.singularity.workForFaction(faction, "hacking", false);
      if (worked) {
        ns.print(`I am working for faction ${faction}`);
        break;
      }
    }

    //Work for atleast 1 min
    await ns.sleep(1000 * 60);
  }
}

function findSleeveNumberToAssign(ns: NS, faction: string): number | undefined {
  for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
    if (ns.sleeve.getTask(i)?.type != "FACTION") {
      return i;
    }
  }
  return undefined;
}

function clearSleevesIfAtFaction(ns: NS, faction: string) {
  for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
    let task = ns.sleeve.getTask(i);
    if (task?.type == "FACTION") {
      if (task.factionName == faction) ns.sleeve.setToIdle(i);
    }
  }
}

function travelToEachCity(ns: NS) {
  ns.singularity.travelToCity("Aevum");
  ns.singularity.travelToCity("Chongqing");
  ns.singularity.travelToCity("Sector-12");
  ns.singularity.travelToCity("New Tokyo");
  ns.singularity.travelToCity("Ishima");
  ns.singularity.travelToCity("Volhaven");
}

function joinFactions(ns: NS) {
  ns.singularity.checkFactionInvitations().forEach((x) => {
    ns.singularity.joinFaction(x);
  });
}

function hasAugment(ns: NS, augmentToCheck: string) {
  let installedAugments = ns.singularity.getOwnedAugmentations();

  return installedAugments.find((x) => x == augmentToCheck) != undefined;
}

function atNeededFactionRep(ns: NS, faction: string) {
  let augmentsNotOwned = ns.singularity
    .getAugmentationsFromFaction(faction)
    .filter((augment) => !hasAugment(ns, augment));

  // now check how much rep is needed to buy the remaining augments.
  // TODO: Check if i have the money and (mulitplier included to buy everything)
  // TODO: buy those augments then in reverse order from the most expensive to afford everything
  let currentRep = ns.singularity.getFactionRep(faction);
  let maxRep = 0;

  augmentsNotOwned.forEach((x) => {
    let req = ns.singularity.getAugmentationRepReq(x);
    maxRep = Math.max(maxRep, req);
  });

  return currentRep >= maxRep;
}
