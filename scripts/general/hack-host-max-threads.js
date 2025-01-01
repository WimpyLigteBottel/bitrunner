let targetPercentage = 0.70

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname =  `${ns.args[0]}`

  let weakenCost = 3
  let maxPossibleThreads = Math.round(ns.getServerMaxRam(ns.getHostname()) / weakenCost) - 1
  await ns.exec("scripts/general/hack-host.js",ns.getHostname(), maxPossibleThreads, `${hostname}`)

}