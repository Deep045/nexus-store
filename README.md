# NEXUS — Full Stack E-Commerce

> Dark & premium e-commerce platform — Node.js · Express · MongoDB · Razorpay



## 🔗 Live Project

Frontend: https://serene-starlight-be4f52.netlify.app  
Backend: https://nexus-backend-sd2q.onrender.com  
API: https://nexus-backend-sd2q.onrender.com/api/products
## Folder Structure

```
nexus-store/
├── frontend/               ← All UI files
│   ├── index.html          ← Main HTML page
│   ├── css/
│   │   └── style.css       ← All styles
│   ├── js/
│   │   └── app.js          ← All JavaScript
│   └── images/             ← Product images (add here)
│
└── backend/                ← All server files
    ├── server.js           ← Express entry point
    ├── package.json        ← Dependencies
    ├── .env                ← Environment variables
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── Cart.js
    ├── routes/
    │   ├── auth.js
    │   ├── products.js
    │   ├── cart.js
    │   ├── orders.js
    │   ├── payment.js
    │   └── admin.js
    ├── middleware/
    │   └── auth.js
    └── uploads/            ← Product image uploads
```

## Quick Start

```bash
# 1. Go into backend folder
cd backend

# 2. Install packages
npm install

# 3. Edit .env with your MongoDB + Razorpay keys

# 4. Start dev server
npm run dev

# 5. Open browser → http://localhost:5000
```

The Express server serves the `frontend/` folder automatically. No separate frontend server needed!
