import { NS } from "@ns";
import { disableLogs } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  let choice = (await ns.prompt(`WHat is the number`, {
    type: "select",
    choices: ns.codingcontract.getContractTypes(),
  })) as string;

  ns.codingcontract.createDummyContract(choice);
}
