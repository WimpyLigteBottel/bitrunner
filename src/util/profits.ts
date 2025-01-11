import { NS } from "@ns";
import { findAllServers } from "./FindAllServers";

export async function main(ns: NS) {
    ns.tail()
    let servers = findAllServers(ns, false, false)


    let stats = []

    for (const server of servers) {
        const first = calculateFullCycleMoneyPerSecond(ns, server.host);

        if (first == undefined) {
            continue;
        }

        if (first.moneyPerSecond != 0)
            stats.push(first)
    }

    stats = stats.sort((a, b) => a.moneyPerSecond - b.moneyPerSecond)

    for (let stat of stats) {
        // Logging for debugging
        ns.tprint(`Server: ${stat.server}`);
        ns.tprint(`Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.weakenThreads1 + stat.weakenThreads2}`);
        ns.tprint(`Cycle Time: ${ns.tFormat(stat.fullCycleTime)} (s)`);
        ns.tprint(`Money Generated per Cycle: $${ns.formatNumber(stat.moneyPerCycle)}`);
        ns.tprint(`Money Generated per Second: $${ns.formatNumber(stat.moneyPerSecond)}`);
        ns.tprint("----------")
    }
}

/** @param {NS} ns **/
export function calculateFullCycleMoneyPerSecond(ns: NS, server: string, stealFraction: number = 0.1) {
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
    };

}
