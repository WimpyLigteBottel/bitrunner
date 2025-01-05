/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()


  let hostname = ns.args[0] ?? "home"
  let ram = ns.args[1] ?? 524288

  ns.print("Going to purchase new PC")

  let homes = ns.scan("home")
    .filter((x) => x.includes(hostname))
    .sort((a, b) => ns.getServerMaxMoney(a) - ns.getServerMaxRam(b))

  for (let x = ns.getPurchasedServerLimit(); x > homes.length; x--) {
    ns.purchaseServer(hostname, 1)
  }

  while (true) {
    await upgradeRam(ns, homes)
    await ns.sleep(1000)
  }

}

/** @param {NS} ns */
function upgradeRam(ns, servers) {
  for (let home of servers) {
    let upgrade = ns.getServerMaxRam(home) * 2
    let response = ns.upgradePurchasedServer(home, upgrade)
    if (response)
      ns.print(`${home} upgraded to ${upgrade}`)
  }
}
