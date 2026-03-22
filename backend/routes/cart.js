const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, cart, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart  — add item
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const existing = cart?.items.find(i => i.product.toString() === productId);

    const newQty = (existing ? existing.quantity : 0) + quantity;

if (product.countInStock < newQty) {
  return res.status(400).json({ success: false, message: 'Not enough stock' });
}

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product:  product._id,
        name:     product.name,
        emoji:    product.emoji,
        price:    product.price,
        quantity
      });
    }
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, cart, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cart/:itemId  — update quantity
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, cart, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart/:itemId  — remove item
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, cart, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart  — clear cart
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
