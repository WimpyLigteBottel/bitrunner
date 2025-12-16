import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { reset } from "./state";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);
  disableLogs(ns);

  ns.clearLog();

  const resultB = await ns.prompt("Are you sure you want to reset?", {
    type: "boolean",
  });

  if (resultB) {
    reset(ns);
  }
}
