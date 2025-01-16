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

    if (targets.length > 25) {
        targets = targets.sort((a, b) => ns.getWeakenTime(a) - ns.getWeakenTime(b))
    }

    ns.print(`Shortest ${targets[0]} => ${ns.getWeakenTime(targets[0])}`)
    ns.print(`Longest ${targets[targets.length - 1]} => ${ns.getWeakenTime(targets[targets.length - 1])}`)

    let homeServers = findAllServers(ns, false, false).filter(x => ns.hasRootAccess(x.host))

    ns.tprint(`INFO servers to run ${homeServers.map(x => x.host)} targeting ${targets}`)

    while (targets.length > 0 && homeServers.length > 0) {
        let serverToRunOn = homeServers.pop()
        let target = targets.pop()

        ns.killall(serverToRunOn?.host!, true)
        if (ns.exec(singlePrepName, serverToRunOn?.host!, 1, target!)) {
            ns.tprint(`INFO Running ${singlePrepName} on ${serverToRunOn?.host} targeting ${target!}`)
        } else {
            ns.tprint(`ERROR Failed to run ${singlePrepName} on ${serverToRunOn?.host} targeting ${target!}`)
        }
        await ns.sleep(100)
    }

    ns.tprint(`INFO No more servers to run ${homeServers.map(x => x.host)} targeting ${targets}`)
}
