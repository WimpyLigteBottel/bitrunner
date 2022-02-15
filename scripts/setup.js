/** @param {import(".").NS } ns */
export async function main(ns) {
  let args = arguments["0"].args;
  ns.tprint(`arguments ${args}`);

  let HOSTNAME = ns.getHostname();
  ns.print(`HOSTNAME ${HOSTNAME}`);
  let hackingLevel = ns.getHackingLevel();

  ns.print(`hackingLevel ${hackingLevel}`);
  let hosts = ns.scan(HOSTNAME);
  ns.print(`hosts ${hosts}`);

  let ignoreList = ["setup-server", "home", "darkweb"];

  for (let i = 0; i < hosts.length; ++i) {
    let targetHost = hosts[i];
    if (!ignoreList.includes(targetHost)) {
      await executeScript(
        ns,
        targetHost,
        "/scripts/copy-to-server.js",
        targetHost
      );
      await executeScript(ns, targetHost, "/scripts/gainRootAccess.js");
      await executeScript(ns, targetHost, "/scripts/killAll.js");

      if (args.includes("--weaken")) {
        await executeScript(ns, targetHost, "/scripts/weakenFully.js");
      } else if (args.includes("--grow")) {
        await executeScript(ns, targetHost, "/scripts/grow.js");
      } else {
        await executeScript(ns, targetHost, "/scripts/hackFully.js");
      }
    }
  }
}

async function executeScript(ns, targetHost, scriptName) {
  // Deploy the script and run it
  if (ns.hasRootAccess(targetHost)) {
    ns.print(`Gained root on ${targetHost}`);

    // Copy the script over and start it running
    ns.print(`Trying to execute script ${scriptName} on ${targetHost}`);

    try {
      await ns.exec(scriptName, targetHost, 1, targetHost);
    } catch (err) {
      ns.tprint(
        `Failed to execute remote script ${scriptName} on ${targetHost}`
      );
    }
  }
}
