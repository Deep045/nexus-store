const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    emoji:    String,
    price:    Number,
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);