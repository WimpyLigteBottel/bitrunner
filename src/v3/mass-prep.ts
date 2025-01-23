import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";
import { PREP_V3 } from "/util/HackConstants";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let homeServers = findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))

    await ns.sleep(1000)

    while (homeServers.length > 0) {
        let serverToRunOn = homeServers.pop()

        ns.exec(PREP_V3, serverToRunOn?.host!, 1)
        ns.tprint(`Running ${PREP_V3} on ${serverToRunOn?.host}`)

        await ns.sleep(10)
    }
}
