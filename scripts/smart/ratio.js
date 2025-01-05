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


  for (const server of toBeProcessed) {
    if (killAll) {
      ns.killall(server);
    }

    try {
      let serverData = getServerData(ns, server, hostname)

      copyToServer(ns, serverData)

      await executeThreads(ns, serverData)
    } catch (error) {
      ns.print(`Failed for server ${server} ` + error)
    }
  }

  ns.print('Jobs executed')

}
/** @param {NS} ns **/
function copyToServer(ns, serverData) {
  let { weakenScript, growScript, hackScript, server, weakenThreads, growThreads, hackThreads } = serverData

  // Copy scripts if not already present
  ns.scp([weakenScript, growScript, hackScript], server);
  ns.print(`${server}: W: ${weakenThreads}, G: ${growThreads}, H: ${hackThreads}`);
}

/** @param {NS} ns **/
function getServerData(ns, server, hostname) {
  // Script RAM requirements
  const weakenScript = "scripts/general/weaken-host.js";
  const growScript = "scripts/general/grow-host.js";
  const hackScript = "scripts/general/hack-host.js";

  const weakenRam = ns.getScriptRam(weakenScript);
  const growRam = ns.getScriptRam(growScript);
  const hackRam = ns.getScriptRam(hackScript);

  const maxRam = ns.getServerMaxRam(server);
  const availableRam = Math.floor(maxRam * 0.99);



  // Skip servers with insufficient RAM
  if (availableRam <= 0) {
    throw Error("Skipping ${server}, insufficient RAM.");
  }

  return {
    "hostname": hostname,
    "server": server,

    // Script RAM requirements
    "weakenScript": weakenScript,
    "growScript": growScript,
    "hackScript": hackScript,

    "weakenThreads": Math.floor(availableRam * 0.2 / weakenRam),
    "growThreads": Math.floor(availableRam * 0.5 / growRam),
    "hackThreads": Math.floor(availableRam * 0.3 / hackRam),
  }

}

/** @param {NS} ns **/
async function executeThreads(ns, serverData) {
  const { weakenScript, growScript, hackScript, weakenThreads, growThreads, hackThreads, server, hostname } = serverData;

  // Helper function for batch execution
  const runBatches = async (script, totalThreads, batchSize, inputDuration) => {
    let duration = inputDuration
    while (totalThreads > 0) {
      const threadsToRun = Math.min(totalThreads, batchSize);

      ns.exec(script, server, threadsToRun, hostname)

      // Wait for delay before starting the next batch
      await ns.sleep(duration);

      totalThreads -= threadsToRun;
    }

    return duration;
  };

  await runBatches(hackScript, hackThreads, Math.floor(hackThreads * 0.10), 100);
  await runBatches(weakenScript, weakenThreads, Math.floor(weakenThreads * 0.10), 100);
  await runBatches(growScript, growThreads, Math.floor(growThreads * 0.10), 100);

}