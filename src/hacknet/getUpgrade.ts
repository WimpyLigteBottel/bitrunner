import { NS } from "@ns";
import { deltaProduction } from "./deltaProduction";
import { currentMoneyPerSecond, paybackSeconds } from "./hash-calculations";
import { UpgradeCost } from "./models";

export const getBestUpgrade = (ns: NS) => {
  let servers = [];
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    let level = deltaProduction(ns, i, "level");
    let ram = deltaProduction(ns, i, "ram");
    let core = deltaProduction(ns, i, "core");
    let node = deltaProduction(ns, i, "node");

    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getPurchaseNodeCost(),
      action: "node",
      execute: () => {
        ns.hacknet.purchaseNode();
      },
      // shortcut to buy node if it can be paid back within 60sec
      payback:
        currentMoneyPerSecond(ns) * 60 > node.cost
          ? 0
          : paybackSeconds(node.cost, node.production),
    } as UpgradeCost);

    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getLevelUpgradeCost(i, 1),
      action: "level",
      execute: () => {
        ns.hacknet.upgradeLevel(i, 1);
      },
      payback: paybackSeconds(level.cost, level.production),
    } as UpgradeCost);

    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getRamUpgradeCost(i, 1),
      action: "ram",
      execute: () => {
        ns.hacknet.upgradeRam(i, 1);
      },
      payback: paybackSeconds(ram.cost, ram.production),
    } as UpgradeCost);

    servers.push({
      nodeIndex: i,
      cost: ns.hacknet.getCoreUpgradeCost(i, 1),
      action: "core",
      execute: () => {
        ns.hacknet.upgradeCore(i, 1);
      },
      payback: paybackSeconds(core.cost, core.production),
    } as UpgradeCost);
  }

  // servers = servers.toSorted((a, b) => a.payback! - b.payback!); //ASC
  servers = servers.toSorted((b, a) => a.payback! - b.payback!); //DESC

  return servers.pop()!;
};

export const getCheapestUpgrade = (ns: NS) => {
  let { cheapestLevel, cheapestRam, cheapestCores, purchaseCost } =
    getDefaultUpgrades(ns);

  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    if (ns.hacknet.getLevelUpgradeCost(i, 1) < cheapestLevel.cost) {
      cheapestLevel = {
        nodeIndex: i,
        cost: ns.hacknet.getLevelUpgradeCost(i, 1),
        action: "level",
        execute: () => {
          ns.hacknet.upgradeLevel(i, 1);
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

export const getDefaultUpgrades = (ns: NS) => {
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
