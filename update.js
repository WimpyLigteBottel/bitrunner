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
    "https://raw.githubusercontent.com/WimpyLigteBottel/bitrunner/master/scripts/";

  let files = [
    "copy-to-server.js",
    "createProgram.js",
    "gainRootAccess.js",
    "grow.js",
    "hack.js",
    "killAll.js",
    "run.js",
    "setup.js",
    "weaken.js",
    "weakenFully.js",
  ];

  for (let x = 0; x < files.length; x++) {
    let newFile = baseUrl + files[x];
    let result = await ns.wget(newFile, files[x]);

    ns.tprint(`${newFile} : ${result}`);
  }
}
