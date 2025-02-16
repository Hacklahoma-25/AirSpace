import { ethers } from "hardhat";

async function main() {
  const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT");
  const airSpaceNFT = await AirSpaceNFT.deploy();

  await airSpaceNFT.deployed();

  console.log("AirSpaceNFT deployed to:", airSpaceNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 