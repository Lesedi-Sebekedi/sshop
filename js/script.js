// Sample product data
const products = [
    {
        id: 1,
        name: "Product 1",
        price: 19.99,
        image: "images/product1.jpg"
    },
    {
        id: 2,
        name: "Product 2",
        price: 24.99,
        image: "images/product2.jpg"
    },
    {
        id: 3,
        name: "Product 3",
        price: 29.99,
        image: "images/product3.jpg"
    },
    {
        id: 4,
        name: "Product 4",
        price: 34.99,
        image: "images/product1.jpg"
    },
    {
        id: 5,
        name: "Product 5",
        price: 39.99,
        image: "images/product2.jpg"
    },
    {
        id: 6,
        name: "Product 6",
        price: 44.99,
        image: "images/product3.jpg"
    }
];

// Generate product cards on products page
document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    
    if (productGrid) {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <a href="product-detail.html" class="btn">View Details</a>
            `;
            productGrid.appendChild(productCard);
        });
    }
    
    // Thumbnail click functionality
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-image');
    
    if (thumbnails && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src;
            });
        });
    }
    
        // Cart functionality
    let cart = [];

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
        localStorage.setItem('cartCount', cart.reduce((total, item) => total + item.quantity, 0));
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

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    }

    // Update item quantity in cart
    function updateQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            saveCart();
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

    // Render cart page
    function renderCart() {
        const cartContainer = document.getElementById('cart-items-container');
        const emptyMessage = document.getElementById('empty-cart-message');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            cartContainer.innerHTML = '';
            checkoutBtn.disabled = true;
            subtotalElement.textContent = '$0.00';
            totalElement.textContent = '$5.99';
            return;
        }
        
        emptyMessage.style.display = 'none';
        checkoutBtn.disabled = false;
        
        // Calculate subtotal
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 5.99;
        const total = subtotal + shipping;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
        
        // Render cart items
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
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
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                const item = cart.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    updateQuantity(itemId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                const item = cart.find(item => item.id === itemId);
                if (item) {
                    updateQuantity(itemId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.cart-item-quantity input').forEach(input => {
            input.addEventListener('change', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                updateQuantity(itemId, parseInt(this.value));
            });
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                removeFromCart(itemId);
            });
        });
    }

    // Update the DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // Load cart from storage
        loadCart();
        
        // Existing product grid generation code...
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
        
        // Product detail page - Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (addToCartBtn) {
            // Get product ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            
            addToCartBtn.addEventListener('click', function() {
                const quantity = parseInt(document.getElementById('quantity').value) || 1;
                addToCart(productId, quantity);
                alert('Product added to cart!');
            });
        }
        
        // Existing thumbnail and cart link code...
    });
});