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
    hack: {
        threads: number
        scriptName: string
    },
    weaken1: {
        threads: number,
        scriptName: string
    },
    grow: {
        scriptName: string
        threads: number
    },
    weaken2: {
        threads: number,
        scriptName: string
    }
} {
    let hackAmount = ns.getServerMaxMoney(target) * percentage; // Amount to hack (10% of max money)
    let hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, hackAmount)));
    hackThreads = Math.abs(hackThreads)

    const wgthreads = calculateGrowAndWeakenThreads(ns, target, percentage)

    return {
        hack: {
            threads: hackThreads,
            scriptName: hackScriptName
        },
        weaken1: {
            threads: calculateHackWeakenThreads(ns, hackThreads),
            scriptName: weakenScriptName
        },
        grow: {
            threads: wgthreads.growThreads,
            scriptName: growScriptName
        },
        weaken2: {
            threads: wgthreads.weakenThreads,
            scriptName: weakenScriptName
        }
    };
}

/**
 * Calculates the grow threads and weaken threads required after hacking.
 *
 * @param {NS} ns - The Netscript environment object.
 * @param {string} target - The target server's name.
 * @returns {Object} Threads needed for grow and weaken operations.
 */
export function calculateGrowAndWeakenThreads(ns: NS, target: string, percentage: number) {
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = maxMoney * (1 - percentage); // Money left after hacking

    // Growth Multiplier
    const growthMultiplier = maxMoney / availableMoney;

    // Grow Threads
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));

    // Security Increases
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);
    const weakenEffect = ns.weakenAnalyze(1);

    // Weaken Threads (to offset grow security increase)
    const weakenThreads = Math.ceil(growSecurityIncrease / weakenEffect);

    return { growThreads, weakenThreads };
}


/**
 * Calculates the grow threads and weaken threads required after hacking.
 *
 * @param {NS} ns - The Netscript environment object.
 * @param {string} target - The target server's name.
 * @returns {Object} Threads needed for grow and weaken operations.
 */
export function calculateHackWeakenThreads(ns: NS, threads: number) {
    const weakenEffect = ns.weakenAnalyze(1);

    // Weaken Threads (to offset grow security increase)
    const weakenThreads = Math.ceil(ns.hackAnalyzeSecurity(threads) / weakenEffect);

    return weakenThreads;
}



/*

It should generate as follows


BATCH 1
--------------hhhhhhhhhh
wwwwwwwwwwwwwwwwwwwwwwwww
-----------ggggggggggggggg
--WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 2
------------------hhhhhhhhhh
----wwwwwwwwwwwwwwwwwwwwwwwww
---------------ggggggggggggggg
------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 3
----------------------hhhhhhhhhh
--------wwwwwwwwwwwwwwwwwwwwwwwww
-------------------ggggggggggggggg
----------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 4
--------------------------hhhhhhhhhh
------------wwwwwwwwwwwwwwwwwwwwwwwww
-----------------------ggggggggggggggg
--------------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 5
------------------------------hhhhhhhhhh
----------------wwwwwwwwwwwwwwwwwwwwwwwww
---------------------------ggggggggggggggg
------------------WWWWWWWWWWWWWWWWWWWWWWWWW

*/