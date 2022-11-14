import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const convertStringArrayToBytes32 = (
  propArray: string[] = ["chocolate", "lemon", "lime"]
) => propArray.map((p) => ethers.utils.formatBytes32String(p));
const PROPOSALS = convertStringArrayToBytes32();

describe("Ballot", () => {
  let ballotContract: Ballot;
  let accounts: SignerWithAddress[];
  beforeEach(async () => {
    const ballotContractFactory = await ethers.getContractFactory("Ballot");
    accounts = await ethers.getSigners();
    ballotContract = await ballotContractFactory.deploy(PROPOSALS);
    await ballotContract.deployed();
  });
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.name).to.eq(PROPOSALS[index]);
      }
    });
    it("sets the deployer address as chairperson", async () => {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight).to.eq(1);
    });
  });
  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    beforeEach(async () => {
      const selectedVoter = accounts[1].address;
      const tx = await ballotContract.giveRightToVote(selectedVoter);
      await tx.wait();
    });
    it("gives right to vote for another address", async () => {
      const acc1Voter = await ballotContract.voters(accounts[1].address);
      expect(acc1Voter.weight).to.eq(1);
    });
    it("can not give right to vote to someone that has already voted", async () => {
      (await ballotContract.connect(accounts[1]).vote(0)).wait();
      const tx =  ballotContract.giveRightToVote(accounts[1].address);

      await expect(tx).to.be.revertedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async () => {});
    const selectedVoter = accounts[1].address;
    await expect(
      ballotContract.giveRightToVote(selectedVoter)
    ).to.be.revertedWithoutReason();
  });
});
