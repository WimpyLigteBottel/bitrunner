import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singleBatcherName } from "/util/HackConstants";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    prepServersForHack(ns)

    let targets = findAllServers(ns, false, false).filter(x => ns.hasRootAccess(x.host)).filter(x => ns.getServerMaxRam(x.host) > 0)
    let homeServers = findAllServers(ns, false, true)

    while (targets.length > 0 && homeServers.length > 0) {

        let serverToRunOn = homeServers.pop()?.host as string
        let target = targets.pop()?.host as string

        try {
            ns.print(`Running batches ${serverToRunOn}`)
            ns.exec(singleBatcherName, serverToRunOn, 1, target, 0)
        } catch (error) {
            ns.print(error)
         }
    }
}
