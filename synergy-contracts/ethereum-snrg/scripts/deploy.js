import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying SynergyCoin contract...");

  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await deployer.provider.getBalance(deployer.address);

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(deployerBalance), "ETH");

  const SynergyCoin = await hre.ethers.getContractFactory("SynergyCoin");

  // Deploy with multisig wallet as owner
  const multisigOwner = process.env.MULTISIG_WALLET;
  if (!multisigOwner) {
    throw new Error("MULTISIG_WALLET not set in .env");
  }
  console.log("Using multisig owner:", multisigOwner);

  const synergyCoin = await SynergyCoin.deploy(multisigOwner);

  await synergyCoin.waitForDeployment();

  const contractAddress = await synergyCoin.getAddress();
  console.log("SynergyCoin deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    multisigOwner: multisigOwner,
    network: hre.network.name,
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");

  // Fetch token details
  const totalSupply = await synergyCoin.totalSupply();
  const name = await synergyCoin.name();
  const symbol = await synergyCoin.symbol();
  const decimals = await synergyCoin.decimals();

  console.log("✅ Contract deployed successfully!");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} tokens`);
  console.log(`   Owner (Multisig): ${multisigOwner}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
