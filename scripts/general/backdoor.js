/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL"); // Prevents spammy logs
  ns.tail(); // Opens the log window for better visibility

  const startHostname = ns.args[0] || "home"; // Default to 'home' if not provided
  const maxDepth = 10; // Max recursion depth
  const scriptPath = "scripts/general/hack-host.js"; // Path to the script

  
  let grow_nodes = ns.scan("home").filter((value) => {
    return value.includes("grow")
  })

  
  let home_nodes = ns.scan("home").filter((value) => {
    return value.includes("home")
  })

  // Verify script exists
  if (!ns.fileExists(scriptPath, "home")) {
    ns.tprint(`ERROR: Script "${scriptPath}" not found on home!`);
    return;
  }

  const serversToProcess = findAllServers(ns, startHostname, maxDepth);

  for (const server of serversToProcess) {

    if(home_nodes.includes(server) || grow_nodes.includes(server) || server == "home"){
      ns.print("skipping node " + server);
      continue
    }


    try {
      ns.print(`Processing server: ${server}`);
      await processServer(ns, server, scriptPath);
    } catch (err) {
      ns.print(`ERROR: Failed to process server: ${server}. ${err}`);
    }
  }
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
  
  return Array.from(visited);
}

/**
 * Processes a server based on its hacking level.
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} level
 * @param {string} scriptPath
 */
async function processServer(ns, hostname, scriptPath) {
  // Skip servers already rooted
  if (!ns.hasRootAccess(hostname)) {
    // Level-specific hacks
    if (ns.fileExists("FTPCrack.exe", "home")) {
      await ns.ftpcrack(hostname);
    }
    if (ns.fileExists("BruteSSH.exe", "home")) {
      await ns.brutessh(hostname);
    }

    try {
      // Always attempt to nuke
      await ns.nuke(hostname);
    } catch (error) { }
  }





  // Deploy and run the hack script
  await deployAndRunScript(ns, hostname, scriptPath);
}

/**
 * Copies the hacking script to the server and executes it.
 * @param {NS} ns
 * @param {string} hostname
 * @param {string} scriptPath
 */
async function deployAndRunScript(ns, hostname, scriptPath) {
  const weakenCost = ns.getScriptRam(scriptPath) + 0.15;
  const maxRam = ns.getServerMaxRam(hostname);
  const maxThreads = Math.max(1, Math.floor(maxRam / weakenCost) - 1); // Ensure at least 1 thread

  // Skip servers with insufficient RAM
  if (maxThreads < 1) {
    ns.print(`Insufficient RAM on server: ${hostname}`);
    return;
  }

  // Copy script and execute
  await ns.scp(scriptPath, hostname);
  ns.killall(hostname);
  ns.exec(scriptPath, hostname, maxThreads, hostname);
}
