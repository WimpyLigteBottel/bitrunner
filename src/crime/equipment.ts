import { NS } from "@ns";

const equipments = [
  "Baseball Bat",
  "Katana",
  "Glock 18C",
  "P90C",
  "Steyr AUG",
  "AK-47",
  "M15A10 Assault Rifle",
  "AWM Sniper Rifle",
  "Bulletproof Vest",
  "Full Body Armor",
  "Liquid Body Armor",
  "Graphene Plating Armor",
  "Ford Flex V20",
  "ATX1070 Superbike",
  "Mercedes-Benz S9001",
  "White Ferrari",
  "NUKE Rootkit",
  "Soulstealer Rootkit",
  "Demon Rootkit",
  "Hmap Node",
  "Jack the Ripper",
  "Bionic Arms",
  "Bionic Legs",
  "Bionic Spine",
  "BrachiBlades",
  "Nanofiber Weave",
  "Synthetic Heart",
  "Synfibril Muscle",
  "BitWire",
  "Neuralstimulator",
  "DataJack",
  "Graphene Bone Lacings",
];

export const suitUpGangMembers = (ns: NS) => {
  let equipmentAndCost = [];

  for (const equipment of equipments) {
    equipmentAndCost.push({
      cost: ns.gang.getEquipmentCost(equipment),
      name: equipment,
    });
  }

  equipmentAndCost = equipmentAndCost.toSorted((a, b) => a.cost - b.cost);

  for (const equipment of equipmentAndCost) {
    for (const name of ns.gang.getMemberNames()) {
      if (equipment.cost < ns.getPlayer().money) {
        ns.gang.purchaseEquipment(name, equipment.name);
      }
    }
  }
};
