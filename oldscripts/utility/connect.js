/** @param {NS} ns */
export async function main(ns) {

  ns.tail()
  ns.clearLog()


  const servers = findAllServers(ns)

  ns.clearLog()


  for (const serverToFind of ns.args) {
    for (const server of servers) {
      if (server.host.includes(serverToFind)) {
        ns.print(buildConnectScript(ns, server));
        ns.print("")
      }
    }
  }


  ns.print("----------")
}

/** @param {NS} ns */
function buildConnectScript(ns, startingHost) {

  let servers = recursiveDive(ns, startingHost, startingHost.depth)
  let string = ""

  while (servers.length > 0) {
    string += `connect ${servers.pop()};`
  }

  return string
}



/** @param {NS} ns */
function recursiveDive(ns, server, depth) {
  if (server.depth == 1) {
    return server.host
  }
  // ns.print(JSON.stringify(server, null, 1))

  return [server.host].concat(recursiveDive(ns, server.parent, server.depth))
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