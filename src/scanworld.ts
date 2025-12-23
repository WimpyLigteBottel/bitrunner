import { NS } from "@ns";
import { openTail } from "./models/debug";
import { getKnownServers } from "./util/find";
import { globalStockList } from "./stock/stock-utils";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);
  getKnownServers(ns)
    .toSorted((b, a) => a.hackDifficulty! - b.hackDifficulty!)
    .forEach((x) => {
      const hasStock = globalStockList
        .map((y) => y.hostname)
        .some((y) => x.hostname == y);

      if (hasStock) ns.print(`${x.hostname} == ${hasStock}`);
    });
}
