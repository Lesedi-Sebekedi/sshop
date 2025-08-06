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
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
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
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
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

// Render cart items function
function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    // Clear previous items
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    // Create HTML for each cart item
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
    
    // Add event listeners to the new elements
    addCartItemEventListeners();
}

// Add event listeners to cart items
function addCartItemEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity--;
                saveCart();
                renderCartItems();
            }
        });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            if (item) {
                item.quantity++;
                saveCart();
                renderCartItems();
            }
        });
    });
    
    // Quantity input changes
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            const item = cart.find(item => item.id === itemId);
            const newQuantity = parseInt(this.value) || 1;
            
            if (item) {
                item.quantity = newQuantity;
                saveCart();
                renderCartItems();
            }
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
            renderCartItems();
        });
    });
}

// Call this when the cart page loads
if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // Product grid generation
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
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
    
    // Product detail page
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        // Set the data-id attribute if we have a product ID
        if (productId) {
            addToCartBtn.dataset.id = productId;
        }
        
        addToCartBtn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            
            if (productId) {
                addToCart(productId, quantity);
                alert('Product added to cart!');
            } else {
                alert('Error: Product not found');
            }
        });
    }
    
    // Thumbnail functionality
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-image');
    if (thumbnails && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src;
            });
        });
    }



});