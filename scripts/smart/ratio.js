/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL")
  ns.tail();

  // Arguments
  const hostname = ns.args[0];
  const killAll = ns.args[1]?.toLowerCase() === "true";

  // Scan for servers to process
  const toBeProcessed = ["home"].concat(ns.scan("home").filter(server => {
    return ns.getServerMaxRam(server) > 0 && server.includes("home"); // Only servers with RAM
  }));

  // Script RAM requirements
  const weakenScript = "scripts/general/weaken-host.js";
  const growScript = "scripts/general/grow-host.js";
  const hackScript = "scripts/general/hack-host.js";

  const weakenRam = ns.getScriptRam(weakenScript);
  const growRam = ns.getScriptRam(growScript);
  const hackRam = ns.getScriptRam(hackScript);

  for (const server of toBeProcessed) {
    await ns.sleep(100)
    const maxRam = ns.getServerMaxRam(server);
    const availableRam = maxRam;

    // Skip servers with insufficient RAM
    if (availableRam <= 0) {
      ns.print(`Skipping ${server}, insufficient RAM.`);
      continue;
    }

    let weakenThreads = Math.floor(availableRam * 0.1 / weakenRam); // 40% for weaken
    let growThreads = Math.floor(availableRam * 0.1 / growRam);   // 30% for grow
    let hackThreads = Math.floor(availableRam * 0.8 / hackRam);    // 30% of RAM


    ns.print(`${server}: W: ${weakenThreads}, G: ${growThreads}, H: ${hackThreads}`);

    if (killAll) {
      ns.killall(server);
    }

    // Copy scripts if not already present
    await ns.scp([weakenScript, growScript, hackScript], server);


    while (weakenThreads >= 1 || growThreads >= 1 || hackThreads >= 1) {
      await ns.sleep(5);

      if (weakenThreads >= 1) {
        await ns.exec(weakenScript, server, 1, hostname);
        weakenThreads--;
      }

      if (growThreads >= 1) {
        await ns.exec(growScript, server, 1, hostname);
        growThreads--;
      }

      if (hackThreads >= 1) {
        await ns.exec(hackScript, server, 1, hostname);
        hackThreads--;
      }
    }
  }
}
