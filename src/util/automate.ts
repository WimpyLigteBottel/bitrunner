import { NS } from "@ns"
import { BACKDOOR, CONNECT, CONTRACTS, KILL_ALL, PREP, PREP_MANAGER, UPGRADE } from "./HackConstants"
import { prepServer } from "/v2/single-prep"
import { prepServersForHack } from "./FindAllServers"
import { killAllServer } from "./killall"


export async function main(ns: NS) {
  ns.closeTail()


  ns.exec(CONNECT, "home", 1, "CSEC", "I.I.I.I", "avmnite-02h", "run4theh111z", "The-Cave")
  ns.exec(BACKDOOR, "home", 1)
  prepServersForHack(ns)


  let text = `
  1. Should kill all tasks
  2. Contracts
  3. Prep all servers (runs prep manager)
  4. Only prep on home server
  5. Run upgrade
  `;

  let input = await ns.prompt(text, { type: "text" }) as string

  if (input.includes("1")) {
    killAllServer(ns)
  }

  if (input.includes("2")) {
    ns.exec(CONTRACTS, "home", 1)
  }

  if (input.includes("3")) {
    prepServersForHack(ns)
    ns.exec(PREP_MANAGER, "home", 1)
  }

  if (input.includes("4")) {
    ns.exec(PREP, "home", 1)
  }

  if (input.includes("5")) {
    ns.exec(UPGRADE, "home", 1)
  }

}