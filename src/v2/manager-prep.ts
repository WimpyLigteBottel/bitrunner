import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singlePrepName } from "/util/HackConstants";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()


    let targets = findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))
        .filter(x => ns.getServerMaxRam(x.host) > 0)
        .filter(x => !ns.getServer(x.host).purchasedByPlayer)

    let homeServers = findAllServers(ns, false, true).sort((a, b) => a.host.localeCompare(b.host))

    prepServersForHack(ns)

    while (targets.length > 0 && homeServers.length > 0) {
        let serverToRunOn = homeServers.pop()?.host as string
        let target = targets.pop()?.host as string

        ns.exec(singlePrepName, serverToRunOn, 1, target, 0)
    }
}
