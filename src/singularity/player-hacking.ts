import { NS } from "@ns";
import { getKnownServers } from "/util/find";
import { CustomServer } from "/models/Models";
import { disableLogs } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();

  while (true) {
    let knownServers = getKnownServers(ns)
      .filter((x) => x.requiredHackingSkill! < ns.getPlayer().skills.hacking)
      .filter((x) => !x.purchasedByPlayer)
      .toSorted((b,a) => (a.moneyAvailable ?? 1) - (b.moneyAvailable ?? 1));

    while (knownServers.length != 0) {
      let list = buildList(knownServers.pop()!, []);

      list.forEach((x) => ns.singularity.connect(x.hostname));

      connectToTarget(ns, list);

      await ns.singularity.manualHack();
    }
  }
}

function connectToTarget(ns: NS, servers: CustomServer[]): string {
  servers.forEach((x) => ns.singularity.connect(x.hostname));

  return ns.singularity.getCurrentServer();
}

function buildList(server: CustomServer, list: CustomServer[]) {
  list.push(server);

  let current: CustomServer | undefined = server;
  let parent = current.parent;

  while (parent != null) {
    list.push(parent);

    current = parent;
    parent = current.parent;
  }

  return list.toReversed();
}
