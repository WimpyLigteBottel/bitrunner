import { NS } from "@ns";
import { getKnownServers } from "../util/find"
import { getAvailableRam } from "../util/availableram"
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "/base/debug";
import { HackRequest } from "/models/Models";

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)
    ns.clearPort(1)

    while (true) {
        let request = await readPortHackRequest(ns, 1)

        try {
            if (request.requestType == 'HACK')
                await executeHGW(ns, request)
            if (request.requestType == 'PREP')
                await executePrep(ns, request)
        } catch (e) {
            ns.print(`ERROR ${e}`)
        }
    }
}

async function readPortHackRequest(ns: NS, portNumber: number): Promise<HackRequest> {
    let request = await ns.readPort(portNumber) as 'NULL PORT DATA' | string

    if (request == 'NULL PORT DATA') {
        await ns.nextPortWrite(1)

        return readPortHackRequest(ns, portNumber)
    }

    return await JSON.parse(request) as HackRequest
}

async function executeHGW(ns: NS, request: HackRequest) {
    let firstServer = findPreppedServers(ns).pop()!

    ns.print(firstServer.hostname)
    let ram = getAvailableRam(ns, request.requesterName)
    let batch = createBatchOptimal(ns, firstServer.hostname, ram, 'HACK')

    batch.tasks.forEach(task => {
        ns.exec(task.script, request.requesterName, task.threads, batch.server, task.delay)
    });
}


async function executePrep(ns: NS, request: HackRequest) {
    let firstServer = findServersToPrep(ns).pop()!
    let ram = getAvailableRam(ns, request.requesterName)
    let batch = createBatchOptimal(ns, firstServer.hostname, ram, 'PREP')

    batch.tasks.forEach(task => {
        ns.exec(task.script, request.requesterName, task.threads, batch.server, task.delay)
    });
}


function findServersToPrep(ns: NS) {

    return getKnownServers(ns, false)
        .values()
        .toArray()
        .filter(server => server.requiredHackingSkill != undefined)
        .filter(server => ns.getPlayer().skills.hacking > server.requiredHackingSkill!)
        .filter(server => !server.hostname.includes('home'))
        .filter(server => !server.hostname.includes('fulcrumassets'))
        .filter(server => ns.getServerSecurityLevel(server.hostname) > ns.getServerMinSecurityLevel(server.hostname))
        .filter(server => ns.getServerMaxMoney(server.hostname) != ns.getServerMoneyAvailable(server.hostname))
        // (b,a) == desc
        // (a,b) == asc
        .toSorted((b, a) => a.requiredHackingSkill! - b.requiredHackingSkill!)
        // .toSorted((a, b) => a.requiredHackingSkill! - b.requiredHackingSkill!)

}



function findPreppedServers(ns: NS) {
    return getKnownServers(ns, true)
        .values()
        .toArray()
        .filter(server => !server.hostname.includes('home'))
        .filter(server => ns.getServerMoneyAvailable(server.hostname) > 100)
        .filter(server => ns.getServerMaxMoney(server.hostname) == ns.getServerMoneyAvailable(server.hostname))
        // (b,a) == desc
        // (a,b) == asc
        .sort((a, b) => ns.getWeakenTime(a.hostname) - ns.getWeakenTime(b.hostname));

}