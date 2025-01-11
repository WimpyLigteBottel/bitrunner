import { NS } from "@ns";
import { createBatch } from "v2/batcher";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/


export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    const targetHost: string = ns.args[0] as string

    prepServersForHack(ns)

    let batches = []

    while (true) {
        let servers = findAllServers(ns) ?? []

        let maxBatches = (calculateMaxBatches(ns, targetHost))
        // ns.print(maxBatches)
        if (batches.length > maxBatches) {
            while (batches.length > 1) {
                const batch = batches.pop()!;
                const tasks = batch?.tasks!
                for (const task of tasks) {
                    if (task.threads != 0)
                        ns.exec(task.script, batch.server, { threads: task.threads }, targetHost, task.delay, task.threads)
                }
                await ns.sleep(50)
            }

            await ns.sleep(maxBatches * 50)
        } else {
            if (servers.length == 0) {
                ns.print("Sleeping because no servers are availaible....")
                await ns.sleep(2000)
                continue;
            }

            let previousDelay = 0
            for (const server of servers) {
                let batch = createBatch(ns, targetHost, previousDelay, server.host)
                batches.push(batch)
                previousDelay += 50 * batch.tasks.length
            }
        }

    }
}


/**
 * Calculates the maximum number of batches that can fit without overlapping.
 *
 * @param {NS} ns - The Netscript environment object.
 * @param {string} target - The target server's name (e.g., "joesguns").
 * @param {number} batchDelay - Delay between the start of each batch (default 50 ms).
 * @returns {number} Maximum number of batches that can fit.
 */
export function calculateMaxBatches(ns: NS, target: string, batchDelay = 50) {
    // Calculate batch duration (from the start of hack to the end of weaken)
    const batchDuration = ns.getWeakenTime(target) + 50; // Weaken finishes last
    const gapBetweenBatches = batchDelay; // Time between consecutive batches



    return Math.floor(batchDuration / gapBetweenBatches);
}