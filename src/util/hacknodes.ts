import { NodeStats, NS } from "@ns";

type UPGRADEPLAN = {
  index: number;
  coreCost: number;
  ramCost: number;
  levelCost: number;
  serverCost: number;
  cheapest: "CORES" | "RAM" | "LEVEL" | "SERVER" | undefined
  lowestAmount: number;
}

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()


  // If i have no nodes and cant purchace exit
  if (ns.hacknet.numNodes() == 0 && !canPurchasehackNode(ns)) {
    ns.print("I cant buy anything")
    return undefined
  }

  // Try to buy the max amount of servers
  ns.print(`max node : ${ns.hacknet.maxNumNodes()}`)

  while (true) {
    await ns.sleep(100)

    let production = getTotalProduction(ns)

    let cheapestUpgradePlan = getCheapestUpgradeFromNodes(ns)

    if (cheapestUpgradePlan == undefined) {
      continue
    }

    if (production > cheapestUpgradePlan!.lowestAmount) {
      switch (cheapestUpgradePlan?.cheapest) {
        case "CORES":
          ns.hacknet.upgradeCore(cheapestUpgradePlan.index, 1)
          ns.print(`Upgraded CORE ${cheapestUpgradePlan.index}`)
          break;
        case "RAM":
          ns.hacknet.upgradeRam(cheapestUpgradePlan.index, 1)
          ns.print(`Upgraded RAM ${cheapestUpgradePlan.index}`)
          break;
        case "LEVEL":
          ns.hacknet.upgradeLevel(cheapestUpgradePlan.index, 1)
          ns.print(`Upgraded level ${cheapestUpgradePlan.index}`)
          break;
        case "SERVER":
          purchaseServer(ns)
          ns.print("PURCHASED SERVER")
          break
      }
    }
  }
}

function getCheapestUpgradeFromNodes(ns: NS): UPGRADEPLAN | undefined {
  let nodes = getAllHackNodes(ns)

  let cheapest = Number.MAX_VALUE;

  let serverToUpgrade;

  for (let x = 0; x < nodes.length; x++) {
    let plan = getUpgradePlan(ns, x)
    if (cheapest > plan.lowestAmount) {
      cheapest = plan.lowestAmount
      serverToUpgrade = plan;
    }
  }

  return serverToUpgrade
}

function getUpgradePlan(ns: NS, index: number) {
  const coreCost = ns.hacknet.getCoreUpgradeCost(index);
  const ramCost = ns.hacknet.getRamUpgradeCost(index);
  const levelCost = ns.hacknet.getLevelUpgradeCost(index);
  const serverCost = ns.hacknet.getPurchaseNodeCost();

  let lowest = Math.min(coreCost, ramCost, levelCost, serverCost)

  let upgradePlan: UPGRADEPLAN = {
    index,
    coreCost,
    ramCost,
    levelCost,
    serverCost,
    cheapest: undefined,
    lowestAmount: lowest,
  }

  if (lowest == coreCost) {
    upgradePlan = { ...upgradePlan, cheapest: "CORES" }
  } else if (lowest == ramCost) {
    upgradePlan = { ...upgradePlan, cheapest: "RAM" }
  } else if (lowest == levelCost) {
    upgradePlan = { ...upgradePlan, cheapest: "LEVEL" }
  } else {
    upgradePlan = { ...upgradePlan, cheapest: "SERVER" }
  }

  return upgradePlan
}

function getAllHackNodes(ns: NS): NodeStats[] {
  let nodes: NodeStats[] = []
  for (let x = 0; x < ns.hacknet.numNodes(); x++) {
    nodes.push(ns.hacknet.getNodeStats(x))
  }

  return nodes;
}


function getTotalMoneyMade(ns: NS) {
  return getAllHackNodes(ns).map(x => x.totalProduction).reduce((a, v) => a + v, 0)
}

function getTotalProduction(ns: NS) {
  return getAllHackNodes(ns).map(x => x.production).reduce((a, v) => a + v, 0)
}


function canPurchasehackNode(ns: NS) {
  return ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost()
}


function purchaseServer(ns: NS): NodeStats | undefined {
  let number = ns.hacknet.purchaseNode()

  return ns.hacknet.getNodeStats(number)
}

