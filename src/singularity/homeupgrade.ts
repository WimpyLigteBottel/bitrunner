import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  upgradeHomeRam(ns);
  upgradeHomeCores(ns);
}

const upgradeHomeRam = (ns: NS) => {
  while (true) {
    if (ns.getPlayer().money > ns.singularity.getUpgradeHomeRamCost()) {
      ns.singularity.upgradeHomeRam();
    } else {
      break;
    }
  }
};

const upgradeHomeCores = (ns: NS) => {
  while (true) {
    if (ns.getPlayer().money > ns.singularity.getUpgradeHomeCoresCost()) {
      ns.singularity.upgradeHomeCores();
    } else {
      break;
    }
  }
};
