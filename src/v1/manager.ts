import { NS } from "@ns";
import { createBatch } from "v1/batcher";
import { findAllServers } from "/util/FindAllServers";


export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    const targetHost: string = ns.args[0] as string

    while (true) {
        let servers = findAllServerForBatch(ns) ?? []

        if (servers.length == 0) {
            ns.print("Sleeping because no servers are availaible....")
            await ns.sleep(2000)
            continue;
        }

        let previousDelay = 0
        for (const server of servers) {
            let threads = getThreadsPossible(ns, server.host)
            let batch = createBatch(ns, targetHost, previousDelay)
            ns.print(`${server.host} - ${threads}`)

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

function findAllServerForBatch(ns: NS) {
    let servers = findAllServers(ns)
        .filter((x) => ns.hasRootAccess(x.host))
        .filter((x) => getAvailiableRam(ns, x.host) > getScriptTotalCost(ns))
        .map(x => {
            ns.scp(["v1/hack.js", "v1/weaken.js", "v1/grow.js"], x.host)
            let temp = x
            temp.parent = undefined
            return temp
        }) ?? []

    ns.print(JSON.stringify(servers, null, 1))

    return servers
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