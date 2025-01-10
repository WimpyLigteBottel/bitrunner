import { NS } from "@ns";
import { createBatch } from "./v1/batcher";

export async function main(ns: NS): Promise<void> {
  createBatch(ns, "n00dles", ns.args[0] as number)
}
