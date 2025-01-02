/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL")
  ns.tail();

  // Arguments
  const hostname = ns.args[0];
  const killAll = ns.args[1]?.toLowerCase() === "true";

  // Scan for servers to process
  const toBeProcessed = findAllServers(ns, "home", 11);

  // Script RAM requirements
  const weakenScript = "scripts/general/weaken-host.js";
  const growScript = "scripts/general/grow-host.js";
  const hackScript = "scripts/general/hack-host.js";

  const weakenRam = ns.getScriptRam(weakenScript);
  const growRam = ns.getScriptRam(growScript);
  const hackRam = ns.getScriptRam(hackScript);

  for (const server of toBeProcessed) {
      if(server.includes("home")){
        ns.print("skipping node " + server);
        continue
      }

    await ns.sleep(100)
    const maxRam = ns.getServerMaxRam(server);
    const availableRam = maxRam * 0.95;

    // Skip servers with insufficient RAM
    if (availableRam <= 0) {
      ns.print(`Skipping ${server}, insufficient RAM.`);
      continue;
    }

    let weakenThreads = Math.floor(availableRam * 0.5 / weakenRam); // 50% for weaken
    let growThreads = Math.floor(availableRam * 0.3 / growRam);   // 30% for grow
    let hackThreads = Math.floor(availableRam * 0.2 / hackRam);    // 20% of RAM

    // Safety checks
    if (weakenThreads <= 0 || growThreads <= 0 || hackThreads <= 0) {
      ns.print(`Skipping ${server}, insufficient threads.`);
      continue;
    }

    ns.print(`${server}: Weaken: ${weakenThreads}, Grow: ${growThreads}, Hack: ${hackThreads}`);

    if (killAll) {
      ns.killall(server);
    }

    // Copy scripts if not already present
    await ns.scp([weakenScript, growScript, hackScript], server);


    while (weakenThreads >= 1 || growThreads >= 1 || hackThreads >= 1) {

      await ns.sleep(10);

      if (weakenThreads >= 1) {
        await ns.exec(weakenScript, server, 1, server);
        weakenThreads--;
      }

      if (growThreads >= 1) {
        await ns.exec(growScript, server, 1, server);
        growThreads--;
      }

      if (hackThreads >= 1) {
        await ns.exec(hackScript, server, 1, server);
        hackThreads--;
      }
    }
    ns.print("Done launching scripts")

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