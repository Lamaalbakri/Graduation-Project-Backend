const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChainContract", function () {
    let SupplyChainContract;
    let supplyChainContract;
    let companyAddress;

    before(async () => {
        SupplyChainContract = await ethers.getContractFactory("SupplyChainContract");
        supplyChainContract = await SupplyChainContract.deploy();
        await supplyChainContract.waitForDeployment();
        companyAddress = await supplyChainContract.companyAddress();
    });



    it("should mark contract as delivered", async function () {
        const contractId = 0;
        const actualDeliveryTime = 10000;

        const tx = await supplyChainContract.markContractAsDelivered(
            companyAddress,
            contractId,
            actualDeliveryTime
        );
        await tx.wait();

        const deliveredContract = await supplyChainContract.getContract(companyAddress, contractId);
        expect(deliveredContract.purchaseOrderStatus).to.equal(1);
        expect(deliveredContract.actualDeliveryTime).to.equal(actualDeliveryTime);
    });
});
