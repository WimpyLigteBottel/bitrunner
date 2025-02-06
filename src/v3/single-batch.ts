import { NS } from "@ns";
import { requestAndReadResponse } from "./client-hack-request";
import { RespondThreads } from "./host-hacking-calculator";
import { blockTillAllWeakensAreDone } from "./single-prep";
import { print } from "/util/HackConstants";
import { findServerStats } from "/util/Find";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")

    let targetHost = ns.args[0] as string
    const currentHost = ns.getHostname();

    while (true) {
        await ns.sleep(100)
        await blockTillAllWeakensAreDone(ns, currentHost)
        let response: RespondThreads = await requestAndReadResponse(ns, targetHost, currentHost)

        const possibleBatches = getMaxPossibleBatch(ns, response);
        let message = {
            possibleBatches: possibleBatches,
            totalCost: response.totalCost,
            availRam: getAvailiableRam(ns, currentHost, 0),
            hackPercentage: response.hackPercentage,
            stats: findServerStats(ns, targetHost)
        }
        print(ns, JSON.stringify(message, undefined, 1), false)

        let previousDelay = 0
        for (let x = 0; x < Math.min(100, possibleBatches); x++) {
            response.tasks
                .filter(x => x.threads != 0) // Not empty threads
                .forEach(x => ns.exec(
                    x.script,
                    response.intededServer, // host
                    x.threads,
                    targetHost,
                    x.delay + previousDelay, // Delay
                    x.threads
                )) // execute

            previousDelay += 100 * (response.tasks.length + 1)
        }
    }

}

function getMaxPossibleBatch(ns: NS, response: RespondThreads): number {
    return Math.floor(getAvailiableRam(ns, response.intededServer, 0) / response.totalCost)
}

function getAvailiableRam(ns: NS, serverName: string, reserve: number = 10): number {
    return ns.getServerMaxRam(serverName) - reserve - ns.getServerUsedRam(serverName)
}
