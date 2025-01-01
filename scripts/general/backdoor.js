var hostname = "BLANK";

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  hostname = `${ns.args[0]}`
  level = `${ns.args[1]}`

  switch (level) {
    case 1:
      level1Hack(ns, hostname)
      break;
    default:
      level0Hack(ns, hostname)
      break;
  }


}

/** @param {NS} ns **/
async function level1Hack(ns, hostname) {

  ns.print("target host: " + hostname)
  ns.print("brutessh: " + hostname)
  ns.brutessh(hostname)
  ns.print("nuking: " + hostname)
  ns.nuke(hostname)

  ns.print("Coping update.js to location " + hostname)
  ns.scp("update.js", hostname)
  ns.print("running update.js to get scripts " + hostname)
  ns.exec("update.js", hostname)

  var weakenCost = 3
  var maxPossibleThreads = ns.getServerMaxRam() / weakenCost

  ns.print(`Weaking server with ${maxPossibleThreads}`)
  ns.exec("/scripts/general/weaken-host.js", hostname, maxPossibleThreads, `"${hostname}"`)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {

  ns.print("target host: " + hostname)
  ns.print("nuking: " + hostname)
  ns.nuke(hostname)

  ns.print("Coping update.js to location " + hostname)
  ns.scp("update.js", hostname)
  ns.print("running update.js to get scripts " + hostname)
  ns.exec("update.js", hostname)

  var weakenCost = 3
  var maxPossibleThreads = ns.getServerMaxRam() / weakenCost

  ns.print(`Weaking server with ${maxPossibleThreads}`)
  ns.exec("/scripts/general/weaken-host.js", hostname, maxPossibleThreads, `"${hostname}"`)

}