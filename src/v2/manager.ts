import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { calculateFullCycleThreadsV2, getAvailiableRam, getTotalCost, getTotalCostThreads } from "/util/HackThreadUtil";
import { createTasksHGW } from "/v1/batcher";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();

    dissableLogs(ns)

    ns.tail();

    let targetHost: string = ns.args[0] as string ?? await ns.prompt("Server to hack", { type: "text" }) as string;

    prepServersForHack(ns);

    let batchNumber = 0
    while (true) {
        try {
            batchNumber = await hackFullCycleEachServer(ns, targetHost, batchNumber);
        } catch (error) {
            ns.print("ERROR" + error)
            batchNumber = 0
            await ns.sleep(1000)
        }
    }
}

async function hackFullCycleEachServer(ns: NS, targetHost: string, batchNumber: number) {
    let servers = findAllServers(ns, false, true);

    for (const server of servers) {
        let threads: {
            hackThreads: number;
            growThreads: number;
            weakenThreads: number;
        } = calculateFullCycleThreadsV2(ns, targetHost, server.host)

        // Skip if no threads are calculated
        if (threads.weakenThreads === 0 || threads.growThreads === 0) {
            await ns.sleep(100)
            ns.print(`Server ${server.host} cannot handle the batch. Skipping...`);
            continue;
        }

        let tasks = createTasksHGW(ns, targetHost)

        let totalCost = getTotalCostThreads(ns, threads.hackThreads, threads.weakenThreads, threads.growThreads)

        if (getAvailiableRam(ns, server.host) >= totalCost) {
            ns.exec(tasks.hack.script, server.host, { threads: threads.hackThreads }, targetHost, tasks.hack.delay + batchNumber, threads.hackThreads)
            ns.exec(tasks.grow.script, server.host, { threads: threads.growThreads }, targetHost, tasks.grow.delay + batchNumber, threads.growThreads)
            ns.exec(tasks.weaken.script, server.host, { threads: threads.weakenThreads }, targetHost, tasks.weaken.delay + batchNumber, threads.weakenThreads)
        }
    }

    return batchNumber + 200
}




function dissableLogs(ns: NS) {

    ns.disableLog("exec")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("scan")
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("getServerMoneyAvailable")
}