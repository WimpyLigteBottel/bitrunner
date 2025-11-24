import { NS } from "@ns";
import { disableLogs } from "/models/debug";

let ns: NS;

let lastPurchaseTime: number | undefined = undefined;
let lastTotalProduction: number;

const canBuyNextNode = () =>
  ns.hacknet.getPurchaseNodeCost() < ns.getPlayer().money &&
  ns.hacknet.maxNumNodes() > ns.hacknet.numNodes();

const currentHashPerSecond = () => {
  let total = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    total += ns.hacknet.getNodeStats(i).production;
  }

  return total;
};

const totalProduction = () => {
  let total = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    total += ns.hacknet.getNodeStats(i).totalProduction;
  }
  return total;
};

const paybackSeconds = (cost: number, gain: number) => {
  if (gain <= 0) return Infinity;

  return cost / hashToMoneyPerSecond(gain);
};

const deltaProduction = (
  node: number,
  type: "level" | "ram" | "core" | "node" | "none"
) => {
  const nodeStat = ns.hacknet.getNodeStats(node);
  const before = nodeStat.production;

  const hacknetServers = ns.formulas.hacknetServers;

  if (type == "node" || type == "none") {
    return {
      production: hacknetServers.hashGainRate(1, 0, 1, 1),
      cost: hacknetServers.hacknetServerCost(ns.hacknet.numNodes() + 1),
    };
  }

  let level =
    hacknetServers.hashGainRate(
      nodeStat.level + 1,
      nodeStat.ramUsed ?? 0,
      nodeStat.ram,
      nodeStat.cores
    ) ?? 0;
  let ram =
    hacknetServers.hashGainRate(
      nodeStat.level,
      nodeStat.ramUsed ?? 0,
      nodeStat.ram * 2,
      nodeStat.cores
    ) ?? 0;
  let core =
    hacknetServers.hashGainRate(
      nodeStat.level,
      nodeStat.ramUsed ?? 0,
      nodeStat.ram,
      nodeStat.cores + 1
    ) ?? 0;

  // simulate the upgrade
  if (type === "level")
    return {
      production: before - level,
      cost: hacknetServers.levelUpgradeCost(nodeStat.level),
    };

  if (type === "ram")
    return {
      production: before - ram,
      cost: hacknetServers.ramUpgradeCost(nodeStat.ram),
    };

  return {
    production: before - core,
    cost: hacknetServers.coreUpgradeCost(nodeStat.cores),
  };
};

const currentMoneyPerSecond = () =>
  (currentHashPerSecond() / Upgrades["Sell for Money"].cost) *
  Upgrades["Sell for Money"].receive;

const hashToMoneyPerSecond = (hashes: number) =>
  (hashes / Upgrades["Sell for Money"].cost) *
  Upgrades["Sell for Money"].receive;

type UpgradeCost = {
  nodeIndex: number;
  cost: number;
  action: "level" | "ram" | "core" | "node" | "none";
  execute: () => void;
  payback?: number;
};

const getDefaultCheapestUpgrades = () => {
  let cheapestLevel = {
    nodeIndex: 0,
    cost: ns.hacknet.getLevelUpgradeCost(0, 1),
    action: "level",
    execute: () => {
      ns.hacknet.upgradeLevel(0, 1);
    },
  } as UpgradeCost;
  let cheapestRam = {
    nodeIndex: 0,
    cost: ns.hacknet.getRamUpgradeCost(0, 1),
    action: "ram",
    execute: () => {
      ns.hacknet.upgradeRam(0, 1);
    },
  } as UpgradeCost;
  let cheapestCores = {
    nodeIndex: 0,
    cost: ns.hacknet.getCoreUpgradeCost(0, 1),
    action: "core",
    execute: () => {
      ns.hacknet.upgradeCore(0, 1);
    },
  } as UpgradeCost;
  let purchaseCost = {
    nodeIndex: Infinity,
    cost: ns.hacknet.getPurchaseNodeCost(),
    action: "node",
    execute: () => ns.hacknet.purchaseNode(),
  } as UpgradeCost;

  return { cheapestLevel, cheapestRam, cheapestCores, purchaseCost };
};

const getCheapestUpgrade = () => {
  let { cheapestLevel, cheapestRam, cheapestCores, purchaseCost } =
    getDefaultCheapestUpgrades();

  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    if (ns.hacknet.getLevelUpgradeCost(i, 1) < cheapestLevel.cost) {
      cheapestLevel = {
        nodeIndex: i,
        cost: ns.hacknet.getLevelUpgradeCost(i, 1),
        action: "level",
        execute: () => {
          ns.hacknet.upgradeLevel(i, 1);
          updateLastProduction(`${i}`, "level");
        },
      };
    }

    if (ns.hacknet.getRamUpgradeCost(i, 1) < cheapestRam.cost) {
      cheapestRam = {
        nodeIndex: i,
        cost: ns.hacknet.getRamUpgradeCost(i, 1),
        action: "ram",
        execute: () => {
          ns.hacknet.upgradeRam(i, 1);
          updateLastProduction(`${i}`, "ram");
        },
      };
    }

    if (ns.hacknet.getCoreUpgradeCost(i, 1) < cheapestCores.cost) {
      cheapestCores = {
        nodeIndex: i,
        cost: ns.hacknet.getCoreUpgradeCost(i, 1),
        action: "core",
        execute: () => {
          ns.hacknet.upgradeCore(i, 1);
          updateLastProduction(`${i}`, "core");
        },
      };
    }
  }

  let cheapest = {
    nodeIndex: Infinity,
    cost: Infinity,
    action: "none",
  } as UpgradeCost;

  if (cheapestLevel.cost <= cheapest.cost) cheapest = cheapestLevel;

  if (cheapestRam.cost <= cheapest.cost) cheapest = cheapestRam;

  if (cheapestCores.cost <= cheapest.cost) cheapest = cheapestCores;

  if (purchaseCost.cost <= cheapest.cost) cheapest = purchaseCost;

  return cheapest;
};

const getBestUpgrade = () => {
  let servers = [];

  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    const nodeStat = ns.hacknet.getNodeStats(i);

    let level = deltaProduction(i, "level");
    let ram = deltaProduction(i, "ram");
    let core = deltaProduction(i, "core");

    let levelpb = paybackSeconds(level.cost, level.production);
    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getLevelUpgradeCost(i, 1),
      action: "level",
      execute: () => {
        ns.hacknet.upgradeLevel(i, 1);
        updateLastProduction(`${i}`, "level");
      },
      payback: levelpb,
    } as UpgradeCost);

    let rampb = paybackSeconds(ram.cost, ram.production);
    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getRamUpgradeCost(i, 1),
      action: "ram",
      execute: () => {
        ns.hacknet.upgradeRam(i, 1);
        updateLastProduction(`${i}`, "ram");
      },
      payback: rampb,
    } as UpgradeCost);

    let corepb = paybackSeconds(core.cost, core.production);
    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getCoreUpgradeCost(i, 1),
      action: "core",
      execute: () => {
        ns.hacknet.upgradeCore(i, 1);
        updateLastProduction(`${i}`, "core");
      },
      payback: corepb,
    } as UpgradeCost);
  }

  // servers = servers.toSorted((a, b) => a.payback! - b.payback!); //ASC
  servers = servers.toSorted((b, a) => a.payback! - b.payback!); //DESC

  return servers.pop()!;
};

const Upgrades = {
  "Sell for Money": {
    name: "Sell for Money",
    cost: 4, // hashes
    receive: 1_000_000,
  },
  1: "Sell for Corporation Funds",
  2: "Reduce Minimum Security",
  3: "Increase Maximum Money",
  4: "Improve Studying",
  5: "Improve Gym Training",
  6: "Exchange for Corporation Research",
  7: "Exchange for Bladeburner Rank",
  8: "Exchange for Bladeburner SP",
  9: "Generate Coding Contract",
  10: "Company Favor",
};

const updateLastProduction = (name?: string, upgrade?: string) => {
  // ns.print(`money made since last update => ${ns.formatNumber(hashToMoneyPerSecond(totalProduction()) - (lastTotalProduction ?? 0))}`)
  ns.print(`purchased something? ${name} | ${upgrade}`);
  lastTotalProduction = hashToMoneyPerSecond(totalProduction());
  lastPurchaseTime = Date.now();
};

export async function main(tmpNs: NS): Promise<void> {
  ns = tmpNs;
  ns.ui.openTail();
  disableLogs(ns);

  updateLastProduction();

  while (true) {
    await ns.sleep(100);
    buyNextThing();
  }
}

const buyNextThing = () => {
  let canBuy = canBuyNextNode();
  let moneyMade = hashToMoneyPerSecond(totalProduction()) - lastTotalProduction;

  if (canBuy && ns.hacknet.numNodes() == 0) {
    ns.hacknet.purchaseNode();
    lastPurchaseTime = Date.now();
    return;
  }

  /// Improve this logic to use CHPS + past 60 seconds money to get idea if its worth it to buy upgrade.... Maybe use parameter for this...
  // aka... If i have made more money in the last 60 seconds than the cost its fine to buy... But then i need to do it in slide window timeframe

  let upgrade = getCheapestUpgrade();
  let mps = currentMoneyPerSecond();
  let canAfford = upgrade.cost < ns.getPlayer().money;

  // ns.print("----------")
  // ns.print("WARN " + JSON.stringify(upgrade));
  // ns.print("ERROR " + JSON.stringify(getCheapestUpgrade()));
  if (canAfford)
    if (mps > upgrade.cost || moneyMade > upgrade.cost) {
      upgrade.execute();
    }
};
