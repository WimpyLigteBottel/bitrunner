/** @param {NS} ns */
export async function main(ns) {


  let hostname = ns.args[0];

  let delay = 100
  let weakenStartTime = ns.getWeakenTime(hostname);
  let growStartTime = ns.getGrowTime(hostname);
  let hackStartTime = ns.getHackTime(hostname);

  while (true) {
    await ns.weaken(hostname, { stock: true })
    await ns.sleep(weakenStartTime - hackStartTime + delay)
    await ns.hack(hostname, { stock: true })
    await ns.sleep(weakenStartTime - hackStartTime + delay)
    await ns.grow(hostname, { stock: true })
    await ns.sleep(growStartTime - weakenStartTime + delay)
    await ns.weaken(hostname, { stock: true })
  }

}