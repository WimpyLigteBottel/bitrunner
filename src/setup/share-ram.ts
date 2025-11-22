import { NS } from "@ns";
import { getCustomServer } from "/util/serverCustomStats";
import { getKnownServers } from "/util/find";

export async function main(ns: NS): Promise<void> {

    let allServers = getKnownServers(ns)
        .map(x => getCustomServer(ns, x.hostname))
        .filter(x => x.canExecuteScripts)
        .filter(x => !x.hostname.includes("home"))
        .filter(x => x.availableRam > ns.getScriptRam('base/share.js'))

    ns.print({ ...allServers })


    while (true) {
        for (const server of allServers) {

            let threads = Math.floor(server.availableRam / ns.getScriptRam('base/share.js'))

            ns.exec('base/share.js', server.hostname, threads)
        }
        await ns.sleep(10 * 1000)
    }


}

