import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singleBatcherName } from "/util/HackConstants";
import { getHighestMoneyPerSecondDesc } from "/util/profits";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    prepServersForHack(ns)

    let moneyPerTarget = (await getHighestMoneyPerSecondDesc(ns, false)).filter((a) => a.prepped)

    let homeServers = findAllServers(ns, false, true)

    while (moneyPerTarget.length > 0 && homeServers.length > 0) {
        let serverToRunOn = homeServers.shift()?.host!
        let target = moneyPerTarget.pop()

        if (target!.totalRamCost > ns.getServerMaxRam(serverToRunOn)) {
            continue
        }

        ns.print(`Running batches ${serverToRunOn}`)
        ns.exec(singleBatcherName, serverToRunOn, 1, target?.server!, 0)
    }
}
