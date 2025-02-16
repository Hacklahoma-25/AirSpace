import { ethers } from "hardhat";
import axios from "axios";

async function main() {
    // Contract setup
    const contractAddress = "0x676AB843E8aDd6363779409Ee5057f4a26F46F59";
    const AirSpaceNFT = await ethers.getContractFactory("AirSpaceNFT");
    const contract = AirSpaceNFT.attach(contractAddress);

    // Array of token IDs to check (from your minted NFTs)
    const tokenIds = [4, 5, 6, 7, 8];

    for (const tokenId of tokenIds) {
        try {
            console.log(`\nReading metadata for Token ID: ${tokenId}`);
            
            // Get the token URI from the contract
            const tokenURI = await contract.tokenURI(tokenId);
            console.log("Token URI:", tokenURI);

            // Convert ipfs:// URI to https gateway URL
            const ipfsHash = tokenURI.replace("ipfs://", "");
            const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            // Fetch the metadata
            const response = await axios.get(url);
            const metadata = response.data;

            // Pretty print the metadata
            console.log("\nMetadata:");
            console.log("Title:", metadata.title);
            console.log("Description:", metadata.description);
            console.log("\nAttributes:");
            metadata.attributes.forEach((attr: { trait_type: string; value: string }) => {
                console.log(`${attr.trait_type}: ${attr.value}`);
            });
            
            if (metadata.properties?.coordinates) {
                console.log("\nCoordinates:");
                console.log("Latitude:", metadata.properties.coordinates.latitude);
                console.log("Longitude:", metadata.properties.coordinates.longitude);
            }

        } catch (error) {
            console.error(`Error reading metadata for token ${tokenId}:`, error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 