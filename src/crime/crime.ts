import { NS } from "@ns";
import { disableLogs } from "../models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.ui.openTail();

  ns.exec("setup/setup.js", "home", 1);
}
