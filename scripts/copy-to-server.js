/** @param {import(".").NS } ns */

export async function main(ns) {
  let args = arguments["0"].args;
  let files = ns.ls("home", ".js");

  let extraHost;
  if (args[0] != undefined) {
    extraHost = args[0];
  }

  let servers = [
    "n00dles",
    "joesguns",
    "harakiri-sushi",
    "foodnstuff",
    "hong-fang-tea",
    "sigma-cosmetics",
    "iron-gym",
    "CSEC",
    "nectar-net",
    "phantasy",
    "zer0",
    "max-hardware",
    "neo-net",
    "nectar-net",
    "omega-net",
  ];

  for (let index = 0; index < servers.length; index++) {
    try {
      await ns.scp(files, servers[index]);
      ns.print(`Copied files to ${servers[index]}`);
    } catch (e) {
      ns.print(`failed to copy files to ${e} on (${servers[index]})`);
    }
  }

  if (extraHost == undefined) {
    return 1;
  }

  ns.print(`Copy files to addtional host ${extraHost}`);

  try {
    await ns.scp(files, extraHost);
    ns.print(`Copied files to ${extraHost}`);
  } catch (e) {
    ns.print(`failed to copy files to ${e} on(${extraHost})`);
  }
}
