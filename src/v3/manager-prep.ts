import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";
import { PREP_V3, SINGLE_PREP_V3 } from "/util/HackConstants";
import { getServerPrepModel, isPrepped } from "./single-prep";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()

    let targets = getTargetsToHack(ns)
    let homeServers = serverToRunScripts(ns)

    ns.tprint(`INFO servers to run ${homeServers.map(x => x.host)}`)
    ns.tprint(`INFO servers to target  ${targets}`)


    for (const homeserver of homeServers) {
        let target = targets.pop()

        if (target == undefined) {
            break;
        }

        ns.exec(SINGLE_PREP_V3, homeserver?.host!, 1, target!)

        await ns.sleep(100)
    }

    ns.tprint(`INFO No more servers to run ${homeServers.map(x => x.host)} targeting ${targets}`)
}


function serverToRunScripts(ns: NS) {
    return findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))
        .filter(x => x.host.includes("home") && x.host != "home")
        .sort((a, b) => ns.getServerMaxRam(a.host) - ns.getServerMaxRam(b.host));
}

function getTargetsToHack(ns: NS) {
    return findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host))
        .filter(x => ns.getServerMaxMoney(x.host) > 0)
        .filter(x => !ns.getServer(x.host).purchasedByPlayer)
        .sort((a, b) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host))
        .map(x => x.host)
}