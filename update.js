let args = [];
/** @param {import("./scripts").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;

  await ns.wget(
    "https://raw.githubusercontent.com/WimpyLigteBottel/bitrunner/master/update.js",
    "update.js",
    "home"
  );

  let baseUrl =
    "https://raw.githubusercontent.com/WimpyLigteBottel/bitrunner/master/";

  let files = ["scripts/copy-to-server.js", "scripts/createProgram.js"];

  for (let x = 0; x < files.length; x++) {
    //https://raw.githubusercontent.com/WimpyLigteBottel/bitrunner/master/scripts/copy-to-server.js
    let newFile = baseUrl + files[x];
    await ns.wget(newFile, files[x], "home");
  }

  if (args.includes("--lite")) {
    ns.print("it contains it");
  }
}
