// ===== MOBILE MENU TOGGLE =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// ===== MENU FILTERING =====
const tabBtns = document.querySelectorAll('.tab-btn');
const menuCards = document.querySelectorAll('.menu-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    menuCards.forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.cat === filter) ? 'block' : 'none';
    });
  });
});

// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

function setTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.innerHTML = theme === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== SHOPPING CART =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Open/Close Cart
function openCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
}
function closeCartFn() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
}

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

// Cart State Management
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(item) {
  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  renderCart();
}

function updateQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(name);
  } else {
    saveCart();
    renderCart();
  }
}

// Render Cart UI
function renderCart() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty. Add some tasty items!</p>';
    cartTotalEl.textContent = '$0.00';
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <span class="item-price">$${item.price.toFixed(2)}</span>
        <div class="qty-controls">
          <button onclick="updateQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Make functions globally available for inline onclick
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

// Attach add-to-cart to menu items
document.querySelectorAll('.menu-card').forEach(card => {
  const btn = card.querySelector('.add-btn');
  btn.addEventListener('click', () => {
    const item = {
      name: card.dataset.name,
      price: parseFloat(card.dataset.price),
      img: card.dataset.img
    };
    addToCart(item);
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i>';
    }, 800);
  });
});

// ===== WHATSAPP CHECKOUT =====
// ⚠️ REPLACE "1234567890" WITH THE RESTAURANT'S ACTUAL WHATSAPP NUMBER (no + or spaces)
const RESTAURANT_WHATSAPP_NUMBER = "1234567890";

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty! Add some items first.');
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();

  if (!name || !phone || !address) {
    alert('Please fill in your name, phone number, and delivery address.');
    return;
  }

  // Build order message
  let message = `🍽️ *NEW ORDER - Tasty Bites*\n\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📞 *Phone:* ${phone}\n`;
  message += `📍 *Address:* ${address}\n\n`;
  message += `🛒 *Order Details:*\n`;

  cart.forEach(item => {
    message += `• ${item.name} x${item.qty} — $${(item.price * item.qty).toFixed(2)}\n`;
  });

  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  message += `\n💰 *Total: $${total.toFixed(2)}*\n\n`;
  message += `Please confirm my order. Thank you! 🙏`;

  // Encode and open WhatsApp
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');

  // Clear cart and form
  cart = [];
  saveCart();
  renderCart();
  closeCartFn();
  document.getElementById('custName').value = '';
  document.getElementById('custPhone').value = '';
  document.getElementById('custAddress').value = '';
});

// ===== CONTACT FORM =====
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you! Your message has been sent.');
  this.reset();
});

// Initial render
renderCart();
