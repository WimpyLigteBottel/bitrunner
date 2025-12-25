import { NS } from "@ns";

let menu = [
  {
    id: "1",
    text: "Crime",
    action: (ns: NS) => {
      ns.exec("crime/crime.js", "home", 1, "Money");
    },
    enabled: true,
  },
  {
    id: "2",
    text: "Buy Servers",
    action: (ns: NS) => {
      ns.exec("base/upgrade.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "3",
    text: "Buy Hacknet",
    action: (ns: NS) => {
      ns.exec("hacknet/hacknet.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "4",
    text: "Sleeves",
    action: (ns: NS) => {
      ns.exec("sleeves/sleeves.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "5",
    text: "Prep",
    action: (ns: NS) => {
      ns.exec("setup/home-prep.js", "home", 1, "", 2);
    },
    enabled: true,
  },
  {
    id: "6",
    text: "Target Hack",
    action: (ns: NS) => {
      ns.exec("setup/master-calc.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "7",
    text: "Home prep (4)",
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
    text: "Backoor all servers",
    action: (ns: NS) => {
      ns.exec("singularity/backdoor.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "9",
    text: "Home Upgrade",
    action: (ns: NS) => {
      ns.exec("singularity/homeupgrade.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "A",
    text: "Factions invites",
    action: (ns: NS) => {
      ns.exec("singularity/factions.js", "home", 1);
    },
    enabled: true,
  },
  {
    id: "C",
    text: "Trader",
    action: (ns: NS) => {
      if (ns.stock.has4SDataTIXAPI()) {
        ns.exec("stock/smart-trader.js", "home", 1);
      } else {
        ns.exec("stock/reset.js", "home", 1);
        ns.exec("stock/stock-record.js", "home", 1);
        ns.exec("stock/trader-without4s.js", "home", 1);
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
  ns.exec("util/find.js", "home", 1, "CSEC");
  ns.exec("util/find.js", "home", 1, "avmnite-02h");
  ns.exec("util/find.js", "home", 1, "I.I.I.I");
  ns.exec("util/find.js", "home", 1, "run4theh111z");
  // ns.exec("util/find.js", "home", 1, "w0r1d_d43m0n");
  ns.tprint("---------");

  let text = menu.map((x) => x.id + ": " + x.text).join("\n");

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
