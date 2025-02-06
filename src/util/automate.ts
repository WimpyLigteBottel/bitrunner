import { NS } from "@ns"
import { BACKDOOR, CONNECT, CONTRACTS, CRIME_V1, HACKNODES_V1, HOST_HACK_V3, MASS_PREP, MASS_PREP_V3, PREP, PREP_MANAGER_V3, PREP_V3, UPGRADE } from "./HackConstants"
import { prepServersForHack } from "./FindAllServers"
import { killAllServer } from "./killall"


export async function main(ns: NS) {

  ns.disableLog('scp')
  ns.exec(CONNECT, "home", 1, "CSEC", "I.I.I.I", "avmnite-02h", "run4theh111z", "The-Cave", "w0r1d_d43m0n")
  ns.exec(BACKDOOR, "home", 1)
  ns.exec(CONTRACTS, "home", 1)
  await ns.sleep(100)
  prepServersForHack(ns)

  let currentHost = ns.getHostname()


  let text = `
  1. Should kill all tasks
  2. Hack calculator (home)
  3. Prep all servers (runs prep manager)
  4. Crime!
  5. Run upgrade
  6. Mass prep
  7. Hacknodes!
  `;

  let input = await ns.prompt(text, { type: "text" }) as string

  if (input.includes("1")) {
    killAllServer(ns)
  }

  if (input.includes("2")) {
    ns.print(`pid manager = ${ns.exec(HOST_HACK_V3, currentHost, 1)}`)
  }

  if (input.includes("3")) {
    ns.print(`pid manager = ${ns.exec(PREP_MANAGER_V3, currentHost, 1)}`)
  }

  if (input.includes("4")) {
    ns.print(`crime= ${ns.exec(CRIME_V1, currentHost, 1)}`)
  }

  if (input.includes("5")) {
    ns.exec(UPGRADE, "home", 1)
  }

  if (input.includes("6")) {
    ns.exec(MASS_PREP_V3, "home", 1)
  }

  if (input.includes("7")) {
    ns.exec(HACKNODES_V1, "home", 1)
  }

}