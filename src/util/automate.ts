import { NS } from "@ns"
import { KILL_ALL, PREP_MANAGER } from "./HackConstants"


export async function main(ns: NS) {
  ns.closeTail()

  ns.exec("scripts/utility/connect.js", "home", 1, "I.I.I.I", "CSEC", "run4theh111z", "avmnite-02h")


  if (await ns.prompt("Should kill all tasks?", { type: "boolean" })) {
    ns.exec(KILL_ALL, "home", 1)
  }

  if (await ns.prompt("Want to backdoor systems?", { type: "boolean" })) {
    let pid = ns.exec("scripts/general/backdoor.js", "home", 1)
    ns.closeTail(pid)
  }

  if (await ns.prompt("Should prep servers?", { type: "boolean" })) {
    let pid = ns.exec(PREP_MANAGER, "home", 1)
  }


  if (await ns.prompt("Want to run upgrade scripts?", { type: "boolean" })) {
    let pid = ns.exec("scripts/smart/upgrade.js", "home", 1)
    ns.closeTail(pid)
  }

  if (await ns.prompt("Want to hack servers (ratio-split)?", { type: "boolean" })) {
    let pid = ns.exec("scripts/smart/ratio-split.js", "home", 1, " ")
    ns.closeTail(pid)
  }

}