import { NS } from "@ns";
import { BATCH_DELAY, growScriptName, HACK_PERCENTAGE, hackScriptName, weakenScriptName } from "/util/HackConstants";


const delay: number = 50 // milisecond delay to avoid problems

enum TASK_NAME {
    w = "w",
    W = "W",
    h = "h",
    g = "g",
    o = "-"
}

interface Task {
    time: number, // timeIt will take to execute
    delay: number, // that start delay of thread
    name: TASK_NAME, // Name of thread
    script: string,
    threads: number
};

interface Batch {
    tasks: Task[]
    delay: number;
    server: string
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


    const wgthreads = calculateGrowAndWeakenThreads(ns, target)

    return {
        hack: {
            threads: hackThreads,
            scriptName: hackScriptName
        },
        weaken1: {
            threads: wgthreads.weakenThreads,
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
export function calculateGrowAndWeakenThreads(ns: NS, target: string) {
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = maxMoney * (1 - HACK_PERCENTAGE); // Money left after hacking

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

export function createBatch(ns: NS, hostToTarget: string, previousDelay: number, server: string = "home", percentage: number = HACK_PERCENTAGE): Batch {
    let batch: Batch = {
        tasks: createTasks(ns, hostToTarget, previousDelay, BATCH_DELAY, percentage),
        delay: previousDelay + delay,
        server: server
    };

    return batch
}

// Construct a batch of tasks with proper delays
export function createTasks(ns: NS, hostToTarget: string, delay: number, defaultDelay = BATCH_DELAY, percentage: number): Task[] {
    const hackTime = ns.getHackTime(hostToTarget)
    const weakenTime = ns.getWeakenTime(hostToTarget)
    const growTime = ns.getGrowTime(hostToTarget)

    let threads = calculateFullCycleThreads(ns, hostToTarget, percentage)


    let hack = {
        time: hackTime,
        script: hackScriptName,
        delay: weakenTime - hackTime + delay - defaultDelay * 2,
        name: TASK_NAME.h,
        threads: threads.hack.threads
    } as Task

    let weaken1 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: delay - defaultDelay,
        name: TASK_NAME.w,
        threads: threads.weaken1.threads
    } as Task

    let weaken2 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: delay + defaultDelay,
        name: TASK_NAME.W,
        threads: threads.weaken2.threads
    } as Task

    let grow = {
        time: growTime,
        script: growScriptName,
        delay: weakenTime - growTime + delay,
        name: TASK_NAME.g,
        threads: threads.grow.threads
    } as Task

    return [hack, weaken1, grow, weaken2];
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