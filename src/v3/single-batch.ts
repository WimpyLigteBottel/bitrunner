import { NS } from "@ns";
import { Batch, calculateFullCycleThreads } from "/v3/batcher";
// import { BATCH_DELAY } from "/util/HackConstants";

const BATCH_DELAY = 100

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let targetHost = ns.args[0] as string

    const currentHost = ns.getHostname();
    let highestPercentage = 0.001


    while (true) {
        let max = calculateMaxBatches(ns, targetHost, currentHost, highestPercentage)
        let previousDelay = 0

        for (let x = 0; x < max; x++) {
            let batch = createBatch(ns, targetHost, previousDelay, currentHost, highestPercentage)

            batch.tasks
                .filter(x => x.threads != 0) // Not empty threads
                .forEach(x => ns.exec(x.script, batch.server, x.threads, targetHost, x.delay, x.threads)) // execute

            previousDelay += BATCH_DELAY * 5
        }

        await ns.sleep(previousDelay + ns.getWeakenTime(targetHost))
    }

}

function getAvailiableRam(ns: NS, serverName: string, reserve: number = 10): number {
    return ns.getServerMaxRam(serverName) - reserve - ns.getServerUsedRam(serverName)
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
    let threads = calculateFullCycleThreads(ns, hostToTarget, percentage, BATCH_DELAY, previousDelay)

    return {
        tasks: [threads.hack, threads.weaken1, threads.grow, threads.weaken2],
        server: server,
        totalCost: totalRamCost(ns, threads)
    };
}

function totalRamCost(ns: NS, threads: any) {

    let tasks = [threads.hack, threads.weaken1, threads.grow, threads.weaken2]
    let totalCost = tasks.map(x => x.threads * ns.getScriptRam(x.script)).reduce((acc, value) => acc + value)

    return totalCost
}