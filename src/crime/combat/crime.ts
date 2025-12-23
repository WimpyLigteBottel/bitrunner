import { NS } from "@ns";
import { disableLogs, openTail } from "../../models/debug";
import { figureOutTask } from "./tasks";
import { hireAllGangMembers } from "../common/hireAllGangMembers";
import { accendMembers } from "../common/accend-members";
import { suitUpGangMembers } from "../common/equipment";
import { activedClash } from "../common/clash-gangs";

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
        "Train Combat",
        "Territory Warfare",
        "Vigilante Justice",
      ],
    })) as string;
  }

  let gangType: "COMBAT" | "HACKING" = getGangType(ns);

  while (true) {
    activedClash(ns);
    hireAllGangMembers(ns);

    accendMembers(ns, gangType);
    figureOutTask(ns, task!);

    suitUpGangMembers(ns);

    await ns.sleep(5000);
  }
}

function getGangType(ns: NS): "COMBAT" | "HACKING" {
  if (ns.gang.getGangInformation().faction == "Slum Snakes") return "COMBAT";

  return "HACKING";
}
