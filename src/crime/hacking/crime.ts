import { NS } from "@ns";
import { disableLogs, openTail } from "../../models/debug";
import { figureOutTask } from "./tasks";
import { suitUpGangMembers } from "../common/equipment";
import { activedClash } from "../common/clash-gangs";
import { hireAllGangMembers } from "../common/hireAllGangMembers";
import { accendMembers } from "../common/accend-members";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  openTail(ns);

  ns.exec("setup/setup.js", "home", 1);

  let task = ns.args[0] as string;
  if (ns.args[0] == "" || ns.args[0] == undefined) {
    task = (await ns.prompt("Select Gang jobs", {
      type: "select",
      choices: [
        "Money",
        "Train Hacking",
        "Territory Warfare",
        "Vigilante Justice",
      ],
    })) as string;
  }

  while (true) {
    activedClash(ns);
    hireAllGangMembers(ns);
    accendMembers(ns, "HACKING");
    figureOutTask(ns, task!);

    suitUpGangMembers(ns);

    await ns.sleep(5000);
  }
}
