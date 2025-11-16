import { NS, Server } from "@ns";
import { CustomServer} from 'models/Models'


export async function main(ns: NS): Promise<void> {

    ns.disableLog('scan')
    ns.clearLog()
    // ns.ui.openTail()
    let knownServers = getKnownServers(ns)


    let targetHost = ns.args[0] as string
    targetHost = targetHost || 'home'

    // prints list of known servers
    knownServers.keys().forEach(x => ns.print(x))

    let tofind = knownServers.get(targetHost)!
    let text = connectString(tofind, "backdoor;")

    // print out full connect string
    ns.tprint(text)
}


function connectString(server: CustomServer, currentString: String) {
    if (server.parent == undefined)
        return currentString

    return connectString(server.parent, `connect ${server.hostname};` + currentString)
}

export function getKnownServers(ns: NS, hackedServersOnly: boolean = false) {
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


    if (hackedServersOnly) {
        let keys = knownServers.keys()

        keys.map(x => ns.getServer(x.toString()))
            .forEach(x => {
                if (!x.hasAdminRights) {
                    knownServers.delete(x.hostname)
                }
            })
    }



    return knownServers
}