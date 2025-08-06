// Sample product data
const products = [
    { id: 1, name: "Product 1", price: 19.99, image: "images/product1.jpg" },
    { id: 2, name: "Product 2", price: 24.99, image: "images/product2.jpg" },
    { id: 3, name: "Product 3", price: 29.99, image: "images/product3.jpg" },
    { id: 4, name: "Product 4", price: 34.99, image: "images/product1.jpg" },
    { id: 5, name: "Product 5", price: 39.99, image: "images/product2.jpg" },
    { id: 6, name: "Product 6", price: 44.99, image: "images/product3.jpg" }
];

// Cart functionality
let cart = [];
let activeDiscount = 0;

// Initialize on page load
function initializeCart() {
    loadCart();
    updateOrderSummary();
    
    // Set up coupon code handler
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            renderCartItems();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateOrderSummary();
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
}

// Add product to cart
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

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

// Update order summary
function updateOrderSummary() {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 || itemCount === 0 ? 0 : 5.99;
    const total = Math.max(0, subtotal + shipping - activeDiscount);
    
    // Update DOM
    if (document.getElementById('item-count')) {
        document.getElementById('item-count').textContent = itemCount;
        document.getElementById('items-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        document.getElementById('discount').textContent = activeDiscount > 0 ? `-$${activeDiscount.toFixed(2)}` : '$0.00';
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = itemCount === 0;
        }
    }
}

// Apply coupon code
function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (couponCode === 'SAVE10') {
        activeDiscount = subtotal * 0.1;
        alert('10% discount applied!');
    } else if (couponCode === 'FREESHIP') {
        activeDiscount = 0; // Special handling would be needed for shipping
        alert('Free shipping applied!');
    } else if (couponCode) {
        alert('Invalid coupon code');
        return;
    } else {
        alert('Please enter a coupon code');
        return;
    }
    
    updateOrderSummary();
}

// Update cart count in header
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, nav ul li a[href="cart.html"]');
    
    cartCountElements.forEach(element => {
        if (element.tagName === 'SPAN') {
            element.textContent = count;
        } else {
            element.textContent = `Cart (${count})`;
        }
    });
}

// Render cart items
function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
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
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    addCartItemEventListeners();
}

// Add event listeners to cart items
function addCartItemEventListeners() {
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity--;
                saveCart();
            }
        });
    });
    
    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            if (item) {
                item.quantity++;
                saveCart();
            }
        });
    });
    
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            const newQuantity = parseInt(this.value) || 1;
            
            if (item) {
                item.quantity = newQuantity;
                saveCart();
            }
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
        });
    });
}

// Initialize product detail page
function initProductDetail() {
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (!addToCartBtn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (productId) {
        addToCartBtn.dataset.id = productId;
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            addToCart(productId, quantity);
            alert('Product added to cart!');
        });
    }
}

// Initialize product grid
function initProductGrid() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <a href="product-detail.html?id=${product.id}" class="btn">View Details</a>
        `;
        productGrid.appendChild(productCard);
    });
}

// Initialize thumbnail functionality
function initThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-image');
    
    if (thumbnails && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src;
            });
        });
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initProductGrid();
    initProductDetail();
    initThumbnails();
    
    // Special initialization for cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
});