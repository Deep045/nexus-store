const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    emoji:    String,
    price:    Number,
    quantity: Number
  }],
  shippingAddress: {
    name:    String,
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
    phone:   String
  },
  paymentMethod:  { type: String, default: 'razorpay' },
  paymentResult: {
    razorpay_order_id:   String,
    razorpay_payment_id: String,
    razorpay_signature:  String,
    status:              String
  },
  itemsPrice:    { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  totalPrice:    { type: Number, default: 0 },
  isPaid:        { type: Boolean, default: false },
  paidAt:        Date,
  isDelivered:   { type: Boolean, default: false },
  deliveredAt:   Date,
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
