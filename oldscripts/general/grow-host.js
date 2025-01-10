

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  let hostname = "BLANK";
  hostname = `${ns.args[0]}`

  let counter = 0
   ns.print(hostname)

  while (true) {
    let result = await ns.grow(hostname)
    ns.print(`Has grown by ${result}`)
  }
}
