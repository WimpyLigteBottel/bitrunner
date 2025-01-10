import { NS } from "@ns";
import { growScriptName, hackScriptName, weakenScriptName } from "./HackConstants";


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


export function calculateFullCycleThreadsV2(ns: NS, target: string, serverToRun: string, hackPercent: number = 0.1): {
    hackThreads: number;
    growThreads: number;
    weakenThreads: number;
    hackPercent: number;
} {
    // Get target server stats
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = Math.max(ns.getServerMoneyAvailable(target), 1);

    // Constants
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(1); // Security increase per hack thread
    const growSecurityIncrease = ns.growthAnalyzeSecurity(1); // Security increase per grow thread
    const weakenEffect = ns.weakenAnalyze(1); // Security reduction per weaken thread

    // 1. Calculate Hack Threads
    const hackAmount = maxMoney * hackPercent; // Amount to hack (10% of max money)
    const hackThreads = Math.min(
        Math.ceil(ns.hackAnalyzeThreads(target, hackAmount)), 
        Math.floor(maxMoney / 2) // Prevent excessive thread allocation
    );

    // 3. Calculate Grow Threads (to regrow hacked money)
    // 2. Calculate Grow Threads (to regrow hacked money)
    const growMultiplier = maxMoney / Math.max(availableMoney - hackAmount, 1);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));

    // 4. Calculate Weaken Threads (to offset security from growing)

    const totalSecurityIncrease = hackThreads * hackSecurityIncrease + growThreads * growSecurityIncrease;
    const weakenThreads = Math.ceil(totalSecurityIncrease / weakenEffect);

    let totalCost = getTotalCost(ns, hackThreads, hackScript) +
        getTotalCost(ns, weakenThreads, weakenScript) +
        getTotalCost(ns, growThreads, growScript)


    if (getAvailiableRam(ns, serverToRun) > totalCost) {
        return {
            hackThreads,
            growThreads,
            weakenThreads,
            hackPercent
        };
    }

    return {
        hackThreads: 0, growThreads: 0, weakenThreads: 0, hackPercent: hackPercent
    }
}

export function getTotalCost(ns: NS, thread: number, script: string): number {
    return ns.getScriptRam(script) * Math.abs(thread)
}

export function getTotalCostThreads(ns: NS, hackThreads: number, weakenThreads: number, growThreads: number,): number {

    let hackCost = getTotalCost(ns, hackThreads, hackScriptName)
    let growCost = getTotalCost(ns, growThreads, growScriptName)
    let weakenCost = getTotalCost(ns, weakenThreads, weakenScriptName)
    return hackCost + growCost + weakenCost
}

export function getAvailiableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName)
}
