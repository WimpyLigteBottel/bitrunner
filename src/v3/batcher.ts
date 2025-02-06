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
export function calculateFullCycleThreads(ns: NS, target: string, percentage: number): {
    hack: Task,
    grow: Task,
    weaken: Task
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
            delay: weakenTime - hackTime - 100,
            time: hackTime,
            name: TASK_NAME.h
        },
        grow: {
            threads: growThreads,
            script: growScriptName,
            delay: weakenTime - growTime - 50,
            time: growTime,
            name: TASK_NAME.g
        },
        weaken: {
            threads: calculateHackGrowWeakenThreads(ns, growThreads, hackThreads),
            script: weakenScriptName,
            delay: 0,
            time: weakenTime,
            name: TASK_NAME.W
        }
    };
}


function calculateGrowThreads(ns: NS, target: string, percentage: number): number {
    const server = ns.getServer(target)
    const maxMoney = ns.getServerMaxMoney(target);
    server.moneyAvailable = maxMoney * (1 - percentage)

    const growThreads = ns.formulas.hacking.growThreads(server, ns.getPlayer(), maxMoney, 1);

    return growThreads;
}


function calculateHackGrowWeakenThreads(ns: NS, growThreads: number, hackThreads: number) {
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);
    const weakenThreads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1)) + Math.ceil(ns.hackAnalyzeSecurity(hackThreads) / ns.weakenAnalyze(1));

    return weakenThreads;
}

function calculateHackThreads(ns: NS, target: string, percentage: number) {
    let hackAmount = ns.getServerMaxMoney(target) * percentage;
    let hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, hackAmount)));

    return hackThreads
}