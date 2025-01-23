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

        if (ns.ps(homeserver?.host).filter(x => x.filename.includes("prep.js")).length > 0) {
            ns.killall(homeserver?.host)
        }

        if (!isPrepped(getServerPrepModel(ns, target, homeserver.host))) {
            ns.exec(PREP_V3, homeserver?.host!, 1)
            ns.tprint(`INFO Running ${PREP_V3} on ${homeserver?.host}`)
        } else {
            if (ns.exec(SINGLE_PREP_V3, homeserver?.host!, 1, target!)) {
                homeServers = homeServers.filter(x => x.host != homeserver.host)
                ns.tprint(`INFO Running ${SINGLE_PREP_V3} on ${homeserver?.host} targeting ${target!}`)
            } else {
                targets.push(target)
                ns.tprint(`ERROR Failed to run ${SINGLE_PREP_V3} on ${homeserver?.host} targeting ${target!}`)
            }
        }

        await ns.sleep(1)
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
        .sort((b, a) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host))
        .map(x => x.host)
}