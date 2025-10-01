// scripts/generateDeployTx.js
import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Generating deployment transaction for SynergyCoin mainnet deployment...");

  // Compile the contract first
  await hre.run("compile");
  console.log("✅ Contract compiled successfully");

  const SynergyCoin = await hre.ethers.getContractFactory("SynergyCoin");

  const multisigOwner = process.env.MULTISIG_WALLET;
  if (!multisigOwner) {
    throw new Error("❌ MULTISIG_WALLET not set in .env file");
  }

  console.log(`📝 Using multisig owner: ${multisigOwner}`);

  // Get contract bytecode and encode constructor arguments
  const bytecode = SynergyCoin.bytecode;
  const abi = SynergyCoin.interface;

  if (!bytecode || bytecode === "0x") {
    throw new Error("❌ Contract bytecode is empty — compilation failed");
  }

  console.log(`🔧 Contract bytecode length: ${bytecode.length}`);

  // Encode constructor arguments
  const constructorArgs = abi.encodeDeploy([multisigOwner]);
  console.log(`📦 Constructor args encoded length: ${constructorArgs.length}`);

  // Combine bytecode with encoded constructor arguments
  const deploymentData = bytecode + constructorArgs.slice(2); // Remove 0x prefix

  console.log(`🚀 Final deployment data length: ${deploymentData.length}`);

  // Create the transaction object for multisig submission
  const deployTransaction = {
    to: null, // Contract creation
    from: multisigOwner,
    value: "0x0", // No ETH needed for deployment
    data: "0x" + deploymentData,
    gasLimit: "0x" + (8000000).toString(16), // Estimate gas limit
    chainId: 1 // Ethereum mainnet
  };

  // Save the deployment transaction
  fs.writeFileSync("deployTx.json", JSON.stringify(deployTransaction, null, 2));

  console.log("✅ deployTx.json written successfully!");
  console.log("📋 Transaction details:");
  console.log(`   - To: ${deployTransaction.to} (null = contract creation)`);
  console.log(`   - From: ${deployTransaction.from}`);
  console.log(`   - Value: ${deployTransaction.value} ETH`);
  console.log(`   - Gas Limit: ${parseInt(deployTransaction.gasLimit, 16)}`);
  console.log(`   - Data length: ${deployTransaction.data.length} characters`);
  console.log("");
  console.log("🔐 Submit this transaction to your multisig wallet for signing and execution.");
  console.log("💡 The multisig wallet will be the owner and receive all minted tokens (6 billion SNRG).");
  console.log("");
  console.log("📄 Transaction saved to deployTx.json - ready for multisig submission!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
