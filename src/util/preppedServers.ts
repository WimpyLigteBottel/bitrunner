import { NS } from "@ns";
import { getCustomServer } from "./serverCustomStats";
import { CustomServerV2 } from "/models/Models";
import { getKnownServers } from "./find";

export function isPrepped(ns: NS, hostname: string): boolean {
  let server = getCustomServer(ns, hostname);

  return (
    server.minSecurity == server.currentSecurity &&
    server.moneyAvailable == server.moneyMax
  );
}
/*
Mainly used in clearing scripts for faster startup
*/
export function ifPreppedKillScriptsOnOtherServers(
  ns: NS,
  hostname: string,
  excludes: string[] = ["home"]
): boolean {
  if (!isPrepped(ns, hostname)) {
    return false; // not killing others
  }

  getKnownServers(ns)
    .map((x) => getCustomServer(ns, x.hostname))
    .filter((x) => x.canExecuteScripts)
    .filter((x) => !excludes.includes(x.hostname))
    .filter((x) => !ns.scriptRunning("base/hack.js", x.hostname))
    .forEach((x) => {
      ns.killall(x.hostname);
    });

  return true;
}

export function preppedServers(ns: NS): CustomServerV2[] {
  let prepList = [];
  for (const server of getKnownServers(ns)) {
    if (isPrepped(ns, server.hostname))
      prepList.push(getCustomServer(ns, server.hostname));
  }
  return prepList
    .filter((x) => x.moneyMax != "0")
    .toSorted((a, b) => b.requiredHacking - a.requiredHacking);
}

export function notPreppedServers(ns: NS): CustomServerV2[] {
  let prepList = [];
  for (const server of getKnownServers(ns)) {
    if (!isPrepped(ns, server.hostname))
      prepList.push(getCustomServer(ns, server.hostname));
  }
  return prepList
    .filter((x) => x.moneyMax != "0")
    .toSorted((a, b) => b.requiredHacking - a.requiredHacking);
}
