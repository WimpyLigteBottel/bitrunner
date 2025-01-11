import { NS } from "@ns";
import { HostObj } from "./FindAllServers";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()


  let hostname = ns.args[0] as string ?? "home"

  while (true) {
    let homes = ns.scan("home").filter((x) => x.includes(hostname))

    let newServer = ns.purchaseServer(hostname, 32)
    if (newServer != "") {
      ns.print(newServer)
    }
    purchaseHacks(ns)
    upgradeRam(ns, homes)
    await ns.sleep(100)
  }

}


/** @param {NS} ns */
function purchaseHacks(ns: NS) {

}


/** @param {NS} ns */
function upgradeRam(ns: NS, servers: string[]) {
  for (let home of servers) {
    let upgrade = ns.getServerMaxRam(home) * 2
    let response = ns.upgradePurchasedServer(home, upgrade)
    if (response) {
      ns.print(`${home} upgraded to ${upgrade}`)
      break
    }
  }
}
