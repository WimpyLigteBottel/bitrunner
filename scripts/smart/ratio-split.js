/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL")
  ns.tail();

  while (true) {
    await hackServer(ns)
    await ns.sleep(100)
  }
}


async function hackServer(ns) {
  let hostname = ns.args[0] ?? "";
  const killAll = ns.args[1] ?? false;

  // Scan for servers to process
  const toBeProcessed = ["home"].concat(ns.scan("home").filter(server => {
    return server.includes("home"); // Only servers with RAM
  }));

  let allServer = findAllServers(ns)
    .filter((x) => !x.includes("home"))
    .filter((x) => ns.getServerRequiredHackingLevel(x) < ns.getHackingLevel())
    .filter((x) => ns.getServerMaxMoney(x) > 0)
    .sort((a, b) => ns.getHackTime(b) - ns.getHackTime(a))



  for (const server of toBeProcessed) {
    if (killAll == "true") {
      ns.print("WARN ", "Killing all threads " + server)
      await ns.killall(server);
    }
    try {
      if (ns.args[0].trim() == "") {
        hostname = allServer.pop()

        ns.print("No hostname using " + hostname)
      }

      let serverData = getServerData(ns, server, hostname)

      copyToServer(ns, serverData)

      await executeThreads(ns, serverData)
    } catch (error) {
      ns.print(`Failed for server ${server} ` + error)
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
function findAllServers(ns) {
  const visited = new Set();
  const queue = [{ host: "home", depth: 0 }];

  while (queue.length > 0) {
    const { host, depth } = queue.pop();
    if (visited.has(host) || depth > 50) continue;

    visited.add(host);
    const neighbors = ns.scan(host);
    neighbors.forEach((neighbor) => queue.push({ host: neighbor, depth: depth + 1 }));
  }


  return Array.from(visited);
}

/** @param {NS} ns **/
function copyToServer(ns, { weakenScript, growScript, hackScript, server }) {
  // Copy scripts if not already present
  ns.scp([weakenScript, growScript, hackScript], server);
}

/** @param {NS} ns **/
function getServerData(ns, server, hostname) {
  // Script RAM requirements
  const weakenScript = "scripts/smart/weaken.js";
  const growScript = "scripts/smart/grow.js";
  const hackScript = "scripts/smart/hack.js";

  const maxRam = ns.getServerMaxRam(server);
  const availableRam = Math.floor(maxRam * 0.99);


  // Skip servers with insufficient RAM
  if (availableRam <= 0) {
    throw Error("Skipping ${server}, insufficient RAM.");
  }

  return {
    "hostname": hostname,
    "server": server,
    "maxRam": availableRam,

    // Script RAM requirements
    "weakenScript": weakenScript,
    "growScript": growScript,
    "hackScript": hackScript,
  }

}

/** @param {NS} ns **/
async function executeThreads(ns, { weakenScript, growScript, hackScript, server, hostname, maxRam }) {

  let delay = 0;


  const hackTime = ns.getHackTime(hostname);
  const growTime = ns.getGrowTime(hostname);
  const weakenTime = ns.getWeakenTime(hostname);

  let stats = setupStats(ns, hostname, maxRam, server)

  try {
    let totalCost = stats.totalThreadsUsed * 1.75

    let ramAvail = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
    while (totalCost < ramAvail) {
      ramAvail = maxRam - ns.getServerUsedRam(server)
      ns.exec(weakenScript, server, stats.weaken, hostname, delay)
      ns.exec(hackScript, server, stats.hack, hostname, Math.abs(weakenTime - hackTime + delay))
      ns.exec(growScript, server, stats.grow, hostname, Math.abs(hackTime - growTime + delay))
      ns.exec(weakenScript, server, stats.weaken2, hostname, (Math.abs(growTime - weakenTime + delay)))
      delay += delay
      ramAvail = maxRam - ns.getServerUsedRam(server)
      await ns.sleep(1)
    }

    ns.print(`${server} is executing threads towards ${hostname}`)
  } catch (err) {
    ns.print("ERROR" + err)
  }

}

/** @param {NS} ns **/
function setupStats(ns, hostname, maxRam, server) {

  const hackTime = ns.getHackTime(hostname);
  const growTime = ns.getGrowTime(hostname);
  const weakenTime = ns.getWeakenTime(hostname);

  let totalCost = 1.75 * 4
  let totalThreadsAvail = Math.floor(Math.floor(maxRam / totalCost) * 0.95)




  let money = ns.getServerMoneyAvailable(hostname)
  if (money === 0)
    money = 1;
  const maxMoney = ns.getServerMaxMoney(hostname);
  const minSec = ns.getServerMinSecurityLevel(hostname);
  const sec = ns.getServerSecurityLevel(hostname)

  const cores = ns.getServer(hostname).cpuCores;

  ns.securit

  let stats = {
    name: hostname,
    serverMoney: {
      avail: ns.formatNumber(money),
      maxMoney: ns.formatNumber(maxMoney)
    },
    hack: Math.ceil(ns.hackAnalyzeThreads(hostname, maxMoney)),
    hack_time: ns.tFormat(hackTime),
    grow: Math.ceil(ns.growthAnalyze(hostname, maxMoney / 1, cores)),
    grow_time: ns.tFormat(growTime),
    weaken: ns.weakenAnalyze(Math.ceil((sec - minSec) * 53), cores),
    weaken2: 1,
    weaken_time: ns.tFormat(weakenTime),
    increaseAmount: 1,
    totalThreadsUsed: -1
  }


  stats.weaken2 = Math.ceil(stats.grow / 12.5)

  stats.totalThreadsUsed = stats.hack + stats.grow + stats.weaken + stats.weaken2


  if (stats.totalThreadsUsed > totalThreadsAvail) {
    let reduceAmount = stats.totalThreadsUsed / totalThreadsAvail
    stats.grow /= reduceAmount
    stats.hack /= reduceAmount
    stats.weaken /= reduceAmount
    stats.weaken2 /= reduceAmount

  } else {
    stats.increaseAmount = totalThreadsAvail / stats.totalThreadsUsed
  }

  stats.grow = Math.abs(stats.grow)
  stats.hack = Math.abs(stats.hack)
  stats.weaken = Math.abs(stats.weaken)
  stats.weaken2 = Math.abs(stats.weaken2)

  stats.grow = Math.floor(stats.grow)
  stats.hack = Math.floor(stats.hack)
  stats.weaken = Math.floor(stats.weaken)
  stats.weaken2 = Math.floor(stats.weaken2)
  stats.increaseAmount = Math.floor(stats.increaseAmount)


  stats.grow = Math.max(1, stats.grow)
  stats.hack = Math.max(1, stats.hack)
  stats.weaken = Math.max(1, stats.weaken)
  stats.weaken2 = Math.max(1, stats.weaken2)

  stats.totalThreadsUsed = stats.hack + stats.grow + stats.weaken + stats.weaken2

  // ns.print("INFO\n", JSON.stringify({ stats }, null, 1))

  return stats
}