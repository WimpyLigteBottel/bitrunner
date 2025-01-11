import { NS } from "@ns";
import { createBatch } from "v2/batcher";
import { prepServersForHack } from "/util/FindAllServers";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY } from "/util/HackConstants";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/


export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    const targetHost: string = ns.args[0] as string

    prepServersForHack(ns)


    ns.killall("home", true)
    // let port = ns.exec("util/PortListener.js", "home", 1, targetHost)

    let previousDelay = BATCH_DELAY
    while (true) {
        previousDelay = BATCH_DELAY
        let max = calculateMaxBatches(ns, targetHost, "home")
        ns.print(`max = ${max}`)

        for (let x = 0; x < max; x++) {
            let batch = createBatch(ns, targetHost, previousDelay, "home")
            const tasks = batch?.tasks!
            for (const task of tasks) {
                if (task.threads != 0) {
                    ns.exec(task.script, batch.server, { threads: task.threads }, targetHost, task.delay, task.threads)
                }
            }
            previousDelay += BATCH_DELAY * (batch.tasks.length + 1)
        }

        await ns.sleep(previousDelay + ns.getHackTime(targetHost))
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


    return Math.floor((getAvailiableRam(ns, currentServer, 10)) / totalCost);
}