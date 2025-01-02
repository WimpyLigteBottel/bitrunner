/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL")
  ns.tail();

  // Arguments
  const hostname = ns.args[0];
  const killAll = ns.args[1]?.toLowerCase() === "true";

  // Scan for servers to process
  const toBeProcessed = ns.scan("home").filter(server => {
    return ns.getServerMaxRam(server) > 0; // Only servers with RAM
  });

  toBeProcessed.push("home")

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

    const weakenThreads = Math.floor(availableRam * 0.5 / weakenRam); // 50% for weaken
    const growThreads = Math.floor(availableRam * 0.3 / growRam);   // 30% for grow
    const hackThreads = Math.floor(availableRam * 0.2 / hackRam);    // 20% of RAM

    // Safety checks
    if (weakenThreads <= 0 || growThreads <= 0 || hackThreads <= 0) {
      ns.print(`Skipping ${server}, insufficient threads.`);
      continue;
    }

    ns.print(`Processing server: ${server}`);
    ns.print(`Threads - Weaken: ${weakenThreads}, Grow: ${growThreads}, Hack: ${hackThreads}`);

    if (killAll) {
      ns.killall(server);
    }

    // Copy scripts if not already present
    await ns.scp([weakenScript, growScript, hackScript], server);

    // Execute scripts
    ns.exec(weakenScript, server, Math.floor(weakenThreads / 2), hostname);
    await ns.sleep(100)
    ns.exec(weakenScript, server, Math.floor(weakenThreads / 2), hostname);
    await ns.sleep(100)
    ns.exec(growScript, server, Math.floor(growThreads / 2), hostname);
    await ns.sleep(100)
    ns.exec(growScript, server, Math.floor(growThreads / 2), hostname);
    await ns.sleep(100)
    ns.exec(hackScript, server, hackThreads, hostname);
  }
}
