import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { calculateFullCycleThreadsV2, getAvailiableRam } from "/util/HackThreadUtil";
import { createBatch } from "/v1/batcher";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.tail();

    const targetHost: string = await ns.prompt("Server to hack", { type: "text" }) as string;

    prepServersForHack(ns);

    while (true) {
        try {
            await hackFullCycleEachServer(ns, targetHost);
        } catch (error) {
            ns.print("ERROR" + error)
        }
        await ns.sleep(100)
    }
}

async function hackFullCycleEachServer(ns: NS, targetHost: string) {
    let servers = findAllServers(ns, false, true);

    if (!servers.length) {
        ns.print("No available servers for batching. Sleeping...");
        await ns.sleep(2000);
        return;
    }

    let previousDelay = 0
    for (const server of servers) {
        let threads: {
            hackThreads: number;
            weakenThreads1: number;
            growThreads: number;
            weakenThreads2: number;
        } = calculateFullCycleThreadsV2(ns, targetHost, server.host, 0.6)

        // Skip if no threads are calculated
        if (threads.hackThreads === 0 || threads.weakenThreads1 === 0 || threads.growThreads === 0) {
            ns.print(`Server ${server.host} cannot handle the batch. Skipping...`);
            continue;
        }

        let batch = createBatch(ns, targetHost, previousDelay)
        for (const task of batch.tasks) {
            let threadsToUse: number = threadsTouse(task, threads)
            ns.exec(task.script, server.host, { threads: threadsToUse }, targetHost, task.delay, threadsToUse)
        }
        previousDelay += 50 * batch.tasks.length
    }
    await ns.sleep(previousDelay);
}

function threadsTouse(task: any, threads: any) {
    let threadsToUse: number = 0
    switch (task.name) {
        case "w":
            threadsToUse = threads.weakenThreads1
            break;
        case "W":
            threadsToUse = threads.weakenThreads2
            break;
        case "h":
            threadsToUse = threads.hackThreads
            break;
        default:
            threadsToUse = threads.growThreads
            break;
    }

    return threadsToUse
}

