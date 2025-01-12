import { NS } from "@ns";
import { findAllServers, HostObj } from "./FindAllServers";

export async function main(ns: NS) {
    const servers = findAllServers(ns, true, false)
    ns.clearLog()


    for (const serverToFind of ns.args as Array<string>) {
        for (const server of servers) {
            if (server.host.includes(serverToFind)) {
                ns.tprint(buildConnectScript(server) + "\n");
            }
        }
    }


    ns.print("----------")
}

/** @param {NS} ns */
function buildConnectScript(startingHost: HostObj) {

    let servers = recursiveDive(startingHost, startingHost.depth)
    let string = "home;"

    while (servers.length > 0) {
        string += `connect ${servers.pop()};`
    }

    string += `backdoor`

    return string
}

function recursiveDive(server: HostObj | undefined, depth: number): any {
    if (server?.depth == 1) {
        return server.host
    }
    // ns.print(JSON.stringify(server, null, 1))

    return [server?.host].concat(recursiveDive(server?.parent, server!.depth))
}
