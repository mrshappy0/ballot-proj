import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const convertStringArrayToBytes32 = (
  propArray: string[] = process.argv.slice(2)
) => propArray.map((p) => ethers.utils.formatBytes32String(p));
const PROPOSALS = convertStringArrayToBytes32();

async function main() {
  console.log("Proposals: ");
  PROPOSALS.forEach((el, i) => {
    console.log(
      `Proposals N. ${i + 1}: ${ethers.utils.parseBytes32String(el)}`
    );
  });
  const provider = ethers.getDefaultProvider("goerli", { alchemy: process.env.I_DONT_REMEMBER}); // second arg prevents request rate-limited
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  const signer = wallet.connect(provider);
  console.log(`Connected to the wallet ${signer.address}`);
  const balance = await signer.getBalance();
  console.log(`This address has a balance of ${balance} wei`);
  if (balance.eq(0)) throw new Error("I'm too poor");
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = await ballotContractFactory.deploy(PROPOSALS);
  await ballotContract.deployed();
  console.log(
    `The ballot smart contract was deployed at ${ballotContract.address}`
  );
}

main().catch((err) => {
  process.exitCode = 1;
});
