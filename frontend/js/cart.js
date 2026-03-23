const BASE_URL = "https://nexus-backend-sd2q.onrender.com";

async function loadCart() {
  const token = localStorage.getItem("nexus_token");

  const res = await fetch(`${BASE_URL}/api/cart`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  const items = data.cart.items || [];

  const container = document.getElementById("cart-items");

  let total = 0;

  container.innerHTML = items.map(item => {
    total += item.price * item.quantity;

    return `
      <div style="border:1px solid white; margin:10px; padding:10px;">
        <h3>${item.name}</h3>
        <p>Price: ₹${item.price}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
    `;
  }).join("");

  document.getElementById("total").innerText = "Total: ₹" + total;
}

loadCart();