import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { recordPrice } from "./Price";
import { readState, saveState } from "./state";
import { waitForStockTick } from "./stock-utils";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);
  disableLogs(ns);

  ns.clearLog();

  while (true) {
    await waitForStockTick(ns);
    let state = readState(ns);
    ns.stock.getSymbols().forEach((symbol) => {
      recordPrice(ns, symbol, state);
    });
    saveState(ns, state);

    ns.print(`You have ${readState(ns)["WDS"].length} data points`);
  }
}
