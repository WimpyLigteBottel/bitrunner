import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";
import { singlePrepName } from "/util/HackConstants";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()

    let targets = findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))
        .filter(x => ns.getServerMaxMoney(x.host) > 0)
        .filter(x => !ns.getServer(x.host).purchasedByPlayer)
        .sort((b, a) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host))
        .map(x => x.host)

    let homeServers = findAllServers(ns, false, true).sort((a, b) => ns.getServerMaxRam(a.host) - ns.getServerMaxRam(b.host))

    while (targets.length > 0 && homeServers.length > 0) {
        let serverToRunOn = homeServers.pop()
        let target = targets.pop()

        ns.tprint(`Running ${singlePrepName} on ${serverToRunOn?.host} targeting ${target!}`)

        ns.killall(serverToRunOn?.host!, true)
        ns.exec(singlePrepName, serverToRunOn?.host!, 1, target!)
        await ns.sleep(100)
    }

    ns.tprint(`No more servers to run ${JSON.stringify(homeServers)} targeting ${JSON.stringify(targets)}`)
}
