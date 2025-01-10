import { NS } from "@ns";
import { findAllServers } from "/util/FindAllServers";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.tail();

    let targetHost: string = ns.args[0] as string ?? await ns.prompt("Server to hack", { type: "text" }) as string;
    if (!targetHost) {
        ns.tprint("Error: Please specify a target server.");
        return;
    }

    // Copy necessary scripts to all servers
    const allServers = findAllServers(ns);
    for (const server of allServers) {
        ns.scp(["/v1/hack.js", "/v1/weak.js", "/v1/grow.js"], server.host);
    }

    // Filter servers with root access and available RAM
    let servers = allServers.filter((x) => ns.hasRootAccess(x.host));

    if (servers.length === 0) {
        ns.print("No servers with root access available. Sleeping...");
        await ns.sleep(1000);
        return;
    }

    // Prep the target server
    while (true) {
        const availableMoney = ns.getServerMoneyAvailable(targetHost); // Current money
        const maxMoney = ns.getServerMaxMoney(targetHost); // Max money
        const currentSecurity = ns.getServerSecurityLevel(targetHost); // Current security level
        const minSecurity = ns.getServerMinSecurityLevel(targetHost); // Min security level

        ns.print(`Money: ${ns.formatNumber(availableMoney)} / ${ns.formatNumber(maxMoney)}`);
        ns.print(`Security: ${currentSecurity} / ${minSecurity}`);

        // Exit if the server is fully prepped
        if (availableMoney === maxMoney && currentSecurity === minSecurity) {
            ns.tprint("Server is fully prepped!");
            break;
        }

        // Weaken first if security is above minimum
        if (currentSecurity > minSecurity || availableMoney < maxMoney) {

            for (const server of servers) {
                const availableRam = getAvailableRam(ns, server.host);
                const scriptRam = ns.getScriptRam("/v1/weak.js");
                const threads = Math.max(1, Math.floor(availableRam / scriptRam / 2));

                ns.exec("/v1/weak.js", server.host, threads, targetHost, 0);
                ns.exec("/v1/grow.js", server.host, threads, targetHost, 0);
            }
            await ns.sleep(500);
        }



        // Short delay to prevent excessive CPU usage
        await ns.sleep(2000);
    }
}

// Helper function: Get available RAM on a server
function getAvailableRam(ns: NS, serverName: string): number {
    return ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);
}
