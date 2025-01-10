/** @param {NS} ns */
export async function main(ns) {
  ns.tail()

   ns.exec("scripts/utility/connect.js", "home", 1, "I.I.I.I","CSEC","run4theh111z", "02h")

  if (await ns.prompt("Should kill all tasks?", { type: "boolean" })) {
    ns.killall()
  }


  if (await ns.prompt("Want to backdoor systems?", { type: "boolean" })) {
    let pid = ns.exec("scripts/general/backdoor.js", "home", 1)
    ns.closeTail(await pid)
  }

  if (await ns.prompt("Want to run upgrade scripts?", { type: "boolean" })) {
    let pid = ns.exec("scripts/smart/upgrade.js", "home", 1)
    ns.closeTail(await pid)
  }

  if (await ns.prompt("Want to hack servers (ratio-split)?", { type: "boolean" })) {
    let pid = ns.exec("scripts/smart/ratio-split.js", "home", 1, " ")
    ns.closeTail(await pid)
  }

}