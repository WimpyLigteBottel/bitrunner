import { NS } from "@ns";
import { Batch, calculateFullCycleThreads, Task, TASK_NAME } from "v2/batcher";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, growScriptName, hackScriptName, weakenScriptName } from "/util/HackConstants";
import { blockTillAllWeakensAreDone } from "./single-prep";
import { findBestHackConstantToGenerateMoney } from "/util/profits";
import { findServerStats } from "/util/Find";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let targetHost = findServerStats(ns, ns.args[0] as string)

    const currentHost = ns.getHostname();

    let highestPercentage = findBestHackConstantToGenerateMoney(ns, targetHost.host, currentHost, 0.001, getAvailiableRam(ns, currentHost, 1))


    while (true) {
        await blockTillAllWeakensAreDone(ns, currentHost) //TODO: to be removed and then replace with sleep time to make sure that batches don't overlap
        let max = calculateMaxBatches(ns, targetHost.host, currentHost, highestPercentage)
        let previousDelay = BATCH_DELAY

        if (max == 0) {
            throw Error("FAILED BECAUSE MAX IS 0")
        }
        for (let x = 0; x < max; x++) {
            let batch = createBatch(ns, targetHost.host, previousDelay, currentHost, highestPercentage)
            const tasks = batch?.tasks!
            for (const task of tasks) {
                if (task.threads != 0) {
                    ns.exec(task.script, batch.server, { threads: task.threads }, targetHost.host, task.delay, task.threads)
                }
            }
            previousDelay += BATCH_DELAY * (batch.tasks.length + 1)
        }

        //TODO: sleep here once "max batch has finnished and restart"  ===> BATCH_DELAY * 4 + weakenTime (Remember it needs to kick after the last wekane)
    }

}


/**
 * Calculates the maximum number of batches that can fit without overlapping.
 *
 * @param {NS} ns - The Netscript environment object.
 * @param {string} target - The target server's name (e.g., "joesguns").
 * @returns {number} Maximum number of batches that can fit.
 */
export function calculateMaxBatches(ns: NS, target: string, currentServer: string, highestPercentage: number) {
    let batch = createBatch(ns, target, 0, currentServer, highestPercentage)

    const availiableRam = getAvailiableRam(ns, currentServer, 1);
    let possibleBatches = Math.floor((availiableRam) / batch.totalCost)

    if (possibleBatches == 0)
        throw new Error(`Could not run current script because ${batch.totalCost} more than ${availiableRam} | highestPercentage: ${highestPercentage}`)

    let maxBatches = Math.floor(ns.getWeakenTime(target) / BATCH_DELAY * 4) //TODO: fix to get the most accurate

    const max = Math.min(possibleBatches, maxBatches);

    ns.print(`possibleBatches = ${possibleBatches}`)
    ns.print(`Max possible batches = ${maxBatches}`)
    ns.print(`BATCH_DELAY ${BATCH_DELAY}`)
    ns.print(`HACK_PERCENTAGE ${highestPercentage}`)

    return max;
}

function createBatch(ns: NS, hostToTarget: string, previousDelay: number, server: string, percentage: number): Batch {
    const hackTime = ns.getHackTime(hostToTarget)
    const weakenTime = ns.getWeakenTime(hostToTarget)
    const growTime = ns.getGrowTime(hostToTarget)

    let threads = calculateFullCycleThreads(ns, hostToTarget, percentage)

    let defaultDelay = BATCH_DELAY

    let hack = {
        time: hackTime,
        script: hackScriptName,
        delay: weakenTime - hackTime + previousDelay - defaultDelay * 2,
        name: TASK_NAME.h,
        threads: threads.hack.threads
    } as Task


    let weaken1 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: previousDelay - defaultDelay,
        name: TASK_NAME.w,
        threads: threads.weaken1.threads
    } as Task

    let grow = {
        time: growTime,
        script: growScriptName,
        delay: weakenTime - growTime + previousDelay - defaultDelay,
        name: TASK_NAME.g,
        threads: threads.grow.threads
    } as Task


    let weaken2 = {
        time: weakenTime,
        script: weakenScriptName,
        delay: previousDelay + defaultDelay,
        name: TASK_NAME.W,
        threads: threads.weaken2.threads
    } as Task

    let tasks = [hack, weaken1, grow, weaken2]
    let totalCost = tasks.map(x => x.threads * ns.getScriptRam(x.script)).reduce((acc, value) => acc + value)

    return {
        tasks: tasks,
        server: server,
        totalCost: totalCost
    };
}