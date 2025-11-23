import { NS } from "@ns";
import { disableLogs } from "../models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();
  // ns.ui.openTail()

  let player = ns.getPlayer();
  ns.print(JSON.stringify(player, null, 1));
}
