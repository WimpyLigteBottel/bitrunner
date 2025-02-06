import { NS } from "@ns";
import { getTotalHashProduction } from "./production";
import { print } from "/util/HackConstants";


type HacknetCompontent = "CORES" | "RAM" | "LEVEL" | "CACHE" | "SERVER" | undefined

type UPGRADEPLAN = {
    index: number;
    cost: number;
    baseProduction: number;
    newProduction: number;
    best: HacknetCompontent
    profitability: number;
}


export async function executeUpgradeOfHackNodes(ns: NS) {
    let upgradePlan = findBestHacknetUpgrade(ns)

    if (upgradePlan == undefined || upgradePlan.best == undefined) {
        return
    }

    if (upgradePlan.cost > ns.getPlayer().money) {
        print(ns, `Can't afford ${upgradePlan.best} yet. It cost ${ns.formatNumber(upgradePlan.cost)}`)
        return
    }

    await upgrade(ns, upgradePlan)
}

async function upgrade(ns: NS, cheapestUpgradePlan: UPGRADEPLAN) {
    let production = getTotalHashProduction(ns)

    let isGeneratingMoreMoneyPerMinute = (production * 60) > cheapestUpgradePlan.profitability

    if (isGeneratingMoreMoneyPerMinute) {
        let nodeIndex = cheapestUpgradePlan.index

        switch (cheapestUpgradePlan?.best) {
            case "CORES":
                print(ns, `Upgraded CORE [node=${nodeIndex};succes=${ns.hacknet.upgradeCore(nodeIndex, 1)}]`, false)
                break;
            case "RAM":
                print(ns, `Upgraded RAM [node=${nodeIndex};success=${ns.hacknet.upgradeRam(nodeIndex, 1)}]`, false)
                break;
            case "LEVEL":
                print(ns, `Upgraded level [node=${nodeIndex};success=${ns.hacknet.upgradeLevel(nodeIndex, 1)}]`, false)
                break;
            case "CACHE":
                print(ns, `Upgraded CACHE [node=${nodeIndex};success=${ns.hacknet.upgradeCache(nodeIndex, 1)}]`, false)
                break;
            default:
                print(ns, `PURCHASED SERVER [success=${ns.hacknet.purchaseNode()}]`, false)
                return
        }

        let sleepduration = Math.ceil(cheapestUpgradePlan.cost / getTotalHashProduction(ns) * 1000)
        print(ns, `Sleeping till money is made back ${ns.tFormat(sleepduration)}`)
        // sleep untill i made the money back
        await ns.sleep(sleepduration)
    }

}

function evaluateServerUpgrade(ns: NS, index: number, type: "CORES" | "RAM" | "LEVEL"): UPGRADEPLAN {
    // Get upgrade costs
    let cost = Number.MAX_SAFE_INTEGER

    let node = ns.hacknet.getNodeStats(index);
    let mult = ns.getHacknetMultipliers().production; // Multiplier from Source-Files

    let baseProduction = ns.hacknet.getNodeStats(index).production
    let newProduction = baseProduction;


    if (type === "LEVEL") {
        cost = ns.hacknet.getLevelUpgradeCost(index, 1);
        cost *= 3 // this should theorically be roughly equal to ram
        newProduction *= ns.formulas.hacknetServers.hashGainRate(node.level + 1, node.ram, node.cores, mult);
    } else if (type === "RAM") {
        cost = ns.hacknet.getRamUpgradeCost(index, 1);
        newProduction *= ns.formulas.hacknetServers.hashGainRate(node.level, node.ram * 2, node.cores, mult);
    } else if (type === "CORES") {
        cost = ns.hacknet.getCoreUpgradeCost(index, 1);
        newProduction *= ns.formulas.hacknetServers.hashGainRate(node.level, node.ram, node.cores + 1, mult);
    }

    // Calculate profitability
    let profitability = cost / (newProduction - baseProduction);


    return { index, best: type, profitability, cost, baseProduction, newProduction };
}

function findBestHacknetUpgrade(ns: NS) {
    let bestUpgrade: UPGRADEPLAN = {
        index: 0,
        cost: Number.MAX_VALUE,
        baseProduction: 0,
        newProduction: 0,
        best: undefined,
        profitability: 0,
    }

    let numNodes = ns.hacknet.numNodes();
    for (let i = 0; i < numNodes; i++) {

        // Evaluate upgrades
        let upgrades = [
            evaluateServerUpgrade(ns, i, "LEVEL"),
            evaluateServerUpgrade(ns, i, "RAM"),
            evaluateServerUpgrade(ns, i, "CORES"),
        ];

        // Find best upgrade
        for (let upgrade of upgrades) {
            if (upgrade.cost < bestUpgrade.cost) {
                bestUpgrade = upgrade;
            }
        }
    }

    return bestUpgrade;
}
