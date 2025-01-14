import { NS } from "@ns"
import { BACKDOOR, CONNECT, KILL_ALL, PREP, PREP_MANAGER, UPGRADE } from "./HackConstants"


export async function main(ns: NS) {
  ns.closeTail()

  ns.exec(CONNECT, "home", 1, "CSEC", "I.I.I.I", "avmnite-02h", "run4theh111z", "The-Cave")

  if (await ns.prompt("Should kill all tasks?", { type: "boolean" })) {
    ns.exec(KILL_ALL, "home", 1)
    ns.exit()
  }

  if (await ns.prompt("Want to backdoor systems?", { type: "boolean" })) {
    ns.exec(BACKDOOR, "home", 1)
  }

  if (await ns.prompt("Should prep servers?", { type: "boolean" })) {
    ns.exec(PREP_MANAGER, "home", 1)
  } else {
    if (await ns.prompt("Want to prep servers using home?", { type: "boolean" })) {
      ns.exec(PREP, "home", 1)
    }
  }

  if (await ns.prompt("Want to run upgrade scripts?", { type: "boolean" })) {
    let pid = ns.exec(UPGRADE, "home", 1)
    ns.closeTail(pid)
  }

}