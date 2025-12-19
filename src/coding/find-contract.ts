import { CodingContractObject, NS } from "@ns";
import { getKnownServers } from "/util/find";
import { solve } from "./solvers/total-ways-to-sum";
import { disableLogs } from "/models/debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  let contracts: CodingContractObject[] = findAllContracts(ns);

  let choice = (await ns.prompt(`WHat is the number`, {
    type: "text",
  })) as string;
  ns.print(solve(parseInt(choice!)));
}

function findAllContracts(ns: NS): CodingContractObject[] {
  return getKnownServers(ns).flatMap((server) => {
    // Get all files on the server
    const files = ns.ls(server.hostname);

    // Filter only coding contracts and map to objects
    const contracts = files
      .filter((file) => file.endsWith(".cct"))
      .map((file) => {
        return ns.codingcontract.getContract(file, server.hostname);
      });

    if (contracts.length > 0) {
      ns.print(server.hostname + "->" + contracts.map((x) => x.type));
    }

    return contracts; // flatMap will flatten these arrays
  });
}
