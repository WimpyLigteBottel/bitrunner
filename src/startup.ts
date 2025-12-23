import { NS } from "@ns";

let menu = [
  {
    id: "1",
    text: "1.Crime",
    action: (ns: NS) => {
      ns.exec("crime/crime.js", "home", 1, "Money");
    },
    enabled: true,
  },
  {
    id: "2",
    text: "2.Buy Servers",
    action: (ns: NS) => {
      ns.exec("base/upgrade.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "3",
    text: "3.Buy Hacknet",
    action: (ns: NS) => {
      ns.exec("hacknet/hacknet.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "4",
    text: "4.Sleeves",
    action: (ns: NS) => {
      ns.exec("sleeves/sleeves.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "5",
    text: "5.Prep",
    action: (ns: NS) => {
      ns.exec("setup/home-prep.js", "home", 1, "", 2);
    },
    enabled: true,
  },
  {
    id: "6",
    text: "6.Target Hack",
    action: (ns: NS) => {
      ns.exec("setup/master-calc.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "7",
    text: "7.Home prep (4)",
    action: (ns: NS) => {
      ns.exec("setup/home-prep.js", "home", 1, "", 1);
      ns.exec("setup/home-prep.js", "home", 1, "", 2);
      ns.exec("setup/home-prep.js", "home", 1, "", 3);
      ns.exec("setup/home-prep.js", "home", 1, "", 4);
    },
    enabled: true,
  },
  {
    id: "8",
    text: "8.Backoor all servers",
    action: (ns: NS) => {
      ns.exec("singularity/backdoor.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "9",
    text: "9. Home Upgrade",
    action: (ns: NS) => {
      ns.exec("singularity/homeupgrade.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "A",
    text: "A.Factions invites",
    action: (ns: NS) => {
      ns.exec("singularity/factions.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "B",
    text: "B.Stock record + reset",
    action: (ns: NS) => {
      ns.exec("stock/reset.js", "home", 1);
      ns.exec("stock/stock-record.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "C",
    text: "C. Trader",
    action: (ns: NS) => {
      if (ns.stock.has4SDataTIXAPI()) {
        ns.exec("stock/smart-trader", "home", 1);
      } else {
        ns.exec("stock/trader-without4s", "home", 1);
      }
    },
    enabled: true,
  },
];

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

  let text = menu.map((x) => x.text).join("\n");

  let scriptsToBoot = ns.args[0] as string;
  if (ns.args[0] == "" || ns.args[0] == undefined) {
    scriptsToBoot = (await ns.prompt(text, {
      type: "text",
    })) as string;
  }

  menu.forEach((x) => {
    if (scriptsToBoot.includes(x.id)) {
      x.action(ns);
    }
  });
}
