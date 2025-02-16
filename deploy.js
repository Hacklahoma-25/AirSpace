require('dotenv').config();
const hre = require("hardhat");

async function main(nftId) {
    // Contract details
    const nftContractAddress = "0x676AB843E8aDd6363779409Ee5057f4a26F46F59";
    const price = hre.ethers.utils.parseEther("0.0001");

    // Get signers for seller and buyer
    const [deployer] = await hre.ethers.getSigners();
    
    // Create seller and buyer wallets from private keys
    const sellerWallet = new hre.ethers.Wallet(process.env.SELLER_PRIVATE_KEY, hre.ethers.provider);
    const buyerWallet = new hre.ethers.Wallet(process.env.BUYER_PRIVATE_KEY, hre.ethers.provider);

    console.log("Deploying with the following parameters:");
    console.log("NFT Contract:", nftContractAddress);
    console.log("NFT ID:", nftId);
    console.log("Price:", hre.ethers.utils.formatEther(price), "ETH");
    console.log("Seller:", sellerWallet.address);
    console.log("Buyer:", buyerWallet.address);

    // Deploy the marketplace contract
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const nftmarketplace = await NFTMarketplace.deploy(
        nftContractAddress,
        nftId,
        price,
        buyerWallet.address,
        sellerWallet.address
    );

    await nftmarketplace.deployed();
    console.log("Marketplace deployed to:", nftmarketplace.address);

    // Get NFT contract instance
    const nftContract = await hre.ethers.getContractAt("IERC721", nftContractAddress);

    // Approve marketplace contract (as seller)
    console.log("Approving NFT transfer...");
    const approveTx = await nftContract.connect(sellerWallet).approve(nftmarketplace.address, nftId);
    await approveTx.wait();
    console.log("NFT transfer approved");

    // Execute trade (as buyer)
    console.log("Executing trade...");
    const tradeTx = await nftmarketplace.connect(buyerWallet).executeTradeAndTransfer({
        value: price
    });
    const receipt = await tradeTx.wait();

    // Check for successful trade event
    const tradeEvent = receipt.events?.find(e => e.event === 'TradeExecuted');
    if (tradeEvent) {
        console.log("Trade completed successfully!");
        console.log("NFT transferred to:", buyerWallet.address);
        console.log("ETH transferred to:", sellerWallet.address);
    } else {
        console.log("Trade failed!");
    }
}

// Export the main function
module.exports = { main }

// Only execute if running directly
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}