/** @param {import(".").NS } ns */

// Needs special power to be able to run this script

export async function main(ns) {
  let HOSTNAME = ns.getHostname();
  ns.print(`HOSTNAME ${HOSTNAME}`);
  let hackingLevel = ns.getHackingLevel();

  ns.print(`hackingLevel ${hackingLevel}`);

  if (!ns.fileExists("AutoLink.exe", "home") && hackingLevel >= 25) {
    ns.createProgram("AutoLink.exe");
    ns.print(`Creating program AutoLink`);
  } else if (!ns.fileExists("BruteSSH.exe", "home") && hackingLevel >= 50) {
    ns.createProgram("BruteSSH.exe");
    ns.print(`Creating program BruteSSH`);
  } else if (!ns.fileExists("DeepscanV1.exe", "home") && hackingLevel >= 75) {
    ns.createProgram("DeepscanV1.exe");
    ns.print(`Creating program DeepscanV1`);
  } else if (
    !ns.fileExists("ServerProfiler.exe", "home") &&
    hackingLevel >= 75
  ) {
    ns.createProgram("ServerProfiler.exe");
    ns.print(`Creating program ServerProfiler`);
  } else if (!ns.fileExists("FTPCrack.exe", "home") && hackingLevel >= 100) {
    ns.createProgram("FTPCrack.exe");
    ns.print(`Creating program FTPCrack`);
  } else if (!ns.fileExists("relaySMTP.exe", "home") && hackingLevel >= 250) {
    ns.createProgram("relaySMTP.exe");
    ns.print(`Creating program relaySMTP`);
  } else if (!ns.fileExists("DeepscanV2.exe", "home") && hackingLevel >= 400) {
    ns.createProgram("DeepscanV2.exe");
    ns.print(`Creating program DeepscanV2`);
  } else if (!ns.fileExists("HTTPWorm.exe", "home") && hackingLevel >= 500) {
    ns.createProgram("HTTPWorm.exe");
    ns.print(`Creating program HTTPWorm`);
  } else if (!ns.fileExists("SQLInject.exe", "home") && hackingLevel >= 750) {
    ns.createProgram("SQLInject.exe");
    ns.print(`Creating program SQLInject`);
  }
}
