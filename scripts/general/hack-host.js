var targetPercentage = 0.70
var hostname = "BLANK";

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  hostname = `${ns.args[0]}`

  var counter = 0

  while (ns.getServerMoneyAvailable(hostname) > 0) {
    ns.clearLog()
    ns.print(hostname)
    ns.print(`Has run ${counter} times`)
    await weakenWhenBelow(ns,targetPercentage)
    await ns.hack(hostname)
    counter++;
  }

}

/** @param {NS} ns **/
async function weakenWhenBelow(ns,percentage) {
  var chance = ns.hackAnalyzeChance(hostname)
  if (chance > percentage) {
    ns.print(`Network is stronger than ${percentage} [currentLevel=${chance}]`)
    return false
  }

  await ns.weaken(hostname)
  return true
}