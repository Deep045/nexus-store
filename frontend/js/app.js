// ── Config ──
const API = '';  // same origin — backend serves frontend
let token = localStorage.getItem('nexus_token');
let currentUser = JSON.parse(localStorage.getItem('nexus_user') || 'null');
let cart = [];
let activeFilter = 'All';

// ── API Helper ──
async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ────────────────────────────────────────
// AUTH
// ────────────────────────────────────────
function updateAuthUI() {
  const authBtns  = document.getElementById('auth-btns');
  const userMenu  = document.getElementById('user-menu');
  const greeting  = document.getElementById('user-greeting');
  if (currentUser) {
    authBtns.style.display = 'none';
    userMenu.style.display = 'flex';
    greeting.textContent   = `Hi, ${currentUser.name.split(' ')[0]}`;
  } else {
    authBtns.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

function openModal(mode) {
  const modal   = document.getElementById('auth-modal');
  const content = document.getElementById('modal-content');

  if (mode === 'login') {
    content.innerHTML = `
      <div class="modal-title">Welcome back</div>
      <div class="modal-sub">Sign in to your NEXUS account</div>
      <div class="modal-err" id="merr"></div>
      <div class="form-group">
        <label>Email</label>
        <input id="l-email" type="email" placeholder="you@email.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input id="l-pass" type="password" placeholder="••••••••">
      </div>
      <button class="btn btn-gold" style="width:100%;margin-top:.5rem;text-align:center" onclick="doLogin()">Sign In</button>
      <div class="modal-foot">No account? <a onclick="openModal('register')">Create one →</a></div>`;
  } else {
    content.innerHTML = `
      <div class="modal-title">Create account</div>
      <div class="modal-sub">Join NEXUS and start shopping</div>
      <div class="modal-err" id="merr"></div>
      <div class="form-group">
        <label>Full Name</label>
        <input id="r-name" type="text" placeholder="Your name">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input id="r-email" type="email" placeholder="you@email.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input id="r-pass" type="password" placeholder="Min 6 characters">
      </div>
      <button class="btn btn-gold" style="width:100%;margin-top:.5rem;text-align:center" onclick="doRegister()">Create Account</button>
      <div class="modal-foot">Already have one? <a onclick="openModal('login')">Sign in →</a></div>`;
  }
  modal.classList.add('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('auth-modal')) closeAuthModal();
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

async function doLogin() {
  const email    = document.getElementById('l-email').value;
  const password = document.getElementById('l-pass').value;
  try {
    const data = await api('POST', '/api/auth/login', { email, password });
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    await loadCart();
    toast(`✅ Welcome back, ${currentUser.name.split(' ')[0]}!`);
  } catch (e) {
    document.getElementById('merr').textContent = e.message;
  }
}

async function doRegister() {
  const name     = document.getElementById('r-name').value;
  const email    = document.getElementById('r-email').value;
  const password = document.getElementById('r-pass').value;
  try {
    const data = await api('POST', '/api/auth/register', { name, email, password });
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    toast('🎉 Account created! Welcome to NEXUS');
  } catch (e) {
    document.getElementById('merr').textContent = e.message;
  }
}

function logout() {
  token = null;
  currentUser = null;
  cart = [];
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
  updateAuthUI();
  renderCart();
  toast('👋 Logged out successfully');
}

// ────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────
async function loadProducts(filter = 'All', search = '') {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<div class="loading-grid" style="grid-column:1/-1"><div class="spinner"></div>Loading…</div>';
  try {
    let url = '/api/products?limit=12';
    if (filter !== 'All') url += `&category=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const data = await api('GET', url);
    renderProducts(data.products);
  } catch {
    // Fallback static products when backend isn't running
    const filtered = FALLBACK_PRODUCTS.filter(p => filter === 'All' || p.category === filter);
    const searched = search
      ? filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : filtered;
    console.log(data);
    renderProducts(searched);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--text2);padding:2rem;grid-column:1/-1;text-align:center">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">
        ${p.badge ? `<span class="p-badge b-${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
        <span class="p-wish" onclick="toggleWish(this)" title="Wishlist">♡</span>
        <span style="font-size:5rem">${p.emoji || '📦'}</span>
      </div>
      <div class="product-body">
        <div class="p-cat">${p.category}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating || 0))}${'☆'.repeat(5 - Math.floor(p.rating || 0))}</span>
          <span class="r-count">${(p.rating || 0).toFixed(1)} (${(p.numReviews || 0).toLocaleString()})</span>
        </div>
        <div class="product-footer">
          <div class="p-price">
            ₹${(p.price || 0).toLocaleString()}
            ${p.oldPrice ? `<span class="p-old">₹${p.oldPrice.toLocaleString()}</span>` : ''}
          </div>
            <button class="add-btn" onclick="addToCart('${p._id || p.id}', ... )">
             + Add
            </button>
        </div>
      </div>
    </div>
  `).join('');
}

function applyFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadProducts(cat);
}

function setFilter(cat) {
  setTimeout(() => {
    const btn = [...document.querySelectorAll('.filter-btn')].find(b => b.textContent === cat);
    if (btn) applyFilter(cat, btn);
  }, 500);
}

function toggleWish(el) {
  el.classList.toggle('active');
  el.textContent = el.classList.contains('active') ? '♥' : '♡';
  toast(el.classList.contains('active') ? '❤️ Added to Wishlist' : 'Removed from Wishlist');
}

// ────────────────────────────────────────
// CART
// ────────────────────────────────────────
async function loadCart() {
  if (!token) { cart = []; renderCart(); return; }
  try {
    const data = await api('GET', '/api/cart');
    cart = data.cart?.items || [];
    renderCart();
  } catch { cart = []; renderCart(); }
}
async function updateCart(productId, quantity) {
  const token = localStorage.getItem("nexus_token");

  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      productId,
      quantity
    })
  });

  const data = await res.json();

  if (data.success) {
    loadCart(); // refresh UI
  }
}

async function addToCart(productId) {
  const token = localStorage.getItem("nexus_token");

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1
      })
    });

    const data = await res.json();

    console.log(data); // debug

    if (data.success) {
      alert("Added to cart 🛒");
    } else {
      alert(data.message || "Error adding to cart");
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
}

function quickAdd(product) {
  if (!token) { toast('⚠️ Please login to add to cart'); openModal('login'); return; }
  toast(`✓ ${product.name} added to cart`);
}

async function removeFromCart(itemId) {
  try {
    const data = await api('DELETE', `/api/cart/${itemId}`);
    cart = data.cart?.items || [];
    renderCart();
  } catch (e) { toast('❌ ' + e.message); }
}

async function changeQty(itemId, delta) {
  const token = localStorage.getItem("nexus_token");

  const item = cart.find(i => i._id === itemId);
  const newQty = item.quantity + delta;

  if (newQty < 1) return; // prevent 0

  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: itemId,
      quantity: newQty
    })
  });

  const data = await res.json();

  if (data.success) {
    cart = data.cart?.items || [];
    renderCart();
  }
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  document.getElementById('cart-count').textContent      = count;
  document.getElementById('cart-item-count').textContent = count;
  document.getElementById('cart-total').textContent      = total.toLocaleString();

  const body = document.getElementById('cart-body');
  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <div style="font-size:3rem">🛒</div>
        <div>Your cart is empty.<br>Add some awesome products!</div>
      </div>`;
    return;
  }
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-img">${item.emoji || '📦'}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-cat">${item.category || ''}</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQty('${item._id}', -1)">−</button>
          <span class="qty-n">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${item._id}', 1)">+</button>
        </div>
        <span class="ci-remove" onclick="removeFromCart('${item._id}')">Remove</span>
      </div>
      <div class="ci-price">₹${(item.price * item.quantity).toLocaleString()}</div>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sidebar').classList.add('open');
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sidebar').classList.remove('open');
}

async function checkout() {
  if (!token)       { toast('⚠️ Please login to checkout'); openModal('login'); return; }
  if (!cart.length) { toast('⚠️ Your cart is empty'); return; }
  toast('🔄 Processing order…');
  setTimeout(async () => {
    try {
      await api('DELETE', '/api/cart');
      cart = []; renderCart(); closeCart();
      toast('🎉 Order placed! Add Razorpay keys in .env for live payments.');
    } catch (e) { toast('❌ ' + e.message); }
  }, 1000);
}

// ────────────────────────────────────────
// UTILS
// ────────────────────────────────────────
function toast(msg) {
  const wrap = document.getElementById('toasts');
  const t    = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
}

function subscribe() {
  const email = document.getElementById('nl-email').value;
  if (!email?.includes('@')) { toast('⚠️ Please enter a valid email'); return; }
  toast('🎉 Subscribed! Get ready for exclusive deals');
  document.getElementById('nl-email').value = '';
}

function startCountdown() {
  let h = 8, m = 45, s = 22;
  setInterval(() => {
    s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) h = 23;
    document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-s').textContent = String(s).padStart(2, '0');
  }, 1000);
}

// ────────────────────────────────────────
// FALLBACK PRODUCTS (when backend is offline)
// ────────────────────────────────────────
const FALLBACK_PRODUCTS = [
  { id:1,  name:'iPhone 15 Pro',       category:'Electronics', price:129999, oldPrice:149900, rating:4.8, numReviews:12450, emoji:'📱', badge:'new'  },
  { id:2,  name:'Samsung 4K QLED TV',  category:'Electronics', price:79999,  oldPrice:99999,  rating:4.7, numReviews:8320,  emoji:'📺', badge:'sale' },
  { id:3,  name:'MacBook Air M3',       category:'Electronics', price:114900, oldPrice:null,   rating:4.9, numReviews:5610,  emoji:'💻', badge:'hot'  },
  { id:4,  name:"Levi's 511 Slim",     category:'Fashion',     price:2999,   oldPrice:3999,   rating:4.5, numReviews:22800, emoji:'👖', badge:'sale' },
  { id:5,  name:'Nike Dri-FIT Tee',    category:'Fashion',     price:1499,   oldPrice:null,   rating:4.6, numReviews:18400, emoji:'👕', badge:null   },
  { id:6,  name:'Dyson V15 Detect',    category:'Home',        price:54900,  oldPrice:62000,  rating:4.7, numReviews:4120,  emoji:'🌀', badge:'new'  },
  { id:7,  name:'Instant Pot Duo',     category:'Home',        price:6499,   oldPrice:9999,   rating:4.6, numReviews:3450,  emoji:'🍲', badge:'sale' },
  { id:8,  name:"L'Oreal Serum Set",   category:'Beauty',      price:1799,   oldPrice:2499,   rating:4.5, numReviews:41200, emoji:'✨', badge:'hot'  },
  { id:9,  name:'Adidas Ultraboost 23',category:'Sports',      price:14999,  oldPrice:18999,  rating:4.7, numReviews:7600,  emoji:'🏃', badge:'sale' },
  { id:10, name:'Yoga Mat Pro',         category:'Sports',      price:2499,   oldPrice:null,   rating:4.6, numReviews:11000, emoji:'🧘', badge:'new'  },
  { id:11, name:'Kindle Paperwhite',   category:'Electronics', price:9999,   oldPrice:12499,  rating:4.8, numReviews:2200,  emoji:'📖', badge:'sale' },
  { id:12, name:'Sony WH-1000XM5',     category:'Electronics', price:24999,  oldPrice:34990,  rating:4.9, numReviews:3300,  emoji:'🎧', badge:'hot'  },
];

// ────────────────────────────────────────
// INIT
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadProducts();
  loadCart();
  startCountdown();

  // Search with debounce
  let searchTimer;
  document.getElementById('search-inp').addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadProducts(activeFilter, this.value), 400);
  });
});
