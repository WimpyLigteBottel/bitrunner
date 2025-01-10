import { NS } from "@ns";
import { growScriptName, hackScriptName, weakenScriptName } from "/util/HackConstants";


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
    script: string
};

interface Batch {
    tasks: Task[]
    delay: number;
}


/**
 * Calculates the required threads for a full hack-grow-weaken cycle.
 *
 * @param ns - The Netscript environment object.
 * @param target - The name of the target server.
 * @param hackPercent - Percentage of max money to hack.
 * @returns Object containing thread counts for hack, weaken1, grow, and weaken2.
 */
export function calculateFullCycleThreads(ns: NS, target: string, hackPercent: number): {
    hackThreads: number;
    weakenThreads1: number;
    growThreads: number;
    weakenThreads2: number;
} {
    const maxMoney = ns.getServerMaxMoney(target);
    const availableMoney = ns.getServerMoneyAvailable(target) || 1; // Avoid divide-by-zero
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(1); // Security increase per hack thread
    const growSecurityIncrease = ns.growthAnalyzeSecurity(1); // Security increase per grow thread
    const weakenEffect = ns.weakenAnalyze(1); // Security reduction per weaken thread

    const hackAmount = maxMoney * hackPercent; // Amount to hack
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, hackAmount));
    const weakenThreads1 = Math.ceil((hackThreads * hackSecurityIncrease) / weakenEffect);

    const growthMultiplier = maxMoney / (availableMoney - hackAmount);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));
    const weakenThreads2 = Math.ceil((growThreads * growSecurityIncrease) / weakenEffect);

    return {
        hackThreads,
        weakenThreads1,
        growThreads,
        weakenThreads2
    };
}

export function createBatch(ns: NS, hostToTarget: string, previousDelay: number): Batch {
    let batch: Batch = {
        tasks: createTasks(ns, hostToTarget, previousDelay, 0),
        delay: previousDelay + delay
    };

    return batch
}

// Construct a batch of tasks with proper delays
export function createTasks(ns: NS, hostToTarget: string, delay: number, defaultDelay = 50): Task[] {
    const hackTime = ns.getHackTime(hostToTarget)
    const weakenTime = ns.getWeakenTime(hostToTarget)
    const growTime = ns.getGrowTime(hostToTarget)


    let hack = {
        time: hackTime,
        script: hackScriptName,
        delay: weakenTime - hackTime + delay - defaultDelay - defaultDelay,
        name: TASK_NAME.h,
    } as Task

    let weaken1 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: delay - defaultDelay,
        name: TASK_NAME.w,
    } as Task

    let weaken2 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: delay + defaultDelay,
        name: TASK_NAME.W,
    } as Task

    let grow = {
        time: growTime,
        script: growScriptName,
        delay: weakenTime - growTime + delay,
        name: TASK_NAME.g,
    } as Task

    return [hack, weaken1, grow, weaken2];
}


// Construct a batch of tasks with proper delays
export function createTasksHGW(ns: NS, hostToTarget: string, defaultDelay = 50): {
    hack: Task,
    weaken: Task,
    grow: Task
} {
    const hackTime = ns.getHackTime(hostToTarget)
    const weakenTime = ns.getWeakenTime(hostToTarget)
    const growTime = ns.getGrowTime(hostToTarget)


    let hack = {
        time: hackTime,
        script: hackScriptName,
        delay: weakenTime - hackTime - defaultDelay,
        name: TASK_NAME.h,
    } as Task

    let grow = {
        time: growTime,
        script: growScriptName,
        delay: weakenTime - growTime,
        name: TASK_NAME.g,
    } as Task

    let weaken = {
        time: weakenTime,
        script: weakenScriptName,
        delay: defaultDelay + defaultDelay,
        name: TASK_NAME.W,
    } as Task


    return {hack,grow,weaken};
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