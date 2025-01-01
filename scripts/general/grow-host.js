var hostname = "BLANK";

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  hostname = `${ns.args[0]}`

  var counter = 0
   ns.print(hostname)

  while (true) {
    var result = await ns.grow(hostname)
    ns.print(`Has grown by ${result}`)
  }
}
