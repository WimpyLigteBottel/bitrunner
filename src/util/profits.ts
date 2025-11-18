import { NS } from "@ns";
import { ALL_SERVERS } from "/models/Servers";


export async function main(ns: NS): Promise<void> {
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('scan')
    ns.clearLog()
    ns.ui.openTail()
    let servers = ALL_SERVERS

    let stats = []

    for (const server of servers) {
        const first = calculateFullCycleMoneyPerSecond(ns, server, 0.2);

        if (first == undefined) {
            continue;
        }

        if (first.moneyPerSecond != 0)
            stats.push(first)
    }

    stats = stats.toSorted((b, a) => a.moneyPerSecond - b.moneyPerSecond)
    // stats = stats.slice(0, 5)

    for (let stat of stats) {
        // Logging for debugging
        ns.print(`Server: ${stat.server}`);
        ns.print(`Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.weakenThreads1 + stat.weakenThreads2}`);
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

    // Exit if the server cannot generate money or hacking chance is too low
    if (maxMoney === 0 || hackChance === 0) {
        return undefined;
    }

    // Calculate hack threads needed to steal the desired fraction of money
    const hackAmount = maxMoney * stealFraction;
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
    const hackTime = ns.getHackTime(server);
    const growTime = ns.getGrowTime(server);
    const weakenTime = ns.getWeakenTime(server);

    // Full cycle time is the longest of all operations
    const fullCycleTime = Math.max(hackTime, growTime, weakenTime) + 50;

    // Calculate money generated per cycle and per second
    const moneyPerCycle = hackAmount * hackChance; // Adjust for success probability
    const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000); // Convert ms to seconds

    return {
        server,
        hackThreads,
        growThreads,
        weakenThreads1,
        weakenThreads2,
        fullCycleTime,
        moneyPerCycle,
        moneyPerSecond,
        totalRamCost: (hackThreads + growThreads + weakenThreads1 + weakenThreads2) * 1.75
    };

}
