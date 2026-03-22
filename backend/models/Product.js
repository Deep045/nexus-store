const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  oldPrice:    { type: Number, default: null },
  category:    { type: String, required: true, enum: ['Electronics','Fashion','Home','Beauty','Sports','Books','Toys','Automotive','Health','Grocery'] },
  brand:       { type: String, default: '' },
  images:      [{ type: String }],
  emoji:       { type: String, default: '📦' },
  stock:       { type: Number, required: true, default: 0 },
  sold:        { type: Number, default: 0 },
  badge:       { type: String, enum: ['new','sale','hot', null], default: null },
  featured:    { type: Boolean, default: false },
  reviews:     [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate average rating
productSchema.methods.calcAvgRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
