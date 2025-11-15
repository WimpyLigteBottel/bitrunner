import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    let host = ns.getHostname()
    let targetHost = ns.args[0] as string

    ns.print("Weaken 1")
    while (isToBeWeaken(ns, targetHost)) {
        await ns.sleep(1000);
        if (remainingServerRam(ns, host) < 1.75) {
            continue
        }

        await weakenPrep(ns, targetHost)
    }

    ns.print("Grow 1")
    while (isMaxMoney(ns, targetHost)) {
        await ns.sleep(1000);
        if (remainingServerRam(ns, host) < 1.75) {
            continue
        }
        await growPrep(ns, targetHost)
    }

    ns.print("weaken 2")
    while (isToBeWeaken(ns, targetHost)) {
        await ns.sleep(1000);
        if (remainingServerRam(ns, host) < 1.75) {
            continue
        }
        await weakenPrep(ns, targetHost)
    }

}

function remainingServerRam(ns: NS, host: string): number {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
}

function weakenPrep(ns: NS, host: string) {
    let remainingRam = remainingServerRam(ns, ns.getHostname())
    let countToExecute = Math.floor(remainingRam / 1.75) - 1

    if (countToExecute == 0)
        return

    ns.run("base/weaken.js", countToExecute, host)
}

function growPrep(ns: NS, host: string) {
    let remainingRam = remainingServerRam(ns, ns.getHostname())
    let countToExecute = Math.floor(remainingRam / 1.75) - 1

    if (countToExecute == 0)
        return

    ns.run("base/grow.js", countToExecute, host)
}

function isToBeWeaken(ns: NS, host: string) {
    let minSecurity = ns.getServerMinSecurityLevel(host)
    let currentSecurity = ns.getServerSecurityLevel(host)
    return currentSecurity > minSecurity
}

function isMaxMoney(ns: NS, host: string) {
    let toGrow = ns.getServerMaxMoney(host) - ns.getServerMoneyAvailable(host)

    return toGrow > 0
}



