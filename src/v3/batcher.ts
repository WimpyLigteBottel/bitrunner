import { NS } from "@ns";
import { growScriptName, hackScriptName, weakenScriptName } from "/util/HackConstants";

export enum TASK_NAME {
    w = "w",
    W = "W",
    h = "h",
    g = "g",
    o = "-"
}

export interface Task {
    time: number, // timeIt will take to execute
    delay: number, // that start delay of thread
    name: TASK_NAME, // Name of thread
    script: string,
    threads: number
};

export interface Batch {
    tasks: Task[]
    server: string;
    totalCost: number
}


/**
 * Calculates the required threads for a full hack-grow-weaken cycle.
 *
 * @param ns - The Netscript environment object.
 * @param target - The name of the target server.
 * @param hackPercent - Percentage of max money to hack.
 * @returns Object containing thread counts for hack, weaken1, grow, and weaken2.
 */
export function calculateFullCycleThreads(ns: NS, target: string, percentage: number, delay: number, previousDelay: number): {
    hack: Task,
    weaken1: Task,
    grow: Task,
    weaken2: Task
} {
    const hackTime = ns.getHackTime(target)
    const weakenTime = ns.getWeakenTime(target)
    const growTime = ns.getGrowTime(target)

    const hackThreads = calculateHackThreads(ns, target, percentage)
    const growThreads = calculateGrowThreads(ns, target, percentage)

    return {
        hack: {
            threads: hackThreads,
            script: hackScriptName,
            delay: weakenTime - hackTime - delay + previousDelay,
            time: hackTime,
            name: TASK_NAME.h
        },
        weaken1: {
            threads: calculateHackWeakenThreads(ns, hackThreads),
            script: weakenScriptName,
            delay: previousDelay,
            time: weakenTime,
            name: TASK_NAME.w
        },
        grow: {
            threads: growThreads,
            script: growScriptName,
            delay: weakenTime - growTime + delay + previousDelay,
            time: ns.getGrowTime(target),
            name: TASK_NAME.g
        },
        weaken2: {
            threads: calculateGrowWeakenThreads(ns, growThreads),
            script: weakenScriptName,
            delay: delay + delay + previousDelay,
            time: weakenTime,
            name: TASK_NAME.W
        }
    };
}


function calculateGrowThreads(ns: NS, target: string, percentage: number): number {
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = maxMoney * (1 - percentage); // Money left after hacking

    const growthMultiplier = maxMoney / availableMoney;
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));

    return growThreads;
}


function calculateHackWeakenThreads(ns: NS, threads: number) {
    return Math.ceil(ns.hackAnalyzeSecurity(threads) / ns.weakenAnalyze(1));
}

function calculateGrowWeakenThreads(ns: NS, growThreads: number) {
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);
    const weakenThreads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1));

    return weakenThreads;
}


function calculateHackThreads(ns: NS, target: string, percentage: number) {
    let hackAmount = ns.getServerMaxMoney(target) * percentage;
    let hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, hackAmount)));
    hackThreads = Math.abs(hackThreads)

    return hackThreads
}