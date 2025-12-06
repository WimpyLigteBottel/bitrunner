import { NS } from "@ns";
import { disableLogs, openTail, pTime } from "/models/debug";
import { canBuyNextNode } from "./canBuyNextNode";
import {
  currentMoneyPerSecond,
  hashToMoneyPerSecond,
  totalProduction,
} from "./hash-calculations";
import { getBestUpgrade } from "./getUpgrade";

export let ns: NS;

let lastPurchaseTime: number = Date.now();
let lastTotalProduction: number;

export const updateLastProduction = (name?: string, upgrade?: string) => {
  ns.print(
    `${name} | ${upgrade} -> made $${moneyMade(
      ns
    )} over ${timeSinceLastPurchase(ns)}`
  );
  lastTotalProduction = hashToMoneyPerSecond(totalProduction(ns));
  lastPurchaseTime = Date.now();
};

const moneyMade = (ns: NS) => {
  return ns.formatNumber(
    hashToMoneyPerSecond(totalProduction(ns)) - lastTotalProduction || 0
  );
};

const timeSinceLastPurchase = (ns: NS) =>
  pTime(ns, Date.now() - lastPurchaseTime!);

export async function main(tmpNs: NS): Promise<void> {
  ns = tmpNs;
  openTail(ns);
  disableLogs(ns);

  updateLastProduction();

  while (true) {
    await ns.sleep(1000);
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
  let mps = currentMoneyPerSecond(ns);
  let canAfford = upgrade.cost < ns.getPlayer().money;

  if (canAfford)
    if (mps > upgrade.cost || moneyMade > upgrade.cost) {
      upgrade.execute();
      updateLastProduction(`${upgrade.nodeIndex}`, upgrade.action);
    }
};
