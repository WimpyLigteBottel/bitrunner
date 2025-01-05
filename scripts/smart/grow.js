

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()
  let hostname = `${ns.args[0]}`;
  let delay = `${ns.args[1]}` ?? 50;
  await ns.grow(hostname, { stock: true })
  await ns.sleep(delay)
}