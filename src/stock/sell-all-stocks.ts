import { NS } from "@ns";
import { disableLogs } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  ns.clearLog();
  const question = "Are you sure you want to Sell everything?";

  const questionType = {
    type: "boolean",
  };
  const resultB = await ns.prompt(question, questionType as any);

  if (resultB) {
    ns.stock.getSymbols().forEach((x) => {
      ns.stock.sellShort(x, ns.stock.getMaxShares(x));
      ns.stock.sellStock(x, ns.stock.getMaxShares(x));
    });
  }
}
