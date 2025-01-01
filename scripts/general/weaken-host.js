var hostname = "BLANK";

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  hostname = `${ns.args[0]}`
  ns.print(hostname)

  var counter = 0

  while (true) {
    ns.print(`Has run ${counter} times`)
    await ns.weaken(hostname)
    counter++;
  }

}