import { NS } from "@ns";
import { printDone } from "../models/debug";

export async function main(ns: NS): Promise<void> {
  let host = ns.args[0] as string
  let sleepDuration = ns.args[1] as number

  await ns.hack(host, {
    additionalMsec: sleepDuration
  })

  printDone(ns, '    hack', host)
}