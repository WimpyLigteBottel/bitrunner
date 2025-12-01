import { NS } from "@ns";
import { disableLogs } from "../models/debug";
import { figureOutTask, hireAllGangMembers } from "./tasks";
import { accendMembers } from "./accend-members";
import { suitUpGangMembers } from "./equipment";
import { activedClash } from "./clash-gangs";

const SECOND = 1000;

const taskNames = [
  "Unassigned",
  "Mug People",
  "Deal Drugs",
  "Strongarm Civilians",
  "Run a Con",
  "Armed Robbery",
  "Traffick Illegal Arms",
  "Threaten & Blackmail",
  "Human Trafficking",
  "Terrorism",
  "Vigilante Justice",
  "Train Combat",
  "Train Hacking",
  "Train Charisma",
  "Territory Warfare",
];

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.ui.openTail();

  ns.exec("setup/setup.js", "home", 1);

  let task = ns.args[0] as string;
  if (ns.args[0] == "" || ns.args[0] == undefined) {
    task = (await ns.prompt("Select Gang jobs", {
      type: "select",
      choices: ["Money", "Train", "Territory Warfare", "Vigilante Justice"],
    })) as string;
  }

  while (true) {
    activedClash(ns);
    hireAllGangMembers(ns);
    accendMembers(ns);
    figureOutTask(ns, task!);

    suitUpGangMembers(ns);

    await ns.sleep(5000);
  }
}
