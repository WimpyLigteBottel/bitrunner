import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singlePrepName } from "/util/HackConstants";

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
        let serverToRunOn = homeServers.shift()
        let target = targets.shift()

        ns.tprint(`Running ${singlePrepName} on ${serverToRunOn?.host} targeting ${target?.host!}`)
        ns.exec(singlePrepName, serverToRunOn?.host!, 1, target?.host!)
        await ns.sleep(100)
    }
}
