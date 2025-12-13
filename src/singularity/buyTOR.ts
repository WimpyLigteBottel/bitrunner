import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.singularity.purchaseTor();

  let darkwebPrograms = ns.singularity.getDarkwebPrograms();

  darkwebPrograms.forEach((x) => {
    ns.singularity.purchaseProgram(x);
  });
}
