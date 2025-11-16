import { NS } from "@ns";
import { Batch, RequestType, Task, TASK_NAME } from "/models/Models";
import { getAvailableRam } from "/util/availableram";


export function createBatchOptimal(ns: NS, targetHost: string, availableRam: number, requestType: RequestType): Batch {

    let low = 0;     // definitely fits
    let high = 1;    // probably too big, but serves as the upper bound

    let bestBatch = createBatch(ns, targetHost, 0, availableRam, requestType);
    let bestPercentage = 0;

    // 20–30 iterations = enough precision
    for (let i = 0; i < 30; i++) {
        const mid = (low + high) / 2;
        const batch = createBatch(ns, targetHost, mid, availableRam, requestType);

        if (batch.totalCost <= availableRam) {
            // mid fits -> try higher
            bestPercentage = mid;
            bestBatch = batch;
            low = mid;
        } else {
            // mid too big -> reduce
            high = mid;
        }
    }

    return bestBatch;
}


export function createBatch(ns: NS, targetHost: string, targetPercentage: number, availableRam: number, requestType: RequestType): Batch {
    if (requestType == `HACK`) {
        return createBatchHGW(ns, targetHost, targetPercentage)
    }

    return createPrepBatch(ns, targetHost, availableRam)
}

export function createPrepBatch(ns: NS, targetHost: string, availableRam: number): Batch {

    if (ns.getServerSecurityLevel(targetHost) != ns.getServerMinSecurityLevel(targetHost)) {
        let totalThreads = Math.floor(availableRam / ns.getScriptRam("base/weaken.js"))

        let weakenTask = {
            time: ns.getWeakenTime(targetHost),
            delay: 0,
            name: TASK_NAME.w,
            script: "base/weaken.js",
            threads: totalThreads,
            cost: totalThreads * ns.getScriptRam("base/weaken.js"),
        } as Task

        return {
            tasks: [weakenTask],
            server: targetHost,
            totalCost: weakenTask.cost,
            percentage: -1
        }
    } else {

        let totalThreads = Math.max(2, Math.floor(availableRam / ns.getScriptRam("base/weaken.js")))

        let halfThreads = Math.floor(totalThreads / 2)

        let weakenTask = {
            time: ns.getWeakenTime(targetHost),
            delay: 0,
            name: TASK_NAME.w,
            script: "base/weaken.js",
            threads: halfThreads,
            cost: halfThreads * ns.getScriptRam("base/weaken.js"),
        } as Task


        let growTask = {
            time: ns.getGrowTime(targetHost), // timeIt will take to execute
            delay: ns.getWeakenTime(targetHost) - ns.getGrowTime(targetHost) - 100, // that start delay of thread
            name: TASK_NAME.g, // Name of thread
            script: "base/grow.js",
            threads: halfThreads,
            cost: halfThreads * ns.getScriptRam("base/grow.js"),
        } as Task

        return {
            tasks: [weakenTask, growTask],
            server: targetHost,
            totalCost: weakenTask.cost + growTask.cost,
            percentage: -1
        }
    }
}



function createBatchHGW(ns: NS, targetHost: string, targetPercentage: number): Batch {
    let hackTask = createHackThreads(ns, targetHost, targetPercentage)
    let growTask = createGrowThreads(ns, targetHost, targetPercentage)

    let weakenTask = creatWeakenThreads(ns, targetHost, growTask.threads, hackTask.threads)


    return {
        tasks: [hackTask, growTask, weakenTask],
        server: targetHost,
        totalCost: hackTask.cost + growTask.cost + weakenTask.cost,
        percentage: targetPercentage
    }
}


function createHackThreads(ns: NS, targetHost: string, targetPercentage: number): Task {
    let hackAmount = ns.getServerMaxMoney(targetHost) * targetPercentage;
    let threadsNeeded = ns.hackAnalyzeThreads(targetHost, hackAmount)
    let threads = Math.max(1, Math.floor(threadsNeeded))

    return {
        time: ns.getHackTime(targetHost), // timeIt will take to execute
        delay: ns.getWeakenTime(targetHost) - ns.getHackTime(targetHost) - 200, // that start delay of thread
        name: TASK_NAME.h, // Name of thread
        script: "base/hack.js",
        threads: threads,
        cost: threads * ns.getScriptRam("base/hack.js"),
    } as Task
}

export function createGrowThreads(ns: NS, targetHost: string, targetPercentage: number) {
    const maxMoney = ns.getServerMaxMoney(targetHost);
    const availableMoney = maxMoney * (1 - targetPercentage); // Money left after hacking

    // Growth Multiplier
    const growthMultiplier = maxMoney / availableMoney;

    const growThreads = Math.ceil(ns.growthAnalyze(targetHost, growthMultiplier))

    return {
        time: ns.getGrowTime(targetHost), // timeIt will take to execute
        delay: ns.getWeakenTime(targetHost) - ns.getGrowTime(targetHost) - 100, // that start delay of thread
        name: TASK_NAME.g, // Name of thread
        script: "base/grow.js",
        threads: growThreads,
        cost: growThreads * ns.getScriptRam("base/grow.js"),
    } as Task
}

export function creatWeakenThreads(ns: NS, targetHost: string, growthThreads: number, hackThreads: number) {
    let hackIncrease = ns.hackAnalyzeSecurity(hackThreads);
    let growIncrease = ns.growthAnalyzeSecurity(growthThreads);

    let weakenNeeded1 = Math.ceil(growIncrease / ns.weakenAnalyze(1))
    let weakenNeeded2 = Math.ceil(hackIncrease / ns.weakenAnalyze(1))

    let totalThreads = weakenNeeded1 + weakenNeeded2

    return {
        time: ns.getWeakenTime(targetHost),
        delay: 0,
        name: TASK_NAME.w,
        script: "base/weaken.js",
        threads: totalThreads,
        cost: totalThreads * ns.getScriptRam("base/weaken.js"),
    } as Task
}