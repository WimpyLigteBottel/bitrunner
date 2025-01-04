/** @param {NS} ns */
export async function main(ns) {
  ns.tail();


  let servers = findAllServersR(ns, "home")

  while (true) {
    await ns.sleep(1000)
    ns.clearLog()


    ns.print(`Found total = ${servers.length}`)

    let findHostNameArg = ns.args[0] ?? "joesguns"


    ns.print("------")


    let server = findServer(findHostNameArg, servers)

    server = populate(ns, server, server.host)

    ns.print("INFO \n", JSON.stringify(server, null, 2))
    ns.print(new Date())
  }


}

function findServer(name, servers) {
  let found = servers.find((value) => {
    return value["host"] == name
  })

  return found
}

/** @param {NS} ns */
function populate(ns, obj, host) {
  let server = {
    "host": obj["host"],
    "parent": obj["parent"],
    "depth": obj["depth"],
  }

  server["hackTime"] = ns.getHackTime(host)
  server["growTime"] = ns.getGrowTime(host)
  server["weakenTime"] = ns.getWeakenTime(host)

  server["moneyToGrowPercentage"] = (ns.getServerMoneyAvailable(host) / ns.getServerMaxMoney(host)) * 100

  let player = { ...ns.getPlayer(host) }

  server = { ...ns.getServer(host), ...server, "player": player }


  delete server["player"]

  return server
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
  const extra = new Set();
  const queue = [{ host: hostname, depth: 0 }];

  while (queue.length > 0) {
    const obj = queue.pop();
    const { host, depth } = obj;


    if (visited.has(host) || depth > maxDepth) continue;
    visited.add(host);

    extra.add(populate(ns, obj, host));


    const neighbors = ns.scan(host);
    neighbors.forEach((neighbor) => queue.push({ host: neighbor, parent: obj, depth: depth + 1 }));
  }



  return Array.from(extra).sort((a, b) => a.hostname.localeCompare(b.hostname));
}



/**
 * Recursively finds all servers up to a given depth.
 * @param {NS} ns
 * @param {string} hostname
 * @param {number} maxDepth
 * @returns {string[]}
 */
function findAllServersR(ns, hostname) {

  const neighbors = ns.scan(hostname);

  if (neighbors.length == 0) {
    return neighbors
  }

  let newSet = new Set(...neighbors.map((x) => findAllServers(ns, x)))

  return Array.from(newSet).sort((a, b) => a.hostname.localeCompare(b.hostname))
}
