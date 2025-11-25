import { NS } from "@ns";
import { disableLogs } from "/models/debug";
import { canBuyNextNode } from "./canBuyNextNode";
import {
  currentMoneyPerSecond,
  hashToMoneyPerSecond,
  totalProduction,
} from "./hash-calculations";
import { getBestUpgrade, getCheapestUpgrade } from "./getUpgrade";

export let ns: NS;

let lastPurchaseTime: number | undefined = undefined;
let lastTotalProduction: number;

export const updateLastProduction = (name?: string, upgrade?: string) => {
  ns.print(`${name} | ${upgrade}`);
  lastTotalProduction = hashToMoneyPerSecond(totalProduction(ns));
  lastPurchaseTime = Date.now();
};

export async function main(tmpNs: NS): Promise<void> {
  ns = tmpNs;
  ns.ui.openTail();
  disableLogs(ns);

  updateLastProduction();

  while (true) {
    await ns.sleep(100);
    buyNextThing();
  }
}

const buyNextThing = () => {
  let canBuy = canBuyNextNode(ns);
  let moneyMade =
    hashToMoneyPerSecond(totalProduction(ns)) - lastTotalProduction;

  if (canBuy && ns.hacknet.numNodes() == 0) {
    ns.hacknet.purchaseNode();
    updateLastProduction(`0`, "node");
    return;
  }

  /// Improve this logic to use CHPS + past 60 seconds money to get idea if its worth it to buy upgrade.... Maybe use parameter for this...
  // aka... If i have made more money in the last 60 seconds than the cost its fine to buy... But then i need to do it in slide window timeframe

  let upgrade = getBestUpgrade(ns);
  // compareUpgrades(ns);
  let mps = currentMoneyPerSecond(ns);
  let canAfford = upgrade.cost < ns.getPlayer().money;

  // ns.print("----------")
  // ns.print("WARN " + JSON.stringify(upgrade));
  // ns.print("ERROR " + JSON.stringify(getCheapestUpgrade()));
  if (canAfford)
    if (mps > upgrade.cost || moneyMade > upgrade.cost) {
      upgrade.execute();
      updateLastProduction(`${upgrade.nodeIndex}`, upgrade.action);
    }
};

const compareUpgrades = (ns: NS) => {
  let cheapest = getCheapestUpgrade(ns);
  let best = getBestUpgrade(ns);

  ns.print("--------");
  ns.print({ ...cheapest, cost: ns.formatNumber(cheapest.cost) });
  ns.print("VS");
  ns.print({ ...best, cost: ns.formatNumber(best.cost), payback: ns.tFormat(best.payback! * 1000) });
};
