const NFT = require('../models/nft.model');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genai = new GoogleGenerativeAI("AIzaSyCLemwaUUCHprXaIcuPC-3j7A6V59pj5xw");

exports.getAllNFTs = async (req, res) => {
  try {
    const nfts = await NFT.find({});
    console.log(nfts);
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

exports.createLegalAgreement = async (req, res) => {
    
  try {
    const {
        nft_token_id,
        nft_value,
        buyer_address,
        seller_address,
        Buyer_Name,
        Seller_Name,
        Buyer_Physical,
        Seller_Physical
      } = req.body;
    const prompt = `
    Generate a comprehensive, legally binding Air Rights Purchase Agreement with the following details:

BUYER:
Wallet Address: ${buyer_address}
Legal Name: ${Buyer_Name}
Physical Address: ${Buyer_Physical}

SELLER:
Wallet Address: ${seller_address}
Legal Name: ${Seller_Name}
Physical Address: ${Seller_Physical}

ASSET DETAILS:
Air Rights NFT Token ID: ${nft_token_id}
Purchase Price: ${nft_value} USDC
Execution Date: February 16, 2025

The agreement should include:
Clear definition of Air Rights being transferred, including vertical development rights and view corridor protection
Detailed terms of the blockchain-based transfer using the NFT smart contract
Representations and warranties from both parties
Compliance with local zoning laws and building regulations
Rights and restrictions regarding future development
Transfer of ownership process and confirmation
Dispute resolution mechanisms
Governing law and jurisdiction
Force majeure clauses
Signatures and notarization requirements

The agreement should be structured in formal legal language, with clear sections for definitions, terms, conditions, and execution details. Include specific clauses about the immutable nature of blockchain transactions and the finality of the transfer once executed on-chain.
    `;


    // Implement your legal agreement logic here
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    const agreement_text = response.response.text();

    res.json(({
        "message": "Legal agreement generated successfully",
        "agreement": agreement_text
    }));
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

exports.analyzeDeployment = async (req, res) => {
  try {
    const { tokens } = req.body;
    
    // Your AI/ML decision logic here
    const decision = true; // Replace with actual decision logic

    if (decision) {
      try {
        const { stdout, stderr } = await execPromise(
          `npx hardhat run deploy.js --nft-id ${tokens} --network sepolia`,
          { timeout: 300000 } // 5 minute timeout
        );

        const deploymentStatus = stderr ? 'failed' : 'success';
        const deploymentOutput = stderr || stdout;

        return res.json({
          decision: 'EXECUTE',
          deployment_status: deploymentStatus,
          deployment_output: deploymentOutput,
          model_response: 'Your model response here'
        });

      } catch (error) {
        if (error.code === 'ETIMEDOUT') {
          return res.status(408).json({ error: 'Deployment timeout' });
        }
        return res.status(500).json({ error: `Deployment error: ${error.message}` });
      }
    } else {
      return res.json({
        decision: 'REJECT',
        reason: 'Deployment rejected'
      });
    }
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
}; 