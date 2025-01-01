
var NS;
var targetPercentage = 0.70
var hostname = "BLANK";


/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  NS = ns
  hostname = ns.args[1]
  var counter = 0

  while (NS.getServerMoneyAvailable(hostname) > 0) {
    NS.clearLog()
    NS.print(`Has run ${counter} times`)
    await weakenWhenBelow(targetPercentage)
    await NS.hack(hostname)
    counter++;
  }

}

async function weakenWhenBelow(percentage) {
  if (await NS.hackAnalyzeChance(hostname) > percentage) {
    NS.print(`Network is stronger than ${percentage} [currentLevel=${NS.hackAnalyzeChance(hostname)}]`)
    return false
  }

  await NS.weaken(hostname)
  return true
}