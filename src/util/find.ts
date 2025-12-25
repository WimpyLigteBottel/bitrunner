import { NS } from "@ns";
import { CustomServer } from "models/Models";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("scan");
  ns.clearLog();
  //ns.ui.openTail()
  let knownServers = getKnownServers(ns);

  ns.write("servers.txt", JSON.stringify(knownServers, null, 1), "w");

  let targetHost = ns.args[0] as string;
  if (targetHost == undefined || targetHost == "") {
    targetHost = (await ns.prompt("What server would you like to find?", {
      type: "text",
    })) as string;
  }

  // prints list of known servers
  // knownServers.keys().forEach(x => ns.print(x))

  let tofind = knownServers
    .filter((server) => server.hostname.includes(targetHost))
    .pop()!;
  let text = connectString(tofind, "backdoor;");

  // print out full connect string
  ns.tprint("connect home;" + text);
}

function connectString(server: CustomServer, currentString: string): string {
  if (server.parent == undefined) return currentString;

  return connectString(
    server.parent,
    `connect ${server.hostname};` + currentString
  );
}

export function getKnownServers(
  ns: NS,
  hackedServersOnly: boolean = false
): CustomServer[] {
  let home: CustomServer = { ...ns.getServer(), parent: undefined };

  let knownServers = new Map<String, CustomServer>();
  let toBeScanned: CustomServer[] = [home];

  while (toBeScanned.length > 0) {
    let server = toBeScanned.pop()!;
    let servers = ns.scan(server.hostname).map((x) => {
      return { ...ns.getServer(x), parent: server };
    });

    servers.forEach((x) => {
      if (knownServers.get(x.hostname) == undefined) {
        toBeScanned.push(x);
      }
    });

    knownServers.set(server?.hostname!, server);
  }

  let servers = knownServers
    .entries()
    .map((x) => x[1])
    .toArray();

  if (hackedServersOnly) {
    return servers.filter((x) => x.hasAdminRights);
  }

  return servers;
}
