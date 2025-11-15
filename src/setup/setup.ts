import { NS } from "@ns";
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
        .keys()
        .map(x => x.toString())
        .forEach(x => {
            try {
                for(let i = 0; i < 5;i++){
                    openPorts(ns, x)
                }
            } catch (e) {
            }
        })
}

function openPorts(ns: NS, targetHost: string) {
    if (ns.fileExists("NUKE.exe", "home")) {
        ns.nuke(targetHost)
    }

    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(targetHost)
    }

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(targetHost)
    }

    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(targetHost)
    }

    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(targetHost)
    }

    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(targetHost)
    }

}


function forwardScripts(ns: NS) {
    function copyToAllScripts(ns: NS, targetLocation: string) {
        let files = ns.ls("home").filter(x => x.includes(".js"))

        ns.scp(files, targetLocation)
    }

    getKnownServers(ns)
        .keys()
        .map(x => x.toString())
        .forEach(x => copyToAllScripts(ns, x))

    ns.tprint('Copied scripts to all servers')
}


