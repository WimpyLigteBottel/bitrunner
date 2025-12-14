import { NS } from "@ns";
import { disableLogs, openTail } from "../models/debug";
import { getMiniCustomServer } from "./serverCustomStats";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  openTail(ns, ns.args[1] == true);

  await analyze(ns);
}

async function analyze(ns: NS) {
  let hostname = (ns.args[0] || "") as string;

  if (hostname == "") {
    hostname = (await ns.prompt("What server would you like to analyze?", {
      type: "text",
    })) as any;
  }

  while (true) {
    ns.clearLog();

    let s = getMiniCustomServer(ns, hostname);

    ns.print(JSON.stringify(s, null, 2));
    await ns.sleep(50);
  }
}
