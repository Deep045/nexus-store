const router = require('express').Router();
const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.find()
    ]);
    const revenue = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);
    const pending  = orders.filter(o => o.status === 'pending').length;
    res.json({ success: true, stats: { users, products, orders: orders.length, revenue, pending } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/seed  — seed sample products (dev only)
router.post('/seed', protect, admin, async (req, res) => {
  try {
    await Product.deleteMany();
    const products = [
      { name:'iPhone 15 Pro', description:'Latest Apple flagship with A17 Pro chip.', price:129999, oldPrice:149900, category:'Electronics', emoji:'📱', stock:50, badge:'new', featured:true, rating:4.8, numReviews:1200 },
      { name:'Samsung 4K QLED TV 55"', description:'Brilliant 4K picture with Quantum Dot.', price:79999, oldPrice:99999, category:'Electronics', emoji:'📺', stock:20, badge:'sale', featured:true, rating:4.7, numReviews:890 },
      { name:'MacBook Air M3', description:'Ultra-thin, all-day battery, M3 chip.', price:114900, description:'Superfast M3 chip. 18hr battery.', category:'Electronics', emoji:'💻', stock:30, badge:'hot', featured:true, rating:4.9, numReviews:560 },
      { name:"Levi's 511 Slim Jeans", description:'Classic slim fit, premium denim.', price:2999, oldPrice:3999, category:'Fashion', emoji:'👖', stock:200, badge:'sale', rating:4.5, numReviews:2280 },
      { name:'Nike Dri-FIT T-Shirt', description:'Breathable, moisture-wicking performance tee.', price:1499, category:'Fashion', emoji:'👕', stock:300, rating:4.6, numReviews:1840 },
      { name:'Dyson V15 Detect', description:'Laser-powered vacuum detects hidden dust.', price:54900, oldPrice:62000, category:'Home', emoji:'🌀', stock:15, badge:'new', rating:4.7, numReviews:412 },
      { name:'Instant Pot Duo 7-in-1', description:'Pressure cooker, slow cooker, rice cooker.', price:6499, oldPrice:9999, category:'Home', emoji:'🍲', stock:80, badge:'sale', rating:4.6, numReviews:3450 },
      { name:'L\'Oreal Serum Set', description:'Hydrating & brightening vitamin C serum.', price:1799, oldPrice:2499, category:'Beauty', emoji:'✨', stock:500, badge:'hot', rating:4.5, numReviews:4120 },
      { name:'Adidas Ultraboost 23', description:'Energy-returning Boost midsole running shoe.', price:14999, oldPrice:18999, category:'Sports', emoji:'🏃', stock:60, badge:'sale', rating:4.7, numReviews:760 },
      { name:'Yoga Mat Pro', description:'6mm thick, non-slip, eco-friendly TPE.', price:2499, category:'Sports', emoji:'🧘', stock:150, badge:'new', rating:4.6, numReviews:1100 },
      { name:'Kindle Paperwhite 2024', description:'Glare-free 7" display, 3 months battery.', price:9999, oldPrice:12499, category:'Electronics', emoji:'📖', stock:100, badge:'sale', rating:4.8, numReviews:2200 },
      { name:'Sony WH-1000XM5', description:'Industry-leading noise cancellation headphones.', price:24999, oldPrice:34990, category:'Electronics', emoji:'🎧', stock:45, badge:'hot', featured:true, rating:4.9, numReviews:3300 }
    ];
    const inserted = await Product.insertMany(products);
    res.json({ success: true, message: `${inserted.length} products seeded`, products: inserted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users  (admin)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id  (admin)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
