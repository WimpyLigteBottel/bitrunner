import { NS } from "@ns";
import { disableLogs } from "/models/debug";

type AugDetails = {
  name: string;
  price: number;
  faction: string;
};

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();

  let augs: AugDetails[] = [];

  for (const faction of ns.getPlayer().factions) {
    let augments = ns.singularity
      .getAugmentationsFromFaction(faction)
      .map((x) => {
        let augDetail = {
          name: x,
          price: ns.singularity.getAugmentationPrice(x),
          faction: faction,
        };

        return augDetail;
      })
      .filter((x) => isPurchable(ns, x));

    if (augments.length > 0) augs = [...augs, ...augments];
  }

  augs = augs.toSorted((a, b) => a.price - b.price);

  if (augs.length < 1) return;

  let choice = await ns.prompt("\nDo you wana buy augments?", {
    type: "boolean",
  });

  if (!choice) {
    return;
  }

  while (augs.length > 0) {
    let { faction, name, price } = augs.pop()!;

    let bought = ns.singularity.purchaseAugmentation(faction, name);

    // update prices and remove 'augements' that is purchased
    debugger;

    augs = augs
      .filter((x) => bought && x.name != name)
      .map((x) => updateAugmentPrice(ns, x))
      .toSorted((a, b) => a.price - b.price);

    await ns.sleep(100);
  }
}

const isPurchable = (ns: NS, augment: AugDetails) => {
  let owns = ns.singularity
    .getOwnedAugmentations()
    .some((y) => y == augment.name);

  if (owns) return false;

  let hasRequiredRep =
    ns.singularity.getAugmentationRepReq(augment.name) <
    ns.singularity.getFactionRep(augment.faction);

  let canBuy =
    ns.singularity.getAugmentationPrice(augment.name) < ns.getPlayer().money;

  return canBuy && hasRequiredRep;
};

const updateAugmentPrice = (ns: NS, augment: AugDetails) => {
  return {
    ...augment,
    price: ns.singularity.getAugmentationPrice(augment.name),
  };
};
