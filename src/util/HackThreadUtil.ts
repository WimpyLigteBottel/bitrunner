import { NS } from "@ns";


const hackScript = "../v1/hack.js";
const weakenScript = "../v1/weaken.js";
const growScript = "../v1/grow.js";


/** 
 * Calculates the required threads for hacking, weakening, and growing a server to max money 
 * while keeping security at its base level.
 * 
 * @param ns - The Netscript environment object provided by Bitburner.
 * @param target - The name of the target server.
 * @returns Object containing thread counts for hack, weaken1, grow, and weaken2.
 */
export function calculateFullCycleThreads(ns: NS, target: string): {
    hackThreads: number;
    weakenThreads1: number;
    growThreads: number;
    weakenThreads2: number;
} {
    // Get target server stats
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = ns.getServerMoneyAvailable(target) || 1; // Avoid divide-by-zero

    // Constants
    const hackPercent = 0.5; // Hack 50% of available money
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(1); // Security increase per hack thread
    const growSecurityIncrease = ns.growthAnalyzeSecurity(1); // Security increase per grow thread
    const weakenEffect = ns.weakenAnalyze(1); // Security reduction per weaken thread

    // 1. Calculate Hack Threads
    const hackAmount = maxMoney * hackPercent; // Amount to hack (10% of max money)
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, hackAmount));

    // 2. Calculate Weaken Threads (to offset security from hacking)
    const weakenThreads1 = Math.ceil((hackThreads * hackSecurityIncrease) / weakenEffect);

    // 3. Calculate Grow Threads (to regrow hacked money)
    const growthMultiplier = maxMoney / (availableMoney - hackAmount);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));

    // 4. Calculate Weaken Threads (to offset security from growing)
    const weakenThreads2 = Math.ceil((growThreads * growSecurityIncrease) / weakenEffect);

    return {
        hackThreads,
        weakenThreads1,
        growThreads,
        weakenThreads2
    };
}


export function calculateFullCycleThreadsV2(ns: NS, target: string, serverToRun: string, hackPercent: number = 0.1, counter: number = 3000): {
    hackThreads: number;
    weakenThreads1: number;
    growThreads: number;
    weakenThreads2: number;
} {
    if (counter < 1) {
        return {
            hackThreads: 0, weakenThreads1: 0, growThreads: 0, weakenThreads2: 0
        }
    }
    // Get target server stats
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = ns.getServerMoneyAvailable(target);

    // Constants
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(1); // Security increase per hack thread
    const growSecurityIncrease = ns.growthAnalyzeSecurity(1); // Security increase per grow thread
    const weakenEffect = ns.weakenAnalyze(1); // Security reduction per weaken thread

    // 1. Calculate Hack Threads
    const hackAmount = maxMoney * hackPercent; // Amount to hack (10% of max money)
    const hackThreads = Math.abs(Math.ceil(ns.hackAnalyzeThreads(target, hackAmount)));

    // 3. Calculate Grow Threads (to regrow hacked money)
    const growthMultiplier = Math.abs(maxMoney / hackAmount);

    const growThreads = Math.abs(Math.ceil(ns.growthAnalyze(target, growthMultiplier)));

    // 4. Calculate Weaken Threads (to offset security from growing)
    const weakenThreads2 = Math.abs(Math.ceil(((growThreads * growSecurityIncrease) + (hackSecurityIncrease * hackSecurityIncrease)) / weakenEffect));


    let totalCost = getTotalCost(ns, hackThreads, hackScript) +
        getTotalCost(ns, weakenThreads2, weakenScript) +
        getTotalCost(ns, growThreads, growScript) +
        getTotalCost(ns, weakenThreads2, weakenScript)


    if (getAvailiableRam(ns, serverToRun) > totalCost) {
        return {
            hackThreads,
            weakenThreads1: weakenThreads2,
            growThreads,
            weakenThreads2
        };
    }

    return calculateFullCycleThreadsV2(ns, target, serverToRun, hackPercent / 2, counter - 1)
}

export function getTotalCost(ns: NS, thread: number, script: string): number {
    return ns.getScriptRam(script) * Math.abs(thread)
}

export function getAvailiableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName)
}
