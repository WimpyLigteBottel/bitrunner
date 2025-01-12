import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { singleBatcherName } from "/util/HackConstants";
import { getHighestMoneyPerSecondDesc } from "/util/profits";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    prepServersForHack(ns)

    let moneyPerTarget = (await getHighestMoneyPerSecondDesc(ns, false)).filter((a) => a.prepped)

    let targets = moneyPerTarget.map(x => x.server)
    let homeServers = findAllServers(ns, false, true)

    while (targets.length > 0 && homeServers.length > 0) {

        let serverToRunOn = homeServers.shift()?.host!
        let target = targets.pop() as string

        try {
            ns.print(`Running batches ${serverToRunOn}`)
            ns.exec(singleBatcherName, serverToRunOn, 1, target, 0)
        } catch (error) {
            ns.print(error)
        }
    }
}
