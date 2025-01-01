

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname =  `${ns.args[0]}`

  let weakenCost = ns.getScriptRam("scripts/general/grow-host.js",ns.getHostname())
  let maxPossibleThreads = Math.round(ns.getServerMaxRam(ns.getHostname()) / weakenCost) - 1
  await ns.exec("scripts/general/grow-host.js",ns.getHostname(), maxPossibleThreads, `${hostname}`)

}