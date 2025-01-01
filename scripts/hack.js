/** @param {NS} ns */
export async function main(ns) {

  ns.print("--------------")

  var { hostname, hackTime, hackLevel } = await currentServerStats(ns)

  ns.print(`Current Hostname: ${hostname}`)
  ns.print(`Current hackTime: ${hackTime}`)
  ns.print(`Current hackLevel: ${hackLevel}`)

  var servers = await serversConnectedToo(ns, hostname)

}

async function currentServerStats(ns) {
  var currentServer = {
    hostname: ns.getHostname().toString(),
    hackTime: ns.getHackTime().toString(),
    hackLevel: ns.getHackingLevel().toString()
  }

  return currentServer
}


async function serversConnectedToo(ns, hostname) {
  var servers = await ns.scan(hostname)

  for (var index in servers) {
    ns.print(`${hostname} -> ${servers[index]}`)
  }

  return servers
}