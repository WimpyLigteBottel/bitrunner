import { NS } from "@ns";

import { findAllServers } from "./FindAllServers";

export async function main(ns: NS) {
    let servers = findAllServers(ns, true, false)

    for (const server of servers) {
        ns.killall(server.host, true)
    }
}