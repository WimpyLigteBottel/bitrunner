var hostname = "BLANK";

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  hostname = `${ns.args[0]}`

  var counter = 0

  while (true) {
    ns.print(hostname)
    ns.print(`Has run ${counter} times`)
    await ns.grow(hostname)
    counter++;
  }
}
