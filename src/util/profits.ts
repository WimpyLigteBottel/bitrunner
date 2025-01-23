import { NS } from "@ns";
import { findAllServers } from "./FindAllServers";
import { getAvailiableRam, getTotalCostThreads } from "./HackThreadUtil";
import { BATCH_DELAY, print } from "./HackConstants";


export interface ServerMoneyStats {
    server: string;
    hackThreads: number;
    growThreads: number;
    weakenThreads1: number;
    weakenThreads2: number;
    fullCycleTime: number;
    moneyPerCycle: number;
    moneyPerSecond: number;
    prepped: boolean;
    totalRamCost: number;
    percentage: number;
}


function disableLogs(ns: NS) {
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("scan")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerSecurityLevel")
}

export async function main(ns: NS) {
    disableLogs(ns)

    let stats: ServerMoneyStats[] = getHighestMoneyPerSecondDesc(ns)

    let counter = 1
    for (let stat of stats) {

        let preAppender = (stat: ServerMoneyStats) => {
            switch (stat.prepped) {
                case false:
                    return "ERROR"
                default:
                    return ""
            }

            return ""
        }

        let COLOR = preAppender(stat)

        // Logging for debugging
        ns.tprint(`${COLOR} Server ${counter++}: ${stat.server}`);
        ns.tprint(`${COLOR} Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.weakenThreads1 + stat.weakenThreads2}`);
        ns.tprint(`${COLOR} Total RAM Cost: ${stat.totalRamCost}`);
        ns.tprint(`${COLOR} Cycle Time: ${ns.tFormat(stat.fullCycleTime)} (s)`);
        ns.tprint(`${COLOR} Prepped: ${stat.prepped}`);
        ns.tprint(`${COLOR} hack constant: ${stat.percentage}`);
        ns.tprint(`${COLOR} Money Generated per Cycle: $${ns.formatNumber(stat.moneyPerCycle)}`);
        ns.tprint(`${COLOR} Money Generated per Second: $${ns.formatNumber(stat.moneyPerSecond)}`);
        ns.tprint("----------")
    }


    let totalMoneyPerSecond: string | number = stats.map(x => x.moneyPerSecond ?? 0).reduce((a, v) => a + v, 0)
    totalMoneyPerSecond = ns.formatNumber(totalMoneyPerSecond)
    ns.tprint("Total profit per second (without multiple batches) = " + totalMoneyPerSecond)
}


export function getHighestMoneyPerSecondDesc(ns: NS) {
    let servers = findAllServers(ns, false, false)
    let stats: ServerMoneyStats[] = []
    let highestPercentage = 0.001

    let currentServer = ns.getHostname()

    for (const server of servers) {
        highestPercentage = findBestHackConstantToGenerateMoney(ns, server.host, currentServer, 0.001, getAvailiableRam(ns, currentServer, 0))

        const first = calculateFullCycleMoneyPerSecond(ns, server.host, highestPercentage);

        if (first == undefined) {
            continue;
        }

        if (first.totalRamCost > getAvailiableRam(ns, currentServer, 2)) {
            ns.print(`cost too much ${first.totalRamCost}`)
            continue;
        }

        stats.push(first)
    }

    stats = stats.sort((a, b) => a.moneyPerSecond - b.moneyPerSecond)
    return stats
}

export function findBestHackConstantToGenerateMoney(ns: NS, hackTarget: string, host: string | undefined, startingPercentage: number, ramLimit: number): number {
    let highestPaid = 0
    let highestPercentage = startingPercentage + 0
    let lastRatio = null
    for (let x = 1; x < 6; x++) {
        highestPercentage = x / 100
        print(ns, `0 highestPercentage: ${highestPercentage}`, true)
        let first = calculateFullCycleMoneyPerSecond(ns, hackTarget, highestPercentage);
        if (first == undefined) {
            break;
        }

        if (first.totalRamCost >= ramLimit) {
            print(ns, `ERROR ${first.totalRamCost} cost too much: ${highestPercentage} for ${ramLimit}`, true)
            x--;
            highestPercentage = x / 100
            print(ns, `INFO startingPercentage changed  ${highestPercentage} `, true)
            break;
        }

        if (first.moneyPerSecond >= highestPaid && first.totalRamCost < ramLimit) {
            highestPaid = first.moneyPerSecond
            highestPercentage = highestPercentage
            lastRatio = first
        }
    }

    highestPercentage = Math.floor(highestPercentage * 100) / 100
    print(ns, `1 highestPercentage: ${highestPercentage}`, true)

    return highestPercentage
}

/**
 * Caluclate the full cycle ServerMoneyStats
 * @param ns 
 * @param server The server that is being hacked
 * @param percentageConstant the hacking percentage
 * @returns {ServerMoneyStats}
 */
function calculateFullCycleMoneyPerSecond(ns: NS, server: string, percentageConstant: number): ServerMoneyStats | undefined {
    const maxMoney = ns.getServerMaxMoney(server);
    const hackChance = ns.hackAnalyzeChance(server);

    // Exit if the server cannot generate money or hacking chance is too low
    if (maxMoney === 0 || hackChance === 0) {
        return undefined;
    }

    // Calculate hack threads needed to steal the desired fraction of money
    const hackAmount = maxMoney * percentageConstant;
    const hackThreads = Math.floor(ns.hackAnalyzeThreads(server, hackAmount));

    // Exit if hackThreads is invalid or too small
    if (hackThreads < 1 || hackThreads === Infinity) {
        return undefined;
    }

    // Calculate grow threads needed to regrow the stolen money
    const growMultiplier = maxMoney / (maxMoney - hackAmount); // Restore the stolen amount
    const growThreads = Math.ceil(ns.growthAnalyze(server, growMultiplier));

    // Calculate weaken threads to offset security increases
    const weakenThreads1 = Math.abs(Math.ceil(ns.weakenAnalyze(1) * hackThreads)); // Offset hack security increase
    const weakenThreads2 = Math.abs(Math.ceil(ns.weakenAnalyze(1) * growThreads)); // Offset grow security increase

    // Calculate operation times
    const weakenTime = ns.getWeakenTime(server);

    const fullCycleTime = weakenTime + BATCH_DELAY * 4;

    // Calculate money generated per cycle and per second
    const moneyPerCycle = hackAmount * hackChance; // Adjust for success probability
    const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000); // Convert ms to seconds

    const prepped = isPrepped(ns, server)

    return {
        server,
        hackThreads,
        growThreads,
        weakenThreads1,
        weakenThreads2,
        fullCycleTime,
        moneyPerCycle,
        moneyPerSecond,
        prepped,
        totalRamCost: getTotalCostThreads(ns, hackThreads, weakenThreads1 + weakenThreads2, growThreads),
        percentage: percentageConstant
    } as ServerMoneyStats;

}


/*
Check if the server is prepped
*/
export function isPrepped(ns: NS, server: string): boolean {
    const maxMoney = ns.getServerMaxMoney(server);
    return maxMoney == ns.getServerMoneyAvailable(server) && ns.getServerMinSecurityLevel(server) == ns.getServerSecurityLevel(server)
}