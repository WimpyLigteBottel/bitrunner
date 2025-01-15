import { NS } from "@ns";


let names: string[] = []

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()

  if (names.length == 0) {
    names = [
      "home-01", "home-02", "home-03", "home-04", "home-05", "home-06", "home-07", "home-08", "home-09", "home-10",
      "home-11", "home-12", "home-13", "home-14", "home-15", "home-16", "home-17", "home-18", "home-19", "home-20",
      "home-21", "home-22", "home-23", "home-24", "home-25"]
  }

  let purchasedServer = ns.getPurchasedServers()
  if (purchasedServer.length != 0) {
    ns.print(names)
    names = names.filter(x => !purchasedServer.includes(x))
    ns.print(names)
  }


  while (true) {
    purchaseServers(ns)
    upgradeRam(ns)
    await ns.sleep(100)
  }
}


/** @param {NS} ns */
function purchaseServers(ns: NS) {
  if (names.length == 0) {
    return;
  }

  let newServer = ns.purchaseServer(names.pop()!, 1024)
  if (newServer != "") {
    ns.print(`Bought new server: ${newServer}`)
  }
}

/** @param {NS} ns */
function upgradeRam(ns: NS) {
  let servers = ns.scan("home").filter((x) => x.includes("home")).sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b)) as Array<string>
  for (let home of servers) {
    let upgrade = ns.getServerMaxRam(home) * 2
    let response = ns.upgradePurchasedServer(home, upgrade)
    if (response) {
      ns.print(`${home} upgraded to ${upgrade}`)
      break
    }
  }
}
