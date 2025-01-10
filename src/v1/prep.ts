import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";


export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()
    const targetHost: string = ns.args[0] as string


    //prep all server
    findAllServers(ns).forEach((server) => {
        ns.scp("v1/hack.js", server.host)
        ns.scp("v1/weaken.js", server.host)
        ns.scp("v1/grow.js", server.host)
    })


    let servers = findAllServers(ns).filter((x) => ns.hasRootAccess(x.host))

    if (servers.length == 0) {
        ns.print("Sleeping because no servers are availaible....")
        await ns.sleep(1000)
        return;
    }

    while (true) {
        const availableMoney = ns.getServerMoneyAvailable(targetHost); // Current money on the server
        const maxMoney = ns.getServerMaxMoney(targetHost); // Maximum money the server can hold
        ns.print(`Money: ${ns.formatNumber(availableMoney)} / ${ns.formatNumber(maxMoney)}`)

        if (availableMoney == maxMoney && ns.getServerSecurityLevel(targetHost) == ns.getServerMinSecurityLevel(targetHost)) {
            break;
        }
        await weakenServer(ns, targetHost)

        await growServer(ns, targetHost)
        await ns.sleep(5000)
    }



    ns.tprint("Server should be prepped!")
}

async function growServer(ns: NS, targetHost: string) {
    while (ns.getServerMaxMoney(targetHost) > ns.getServerMoneyAvailable(targetHost)) {
        let servers = findAllServers(ns, false)
            .filter((x) => ns.hasRootAccess(x.host))
            .filter((x) => getAvailiableRam(ns, x.host) > ns.getScriptRam("./grow.js"))

        if (servers.length == 0) {
            break
        }

        for (const server of servers) {
            let availRam = getAvailiableRam(ns, server.host)
            let cost = ns.getScriptRam("./grow.js")
            let threads = Math.floor(availRam / cost)

            ns.exec("./grow.js", server.host, { threads: threads }, targetHost, 0, threads)
        }
    }

}

async function weakenServer(ns: NS, targetHost: string) {
    let threadsToRun = ns.getServerSecurityLevel(targetHost) / ns.weakenAnalyze(1)

    ns.print(`threadsTORun ${threadsToRun}`)
    while (threadsToRun > 0) {
        let servers = findAllServers(ns)
            .filter((x) => ns.hasRootAccess(x.host))
            .filter((x) => getAvailiableRam(ns, x.host) > ns.getScriptRam("./weaken.js"))

        if (servers.length == 0) {
            await ns.sleep(1000)
            continue
        }

        for (const server of servers) {
            if (threadsToRun <= 0)
                break
            let maxThreadsCanRun = Math.floor(getAvailiableRam(ns, server.host) / ns.getScriptRam("./weaken.js"))

            const pid = ns.exec("./weaken.js", server.host, { threads: maxThreadsCanRun }, targetHost, 0, maxThreadsCanRun)
            if (pid != 0)
                threadsToRun -= maxThreadsCanRun
        }
    }

}


function getAvailiableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName)
}