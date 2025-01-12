import { NS } from "@ns";
import { findAllServers, HostObj } from "./FindAllServers";
import { getTotalCostThreads } from "./HackThreadUtil";
import { BATCH_DELAY } from "./HackConstants";


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


export async function main(ns: NS) {
    let servers = findAllServers(ns, false, false)

    let stats: ServerMoneyStats[] = await getHighestMoneyPerSecondDesc(ns, true)

    let counter = 1
    for (let stat of stats) {
        // Logging for debugging
        ns.tprint(`Server ${counter++}: ${stat.server}`);
        ns.tprint(`Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.weakenThreads1 + stat.weakenThreads2}`);
        ns.tprint(`Total RAM Cost: ${stat.totalRamCost}`);
        ns.tprint(`Cycle Time: ${ns.tFormat(stat.fullCycleTime)} (s)`);
        ns.tprint(`Prepped: ${stat.prepped}`);
        ns.tprint(`hack constant: ${stat.percentage}`);
        ns.tprint(`Money Generated per Cycle: $${ns.formatNumber(stat.moneyPerCycle)}`);
        ns.tprint(`Money Generated per Second: $${ns.formatNumber(stat.moneyPerSecond)}`);
        ns.tprint("----------")
    }


    let totalMoneyPerSecond = ns.formatNumber(stats.map(x => x.moneyPerSecond ?? 0).reduce((a, v) => a + v), 0)
    ns.tprint("Total profit per second (without multiple batches) = " + totalMoneyPerSecond)
    ns.tprint("Make sure your hackconstant is percentage = " + findBestHackConstantToGenerateMoney(ns, servers))
}


export async function getHighestMoneyPerSecondDesc(ns: NS, lowestValue: boolean) {
    let servers = findAllServers(ns, false, false)
    let stats: ServerMoneyStats[] = []

    let highestPercentage = findBestHackConstantToGenerateMoney(ns, servers)

    if (lowestValue) {
        highestPercentage = 0.01
    } else {
        highestPercentage = findBestHackConstantToGenerateMoney(ns, servers)
    }

    for (const server of servers) {
        const first = calculateFullCycleMoneyPerSecond(ns, server.host, highestPercentage);

        if (first == undefined) {
            continue;
        }

        stats.push(first)
    }

    stats = stats.sort((a, b) => a.moneyPerSecond - b.moneyPerSecond)
    return stats
}


function homeServerWithLowestRam(ns: NS): number {
    let lowestRam = Number.MAX_VALUE

    for (const server of findAllServers(ns, false, true)) {
        let ram = ns.getServerMaxRam(server.host)
        lowestRam = Math.min(ram, lowestRam)
    }

    return lowestRam
}


function findBestHackConstantToGenerateMoney(ns: NS, servers: HostObj[]): number {
    let highestPaid = 0
    let highestPercentage = 0
    let lowestRam = homeServerWithLowestRam(ns)

    outer:
    for (let x = 1; x < 1000; x++) {
        let stats = []
        let percentage = x / 1000
        for (const server of servers) {
            let first = calculateFullCycleMoneyPerSecond(ns, server.host, percentage);
            if (first == undefined) {
                continue;
            }
            if (first.totalRamCost > lowestRam) {
                // ns.tprint(`needs ram server:  ${first.totalRamCost}`)
                continue outer;
            }

            stats.push(first)
        }

        if (stats.length < 24) {
            continue
        }

        const totalMoneyPerSecond = stats.map(x => x.moneyPerSecond ?? 0).reduce((a, v) => a + v, 0)
        if (totalMoneyPerSecond > highestPaid) {
            highestPaid = totalMoneyPerSecond
            highestPercentage = percentage
        }
    }

    return highestPercentage
}

/** @param {NS} ns **/
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
    const weakenThreads1 = Math.ceil(ns.weakenAnalyze(1) * hackThreads); // Offset hack security increase
    const weakenThreads2 = Math.ceil(ns.weakenAnalyze(1) * growThreads); // Offset grow security increase

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