import { NS } from "@ns";
import { executeUpgradeOfHackNodes } from "./upgrade";
import { print } from "/util/HackConstants";


/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog("ALL")
  ns.clearLog()



  // print(ns, `karma ${ns.getPlayer().karma}`)
  // print(ns, `upgrades ${ns.hacknet.getHashUpgrades()}`)
  let data = JSON.stringify(ns.formulas.hacknetServers.constants(), undefined, 1)
  print(ns, `${data}`)

  while (true) {
    await ns.sleep(1000)
    convertHashesToMoney(ns)
    await executeUpgradeOfHackNodes(ns)
  }

}


function convertHashesToMoney(ns: NS) {
  while (ns.hacknet.numHashes() > ns.hacknet.hashCost('Sell for Money')) {
    ns.hacknet.spendHashes('Sell for Money')
  }
}





