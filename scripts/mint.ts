const dotenv = require('dotenv');
const PinataSDK = require('@pinata/sdk');

dotenv.config();

const pinata = new PinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_SECRET_KEY
);

export async function uploadToIPFS(floorData: {
    title: string;
    description: string;
    address: string;
    currentHeight: number;
    maxHeight: number;
    floorsToBuy: number;
    price: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}) {
    // Create metadata
    const metadata = {
        title: floorData.title,
        name: `AirSpace - ${floorData.title}`,
        description: floorData.description,
        attributes: [
            {
                trait_type: "Property Address",
                value: floorData.address
            },
            {
                trait_type: "Current Height",
                value: floorData.currentHeight
            },
            {
                trait_type: "Maximum Height",
                value: floorData.maxHeight
            },
            {
                trait_type: "Available Floors",
                value: floorData.floorsToBuy
            },
            {
                trait_type: "Price",
                value: floorData.price
            }
        ],
        properties: {
            coordinates: floorData.coordinates
        }
    };

    try {
        // Upload to IPFS via Pinata
        const result = await pinata.pinJSONToIPFS(metadata);
        console.log("Uploaded to IPFS!");
        console.log("IPFS Hash:", result.IpfsHash);
        console.log("Pinata URL:", `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        throw error;
    }
}

// Example usage
async function main() {
    const floorData = {
        title: "123 Main St, City",
        description: "Air rights for floor 1 at 123 Main St, City",
        address: "123 Main St, City",
        currentHeight: 100,
        maxHeight: 100,
        floorsToBuy: 5,
        price: 100000,
        coordinates: {
            latitude: 43.0962,
            longitude: -79.0377
        }
    };

    try {
        await uploadToIPFS(floorData);
    } catch (error) {
        console.error("Main function error:", error);
    }
}

main();