import { NS } from "@ns";
import { findAllServers } from "./FindAllServers";
import { hackServer } from "./backdoor";
import { getAvailiableRam } from "./HackThreadUtil";

export async function main(ns: NS) {
    ns.clearLog();

    const serversToProcess = findAllServers(ns, false, false).filter(x => !x.host.includes("home"));

    for (const server of serversToProcess) {
        try {
            await hackServer(ns, server.host)
            await deployAndRunScript(ns, server.host)
        } catch (err) {
            ns.print(`${err}`);
        }
    }

    ns.print(`Total servers [size=${serversToProcess.length}]`)

}

/**
 * Copies the hacking script to the server and executes it.
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} scriptPath
 */
async function deployAndRunScript(ns: NS, hostname: string) {
    const scriptPath = "scripts/general/hack-host.js"; // Path to the script

    await ns.killall(hostname);

    const availableRam = getAvailiableRam(ns, hostname, 1);
    const threads = Math.max(1, Math.floor(availableRam / ns.getScriptRam(scriptPath)));

    // Copy script and execute
    await ns.scp(scriptPath, hostname);
    await ns.exec(scriptPath, hostname, threads, hostname, threads);

    ns.print(`Done executing scripts on ${hostname}`)
}
