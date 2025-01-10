import { NS } from "@ns";
import { createBatch } from "v1/batcher";
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

    while (true) {
        let servers = findAllServers(ns) ?? []

        if (servers.length == 0) {
            ns.print("Sleeping because no servers are availaible....")
            await ns.sleep(2000)
            continue;
        }

        let previousDelay = 0
        for (const server of servers) {
            let threads = getThreadsPossible(ns, server.host)
            if (threads == 0)
                continue
            let batch = createBatch(ns, targetHost, previousDelay)
            for (const task of batch.tasks) {
                ns.exec(task.script, server.host, { threads: threads }, targetHost, task.delay, threads)
                await ns.sleep(50)
            }
            previousDelay += 50 * batch.tasks.length
        }

        await ns.sleep(previousDelay);
    }
}

function getThreadsPossible(ns: NS, host: string) {
    let availRam = Math.floor(getAvailiableRam(ns, host))
    return Math.floor(availRam / getScriptTotalCost(ns))
}


function getScriptTotalCost(ns: NS): number {
    let hackScriptCost = ns.getScriptRam("./hack.js", "home") ?? 1.7
    let weakenScriptCost = ns.getScriptRam("./weaken.js", "home") ?? 1.75
    let growScriptCost = ns.getScriptRam("./grow.js", "home") ?? 1.75

    return hackScriptCost + weakenScriptCost + growScriptCost + weakenScriptCost
}


function getAvailiableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName)
}