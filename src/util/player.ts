import { NS } from "@ns";
import { DEBUG, disableLogs, openTail } from "../models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();
  openTail(ns);

  let player = ns.getPlayer();
  ns.print(JSON.stringify(player, null, 1));
}
