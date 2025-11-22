import { NS } from "@ns";
import { ALL_SERVERS } from "/models/Servers";
import { BUFFER } from "/models/Models";


export async function main(ns: NS): Promise<void> {
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('scan')
    ns.clearLog()
    // ns.ui.openTail()
    let servers = ALL_SERVERS

    let stats: Stat[] = []

    for (const server of servers) {
        const first = findHighestPercentagePerServer(ns, server);

        if (first == undefined) {
            continue;
        }

        if (first.moneyPerSecond != 0 && first.server != undefined)
            stats.push(first)
    }

    stats = stats.toSorted((b, a) => a.moneyPerCycle - b.moneyPerCycle)

    for (let stat of stats) {
        // Logging for debugging
        // ns.print(`Hack Threads: ${stat.hackThreads}, Grow Threads: ${stat.growThreads}, Weaken Threads: ${stat.totalWeakenThreads}`);
        // ns.print(`Total ram cost: ${stat.totalRamCost}`);
        // ns.print(`Cycle Time: ${ns.tFormat(stat.fullCycleTime)} (s)`);
        // ns.print(`Money Generated per Cycle: $${ns.formatNumber(stat.moneyPerCycle)}`);
        ns.print(`Server: ${stat.server} -> Money p/s: $${ns.formatNumber(stat.moneyPerSecond)}`);
        // ns.print(`Percentage: ${ns.formatNumber(stat.percentage)}`);
    }

    ns.write("profits.txt", toPretty(stats), "w")
}


function findHighestPercentagePerServer(ns: NS, server: string) {

    let highestAmount = 1
    let low = 0.00001;     // definitely fits
    let high = 0.99999;    // probably too big, but serves as the upper bound

    let bestBatch: Stat | undefined;

    try {
        bestBatch = calculateFullCycleMoneyPerSecond(ns, server, low);
        // 20–30 iterations = enough precision
        for (let i = 0; i < 60; i++) {
            let mid: string | number = ((low + high) / 2).toFixed(3);
            mid = parseFloat(mid)
            const batch = calculateFullCycleMoneyPerSecond(ns, server, mid);

            if (batch == undefined)
                break;

            if (batch.moneyPerSecond >= highestAmount) {
                bestBatch = batch;
                highestAmount = batch?.moneyPerSecond!
                low = mid;
            } else {
                // mid too big -> reduce
                high = mid;
            }
        }
    } catch (er) {
        ns.print('ERROR ' + er)
    }


    return { ...bestBatch! } as Stat
}


/** @param {NS} ns **/
export function calculateFullCycleMoneyPerSecond(ns: NS, server: string, stealFraction: number): Stat | undefined {
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
        totalWeakenThreads,
        fullCycleTime: ns.tFormat(fullCycleTime),
        moneyPerCycle: moneyPerCycle,
        moneyPerCycleC: ns.formatNumber(moneyPerCycle),
        moneyPerSecond: moneyPerSecond,
        moneyPerSecondC: ns.formatNumber(moneyPerSecond),
        totalRamCost: (hackThreads + growThreads + totalWeakenThreads) * 1.75
    } as Stat;
}


type Stat = {
    server: string,
    hackThreads: number,
    growThreads: number,
    totalWeakenThreads: number,
    fullCycleTime: string,
    moneyPerCycle: number,
    moneyPerCycleC: string,
    moneyPerSecond: number;
    moneyPerSecondC: string;
    totalRamCost: number;
}

function toPretty(stats: Stat[]) {
    let pretty = stats.map(x => {
        return { server: x.server, moneyPerCycle: x.moneyPerCycleC, totalRamCost: x.totalRamCost }
    });
    return JSON.stringify(pretty, null, 1)
}
