
var NS;

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  NS = ns

  NS.print(`works`)


  var { hostname } = await currentServerStats();


  while (NS.getServerMoneyAvailable(hostname) > 0) {
    await weakenWhenBelow(0.70)
    await NS.hack(hostname)
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
