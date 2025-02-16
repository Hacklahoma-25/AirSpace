import { ethers } from "hardhat";
import { uploadToIPFS } from "./mint";

const properties = [
    {
        title: "Niagara Falls Hotel View Rights",
        description: "Secure the pristine view of Niagara Falls by purchasing air rights above the existing hotel structure. Prime location with unobstructed views of the falls.",
        address: "6650 Niagara Parkway, Niagara Falls, ON L2G 0L0",
        currentHeight: "10 floors",
        maxHeight: "25 floors",
        floorsToBuy: "11-25 floors",
        price: "250,000",
        coordinates: {
            latitude: 43.0962,
            longitude: -79.0377
        }
    },
    {
        title: "Vancouver Harbor View Rights",
        description: "Protect your panoramic view of Vancouver's harbor and North Shore mountains. Strategic location in downtown Vancouver.",
        address: "1128 West Georgia Street, Vancouver, BC V6E 0A8",
        currentHeight: "15 floors",
        maxHeight: "30 floors",
        floorsToBuy: "16-30 floors",
        price: "375,000",
        coordinates: {
            latitude: 49.2827,
            longitude: -123.1207
        }
    },
    {
        title: "Miami Beach Oceanfront Rights",
        description: "Preserve your ocean view in South Beach Miami. Excellent opportunity to secure views of the Atlantic Ocean.",
        address: "1100 Collins Avenue, Miami Beach, FL 33139",
        currentHeight: "8 floors",
        maxHeight: "20 floors",
        floorsToBuy: "9-20 floors",
        price: "420,000",
        coordinates: {
            latitude: 25.7617,
            longitude: -80.1918
        }
    },
    {
        title: "Sydney Opera House View Rights",
        description: "Once-in-a-lifetime opportunity to secure air rights with direct views of the Sydney Opera House and Harbor Bridge.",
        address: "71 Macquarie Street, Sydney NSW 2000",
        currentHeight: "12 floors",
        maxHeight: "28 floors",
        floorsToBuy: "13-28 floors",
        price: "580,000",
        coordinates: {
            latitude: -33.8688,
            longitude: 151.2093
        }
    },
    {
        title: "Dubai Marina View Rights",
        description: "Secure spectacular views of Dubai Marina and the Arabian Gulf. Premium location in the heart of New Dubai.",
        address: "Dubai Marina, Plot No. JLT-PH2-T2A Dubai, UAE",
        currentHeight: "20 floors",
        maxHeight: "45 floors",
        floorsToBuy: "21-45 floors",
        price: "680,000",
        coordinates: {
            latitude: 25.0757,
            longitude: 55.1386
        }
    }
];

async function main() {
    const contractAddress = "0x676AB843E8aDd6363779409Ee5057f4a26F46F59";
    const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT");
    const contract = AirSpaceNFT.attach(contractAddress);

    for (const property of properties) {
        try {
            console.log(`\nMinting NFT for ${property.title}...`);
            
            // Upload metadata to IPFS
            const ipfsHash = await uploadToIPFS(property);
            const tokenURI = `ipfs://${ipfsHash}`;

            // Mint NFT
            const tx = await contract.mintNFT(
                "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D",
                tokenURI
            );

            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'Transfer');
            const tokenId = event?.args?.tokenId.toString();

            console.log(`✓ NFT Minted Successfully!`);
            console.log(`Transaction Hash: ${tx.hash}`);
            console.log(`Token ID: ${tokenId}`);
            console.log(`IPFS Hash: ${ipfsHash}`);
            
        } catch (error) {
            console.error(`Error minting NFT for ${property.title}:`, error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 