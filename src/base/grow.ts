import { NS } from "@ns";
import { printDone } from "./debug";

export async function main(ns: NS): Promise<void> {
  let host = ns.args[0] as string
  let sleepDuration = ns.args[1] as number

  // await ns.sleep(sleepDuration)
  await ns.grow(host, {
    additionalMsec: sleepDuration
  })

  printDone(ns, '    grow', host)
}