import { NS, Server } from "@ns";


type CustomServer = {
    parent: CustomServer | undefined
} & Server

export async function main(ns: NS): Promise<void> {

    ns.disableLog('scan')
    ns.clearLog()
    let knownServers = getKnownServers(ns)


    let targetHost = ns.args[0] as string


    let tofind = knownServers.get(targetHost)!
    let text = connectString(tofind, "")


    knownServers.keys().forEach(x => ns.print(x))
    ns.tprint(text)
}


function connectString(server: CustomServer, currentString: String) {
    if (server.parent == undefined)
        return currentString

    return connectString(server.parent, `connect ${server.hostname};` + currentString)
}

export function getKnownServers(ns: NS) {
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


    return knownServers
}