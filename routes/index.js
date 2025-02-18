const express = require('express');
const router = express.Router();
const { 
  getAllNFTs, 
  createLegalAgreement, 
  analyzeDeployment 
} = require('../controllers/nft.controller');
const mongoose = require('mongoose');

router.get('/nfts', getAllNFTs);
router.post('/nft/agreement', createLegalAgreement);
router.post('/analyze_deployment', analyzeDeployment);

// Add test route
router.get('/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const dbName = mongoose.connection.db.databaseName;
    
    // Try to fetch one document from NFT_information collection
    const sampleDoc = await mongoose.connection.db
      .collection('NFT_information')
      .findOne({});
    
    res.json({
      connected: mongoose.connection.readyState === 1,
      database: dbName,
      collections: collections.map(c => c.name),
      sampleDocument: sampleDoc
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 