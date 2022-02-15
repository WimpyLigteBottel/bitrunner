/** @param {import(".").NS } ns */
export async function main(ns) {
  let args = arguments["0"].args;

  let HOSTNAME = ns.getHostname();
  ns.print(`HOSTNAME ${HOSTNAME}`);
  let hackingLevel = ns.getHackingLevel();

  ns.print(`hackingLevel ${hackingLevel}`);
  let hosts = ns.scan(HOSTNAME);
  ns.print(`hosts ${hosts}`);

  for (let i = 0; i < hosts.length; ++i) {
    let targetHost = hosts[i];
    if (targetHost != HOSTNAME && targetHost != "darkweb") {
      await gainRootAccess(ns, targetHost, hackingLevel);
    }
  }
}

/** @param {import(".").NS } ns */
async function gainRootAccess(ns, targetHost, hackingLevel) {
  if (!ns.hasRootAccess(targetHost)) {
    if (ns.getServerRequiredHackingLevel(targetHost) <= hackingLevel) {
      var openPorts = 0;

      if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(targetHost);
        openPorts++;
      }

      if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(targetHost);
        openPorts++;
      }

      if (ns.getServerNumPortsRequired(targetHost) >= openPorts) {
        ns.print(`Getting access to ${targetHost}`);
        ns.nuke(targetHost);

        await ns.installBackdoor(targetHost);
      }
    }
  }
}
