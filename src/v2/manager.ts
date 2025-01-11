import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
/*
This codes performs teh HWGW cycle in batches... So far its the only one kinda working
*/

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    const targetHost: string = ns.args[0] as string

    prepServersForHack(ns)

    let batches = []

    while (true) {
        let servers = findAllServers(ns) ?? []


    }
}
