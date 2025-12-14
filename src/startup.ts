import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.exec("singularity/buyTOR.js", "home", 1);
  ns.exec("setup/setup.js", "home", 1);
  ns.exec("util/profits.js", "home", 1);

  ns.tprint("---------");
  ns.tprint("connect home;connect darkweb;buy -a");
  ns.exec("util/find.js", "home", 1, "CSEC");
  ns.exec("util/find.js", "home", 1, "avmnite-02h");
  ns.exec("util/find.js", "home", 1, "I.I.I.I");
  ns.exec("util/find.js", "home", 1, "run4theh111z");
  // ns.exec("util/find.js", "home", 1, "w0r1d_d43m0n");
  ns.tprint("---------");

  let text = [
    "1.Crime",
    "2.Buy Servers",
    "3.Buy Hacknet",
    "4.Sleeves",
    "5.Prep",
    "6.Target Hack",
    "7.Prep (multiple)",
    "8.Backoor all servers",
    "9.Upgrade home",
    "A.Factions invites",
  ].join("\n");

  let scriptsToBoot = ns.args[0] as string;
  if (ns.args[0] == "" || ns.args[0] == undefined) {
    scriptsToBoot = (await ns.prompt(text, {
      type: "text",
    })) as string;
  }

  if (scriptsToBoot.includes("1")) {
    ns.exec("crime/crime.js", "home", 1, "Money");
  }

  if (scriptsToBoot.includes("2")) {
    ns.exec("base/upgrade.js", "home", 1);
  }

  if (scriptsToBoot.includes("3")) {
    ns.exec("hacknet/hacknet.js", "home", 1);
  }

  if (scriptsToBoot.includes("4")) {
    ns.exec("sleeves/sleeves.js", "home", 1);
  }

  if (scriptsToBoot.includes("5")) {
    ns.exec("setup/home-prep.js", "home", 1, "", 2);
  }

  if (scriptsToBoot.includes("6")) {
    ns.exec("setup/master-calc.js", "home", 1);
  }

  if (scriptsToBoot.includes("7")) {
    ns.exec("setup/home-prep.js", "home", 1, "", 1);
    ns.exec("setup/home-prep.js", "home", 1, "", 2);
    ns.exec("setup/home-prep.js", "home", 1, "", 3);
    ns.exec("setup/home-prep.js", "home", 1, "", 4);
    ns.exec("setup/home-prep.js", "home", 1, "", 5);
    ns.exec("setup/home-prep.js", "home", 1, "", 6);
    ns.exec("setup/home-prep.js", "home", 1, "", 7);
  }

  if (scriptsToBoot.includes("8")) {
    ns.exec("singularity/backdoor.js", "home", 1);
  }

  if (scriptsToBoot.includes("9")) {
    ns.exec("singularity/homeupgrade.js", "home", 1);
  }

  if (scriptsToBoot.includes("A")) {
    ns.exec("singularity/factions.js", "home", 1);
  }

}
