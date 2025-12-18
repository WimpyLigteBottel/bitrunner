import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { reset } from "./state";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  ns.clearLog();
  const question = "Are you sure you want to reset?";

  const questionType = {
    type: "boolean",
  };
  const resultB = await ns.prompt(question, questionType as any);

  if (resultB) {
    reset(ns);
  }
}
