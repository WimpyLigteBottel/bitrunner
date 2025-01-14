import { NS } from "@ns";
import { findAllServers } from "./FindAllServers";

export async function main(ns: NS) {
    ns.clearLog();

    const serversToProcess = findAllServers(ns, false, false);

    for (const server of serversToProcess) {
        try {
            await hackServer(ns, server.host)
        } catch (err) {
            ns.print(`ERROR ${err}`);
        }
    }

    ns.print(`Total servers [size=${serversToProcess.length}]`)

}

/**
 * Copies the hacking script to the server and executes it.
 * @param {NS} ns
 * @param {string} hostname
 */
export async function hackServer(ns: NS, hostname: string) {

    let playerHackingLevel = ns.getHackingLevel()

    // below can be commented out to save memory
    if (ns.getServerRequiredHackingLevel(hostname) > playerHackingLevel) {
        throw Error("Player level too low for " + hostname)
    }

    if(ns.hasRootAccess(hostname)){
        return;
    }

    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(hostname);
    }

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(hostname);
    }

    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(hostname);
    }

    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(hostname);
    }

    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(hostname);
    }

    try {
        ns.nuke(hostname);
        ns.tprint(`Has nuked ${hostname}`)
    } catch (err) {
        throw Error(`Failed to nuke server ${hostname}`)
    }

}