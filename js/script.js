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
    
    // Simple cart counter
    const cartLink = document.querySelector('nav ul li a[href="#"]');
    let cartCount = 0;
    
    if (cartLink) {
        // Load cart count from localStorage if available
        if (localStorage.getItem('cartCount')) {
            cartCount = parseInt(localStorage.getItem('cartCount'));
            updateCartCount();
        }
        
        // Add to cart button functionality
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                cartCount++;
                updateCartCount();
                localStorage.setItem('cartCount', cartCount);
                alert('Product added to cart!');
            });
        }
    }
    
    function updateCartCount() {
        cartLink.textContent = `Cart (${cartCount})`;
    }
});