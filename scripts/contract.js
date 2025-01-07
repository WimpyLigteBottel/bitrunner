/** @param {NS} ns */
export async function main(ns) {

  ns.clearLog();
  ns.tail();

 //test

  const contracts = findAllServers(ns, "home", 20).flatMap((server) => {
    let files = ns.ls(server)
    let tempContracts = files.filter((file) => file.endsWith(".cct"))

    return tempContracts.map((file) => {
      return {
        file: file,
        host: server
      }
    })
  });



  ns.print("INFO \n", JSON.stringify(contracts, null, 2))

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