import { NS } from "@ns";
import { findBestMoneyPerSecondServer, getKnownServers } from "../util/find"
import { getAvailableRam } from "../util/availableram"
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "/base/debug";
import { CustomServerV2 } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)
    ns.exec('util/killall.js', 'home', 1)


    while (true) {
        // Trying to make money
        // let bestServerToHack = findBestMoneyPerSecondServer(ns)
        // trying to prep
        let bestServerToHack = findNextServerToPrep(ns)
        let maxBatches = bestServerToHack.maxBatches
        ns.print('Targeting ' + bestServerToHack.hostname)
        let tempCounter = 0
        ns.print('max batches ' + maxBatches)

        while (tempCounter < maxBatches) {
            let server = await nextUsableServer(ns)

            try {
                await execute(ns, server, bestServerToHack.hostname)
                tempCounter++
            } catch (e) {
                ns.print(`ERROR ${e}`)
            }
        }

        await ns.sleep(ns.getWeakenTime(bestServerToHack.hostname))
        ns.print('XXXXXXXXXXXXXX')
    }
}

async function execute(ns: NS, server: CustomServerV2, targetHost: string) {
    let ram = getAvailableRam(ns, server.hostname)
    let batch = createBatchOptimal(ns, targetHost, ram)

    batch.tasks.forEach(task => {
        ns.exec(task.script, server.hostname, task.threads, batch.server, task.delay)
    });
    await ns.sleep(300)
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
    return getKnownServers(ns, false)
        .map(server => getCustomServer(ns, server.hostname))
        .filter(server => server.hostname != 'home')
        .filter(server => server.canExecuteScripts)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
    // .toSorted()
}

function findNextServerToPrep(ns: NS) {
    return getKnownServers(ns, false)
        .map(server => getCustomServer(ns, server.hostname))
        .filter(server => server.hostname != 'home')
        .filter(server => server.canHack)
        .filter(server => server.currentSecurity != server.minSecurity && server.moneyMax != server.moneyAvailable)
        .toSorted((b, a) => a.weakTime - b.weakTime)
        .pop()!
}