const dotenv = require("dotenv");
const abi = require("./abi.js");
const fs = require("fs");
dotenv.config();
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

async function executeClaimAndMint() {
  // Set up the signer (e.g., using a private key)
  const privateKey = process.env.PRIVATE_KEY;
  const signer = new ethers.Wallet(privateKey, provider);

  // Load contract addresses from JSON file
  const contractAddresses = JSON.parse(fs.readFileSync("contract.json"));

  // Contract ABI
  const contractABI = abi;

  // Iterate over each contract address
  for (const contractAddress of contractAddresses) {
    // Instantiate the contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Execute claim function
    try {
      const time = "20";
      const claimTransaction = await contract.claimTokens();
      await claimTransaction.wait();
      console.log(
        `Claim successful for contract at address ${contractAddress} - Transaction Hash: ${claimTransaction.hash}`
      );
    } catch (error) {
      console.error(
        `Claim failed for contract at address ${contractAddress}:`,
        error
      );
    }

    // Execute mint function
    const mintAmount = ethers.utils.parseUnits("2000", 18); // Mint 2000 tokens (adjust the decimals if necessary)

    try {
      const mintTransaction = await contract.withdraw(mintAmount);
      await mintTransaction.wait();
      console.log(
        `Mint successful for contract at address ${contractAddress} - Transaction Hash: ${mintTransaction.hash}`
      );
    } catch (error) {
      console.error(
        `Mint failed for contract at address ${contractAddress}:`,
        error
      );
    }
  }
}

executeClaimAndMint().catch((error) => {
  console.error("Error:", error);
});
