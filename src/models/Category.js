const mongoose = require('mongoose');

// Update your Cart model/schema
const categorySchema = new mongoose.Schema({
    
    name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Category', categorySchema);