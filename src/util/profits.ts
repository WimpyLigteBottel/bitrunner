import { NS } from "@ns";
import { ALL_SERVERS } from "/models/Servers";
import { BUFFER } from "/models/Models";


export async function main(ns: NS): Promise<void> {
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('scan')
    ns.clearLog()
    ns.ui.openTail()
    let servers = ALL_SERVERS

    let stats = []

    for (const server of servers) {
        const first = calculateFullCycleMoneyPerSecond(ns, server, 0.99999);

        if (first == undefined) {
            continue;
        }

        if (first.moneyPerSecond != 0)
            stats.push(first)
    }

    stats = stats.toSorted((b, a) => a.moneyPerSecond - b.moneyPerSecond)
    stats = stats.slice(0, 5)

    for (let stat of stats) {
        // Logging for debugging
        ns.print(`Server: ${stat.server}`);
        ns.print(`Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.totalWeakenThreads}`);
        ns.print(`Total ram cost: ${stat.totalRamCost}`);
        ns.print(`Cycle Time: ${ns.tFormat(stat.fullCycleTime)} (s)`);
        ns.print(`Money Generated per Cycle: $${ns.formatNumber(stat.moneyPerCycle)}`);
        ns.print(`Money Generated per Second: $${ns.formatNumber(stat.moneyPerSecond)}`);
        ns.print("----------")
    }


}


/** @param {NS} ns **/
export function calculateFullCycleMoneyPerSecond(ns: NS, server: string, stealFraction: number) {
    const maxMoney = ns.getServerMaxMoney(server);
    const hackChance = ns.hackAnalyzeChance(server);

    if (maxMoney === 0 || hackChance === 0) return undefined;

    // Hack threads
    const hackAmount = maxMoney * stealFraction;
    let hackThreads = ns.hackAnalyzeThreads(server, hackAmount);
    if (!isFinite(hackThreads) || hackThreads < 1) return undefined;
    hackThreads = Math.ceil(hackThreads);

    // Grow threads
    const growMultiplier = maxMoney / (maxMoney - hackAmount);
    const growThreads = Math.ceil(ns.growthAnalyze(server, growMultiplier));

    // Weaken threads
    const weakenThreadsHack = Math.ceil((hackThreads * 0.002) / 0.05);
    const weakenThreadsGrow = Math.ceil((growThreads * 0.004) / 0.05);
    const totalWeakenThreads = weakenThreadsHack + weakenThreadsGrow;

    // Operation times
    const hackTime = ns.getHackTime(server);
    const growTime = ns.getGrowTime(server);
    const weakenTime = ns.getWeakenTime(server);

    // Correct full cycle time (weaken finishes last)
    const fullCycleTime = weakenTime + BUFFER;

    // Expected money per cycle
    const moneyPerCycle = hackAmount * hackChance;

    // Correct money per second
    const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000);

    return {
        server,
        hackThreads,
        growThreads,
        weakenThreadsHack,
        weakenThreadsGrow,
        totalWeakenThreads,
        fullCycleTime,
        moneyPerCycle,
        moneyPerSecond,
        totalRamCost: (hackThreads + growThreads + totalWeakenThreads) * 1.75
    };
}
