import { NS } from "@ns";
import { printDone } from "../models/debug";

export async function main(ns: NS): Promise<void> {
    await ns.share()
    printDone(ns, '    share', ns.getHostname())
}