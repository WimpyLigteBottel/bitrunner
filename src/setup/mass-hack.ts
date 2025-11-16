import { NS } from "@ns";
import { getKnownServers } from "../util/find"
import { getAvailableRam } from "../util/availableram"
import { disableLogs } from "/base/debug";

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)

    while (true) {
        await ns.sleep(1000)

        for (const x of findServersThatCanBeUsed(ns)) {
            let noScriptsRunning = getAvailableRam(ns, x.hostname) == ns.getServerMaxRam(x.hostname)
            if (noScriptsRunning) {
                ns.print('creating hack request ' + x.hostname)
                ns.exec('setup/request.js', x.hostname, 1, 'HACK')
                await ns.sleep(50)
            }
        }
    }
}

function findServersThatCanBeUsed(ns: NS) {

    return getKnownServers(ns, true)
        .values()
        .toArray()
        // .filter(server => server.hostname != 'home')
        .filter(server => server.hasAdminRights == true)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
}