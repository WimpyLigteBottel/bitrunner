

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let delay = `${ns.args[1]}` ?? 50;

  await ns.weaken(hostname)
  await ns.sleep(delay)
}