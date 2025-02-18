import ollama from 'ollama'
const prompt=
"Generate a Solidity-based NFT marketplace contract along with its necessary configuration, deployment script, and environment file. The response should be in **JSON format**, where each file is represented as an object with a `filename` key and a `content` key containing the respective code.  
The NFT marketplace contract should:  
- Use OpenZeppelin’s `IERC721` for NFT interactions and `ReentrancyGuard` for security.  
- Store the NFT contract address, NFT ID, price, seller, and buyer.  
- Ensure the seller owns the NFT before executing the trade.  
- Require the buyer to send the correct ETH amount.  
- Transfer the NFT to the buyer and ETH to the seller upon a successful trade.  
- Handle transaction failures safely and refund the buyer if the NFT transfer fails.  
- Emit events for successful and failed trades.  
- Include a function to check the trade status.  
- Be compatible with Solidity ^0.8.0 and optimized for gas efficiency and security.  

Additionally, generate the following files in JSON format:  


{
  "files": [
    {
      "filename": "contracts/NFTMarketplace.sol",
      "content": "/* Solidity smart contract code here */"
    },
    {
      "filename": "hardhat.config.js",
      "content": "/* Hardhat configuration code here */"
    },
    {
      "filename": "scripts/deploy.js",
      "content": "/* Deployment script code here */"
    },
    {
      "filename": ".env",
      "content": "SEPOLIA_RPC_URL=''\nBUYER_PRIVATE_KEY=''\nSELLER_PRIVATE_KEY=''\nALCHEMY_API_KEY=''\nPRIVATE_KEY=''"
    }
  ]
}
 

Ensure the Solidity contract is structured properly and that the Hardhat configuration correctly loads environment variables. The deployment script should:  
1. Deploy the contract with necessary parameters (NFT contract address, NFT ID, price, buyer, seller).  
2. Approve the NFT transfer from the seller to the contract.  
3. Execute the trade and verify success.  
4. Log transaction details.  

Respond strictly in **valid JSON format** without additional explanations."
const response = await ollama.chat({
  model: 'llama3.1:8b-instruct-q5_K_M',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)
const fs = require('fs');
const path = require('path');

// Read and parse the JSON file
const jsonFile = 'files.json';
fs.readFile(jsonFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    try {
        const parsedData = JSON.parse(data);

        if (!parsedData.files || !Array.isArray(parsedData.files)) {
            throw new Error('Invalid JSON format: Missing or incorrect "files" array.');
        }

        parsedData.files.forEach(file => {
            const filePath = path.resolve(__dirname, file.filename);
            const dirPath = path.dirname(filePath);

            // Ensure directory exists
            fs.mkdirSync(dirPath, { recursive: true });

            // Write the file content
            fs.writeFileSync(filePath, file.content, 'utf8');
            console.log(`✅ Created: ${file.filename}`);
        });

        console.log('🚀 All files have been generated successfully!');
    } catch (error) {
        console.error('Error processing JSON:', error);
    }
});
