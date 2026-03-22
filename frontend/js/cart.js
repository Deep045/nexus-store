async function loadCart() {
  const token = localStorage.getItem("nexus_token");

  const res = await fetch("/api/cart", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  const items = data.cart || [];

  const container = document.getElementById("cart-items");

  let total = 0;

  container.innerHTML = items.map(item => {
    total += item.product.price * item.quantity;

    return `
      <div style="border:1px solid white; margin:10px; padding:10px;">
        <h3>${item.product.name}</h3>
        <p>Price: ₹${item.product.price}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
    `;
  }).join('');

  document.getElementById("total").innerText = "Total: ₹" + total;
}

loadCart();