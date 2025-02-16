import { ethers } from "hardhat";
import { uploadToIPFS } from "./mint";
import { Event } from "ethers";

async function main() {
    // Get the contract
    const contractAddress = "0x676AB843E8aDd6363779409Ee5057f4a26F46F59";
    const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT");
    const contract = AirSpaceNFT.attach(contractAddress);

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
            "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D", // Replace with your MetaMask address
            tokenURI
        );

        const receipt = await tx.wait();
        
        // Get the token ID from the event logs with proper typing
        const event = receipt.events?.find((e: Event) => e.event === 'Transfer');
        const tokenId = event?.args?.tokenId.toString();

        console.log("\n=== NFT Minted Successfully! ===");
        console.log("Transaction Hash:", tx.hash);
        
        console.log("\n=== How to view in MetaMask ===");
        console.log("1. Open MetaMask");
        console.log("2. Select Sepolia network");
        console.log("3. Click 'NFTs' tab");
        console.log("4. Click 'Import NFT'");
        console.log("5. Enter these details:");
        console.log(`   - Contract Address: ${contractAddress}`);
        console.log(`   - Token ID: ${tokenId}`);
        
        console.log("\n=== Other places to view your NFT ===");
        console.log("1. OpenSea Testnet:");
        console.log(`   https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`);
        console.log("\n2. Etherscan Sepolia:");
        console.log(`   https://sepolia.etherscan.io/token/${contractAddress}`);
        console.log("\n3. Metadata on IPFS:");
        console.log(`   https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        
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