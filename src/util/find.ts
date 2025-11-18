import { NS } from "@ns";
import { CustomServer } from 'models/Models'
import { getAvailableRam } from "./availableram";
import { calculateFullCycleMoneyPerSecond } from "./profits";
import { ALL_SERVERS } from "/models/Servers";


export async function main(ns: NS): Promise<void> {

    ns.disableLog('scan')
    ns.clearLog()
    //ns.ui.openTail()
    let knownServers = getKnownServers(ns)


    let targetHost = ns.args[0] as string
    if (targetHost == undefined || targetHost == "") {
        targetHost = await ns.prompt('What server would you like to find?', {
            type: 'text'
        }) as string
    }

    // prints list of known servers
    // knownServers.keys().forEach(x => ns.print(x))

    let tofind = knownServers.filter(server => server.hostname.includes(targetHost)).pop()!
    let text = connectString(tofind, "backdoor;")

    // print out full connect string
    ns.tprint(text)
}


function connectString(server: CustomServer, currentString: String) {
    if (server.parent == undefined)
        return currentString

    return connectString(server.parent, `connect ${server.hostname};` + currentString)
}

export function findBestMoneyPerSecondServer(ns: NS): CustomServer {

    let stats = []
    for (const server of ALL_SERVERS) {
        const first = calculateFullCycleMoneyPerSecond(ns, server, 0.1);

        if (first == undefined) {
            continue;
        }

        if (first.moneyPerSecond != 0)
            stats.push(first)
    }

    if (stats.length == 0) {
        return { ...ns.getServer('n00dles'), parent: undefined }
    }

    stats = stats.toSorted((b, a) => a.moneyPerSecond - b.moneyPerSecond)

    let servers = getKnownServers(ns, false)
        .filter(server => server.hostname == stats[0].server)

    return servers.pop()!
}

export function findPreppedServers(ns: NS): CustomServer[] {
    return getKnownServers(ns, false)
        .filter(server => server.minDifficulty == server.hackDifficulty)
        .filter(server => server.moneyMax == server.moneyAvailable)
}

export function findServersToPrep(ns: NS): CustomServer[] {
    return getKnownServers(ns, false)
        .filter(server => server.hasAdminRights == true)
        .filter(server => server.minDifficulty != server.hackDifficulty && server.moneyMax != server.moneyAvailable)
        .toSorted((b, a) => (a.requiredHackingSkill || 0) - (b.requiredHackingSkill || 0))
}

export function findServersThatCanBeUsed(ns: NS): CustomServer[] {
    return getKnownServers(ns, true)
        .filter(server => server.hasAdminRights)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
}

export function getKnownServers(ns: NS, hackedServersOnly: boolean = false): CustomServer[] {
    let home: CustomServer = { ...ns.getServer(), parent: undefined }

    let knownServers = new Map<String, CustomServer>()
    let toBeScanned: CustomServer[] = [home]

    while (toBeScanned.length > 0) {
        let server = toBeScanned.pop()!
        let servers = ns.scan(server.hostname)
            .map(x => {
                return { ...ns.getServer(x), parent: server }
            });

        servers.forEach(x => {
            if (knownServers.get(x.hostname) == undefined) {
                toBeScanned.push(x)
            }
        })

        knownServers.set(server?.hostname!, server)
    }

    let servers = knownServers
        .entries()
        .map(x => x[1])
        .toArray()

    if (hackedServersOnly) {
        return servers.filter(x => x.hasAdminRights)
    }

    return servers
}