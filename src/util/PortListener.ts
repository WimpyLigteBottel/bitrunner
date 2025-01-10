import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("sleep")
    ns.tail()
    while (true) {
        let line = await ns.readPort(9999)
        if (line != "NULL PORT DATA") {
            ns.write("log.txt", line, "a")
            ns.print(`Received: ${line}`);
        }else {
            await ns.sleep(1); // A sh
        }
    }
}
