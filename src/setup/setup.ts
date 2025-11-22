import { NS, Server } from "@ns";
import { getKnownServers } from "../util/find"

export async function main(ns: NS): Promise<void> {
    ns.disableLog('scp')
    ns.disableLog('scan')
    ns.clearLog()

    forwardScripts(ns)
    nukeAll(ns)
}

function nukeAll(ns: NS) {
    getKnownServers(ns)
        .map(x => x.hostname)
        .forEach(x => {
            openPorts(ns, x)
        })
}

function openPorts(ns: NS, targetHost: string) {
    let server = ns.getServer(targetHost)

    let scripts = [
        { id: 1, file: "SQLInject.exe", command: (server: Server) => { ns.sqlinject(server.hostname) } },
        { id: 2, file: "BruteSSH.exe", command: (server: Server) => { ns.brutessh(server.hostname) } },
        { id: 3, file: "FTPCrack.exe", command: (server: Server) => { ns.ftpcrack(server.hostname) } },
        { id: 4, file: "HTTPWorm.exe", command: (server: Server) => { ns.httpworm(server.hostname) } },
        { id: 5, file: "relaySMTP.exe", command: (server: Server) => { ns.relaysmtp(server.hostname) } },
        {
            id: 6, file: "NUKE.exe", command: (server: Server) => {
                server = ns.getServer(targetHost)
                let requiredPorts = server.numOpenPortsRequired ?? 5
                let openPorts = server.openPortCount ?? 0

                if (openPorts >= requiredPorts) {
                    ns.nuke(targetHost)
                }
            }
        }
    ]

    for (const script of scripts) {
        if (ns.fileExists(script.file)) {
            script.command(server)
        }
    }
}


function forwardScripts(ns: NS) {
    function copyToAllScripts(ns: NS, targetLocation: string) {
        let files = ns.ls("home").filter(x => x.includes(".js"))
        ns.print('Copied scripts to ' + targetLocation)
        ns.scp(files, targetLocation)
    }

    getKnownServers(ns).forEach(x => copyToAllScripts(ns, x.hostname))
}


