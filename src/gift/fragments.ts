import { NS } from "@ns";
import { openTail } from "/models/debug";



export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  openTail(ns, true);

  let fragments = ns.stanek.activeFragments();

  for (const fragment of fragments) {
    let { id, x, y, rotation } = fragment;

    ns.print(JSON.stringify(fragment));
  }
}
