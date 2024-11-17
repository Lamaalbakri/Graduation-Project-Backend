const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);  // عنوان الحساب الذي ينفذ النشر

    // الحصول على عقد Factory لنشر العقد الذكي
    const SupplyChainContract = await ethers.getContractFactory("SupplyChainContract");

    // نشر العقد الذكي
    console.log("Deploying SupplyChainContract...");
    const contract = await SupplyChainContract.deploy();
    await contract.waitForDeployment();

    console.log("SupplyChainContract deployed to:", contract.target);

    // حفظ عنوان العقد في ملف JSON للاستخدام في المستقبل
    // هذا الجزء يقوم بحفظ عنوان العقد المنشور في ملف JSON
    const data = { contractAddress: contract.target }; // حفظ العنوان في كائن
    fs.writeFileSync("deployedContract.json", JSON.stringify(data, null, 2)); // كتابة البيانات في الملف
}

// استدعاء دالة النشر مع معالجة الأخطاء
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in deployment:", error);
        process.exit(1);
    });
