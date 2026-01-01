import { NS } from "@ns";
import { getHackingFragments, getTrainingFragment } from "./model";
import { getCustomServer } from "/util/serverCustomStats";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();

  await shouldClear(ns);

  let stanekType = await ns.prompt("Choose the stanek place grid", {
    type: "select",
    choices: ["hacking", "training"],
  });

  if (ns.stanek.activeFragments().length == 0)
    ns.exec("gift/placeFragments.js", "home", 1, stanekType);

  if (stanekType == "hacking") {
    await hacking(ns);
  } else {
    await training(ns);
  }
}

async function shouldClear(ns: NS) {
  if (ns.stanek.activeFragments().length > 0) {
    let toClear = await ns.prompt("clear fragements?", { type: "boolean" });

    if (toClear) {
      ns.stanek.clearGift();
    }
  }
}

async function training(ns: NS) {
  let fragToCharge = getTrainingFragment().filter((x) => x.fragmentId < 100);

  while (true) {
    let threads = Math.floor(
      getCustomServer(ns, "home").availableRam /
        Math.ceil(ns.getScriptRam("gift/chargeFragment.js")) /
        fragToCharge.length
    );
    for (const x of fragToCharge) {
      ns.exec("gift/chargeFragment.js", "home", threads, x.rootX, x.rootY);
    }
    await ns.sleep(1010);
  }
}

async function hacking(ns: NS) {
  let fragToCharge = getHackingFragments().filter((x) => x.fragmentId < 100);

  while (true) {
    let threads = Math.floor(
      getCustomServer(ns, "home").availableRam /
        Math.ceil(ns.getScriptRam("gift/chargeFragment.js")) /
        fragToCharge.length
    );
    for (const x of fragToCharge) {
      ns.exec("gift/chargeFragment.js", "home", threads, x.rootX, x.rootY);
    }
    await ns.sleep(1010);
  }
}
