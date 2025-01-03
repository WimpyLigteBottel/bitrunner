/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL"); // Prevents spammy logs
  ns.tail(); // Opens the log window for better visibility

  const startHostname = "home"; // Default to 'home' if not provided
  const maxDepth = 20; // Max recursion depth

  const serversToProcess = findAllServers(ns, startHostname, maxDepth);

  for (const server of serversToProcess) {

    if (server.includes("home")) {
      ns.print("skipping node " + server);
      continue
    }

    try {
      await hackServer(ns, server)
      await deployAndRunScript(ns, server);
    } catch (err) {
      ns.print(`${err}`);
    }
  }

  ns.print(`Total servers [size=${serversToProcess.length}]`)

}

/**
 * Recursively finds all servers up to a given depth.
 * @param {NS} ns
 * @param {string} hostname
 * @param {number} maxDepth
 * @returns {string[]}
 */
function findAllServers(ns, hostname, maxDepth) {
  const visited = new Set();
  const queue = [{ host: hostname, depth: 0 }];

  while (queue.length > 0) {
    const { host, depth } = queue.pop();
    if (visited.has(host) || depth > maxDepth) continue;

    visited.add(host);
    const neighbors = ns.scan(host);
    neighbors.forEach((neighbor) => queue.push({ host: neighbor, depth: depth + 1 }));
  }


  return Array.from(visited).sort();
}

/**
 * Copies the hacking script to the server and executes it.
 * @param {NS} ns
 * @param {string} hostname
 */
async function hackServer(ns, hostname) {

  let playerHackingLevel = ns.getHackingLevel()

  // below can be commented out to save memory
  if (ns.getServerRequiredHackingLevel(hostname) > playerHackingLevel) {
    throw Error("Player level too low for " + hostname)
  }

  if (ns.fileExists("FTPCrack.exe", "home")) {
    await ns.ftpcrack(hostname);
  }

  if (ns.fileExists("BruteSSH.exe", "home")) {
    await ns.brutessh(hostname);
  }

  if (ns.fileExists("relaySMTP.exe", "home")) {
    await ns.relaysmtp(hostname);
  }

  if (ns.fileExists("HTTPWorm.exe", "home")) {
    await ns.httpworm(hostname);
  }

  if (ns.fileExists("SQLInject.exe", "home")) {
    await ns.sqlinject(hostname);
  }

  try {
    await ns.nuke(hostname);
  } catch (err) {

    throw Error(`Failed to nuke server ${hostname}`)
  }

}

/**
 * Copies the hacking script to the server and executes it.
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} scriptPath
 */
async function deployAndRunScript(ns, hostname) {
  const scriptPath = "scripts/general/hack-host.js"; // Path to the script

  const weakenCost = ns.getScriptRam(scriptPath);
  const maxRam = ns.getServerMaxRam(hostname) * 0.95;
  let maxThreads = Math.floor(maxRam / weakenCost); // Ensure at least 1 thread

  await ns.killall(hostname);

  // Copy script and execute
  await ns.scp(scriptPath, hostname);

  while(maxThreads > 0){
    await ns.exec(scriptPath, hostname, 1, hostname);
    maxThreads--;
  }
  ns.print(`Done executing scripts on ${hostname}`)
}
