import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { PREP, SINGLE_PREP_V2 } from "/util/HackConstants";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let homeServers = findAllServers(ns, false, true)

    prepServersForHack(ns)

    await ns.sleep(1000)

    while (homeServers.length > 0) {
        let serverToRunOn = homeServers.pop()

        ns.tprint(`Running ${SINGLE_PREP_V2} on ${serverToRunOn?.host}`)
        ns.exec(PREP, serverToRunOn?.host!, 1)
        await ns.sleep(100)
    }
}
