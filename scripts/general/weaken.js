
var NS;
var targetPercentage = 0.70

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  NS = ns

  NS.print(`works`)

  while (await weakenWhenBelow(targetPercentage)) {
   
  }

}

async function weakenWhenBelow(percentage) {
  var { hostname } = await currentServerStats();

  if (NS.hackAnalyzeChance(hostname) > percentage) {
    NS.print(`Network is stronger than ${percentage} [currentLevel=${NS.hackAnalyzeChance(hostname)}]`)
    return false
  }

  await NS.weaken(hostname)

  return true
}


async function currentServerStats() {
  var currentServer = {
    hostname: NS.getHostname().toString(),
  }

  return currentServer
}
