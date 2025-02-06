import { NodeStats, NS } from "@ns";
import { print } from "/util/HackConstants";

export function getAllHackNodes(ns: NS): NodeStats[] {
    let nodes: NodeStats[] = []
    for (let x = 0; x < ns.hacknet.numNodes(); x++) {
        nodes.push(ns.hacknet.getNodeStats(x))
    }

    return nodes;
}

export function getTotalMoneyMade(ns: NS) {
    return getAllHackNodes(ns).map(x => x.totalProduction).reduce((a, v) => a + v, 0)
}


export function getTotalProduction(ns: NS) {
    return getAllHackNodes(ns).map(x => x.production).reduce((a, v) => a + v, 0)
}

export function getTotalHashProduction(ns: NS) {
    return calculateHashToMoney(ns, getTotalProduction(ns))
}

function calculateHashToMoney(ns: NS, hashPerSecond: number) {

    let upgradePerSecond = hashPerSecond / ns.hacknet.hashCost(`Sell for Money`)
    let moneyPerSecond = 1_000_000 * upgradePerSecond

    print(ns, `hashPerSecond ${hashPerSecond}`, true)
    print(ns, `upradePerSecond ${upgradePerSecond}`, true)
    print(ns, `moneyPerSecond ${ns.formatNumber(moneyPerSecond)}`, true)

    return moneyPerSecond
}



export function canPurchasehackNode(ns: NS) {
    return ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost()
}

export function getTotalSpent(ns: NS): number {
    const multipliers = ns.getHacknetMultipliers();

    // Extract multipliers for easy use
    const purchaseCostMult = multipliers.purchaseCost;
    const levelCostMult = multipliers.levelCost;
    const ramCostMult = multipliers.ramCost;
    const coreCostMult = multipliers.coreCost;

    let totalSpent = 0;

    // Constants for Hacknet node purchase
    const baseNodeCost = 1000 * purchaseCostMult; // Base cost of a Hacknet node
    const nodeMultiplier = 1.85; // Default multiplier for node costs

    // Helper functions for calculating upgrade costs
    function getLevelCost(level: number): number {
        let cost = 0;
        for (let i = 1; i < level; i++) {
            cost += ns.hacknet.getLevelUpgradeCost(0, i) * levelCostMult;
        }
        return cost;
    }

    function getRamCost(ram: number): number {
        let cost = 0;
        for (let i = 1; i < Math.log2(ram); i++) {
            cost += ns.hacknet.getRamUpgradeCost(0, i) * ramCostMult;
        }
        return cost;
    }

    function getCoreCost(cores: number): number {
        let cost = 0;
        for (let i = 1; i <= cores; i++) {
            cost += ns.hacknet.getCoreUpgradeCost(0, i) * coreCostMult;
        }
        return cost;
    }

    // Calculate costs for each Hacknet node
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        const stats = ns.hacknet.getNodeStats(i);
        totalSpent += getLevelCost(stats.level);
        totalSpent += getRamCost(stats.ram);
        totalSpent += getCoreCost(stats.cores);
    }

    // Add the cost of purchasing all nodes
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        totalSpent += baseNodeCost * Math.pow(nodeMultiplier, i);
    }

    return totalSpent;
}
