import { NS } from "@ns";
import { Batch, calculateFullCycleThreads, Task } from "/v3/batcher";
import { findBestHackConstantToGenerateMoney } from "/util/profits";

const BATCH_DELAY = 100


type BATCH_STATS = {
    possibleBatches: number; // The highest possible batches
    maxBatch: number; // The maximum possible batches that you can run
    batch_delay: number; // Delay for batches
    hackPercentage: number; // The hack pecerntage of this batch
}

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let targetHost = ns.args[0] as string
    const currentHost = ns.getHostname();

    let highestPercentage = highestPossibleHackConstant(ns, targetHost, currentHost)


    while (true) {
        let max = calculateMaxBatches(ns, targetHost, currentHost, highestPercentage)
        let previousDelay = 0

        for (let x = 0; x < max.maxBatch; x++) {
            let batch = createBatch(ns, targetHost, previousDelay, currentHost, highestPercentage)

            batch.tasks
                .filter(x => x.threads != 0) // Not empty threads
                .forEach(x => ns.exec(x.script, batch.server, x.threads, targetHost, x.delay, x.threads)) // execute

            previousDelay += BATCH_DELAY * 5
        }

        await ns.sleep(previousDelay + ns.getWeakenTime(targetHost) + BATCH_DELAY)
    }

}

function highestPossibleHackConstant(ns: NS, target: string, current: string) {
    let highestPercentage = 0.01

    // Comment out below if its too much RAM
    highestPercentage = findBestHackConstantToGenerateMoney(ns, target, current, 0.001)

    return highestPercentage
}


function calculateMaxBatches(ns: NS, target: string, currentServer: string, highestPercentage: number): BATCH_STATS {
    let batch = createBatch(ns, target, 0, currentServer, highestPercentage)

    const availiableRam = getAvailiableRam(ns, currentServer, 1);
    let possibleBatches = Math.floor(availiableRam / batch.totalCost)

    if (possibleBatches == 0)
        throw new Error(`Could not run current script because ${batch.totalCost} more than ${availiableRam} | highestPercentage: ${highestPercentage}`)

    return {
        possibleBatches,
        maxBatch: Math.min(possibleBatches, Math.floor(ns.getWeakenTime(target) / BATCH_DELAY * 4)),
        batch_delay: BATCH_DELAY,
        hackPercentage: highestPercentage
    };
}

function createBatch(ns: NS, hostToTarget: string, previousDelay: number, server: string, percentage: number): Batch {
    let threads = calculateFullCycleThreads(ns, hostToTarget, percentage, BATCH_DELAY, previousDelay)

    let { hack, weaken1, grow, weaken2 } = threads

    return {
        tasks: [hack, weaken1, grow, weaken2],
        server: server,
        totalCost: totalRamCost(ns, [hack, weaken1, grow, weaken2])
    };
}

function getAvailiableRam(ns: NS, serverName: string, reserve: number = 10): number {
    return ns.getServerMaxRam(serverName) - reserve - ns.getServerUsedRam(serverName)
}

function totalRamCost(ns: NS, threads: Task[]) {
    let tasks: number[] = threads.map(x => x.threads * ns.getScriptRam(x.script))

    return tasks.reduce((acc, value) => acc + value)
}