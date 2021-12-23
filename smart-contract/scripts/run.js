const { utils } = require("ethers");

async function main() {
  // Get owner/deployer's wallet address
  const [owner] = await hre.ethers.getSigners();

  // Get contract that we want to deploy
  const contractFactory = await hre.ethers.getContractFactory("NineWriters");

  // Deploy contract with the correct constructor arguments
  const contract = await contractFactory.deploy();

  // Wait for this transaction to be mined
  await contract.deployed();

  // Get contract address
  console.log("Contract deployed to:", contract.address);

  // Reserve NFTs
  // let txn = await contract.reserveNFT();
  // await txn.wait();
  // console.log("1 NFT have been reserved");

  // Mint 1 NFTs by sending 0.03 ether
  // txn = await contract.mintNFT({ value: utils.parseEther("0.03") });
  // await txn.wait();

  // Write a text on the wall
  txn = await contract.setText("Hello, world!");
  await txn.wait();

  // Get all token IDs of the owner
  let texts = await contract.getTexts();
  console.log("Texts of the wall: ", texts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
