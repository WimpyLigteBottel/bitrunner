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
export function buildConnectScript(startingHost: HostObj) {
    let servers = recursiveDive(startingHost) ?? []
    let string = "home;"

    while (servers.length > 0) {
        let serverName= servers.pop() ?? ""
        string += `connect ${serverName};`
    }

    string += `backdoor`

    return string
}

function recursiveDive(server: HostObj | undefined): any {
    if (server?.depth == 1) {
        return [server.host]
    }

    return [server?.host].concat(recursiveDive(server?.parent))
}
