import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singlePrepName } from "/util/HackConstants";
import { getHighestMoneyPerSecondDesc } from "/util/profits";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()

    let targets = findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))
        .filter(x => ns.getServerMaxMoney(x.host) > 0)
        .filter(x => !ns.getServer(x.host).purchasedByPlayer)
        .sort((a, b) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host))

    let homeServers = findAllServers(ns, false, true)

    prepServersForHack(ns)

    while (targets.length > 0 && homeServers.length > 0) {
        let serverToRunOn = homeServers.shift()?.host as string
        let target = targets.shift()?.host as string

        ns.tprint(`Running ${singlePrepName} on ${serverToRunOn} targeting ${target}`)
        ns.exec(singlePrepName, serverToRunOn, 1, target, 0)
    }
}
