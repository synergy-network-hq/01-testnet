import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Compile contract
  await hre.run("compile");

  const SynergyCoin = await hre.ethers.getContractFactory("SynergyCoin");
  const multisigOwner = process.env.MULTISIG_WALLET;

  // Get deploy transaction object
  const deployTx = await SynergyCoin.getDeployTransaction(multisigOwner);

  // Extract the bytecode with constructor args
  const deployBytecode = deployTx.data;

  if (!deployBytecode) {
    console.error("Error: deployBytecode is undefined. Make sure the contract compiled correctly and is in contracts/ folder.");
    process.exit(1);
  }

  console.log("=== COPY THIS WHOLE STRING INTO SAFE ===");
  console.log(deployBytecode);
  console.log("=== END ===");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
