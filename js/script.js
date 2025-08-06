// Import DOMPurify from CDN (works without npm)
const DOMPurify = window.DOMPurify || { sanitize: str => str }; // Fallback if CDN fails

// Sample product data with descriptions
const products = [
    { 
        id: 1, 
        name: "Premium Wireless Headphones", 
        price: 19.99, 
        image: "images/product1.jpg",
        description: "Experience crystal-clear sound with our comfortable over-ear headphones. Features 20-hour battery life and noise cancellation."
    },
    { 
        id: 2, 
        name: "Smart Fitness Tracker", 
        price: 24.99, 
        image: "images/product2.jpg",
        description: "Track your steps, heart rate, and sleep patterns with this sleek waterproof fitness band. Syncs with all major smartphones."
    },
    { 
        id: 3, 
        name: "Ultra HD Action Camera", 
        price: 29.99, 
        image: "images/product3.jpg",
        description: "Capture your adventures in stunning 4K resolution. Waterproof casing included for underwater shots up to 30m."
    },
    { 
        id: 4, 
        name: "Bluetooth Portable Speaker", 
        price: 34.99, 
        image: "images/product4.jpg",
        description: "Powerful 20W speaker with deep bass and 15-hour playtime. Perfect for outdoor gatherings and travel."
    },
    { 
        id: 5, 
        name: "Ergonomic Wireless Mouse", 
        price: 39.99, 
        image: "images/product5.jpg",
        description: "Designed for comfort during long work sessions. Features silent clicks and precise 1600DPI tracking."
    },
    { 
        id: 6, 
        name: "Fast Wireless Charger", 
        price: 44.99, 
        image: "images/product6.jpg",
        description: "Charge your Qi-enabled devices at maximum speed. Includes overcharge protection and non-slip surface."
    }
];
// Cart functionality
let cart = [];
let activeDiscount = 0;

// Initialize everything
function initialize() {
    loadCart();
    updateCartCount();
    initProductGrid(); 
    initProductDetail();
    initThumbnails();
    if (location.pathname.includes('cart.html')) renderCartItems();
    if (location.pathname.includes('checkout.html')) renderCheckoutItems();
    
    // Set up coupon handler if on cart page
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) applyCouponBtn.addEventListener('click', applyCoupon);
    
    // Set up checkout confirmation if on checkout page
    const confirmOrderBtn = document.getElementById('confirm-order');
    if (confirmOrderBtn) confirmOrderBtn.addEventListener('click', confirmOrder);
}

// Load and validate cart
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            if (!validateCart(cart)) {
                cart = [];
                localStorage.removeItem('cart');
            }
        }
    } catch (e) {
        console.error("Cart load failed:", e);
        cart = [];
    }
}

// Validate cart structure
function validateCart(cart) {
    return Array.isArray(cart) && cart.every(item => 
        item.id && item.name && !isNaN(item.price) && item.image
    );
}

// Save cart securely
function saveCart() {
    if (validateCart(cart)) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        if (location.pathname.includes('cart.html')) renderCartItems();
        if (location.pathname.includes('checkout.html')) renderCheckoutItems();
    }
}

// Add to cart with validation
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product || quantity < 1) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    saveCart();
}

// Calculate cart subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Update cart count in header
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count, nav a[href="cart.html"]').forEach(el => {
        el.textContent = el.tagName === 'SPAN' ? count : `Cart (${count})`;
    });
}

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    
    if (!container) return;
    
    container.innerHTML = '';
    emptyMsg.style.display = cart.length ? 'none' : 'block';
    
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.dataset.id = item.id;
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="decrease-qty">-</button>
                    <input type="number" value="${item.quantity}" min="1">
                    <button class="increase-qty">+</button>
                </div>
                <span class="cart-item-remove">Remove</span>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        container.appendChild(itemEl);
    });
    
    addCartItemEventListeners();
    updateOrderSummary();
}

// Add cart item event listeners
function addCartItemEventListeners() {
    document.querySelectorAll('.cart-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        const cartItem = cart.find(i => i.id === id);
        
        item.querySelector('.decrease-qty').addEventListener('click', () => {
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
                saveCart();
            }
        });
        
        item.querySelector('.increase-qty').addEventListener('click', () => {
            cartItem.quantity++;
            saveCart();
        });
        
        item.querySelector('input').addEventListener('change', (e) => {
            const newQty = Math.max(1, parseInt(e.target.value) || 1);
            cartItem.quantity = newQty;
            saveCart();
        });
        
        item.querySelector('.cart-item-remove').addEventListener('click', () => {
            cart = cart.filter(i => i.id !== id);
            saveCart();
        });
    });
}

// Update order summary
function updateOrderSummary() {
    if (!document.getElementById('item-count')) return;
    
    const subtotal = calculateSubtotal();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const shipping = subtotal > 50 || itemCount === 0 ? 0 : 5.99;
    const total = Math.max(0, subtotal + shipping - activeDiscount);
    
    document.getElementById('item-count').textContent = itemCount;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping ? `$${shipping.toFixed(2)}` : 'FREE';
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-btn').disabled = itemCount === 0;
}

// Apply coupon (sanitized)
function applyCoupon() {
    const couponInput = document.getElementById('coupon-code');
    const cleanCoupon = DOMPurify.sanitize(couponInput.value.trim());
    const subtotal = calculateSubtotal();
    
    if (cleanCoupon === 'SAVE10') {
        activeDiscount = subtotal * 0.1;
        alert('10% discount applied!');
    } else {
        alert('Invalid coupon code');
        return;
    }
    updateOrderSummary();
}

// Render checkout items
function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    
    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    document.getElementById('checkout-total').textContent = 
        `$${calculateSubtotal().toFixed(2)}`;
}

// Confirm order (simulated)
function confirmOrder() {
    if (cart.length === 0) return;
    alert('Redirecting to payment gateway...\n\nSimulated checkout for GitHub Pages');
    // In a real implementation: window.location.href = "https://paypal.com/checkout?cart=" + encodeURIComponent(JSON.stringify(cart));
}

// Initialize product detail page
function initProductDetail() {
    const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
    if (!productId) {
        console.error("No product ID in URL");
        showError("Product not found");
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error("Product not found");
        showError("Product not found");
        return;
    }

    // Update product details
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('main-image').src = product.image;
    document.getElementById('main-image').alt = product.name;

    // Set up thumbnails (using main image as thumbnail if no additional images)
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = `
            <img src="${product.image}" class="thumbnail" alt="${product.name} thumbnail">
        `;
        initThumbnails();
    }

    // Set up Add to Cart button
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.dataset.id = productId;
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            addToCart(productId, quantity);
            alert(`${quantity} ${product.name} added to cart!`);
        });
    }
}

function showError(message) {
    const productInfo = document.querySelector('.product-info');
    if (productInfo) {
        productInfo.innerHTML = `
            <div class="error-message">
                <h2>${message}</h2>
                <a href="products.html" class="btn">Browse Products</a>
            </div>
        `;
    }
}

function initProductGrid() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = ''; // Clear previous content

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <!-- 👇 Add product.id to the link -->
            <a href="product-detail.html?id=${product.id}" class="btn">View Details</a>
        `;
        productGrid.appendChild(productCard);
    });
}

// Initialize thumbnails
function initThumbnails() {
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.getElementById('main-image').src = thumb.src;
        });
    });
}

// Start everything when DOM loads
document.addEventListener('DOMContentLoaded', initialize);