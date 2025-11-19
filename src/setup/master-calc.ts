import { NS } from "@ns";
import { getAvailableRam } from "../util/availableram"
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "/base/debug";
import { CustomServerV2, TASK_NAME } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";



export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)
    ns.exec('util/killall.js', 'home', 1)

    let counter = 0;
    while (true) {
        // Trying to make money
        // let server = notPreppedServers(ns).pop()!
        let target = getCustomServer(ns, 'phantasy')

        ns.print(target.hostname + " is my next target")

        try {
            let server = await nextUsableServer(ns)
            let batch = createBatchOptimal(ns, target.hostname, server.availableRam)

            for (const task of batch.tasks) {
                ns.exec(task.script, server.hostname, task.threads, batch.server, task.delay)
            }

            await ns.sleep(2000)
        } catch (e) {
            counter++;
            ns.print(`ERROR counter:${counter} -> ${e}`)
            await ns.sleep(500)
        }
    }
}

async function nextUsableServer(ns: NS): Promise<CustomServerV2> {
    while (true) {
        let servers = findServersThatCanBeUsed(ns);

        for (const x of servers) {
            let noScriptsRunning = getAvailableRam(ns, x.hostname) == ns.getServerMaxRam(x.hostname)
            if (noScriptsRunning) {
                return x;
            }
        }
        await ns.sleep(1000)
    }
}


function findServersThatCanBeUsed(ns: NS) {
    // return getKnownServers(ns, false)
    return ns.getPurchasedServers()
        .toSorted()
        .map(server => getCustomServer(ns, server))
        .filter(server => server.canExecuteScripts)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
}

function findNextServerToPrep(ns: NS) {
    return notPreppedServers(ns).pop()!
}