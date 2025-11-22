import { NS } from "@ns";
import { getCustomServer } from "/util/serverCustomStats";
import { disableLogs } from "/models/debug";


let ns: NS;

let lastPurchaseTime: number | undefined = undefined
let lastTotalProduction: number;

const getHacknetServers = () => ns!.scan('home').filter(x => x.includes('hacknet')).map(x => getCustomServer(ns, x))
const canBuyNextNode = () => ns.hacknet.getPurchaseNodeCost() < ns.getPlayer().money && ns.hacknet.maxNumNodes() > ns.hacknet.numNodes()
const buyHashIfWithin = (percentage: number) => {
    while (ns.hacknet.numHashes() > ns.hacknet.hashCapacity() * (1 - percentage)) {
        ns.hacknet.spendHashes(Upgrades["Sell for Money"].name)
        // ns.print('Sold hashes!')
    }
}
const currentHashPerSecond = () => {
    let total = 0
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += ns.hacknet.getNodeStats(i).production
    }

    return total;
}

const totalProduction = () => {
    let total = 0
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += ns.hacknet.getNodeStats(i).totalProduction
    }
    return total;
}

const currentMoneyPerSecond = () => (currentHashPerSecond() / Upgrades["Sell for Money"].cost) * Upgrades["Sell for Money"].receive
const hashToMoneyPerSecond = (hashes: number) => hashes / Upgrades["Sell for Money"].cost * Upgrades["Sell for Money"].receive

const buyNextThing = () => {

    let canBuy = canBuyNextNode()
    let moneyMade = hashToMoneyPerSecond(totalProduction()) - lastTotalProduction

    if (canBuy && ns.hacknet.numNodes() == 0) {
        ns.hacknet.purchaseNode()
        lastPurchaseTime = Date.now()
        return
    }

    /// Improve this logic to use CHPS + past 60 seconds money to get idea if its worth it to buy upgrade.... Maybe use parameter for this...
    // aka... If i have made more money in the last 60 seconds than the cost its fine to buy... But then i need to do it in slide window timeframe

    let cheapest = getCheapestUpgrade()
    let mps = currentMoneyPerSecond()

    if (mps > cheapest.cost || moneyMade > cheapest.cost) {
        switch (cheapest.action) {
            case "level": {
                ns.hacknet.upgradeLevel(cheapest.nodeIndex, 1)
                updateLastProduction(cheapest.nodeIndex.toString(), cheapest.action)
                return;
            }
            case "ram": {
                ns.hacknet.upgradeRam(cheapest.nodeIndex, 1)
                updateLastProduction(cheapest.nodeIndex.toString(), cheapest.action)
                break;
            }
            case "core": {
                ns.hacknet.upgradeCore(cheapest.nodeIndex, 1)
                updateLastProduction(cheapest.nodeIndex.toString(), cheapest.action)
                break;
            }
            case "node": {
                ns.hacknet.purchaseNode()
                updateLastProduction(`${ns.hacknet.numNodes()}`, cheapest.action)
                return;
            }
            default: {
                // nothing
            }
        }
    }
}

type UpgradeCost = {
    nodeIndex: number,
    cost: number,
    action: "level" | "ram" | "core" | "node" | "none"
}

const getCheapestUpgrade = () => {
    let cheapestLevel = { nodeIndex: 0, cost: ns.hacknet.getLevelUpgradeCost(0, 1), action: 'level' } as UpgradeCost
    let cheapestRam = { nodeIndex: 0, cost: ns.hacknet.getRamUpgradeCost(0, 1), action: 'ram' } as UpgradeCost
    let cheapestCores = { nodeIndex: 0, cost: ns.hacknet.getCoreUpgradeCost(0, 1), action: 'core' } as UpgradeCost
    let purchaseCost = { nodeIndex: Infinity, cost: ns.hacknet.getPurchaseNodeCost(), action: 'node' } as UpgradeCost

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        if (ns.hacknet.getLevelUpgradeCost(i, 1) < cheapestLevel.cost) {
            cheapestLevel = { nodeIndex: i, cost: ns.hacknet.getLevelUpgradeCost(i, 1), action: 'level' }
        }

        if (ns.hacknet.getRamUpgradeCost(i, 1) < cheapestRam.cost) {
            cheapestRam = { nodeIndex: i, cost: ns.hacknet.getRamUpgradeCost(i, 1), action: 'ram' }
        }

        if (ns.hacknet.getCoreUpgradeCost(i, 1) < cheapestCores.cost) {
            cheapestCores = { nodeIndex: i, cost: ns.hacknet.getCoreUpgradeCost(i, 1), action: 'core' }
        }
    }


    let cheapest = { nodeIndex: Infinity, cost: Infinity, action: 'none' } as UpgradeCost

    if (cheapestLevel.cost <= cheapest.cost)
        cheapest = cheapestLevel

    if (cheapestRam.cost <= cheapest.cost)
        cheapest = cheapestRam

    if (cheapestCores.cost <= cheapest.cost)
        cheapest = cheapestCores

    if (purchaseCost.cost <= cheapest.cost)
        cheapest = purchaseCost

    return cheapest
}



const Upgrades = {
    "Sell for Money": {
        name: "Sell for Money",
        cost: 4, // hashes
        receive: 1_000_000
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
    10: "Company Favor"
}

const updateLastProduction = (name?: string, upgrade?: string) => {
    // ns.print(`money made since last update => ${ns.formatNumber(hashToMoneyPerSecond(totalProduction()) - (lastTotalProduction ?? 0))}`)
    ns.print(`purchased something? ${name} | ${upgrade}`)
    lastTotalProduction = hashToMoneyPerSecond(totalProduction())
    lastPurchaseTime = Date.now()
}

export async function main(tmpNs: NS): Promise<void> {
    ns = tmpNs
    ns.ui.openTail()
    disableLogs(ns)

    updateLastProduction()

    while (true) {
        await ns.sleep(100)

        buyHashIfWithin(0.90)
        buyNextThing()


    }
}



