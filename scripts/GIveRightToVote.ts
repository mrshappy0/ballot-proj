import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const convertStringArrayToBytes32 = (
  propArray: string[] = process.argv.slice(2)
) => propArray.map((p) => ethers.utils.formatBytes32String(p));
const PROPOSALS = convertStringArrayToBytes32();

async function main() {
  const contractAddress = process.argv[2];
  const targetAddress = process.argv[3];
  const provider = ethers.getDefaultProvider("goerli", {
    alchemy: process.env.I_DONT_REMEMBER,
  }); // second arg prevents request rate-limited
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  const signer = wallet.connect(provider);
  console.log(`Connected to the wallet ${signer.address}`);
  const balance = await signer.getBalance();
  console.log(`This address has a balance of ${balance} wei`);
  if (balance.eq(0)) throw new Error("I'm too poor");
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = await ballotContractFactory.attach(contractAddress);
  const tx = await ballotContract.giveRightToVote(targetAddress);
  await tx.wait();
  console.log(`Transaction Hash: ${tx.hash}`);
}

main().catch((err) => {
  process.exitCode = 1;
});
