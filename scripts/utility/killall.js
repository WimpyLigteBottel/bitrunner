/** @param {NS} ns */
export async function main(ns) {

    const servers = findAllServers(ns)


    for(const server of servers){

      ns.killall(server.host)
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