import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.tail();

    prepServersForHack(ns)

    let servers = findAllServers(ns, false, false).filter(x => !x.host.includes("home")).filter(x => ns.hasRootAccess(x.host)).sort((b, a) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host));
    let homeServers = findAllServers(ns, false, true);

    if (servers.length === 0) {
        ns.print("No servers with root access available. Sleeping...");
        await ns.sleep(1000);
        return;
    }

    let targetHost = servers.pop()!.host
    ns.print(`WeakenTime ${ns.getWeakenTime(targetHost)} -> ${targetHost}`)

    let currentFindPid = ns.exec("test.js", "home", 1, targetHost)

    // Prep the target server
    while (true) {
        if (targetHost == undefined) {
            ns.print("All servers prepped!")
            break
        }


        const availableMoney = ns.getServerMoneyAvailable(targetHost); // Current money
        const maxMoney = ns.getServerMaxMoney(targetHost); // Max money
        const currentSecurity = ns.getServerSecurityLevel(targetHost); // Current security level
        const minSecurity = ns.getServerMinSecurityLevel(targetHost); // Min security level

        // Exit if the server is fully prepped
        if (availableMoney === maxMoney && currentSecurity === minSecurity) {
            ns.tprint(`Server is fully prepped! ${targetHost}`);
            targetHost = servers.pop()?.host ?? ""

            if (targetHost == "")
                break




            homeServers.forEach(x => ns.killall(x.host, true))
            ns.print(`WeakenTime ${ns.getWeakenTime(targetHost)} -> ${targetHost}`)
            currentFindPid = ns.exec("test.js", "home", 1, targetHost)


            continue;
        }

        // Weaken first if security is above minimum
        if (availableMoney < maxMoney) {
            for (const homeServer of homeServers) {
                const availableRam = getAvailableRam(ns, homeServer.host);
                const scriptRam = ns.getScriptRam("/v1/weak.js");
                const threads = Math.max(1, Math.floor(availableRam / scriptRam / 2));

                ns.exec("/v1/weak.js", homeServer.host, threads, targetHost, 100);
                ns.exec("/v1/grow.js", homeServer.host, threads, targetHost, 0);
            }
        }

        // Weaken first if security is above minimum
        if (currentSecurity > minSecurity && availableMoney == maxMoney) {
            for (const homeServer of homeServers) {
                const availableRam = getAvailableRam(ns, homeServer.host);
                const scriptRam = ns.getScriptRam("/v1/weak.js");
                const threads = Math.max(1, Math.floor(availableRam / scriptRam));

                ns.exec("/v1/weak.js", homeServer.host, threads, targetHost, 0);
            }
        }

        // Short delay to prevent excessive CPU usage
        await ns.sleep(50);
    }
}

// Helper function: Get available RAM on a server
function getAvailableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);
}
