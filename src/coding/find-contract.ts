import { CodingContractObject, NS } from "@ns";
import { getKnownServers } from "/util/find";
import { disableLogs } from "/models/debug";
import { solveContract } from "./solveContract";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  findAllContracts(ns);
}

function findAllContracts(ns: NS): CodingContractObject[] {
  return getKnownServers(ns).flatMap((server) => {
    // Get all files on the server
    const files = ns.ls(server.hostname);

    // Filter only coding contracts and map to objects
    const contracts = files
      .filter((file) => file.endsWith(".cct"))
      .map((file) => {
        let contract = ns.codingcontract.getContract(file, server.hostname);

        let answer = solveContract(ns, contract, file, server.hostname);

        ns.print(answer);

        return contract;
      });

    if (contracts.length > 0) {
      ns.print(server.hostname + "->" + contracts.map((x) => x.type));
    }

    return contracts; // flatMap will flatten these arrays
  });
}
