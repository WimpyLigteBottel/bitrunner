import { NS } from "@ns";

import { findAllServers } from "./FindAllServers";

export async function main(ns: NS) {
    let servers = findAllServers(ns, true, true)

    for (const server of servers) {
        await killBatches(ns, server.host)
    }
}

async function killBatches(ns: NS, server: string) {
    let scripts = ns.ps(server)
        .filter(x => x.filename.includes("v2/single-batch.js"))

    ns.tprint(scripts)
    while (scripts.length > 0) {
        ns.scriptKill(scripts.pop()?.filename!, server)
    }
}