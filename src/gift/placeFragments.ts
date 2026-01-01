import { NS } from "@ns";
import { openTail } from "/models/debug";
import { getHackingFragments, getTrainingFragment } from "./model";

export async function main(ns: NS): Promise<void> {
  openTail(ns, false);
  let type = ns.args[0];


  switch (type) {
    case "hacking":
      placeHacking(ns);
      break;
    case "training":
      placeTraining(ns);
      break;
  }
}

export function placeHacking(ns: NS) {
  for (const fragment of getHackingFragments()) {
    ns.stanek.placeFragment(
      fragment.rootX,
      fragment.rootY,
      fragment.rotation,
      fragment.fragmentId
    );
  }
}

export function placeTraining(ns: NS) {
  for (const fragment of getTrainingFragment()) {
    ns.stanek.placeFragment(
      fragment.rootX,
      fragment.rootY,
      fragment.rotation,
      fragment.fragmentId
    );
  }
}
