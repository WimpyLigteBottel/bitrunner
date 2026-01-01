import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  let x = (ns.args[0] as number) ?? 0;
  let y = (ns.args[1] as number) ?? 0;

  await ns.stanek.chargeFragment(x, y);
}
