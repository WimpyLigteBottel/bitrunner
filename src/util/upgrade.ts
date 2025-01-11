import { NS } from "@ns";
import { HostObj } from "./FindAllServers";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()


  let hostname = ns.args[0] as string ?? "home"
  let ram = ns.args[1] ?? 524288

  ns.print("Going to purchase new PC")

  let homes = ns.scan("home").filter((x) => x.includes(hostname))

  for (let x = ns.getPurchasedServerLimit(); x > homes.length; x--) {
    ns.purchaseServer(hostname, 64)
  }

  while (true) {
    purchaseHacks(ns)
    upgradeRam(ns, homes)
    await ns.sleep(1000)
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
