import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    if (ns.getPlayer().money > 200_000) {
        ns.singularity.purchaseTor()
    }
    let programs = [{ file: "SQLInject.exe" },
    { file: "BruteSSH.exe" },
    { file: "FTPCrack.exe" },
    { file: "HTTPWorm.exe" },
    { file: "relaySMTP.exe" },]


    programs.forEach(x => {
        ns.singularity.purchaseProgram(x.file)
    })
}