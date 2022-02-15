let args = [];
/** @param {import("./scripts").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;

  await ns.wget(
    "https://raw.githubusercontent.com/WimpyLigteBottel/bitrunner/master/update.js",
    "update.js",
    "home"
  );

  if (args.includes("--lite")) {
    ns.print("it contains it");
  }
}
