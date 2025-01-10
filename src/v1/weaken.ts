import { NS } from "@ns";

export async function main(ns: NS) {
  ns.clearLog()

  let hostname = ns.args[0] as string
  let delay = ns.args[1] as number

  await ns.sleep(delay)
  await ns.weaken(hostname, { stock: true })

  ns.tprint("W")
}