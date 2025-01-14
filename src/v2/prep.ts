import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";
import { BATCH_DELAY } from "/util/HackConstants";
import { findServerStats } from "/util/Find";
import { blockTillAllWeakensAreDone, prepServer } from "./single-prep";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");

    let servers = findAllServers(ns, false, false)
        .filter(x => !x.host.includes("home"))
        .filter(x => ns.hasRootAccess(x.host))
        .sort((b, a) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host));

    if (servers.length === 0) {
        ns.print("No servers with root access available. Sleeping...");
        await ns.sleep(1000);
        return;
    }

    let targetHost = servers.pop()!.host ?? ""

    let currentHost = ns.getHostname()

    let counter = 0
    while (targetHost != "") {
        await blockTillAllWeakensAreDone(ns, currentHost)
     

        if (await prepServer(ns, targetHost, currentHost)) {
            targetHost = servers.pop()?.host ?? ""
            ns.print(`WeakenTime ${ns.tFormat(ns.getWeakenTime(targetHost))} -> ${targetHost}-${counter++}`)
        }

        // Short delay to prevent excessive CPU usage
        await ns.sleep(BATCH_DELAY);
        ns.print("INFO \n", JSON.stringify(findServerStats(ns, targetHost), null, 2))
  
    }
}