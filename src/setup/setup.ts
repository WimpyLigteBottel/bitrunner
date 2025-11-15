import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let host = ns.args[0] as string
    ns.nuke(host)



    copyScripts(ns,host)

}




function copyScripts(ns: NS, targetLocation: string) {
    ns.scp(filesToCopy, targetLocation)
}

const filesToCopy = [
    "base/grow.js",
    "base/hack.js",
    "base/weaken.js",
    "base/hgw.js",
     "setup/setup.js",
]