import { ethers } from "hardhat";
import { uploadToIPFS } from "./mint"; // Your existing IPFS upload function

async function main() {
    // Get the contract
    const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // You'll get this after deployment
    const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT");
    const contract = AirSpaceNFT.attach(contractAddress);

    // Your floor data
    const floorData = {
        propertyAddress: "123 Main St, City",
        floorNumber: 1,
        maxPossibleFloors: 10,
        currentBuiltFloors: 5,
        coordinates: {
            latitude: 43.0962,
            longitude: -79.0377
        }
    };

    try {
        // Upload metadata to IPFS
        const ipfsHash = await uploadToIPFS(floorData);
        const tokenURI = `ipfs://${ipfsHash}`;

        // Mint NFT
        const tx = await contract.mintNFT(
            "YOUR_WALLET_ADDRESS", // Replace with recipient address
            tokenURI
        );

        await tx.wait();
        console.log("NFT Minted! Transaction:", tx.hash);
    } catch (error) {
        console.error("Error minting NFT:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 