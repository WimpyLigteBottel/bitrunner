let targetPercentage = 50
let targetGrow = 500_000

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`

  let counter = 0

  while (ns.getServerMoneyAvailable(hostname) > 0) {
    ns.clearLog()
    ns.print(hostname)
    ns.print(`Has run ${counter} times`)
    await growWhenBelow(ns, targetGrow, hostname)
    await weakenWhenBelow(ns, targetPercentage, hostname)
    await ns.hack(hostname)
    counter++;
  }

}

/** @param {NS} ns **/
async function weakenWhenBelow(ns, percentage, hostname) {
  let chance = ns.hackAnalyzeChance(hostname) * 100
  while (chance < percentage) {
    ns.print(`Network too weak [currentChange=${chance};expected=${percentage}]`)
    await ns.weaken(hostname)
    chance = ns.hackAnalyzeChance(hostname)
  }
}

/** @param {NS} ns **/
async function growWhenBelow(ns, targetGrow, hostname) {
  let avail = ns.getServerMoneyAvailable(hostname)

  while (avail < targetGrow) {
    ns.print(`moneyIsBelow [current=${avail};expected=${targetGrow}]`)
    await ns.grow(hostname)
    avail = ns.getServerMoneyAvailable(hostname)
  }

}