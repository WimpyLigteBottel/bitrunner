import { NS } from "@ns";
import { getKnownServers } from "../util/find"
import { getAvailableRam } from "../util/availableram"

export async function main(ns: NS): Promise<void> {
    ns.disableLog('getServerMaxRam')
    ns.disableLog('getServerUsedRam')
    ns.disableLog('getServerSecurityLevel')
    ns.disableLog('getServerMinSecurityLevel')
    ns.disableLog('scan')
    ns.disableLog('sleep')
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('getServerMoneyAvailable')
    ns.disableLog('exec')
    ns.ui.openTail()

    let toBePrepped = findServersToPrep(ns)


    while (toBePrepped.length > 0) {
        await ns.sleep(1000)
        let target = toBePrepped[0]
        ns.print(`target to be prepped ${target.hostname}`)

        findServersThatCanBeUsed(ns)
            .forEach(x => {
                let totalThreads = Math.max(1, Math.floor(getAvailableRam(ns, x.hostname) / 1.75))

                if (totalThreads > 2) {
                    let halfThreads = Math.max(1, Math.floor(totalThreads / 2))
                    ns.exec('base/weaken.js', x.hostname, halfThreads, target.hostname, 0)
                    ns.exec('base/grow.js', x.hostname, halfThreads, target.hostname, 0)
                } 

            })

        // if server has been prepedd it should clear it from the list
        toBePrepped = findServersToPrep(ns)
    }
}


function findServersToPrep(ns: NS) {

    return getKnownServers(ns, false)
        .values()
        .toArray()
        .filter(server => !server.hostname.includes('home'))
        .filter(server => server.moneyMax != undefined)
        .filter(server => ns.getServerSecurityLevel(server.hostname) > ns.getServerMinSecurityLevel(server.hostname))
        .filter(server => ns.getServerMaxMoney(server.hostname) != ns.getServerMoneyAvailable(server.hostname))
        // (b,a) == desc
        // (a,b) == asc
        // .toSorted((b, a) => a.requiredHackingSkill! - b.requiredHackingSkill!)
        .toSorted((a, b) => a.requiredHackingSkill! - b.requiredHackingSkill!)

}


function findServersThatCanBeUsed(ns: NS) {

    return getKnownServers(ns, true)
        .values()
        .toArray()
        // .filter(server => server.hostname != 'home')
        .filter(server => server.hasAdminRights == true)
        .filter(server => getAvailableRam(ns, server.hostname) > 2)
}