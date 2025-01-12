import { NS } from "@ns";
import { createBatch } from "v2/batcher";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, HACK_PERCENTAGE, hackScriptName, weakenScriptName } from "/util/HackConstants";
import { prepServersForHack } from "/util/FindAllServers";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    const targetHost: string = ns.args[0] as string

    prepServersForHack(ns)

    while (true) {
        await blockTillAllWeakensAreDone(ns) //TODO: to be removed and then replace with sleep time to make sure that batches don't overlap

        let previousDelay = BATCH_DELAY
        let max = calculateMaxBatches(ns, targetHost, ns.getHostname())
        
        let maxWait = 0
        for (let x = 0; x < max; x++) {
            let batch = createBatch(ns, targetHost, previousDelay, ns.getHostname())
            const tasks = batch?.tasks!
            for (const task of tasks) {
                if (task.threads != 0) {
                    ns.exec(task.script, batch.server, { threads: task.threads }, targetHost, task.delay, task.threads)
                    maxWait = Math.max(maxWait, task.delay)
                }
            }
            previousDelay += BATCH_DELAY * (batch.tasks.length + 1)
        }

        //TODO: sleep here once "max batch has finnished and restart"  ===> BATCH_DELAY * 4 + weakenTime (Remember it needs to kick after the last wekane)
    }

}

async function blockTillAllWeakensAreDone(ns: NS) {
    let scripts = ns.ps(ns.getHostname())
        .filter(x => x.filename.includes("weak"))

    while (scripts.length > 0) {
        await ns.sleep(1000)
        scripts = ns.ps(ns.getHostname())
        .filter(x => x.filename.includes("weak"))
    }
    ns.print("Continuing with run")
}

/**
 * Calculates the maximum number of batches that can fit without overlapping.
 *
 * @param {NS} ns - The Netscript environment object.
 * @param {string} target - The target server's name (e.g., "joesguns").
 * @returns {number} Maximum number of batches that can fit.
 */
export function calculateMaxBatches(ns: NS, target: string, currentServer: string) {
    let batch = createBatch(ns, target, 0, "home")

    let totalCost = batch.tasks.map(x => x.threads * ns.getScriptRam(x.script)).reduce((acc, value) => acc + value)

    let possibleBatches = Math.floor((getAvailiableRam(ns, currentServer, 1)) / totalCost)

    let maxBatches = Math.floor(ns.getWeakenTime(target) / BATCH_DELAY * 4) //TODO: fix to get the most accurate


    const max = Math.min(possibleBatches, maxBatches);

    ns.print(`batches = ${possibleBatches}`)
    ns.print(`Max possible batches = ${maxBatches}`)
    ns.print(`BATCH_DELAY ${BATCH_DELAY}`)
    ns.print(`HACK_PERCENTAGE ${HACK_PERCENTAGE}`)

    return max;
}