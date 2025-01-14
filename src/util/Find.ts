import { NS } from "@ns";
import { findAllServers, HostObj } from "./FindAllServers";

export async function main(ns: NS) {
    let servers = findAllServers(ns, true, false)
    let input = ns.args[0] as string ?? await ns.prompt("What is the server you want to find?", { type: "text" }) as string

    ns.tail();
    while (true) {
        await ns.sleep(50)
        ns.clearLog()
        ns.print(`Found = ${servers.map(x => x.host)}`)
        ns.print(`Found total = ${servers.length}`)
        ns.print("------")

        let server = findServerStats(ns, input)


        ns.print("INFO \n", JSON.stringify(server, null, 2))
    }
}

export function findServerStats(ns: NS, targetServer: string): HostObj {
    let servers = findAllServers(ns, true, false)

    let server = findServer(targetServer, servers)

    if (server != undefined) {
        server = populate(ns, server, server.host)
    }


    return server
}

function findServer(name: string, servers: any) {
    let found = servers.find((value: HostObj) => {
        return value.host.includes(name)
    })

    return found
}

/** @param {NS} ns */
function populate(ns: NS, obj: HostObj, host: string) {
    let server: any = {
        "host": obj["host"],
        "parent": obj["parent"],
        "depth": obj["depth"],
    }

    server["hackTime"] = ns.getHackTime(host)
    server["growTime"] = ns.getGrowTime(host)
    server["weakenTime"] = ns.getWeakenTime(host)



    server["moneyToGrowPercentage"] = (ns.getServerMoneyAvailable(host) / ns.getServerMaxMoney(host)) * 100

    let player = { ...ns.getPlayer() }

    server = { ...ns.getServer(host), ...server, "player": player }


    delete server["player"]

    return server
}
