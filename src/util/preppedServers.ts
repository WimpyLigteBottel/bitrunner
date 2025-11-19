import { NS } from "@ns";
import { getCustomServer } from "./serverCustomStats";
import { ALL_SERVERS } from "/models/Servers";
import { CustomServerV2 } from "/models/Models";
import { getKnownServers } from "./find";

export function isPrepped(ns: NS, hostname: string): boolean {
    let server = getCustomServer(ns, hostname);

    return server.minSecurity == server.currentSecurity && server.moneyAvailable == server.moneyMax
}


export function preppedServers(ns: NS): CustomServerV2[] {
    let prepList = []
    for (const server of getKnownServers(ns)) {

        if (isPrepped(ns, server.hostname))
            prepList.push(getCustomServer(ns, server.hostname))
    }
    return prepList.filter(x => x.moneyMax != '0').toSorted((a, b) => b.requiredHacking - a.requiredHacking)
}

export function notPreppedServers(ns: NS): CustomServerV2[] {
    let prepList = []
    for (const server of getKnownServers(ns)) {

        if (!isPrepped(ns, server.hostname))
            prepList.push(getCustomServer(ns, server.hostname))
    }
    return prepList.filter(x => x.moneyMax != '0').toSorted((a, b) => b.requiredHacking - a.requiredHacking)
}
