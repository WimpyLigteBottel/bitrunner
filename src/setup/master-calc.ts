import { NS } from "@ns";
import { getAvailableRam } from "../util/availableram"
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "../models/debug";
import { BUFFER, CustomServerV2, } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";



export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    ns.exec("setup/setup.js", "home", 1)
    ns.exec('util/killall.js', 'home', 1)

    await ns.sleep(1000)

    let counter = 0;
    while (true) {
        let target = getTargetServer(ns);
        let firstWeakenFinish = performance.now() + target.weakTime
        let offset = 0

        let pid = ns.exec("util/analyze.js", "home", 1, target.hostname)
        while (true) {
            try {
                let server = await nextUsableServer(ns)
                let batch = createBatchOptimal(ns, target.hostname, server.availableRam)

                for (const task of batch.tasks) {
                    const additionalMsec = Math.max(0, firstWeakenFinish + offset - performance.now() - task.time);

                    ns.exec(task.script, server.hostname, task.threads, batch.server, additionalMsec, `Threads ${task.threads}`);
                    offset += BUFFER;
                }
            } catch (e) {
                if (e instanceof Error && e.message == 'There is no more servers to execute on') {
                    ns.print('Going to wait now ' + `${ns.tFormat(target.weakTime)} for ${target.hostname}`)
                    await ns.sleep(target.weakTime + offset + 5000)
                    break;
                }

                counter++;
                ns.print(`ERROR counter:${counter} -> ${e}`)
                await ns.sleep(5000)
            }
        }
        ns.kill(pid)
    }
}

function getTargetServer(ns: NS) {
    if (ns.args[0] != undefined && ns.args[0] != '') {
        return getCustomServer(ns, ns.args[0] as string);
    }

    return notPreppedServers(ns).pop()!;
}

async function nextUsableServer(ns: NS): Promise<CustomServerV2> {
    let target = getTargetServer(ns)
    let servers = findServersThatCanBeUsed(ns).toSorted((b, a) => a.availableRam - b.availableRam);

    for (const x of servers) {
        let batch = createBatchOptimal(ns, target.hostname, x.availableRam).totalCost
        let noScriptsRunning = getAvailableRam(ns, x.hostname) > batch
        if (noScriptsRunning) {
            return x;
        }
    }

    throw Error('There is no more servers to execute on')
}


function findServersThatCanBeUsed(ns: NS) {
    // return getKnownServers(ns, false)
    return ns.getPurchasedServers()
        .toSorted()
        .map(server => getCustomServer(ns, server))
        .filter(server => server.canExecuteScripts)
        .filter(server => getAvailableRam(ns, server.hostname) > 5.20)
}

function findNextServerToPrep(ns: NS) {
    return notPreppedServers(ns).pop()!
}