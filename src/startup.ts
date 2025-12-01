import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.exec("setup/setup.js", "home", 1);
  ns.exec("crime/crime.js", "home", 1, "Money");
  ns.exec("hacknet/hacknet.js", "home", 1);
  // ns.exec("setup/share-ram.js", "home", 1)
  // ns.exec("util/TORrouter.js", "home", 1)

  ns.print("---------");
  ns.exec("util/find.js", "home", 1, "CSEC");
  ns.exec("util/find.js", "home", 1, "I.I.I.I");
  ns.exec("util/find.js", "home", 1, "avmnite-02h");
  ns.exec("util/find.js", "home", 1, "run4theh111z");
  // ns.exec("util/find.js", "home", 1, "w0r1d_d43m0n");
  ns.print("---------");

  // ns.exec("setup/home-prep.js", "home", 1);
  ns.exec("setup/master-calc.js", "home", 1);
}
