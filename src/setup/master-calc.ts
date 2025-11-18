import { NS } from "@ns";
import { findBestMoneyPerSecondServer, getKnownServers } from "../util/find"
import { getAvailableRam } from "../util/availableram"
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "/base/debug";
import { CustomServer, HackRequest } from "/models/Models";

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)
    ns.exec('util/killall.js', 'home', 1)

    while (true) {
        let server = await nextUsableServer(ns)

        try {
            await execute(ns, server)

        } catch (e) {
            ns.print(`ERROR ${e}`)
        }
    }
}

async function execute(ns: NS, server: CustomServer) {
    let firstServer = findBestMoneyPerSecondServer(ns)
    let ram = getAvailableRam(ns, server.hostname)
    let batch = createBatchOptimal(ns, firstServer.hostname, ram)

    batch.tasks.forEach(task => {
        ns.exec(task.script, server.hostname, task.threads, batch.server, task.delay)
    });
    await ns.sleep(300)
}

async function nextUsableServer(ns: NS) {
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
        .filter(server => server.hostname != 'home')
        .filter(server => server.hasAdminRights == true)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
    // .toSorted()
}