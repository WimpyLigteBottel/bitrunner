import { NS } from "@ns";
import { getKnownServers } from "../util/find"

export async function main(ns: NS): Promise<void> {
    ns.disableLog('scp')
    ns.disableLog('scan')
    ns.clearLog()


    forwardScripts(ns)
}

function forwardScripts(ns: NS) {
    function copyToAllScripts(ns: NS, targetLocation: string) {
        let files = ns.ls("home").filter(x => x.includes(".js"))

        ns.scp(files, targetLocation)
    }

    getKnownServers(ns)
        .keys()
        .map(x=> x.toString())
        .forEach(x => copyToAllScripts(ns, x))
        
    ns.tprint('Copied scripts to all servers')
}


