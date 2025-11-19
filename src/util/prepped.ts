import { NS } from "@ns";
import { notPreppedServers, preppedServers } from "./preppedServers";
import { disableLogs } from "/base/debug";


export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    let servers = preppedServers(ns)
        .map((x) => {
            let newMap = {
                name: x.hostname,
                // money: parseInt(x.moneyMax, 10) - parseInt(x.moneyAvailable, 10),
                // security: x.currentSecurity - x.minSecurity,
                level: x.requiredHacking,
            }
            return newMap;
        }
        )

    servers = servers.toSorted((a, b) => a.level - b.level)

    for (const server of servers) {
        ns.print(JSON.stringify(server, null, 0))
    }

}



