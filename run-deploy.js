const hre = require("hardhat");

async function runDeploy(nftId) {
    try {
        await hre.run("deploy", {
            nftId: nftId
        });
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
}

module.exports = { runDeploy }; 