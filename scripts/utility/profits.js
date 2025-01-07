/** @param {NS} ns **/
export async function main(ns) {
  ns.tail()
  let servers = findAllServers(ns).filter(({ host }) => !host.includes("home"))



  for (const server of servers) {

    
    const first = calculateFullCycleMoneyPerSecond(ns, server.host);

    if (first == undefined) {
      continue;
    }

    const {
      hackThreads, growThreads, weakenThreads1, weakenThreads2,
      fullCycleTime,
      moneyPerCycle,
      moneyPerSecond } = first;

    if (moneyPerSecond <= 0) {
      continue;
    }

    // Logging for debugging
    ns.tprint(`Server: ${server.host}`);
    ns.tprint(`Hack Threads: ${hackThreads}, Grow Threads: ${growThreads}, Weaken Threads: ${weakenThreads1 + weakenThreads2}`);
    ns.tprint(`Cycle Time: ${ns.tFormat(fullCycleTime)} (ms)`);
    ns.tprint(`Money Generated per Cycle: $${ns.formatNumber(moneyPerCycle)}`);
    ns.tprint(`Money Generated per Second: $${ns.formatNumber(moneyPerSecond)}`);
    ns.tprint("----------")
  }
}

/** @param {NS} ns **/
export function calculateMoneyPerSecond(ns, server) {
  // Get server stats
  const maxMoney = ns.getServerMaxMoney(server);
  const hackTime = ns.getHackTime(server);
  const growTime = ns.getGrowTime(server);
  const weakenTime = ns.getWeakenTime(server);
  const securityLevel = ns.getServerSecurityLevel(server);
  const minSecurityLevel = ns.getServerMinSecurityLevel(server);

  // Early exit if server can't generate money
  if (maxMoney === 0) {
    return 0;
  }

  // Analyze threads required for hacking
  const hackThreads = ns.hackAnalyzeThreads(server, maxMoney); // Steal 10% per hack
  const hackChance = ns.hackAnalyzeChance(server); // Probability of success

  // Analyze threads required for growth and weakening
  const growThreads = Math.ceil(ns.growthAnalyze(server, 1.1)); // Grow by 10%
  const weakenThreads = Math.ceil((securityLevel - minSecurityLevel) / ns.weakenAnalyze(1)); // Normalize security

  // Calculate execution times (milliseconds)
  const averageTime = (hackTime + growTime + weakenTime) / 3;

  // Estimate money generated per hack cycle
  const moneyPerHack = maxMoney * hackChance; // 10% of maxMoney times success rate
  const moneyPerSecond = moneyPerHack / (averageTime / 1000); // Convert time to seconds

  // ns.tprint(`Server ${server} generates approximately $${ns.formatNumber(moneyPerSecond)} per second.`);
  return moneyPerSecond;
}

/** @param {NS} ns **/
export function calculateFullCycleMoneyPerSecond(ns, server) {
  // Get server stats
  const maxMoney = ns.getServerMaxMoney(server);
  const hackChance = ns.hackAnalyzeChance(server); // Probability of successful hack

  // Early exit if server can't generate money
  if (maxMoney === 0) {
    ns.tprint(`Server ${server} has no money to hack.`);
    return undefined;
  }

  // Calculate threads and times for each phase
  const hackAmount = maxMoney * 0.1; // Steal 10% of max money
  const hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, hackAmount)); // Threads for hacking
  const growThreads = Math.ceil(ns.growthAnalyze(server, 1.1)); // Threads to regrow by 10%
  const weakenThreads1 = Math.ceil(ns.weakenAnalyze(1) * hackThreads); // Threads to counter hack security increase
  const weakenThreads2 = Math.ceil(ns.weakenAnalyze(1) * growThreads); // Threads to counter grow security increase

  const hackTime = ns.getHackTime(server);
  const growTime = ns.getGrowTime(server);
  const weakenTime = ns.getWeakenTime(server);

  // Full cycle time is determined by the longest operation
  const fullCycleTime = Math.max(weakenTime, growTime, hackTime);

  // Calculate money generated per cycle
  const moneyPerCycle = hackAmount * hackChance; // Adjust for success probability

  // Calculate money generated per second
  const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000); // Convert cycle time to seconds

  return {
    server,
    hackThreads, growThreads, weakenThreads1, weakenThreads2,
    fullCycleTime,
    moneyPerCycle,
    moneyPerSecond
  }

}

/**
 * Recursively finds all servers up to a given depth.
 * @param {NS} ns
 * @returns {string[]}
 */
function findAllServers(ns) {
  const visited = new Set();
  const detailedVisited = new Set();
  const queue = [{ host: "home", depth: 0, parent: {} }];

  while (queue.length > 0) {
    const obj = queue.pop()
    const { host, depth } = obj;
    if (visited.has(host) || depth > 50) continue;
    visited.add(host);

    detailedVisited.add(populate(ns, obj))
    const neighbors = ns.scan(host);
    neighbors.forEach((neighbor) => queue.push({ host: neighbor, depth: depth + 1, parent: obj }));
  }


  return Array.from(detailedVisited);
}


/** @param {NS} ns */
function populate(ns, detailedHost) {
  let server = {
    ...detailedHost
  }

  server["hackTime"] = ns.getHackTime(server.host)
  server["growTime"] = ns.getGrowTime(server.host)
  server["weakenTime"] = ns.getWeakenTime(server.host)

  server["moneyToGrowPercentage"] = (ns.getServerMoneyAvailable(server.host) / ns.getServerMaxMoney(server.host)) * 100

  server = { ...server }

  return server
}