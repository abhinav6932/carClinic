const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
        
    },
    description: {
        type: String,
        required: true
        
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image:{
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
