import { NS } from "@ns";
import { getCustomServer } from "/util/serverCustomStats";
import { disableLogs, openTail } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  openTail(ns);

  await purchaseServers(ns);
  await upgradeServers(ns);
}

async function upgradeServers(ns: NS) {
  let lowest = lowestServer(ns)!;
  while (lowest.maxRam < 1048576) {
    let latestCost = ns.getPurchasedServerCost(lowest.maxRam * 2);
    if (canAfford(ns, lowest.maxRam * 2)) {
      if (ns.upgradePurchasedServer(lowest?.hostname, lowest?.maxRam * 2)) {
        ns.print(`Upgraded server ${lowest?.hostname} for ${ns.formatNumber(latestCost)}`);
      }
    } else {
      await ns.sleep(5000);
    }
    lowest = lowestServer(ns)!;
  }
}

async function purchaseServers(ns: NS) {
  while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    await ns.sleep(100);
    if (ns.getPurchasedServerCost(32) < ns.getPlayer().money) {
      let bought = ns.getPurchasedServers().map((x) => getCustomServer(ns, x));
      let counter = bought.length;

      if (counter.toString().length == 1) {
        ns.purchaseServer("home-0" + counter, 32);
      } else {
        ns.purchaseServer("home-" + counter, 32);
      }
    }
  }
}

function canAfford(ns: NS, amount: number) {
  return ns.getPurchasedServerCost(amount) < ns.getPlayer().money;
}

function lowestServer(ns: NS) {
  let bought = ns
    .getPurchasedServers()
    .map((x) => getCustomServer(ns, x))
    .toSorted((b, a) => a.maxRam - b.maxRam);

  return bought.pop();
}
