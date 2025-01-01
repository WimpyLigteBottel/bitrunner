
var NS;

var targetPercentage = 0.70


/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  NS = ns
  var { hostname } = await currentServerStats();

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
  var { hostname } = await currentServerStats();

  if (NS.hackAnalyzeChance(hostname) > percentage) {
    NS.print(`Network is stronger than ${percentage} [currentLevel=${NS.hackAnalyzeChance(hostname)}]`)
    return
  }

  await NS.weaken(hostname)
}


async function currentServerStats() {
  var currentServer = {
    hostname: NS.getHostname().toString(),
  }

  return currentServer
}
