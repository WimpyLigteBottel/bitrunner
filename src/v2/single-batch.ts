import { NS } from "@ns";
import { createBatch } from "v2/batcher";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, HACK_PERCENTAGE } from "/util/HackConstants";
import { prepServersForHack } from "/util/FindAllServers";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    const targetHost: string = ns.args[0] as string

    prepServersForHack(ns)
    while (true) {
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

        await ns.sleep(maxWait + ns.getWeakenTime(targetHost))
    }

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
    let maxBatches = Math.floor(ns.getHackTime(target) / BATCH_DELAY)


    const max = Math.min(possibleBatches, maxBatches);

    ns.print(`baches = ${possibleBatches}`)
    ns.print(`Max possible batches = ${maxBatches}`)
    ns.print(`BATCH_DELAY ${BATCH_DELAY}`)
    ns.print(`HACK_PERCENTAGE ${HACK_PERCENTAGE}`)
    
    return max;
}