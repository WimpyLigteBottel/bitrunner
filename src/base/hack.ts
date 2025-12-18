import { NS } from "@ns";
import { printDone } from "../models/debug";

export async function main(ns: NS): Promise<void> {
  let host = ns.args[0] as string;
  let sleepDuration = ns.args[1] as number;
  let affectStock = ns.args[2] as boolean | false;

  // await ns.hack(host, {
  //   additionalMsec: sleepDuration,
  //   stock: affectStock,
  // });

  await ns.hack(host, {
    additionalMsec: sleepDuration,
    stock: false,
  });

  printDone(ns, "    hack", host, affectStock);
}
