/** @param {import(".").NS } ns */

let args = [];

let scripts = ["scripts/hack.js", "scripts/weaken.js", "scripts/grow.js"];

export async function main(ns) {
  args = arguments["0"].args;

  if (args.includes("--lite")) {
    await liteMode(ns);
  } else {
    await moderateMode(ns);
  }
}

/*
If you have 8 or less gig memory
*/
/** @param {import(".").NS } ns */
async function liteMode(ns) {
  ns.print("liteMode running");
  for (let index = 0; index < scripts.length; index++) {
    let scriptName = scripts[index];

    switch (scriptName) {
      case "scripts/hack.js":
      case "scripts/grow.js":
      case "scripts/weaken.js":
      default:
        let result = await ns.run(scriptName, 1, ns.getHostname());
        ns.print(`${scriptName}[pid=${result}]`);
        break;
    }
  }
}

/*
If you have 16 or less gig memory
*/
async function moderateMode(ns) {
  ns.print("moderateMode running");
  for (let index = 0; index < scripts.length; index++) {
    let scriptName = scripts[index];

    let result;
    switch (scriptName) {
      case "scripts/hack.js":
        result = await ns.run(scriptName, 3, ns.getHostname());
        ns.print(`${scriptName}[pid=${result}]`);
        break;
      case "scripts/grow.js":
      case "scripts/weaken.js":
      default:
        result = await ns.run(scriptName, 1, ns.getHostname());
        ns.print(`${scriptName}[pid=${result}]`);
        break;
    }
  }
}

/*
cleans up threads
*/
async function killAllCleanup(ns) {
  await ns.run("scripts/killAll.js", 1, HOSTNAME);
}
