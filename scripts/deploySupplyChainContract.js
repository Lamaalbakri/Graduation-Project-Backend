const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Get a Factory contract to deploy the smart contract
    const SupplyChainContract = await ethers.getContractFactory("SupplyChainContract");

    // deploy smart contract
    const contract = await SupplyChainContract.deploy();
    await contract.waitForDeployment();


    // Save the contract address in a JSON file for future use.  
    const data = { contractAddress: contract.target };
    fs.writeFileSync("deployedContract.json", JSON.stringify(data, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        process.exit(1);
    });
