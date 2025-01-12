import { NS } from "@ns";
import { findAllServers, prepServersForHack } from "/util/FindAllServers";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, growScriptName, weakenScriptName } from "/util/HackConstants";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.tail();

    prepServersForHack(ns)

    let servers = findAllServers(ns, false, false).filter(x => !x.host.includes("home")).filter(x => ns.hasRootAccess(x.host)).sort((b, a) => ns.getWeakenTime(a.host) - ns.getWeakenTime(b.host));
    let homeServers = findAllServers(ns, false, true).filter(x => x.host == ns.getHostname());

    if (servers.length === 0) {
        ns.print("No servers with root access available. Sleeping...");
        await ns.sleep(1000);
        return;
    }

    let targetHost = servers.pop()!.host
    ns.print(`WeakenTime ${ns.getWeakenTime(targetHost)} -> ${targetHost}`)

    let counter = 0
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
            ns.tprint(`Server is fully prepped! ${targetHost} `);
            targetHost = servers.pop()?.host ?? ""

            if (targetHost == "")
                break


            homeServers.forEach(x => ns.killall(x.host, true)) // only kiling on home remaining weaken scripts
            ns.print(`WeakenTime ${ns.tFormat(ns.getWeakenTime(targetHost))} -> ${targetHost}-${counter++}`)
            continue;
        }

        // Weaken first if security is above minimum
        if (availableMoney < maxMoney) {
            for (const homeServer of homeServers) {
                const availableRam = getAvailiableRam(ns, homeServer.host, 10);
                const scriptRam = ns.getScriptRam(weakenScriptName);
                const threads = Math.max(1, Math.floor(availableRam / scriptRam / 2));

                if (threads == 1)
                    continue

                ns.exec(weakenScriptName, homeServer.host, threads, targetHost, BATCH_DELAY, threads);
                ns.exec(growScriptName, homeServer.host, threads, targetHost, 0, threads);
            }
        }

        // Weaken first if security is above minimum
        if (currentSecurity > minSecurity && availableMoney == maxMoney) {
            for (const homeServer of homeServers) {
                const availableRam = getAvailiableRam(ns, homeServer.host, 10);
                const scriptRam = ns.getScriptRam(weakenScriptName);
                const threads = Math.max(1, Math.floor(availableRam / scriptRam));

                if (threads == 1)
                    continue

                ns.exec(weakenScriptName, homeServer.host, threads, targetHost, 0, threads);
            }
        }

        // Short delay to prevent excessive CPU usage
        await ns.sleep(BATCH_DELAY);
    }
}