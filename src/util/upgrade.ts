import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()

  while (true) {
    purchaseServers(ns)
    upgradeRam(ns)
    await ns.sleep(100)
  }

}


/** @param {NS} ns */
function purchaseServers(ns: NS) {
  let newServer = ns.purchaseServer("home", 32)
  if (newServer != "") {
    ns.print(newServer)
  }
}

/** @param {NS} ns */
function upgradeRam(ns: NS) {
  let servers = ns.scan("home").filter((x) => x.includes("home")) as Array<string>
  for (let home of servers) {
    let upgrade = ns.getServerMaxRam(home) * 2
    let response = ns.upgradePurchasedServer(home, upgrade)
    if (response) {
      ns.print(`${home} upgraded to ${upgrade}`)
      break
    }
  }
}
