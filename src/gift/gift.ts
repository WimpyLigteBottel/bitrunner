import { NS } from "@ns";
import { getCustomServer } from "/util/serverCustomStats";
import { disableLogs } from "/models/debug";
import { getKnownServers } from "/util/find";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  disableLogs(ns);

  await shouldClear(ns);

  let stanekType =
    ns.args[0] ??
    (await ns.prompt("Choose the stanek place grid", {
      type: "select",
      choices: ["hacking", "training"],
    }));

  if (ns.stanek.activeFragments().length == 0)
    ns.exec("gift/placeFragments.js", "home", 1, stanekType);

  while (true) {
    await executefragments(ns);

    await ns.sleep(1);
  }
}

async function shouldClear(ns: NS) {
  if (ns.stanek.activeFragments().length > 0) {
    let toClear = await ns.prompt("clear fragements?", { type: "boolean" });

    if (toClear) {
      ns.stanek.clearGift();
    }
  }
}

async function executefragments(ns: NS) {
  let fragToCharge = ns.stanek.activeFragments().filter((x) => x.id < 100);

  let servers = findServersThatCanBeUsed(ns);

  if (servers.length < 1) {
    return;
  }

  for (const server of servers) {
    let threads = Math.floor(server.availableRam / 2 / fragToCharge.length);

    threads = Math.max(1, threads);

    for (const x of fragToCharge) {
      ns.exec(
        "gift/chargeFragment.js",
        server.hostname,
        threads,
        x.x,
        x.y,
        `Threads ${threads}`
      );
    }
  }
}

function findServersThatCanBeUsed(ns: NS) {
  let servers = getKnownServers(ns, false)
    .map((server) => getCustomServer(ns, server.hostname))
    // .filter((server) => !server.hostname.includes("home"))
    .filter((server) => server.canExecuteScripts)
    .filter((server) => server.availableRam > 1 * 6)
    .toSorted((b, a) => a.maxRam - b.maxRam);

  return servers;
}
