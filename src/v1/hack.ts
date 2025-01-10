import { NS } from "@ns";


export async function main(ns: NS) {
  let hostname = ns.args[0] as string
  let delay = ns.args[1] as number

  await ns.sleep(delay)
  await ns.hack(hostname, { stock: true })

  ns.writePort(9999, "H")
}