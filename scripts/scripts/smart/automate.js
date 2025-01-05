/** @param {NS} ns */
export async function main(ns) {
  ns.tail()

  ns.killall("home")
  ns.run("scripts/general/backdoor.js", 1)
  ns.run("scripts/smart/upgrade.js", 1)

  for (let x = 0; x < 1; x++) {
    await ns.sleep(60 * 1000 * 2)
   ns.exec("scripts/smart/ratio-split.js", "home", 1, " ", "true")
  }

  for (let x = 0; x < 1; x++) {
    await ns.sleep(60 * 1000 * 2)
    ns.exec("scripts/smart/ratio-split.js", "home", 1, " ")
  }


  for (let x = 0; x < 1; x++) {
    await ns.sleep(60 * 1000 * 2)
    ns.exec("scripts/smart/ratio-split.js", "home", 1, " ")
  }

}