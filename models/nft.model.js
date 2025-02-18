const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
    title: String,
    name: String,
    description: String,
    property_address: String,
    current_height: String,
    maximum_height: String,
    available_floors: String,
    price: String,
    latitude: Number,
    longitude: Number,
    contract_address: String,
    token_id: Number
  }, {
    collection: 'NFT_information',  // Specify the exact collection name
    strict: false  // Allow flexible schema matching
  });
  

module.exports = mongoose.model('NFT', nftSchema); 