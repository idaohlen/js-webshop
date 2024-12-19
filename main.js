const navList = document.querySelector(".header__nav-list");
const productsContainer = document.querySelector(".products");
const productDetails = document.querySelector(".product-details");
const productDetailsContent = document.querySelector(".product-details__content");
const productDetailsCloseBtn = document.querySelector(".product-details__close-btn");
const priceSort = document.querySelector("#price-sort");
const cartElement = document.querySelector(".cart");
const cartHeading = document.querySelector(".cart__heading");
const cartTotalValue = document.querySelector(".cart__total-value");
const cartContent = document.querySelector(".cart__content");
const cartToggleBtn = document.querySelector(".cart__toggle-btn");

let products = [];
let cart = [];
let filter = "All";

const icons = [
    { category: "electronics", icon: "🖥️" },
    { category: "jewelery", icon: "💍" },
    { category: "men's clothing", icon: "👕" },
    { category: "women's clothing", icon: "👗" }
];

/* ----------------------------------------------------- */
// Utility functions
/* ----------------------------------------------------- */

const productInCart = (id) => cart.find(item => item.id === id);

const getCategoryIcon = (category) => icons.find(icon => icon.category === category)?.icon;

const getCartTotal = () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

const shuffleArray = (array) => {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

 /* ----------------------------------------------------- */
// Fetch API data
/* ----------------------------------------------------- */

async function loadCategories() {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    if (!response.ok) throw new Error("Unable to fetch categories.");
    const data = await response.json();
    return data;
}

async function loadProducts() {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error("Unable to fetch products.");
    const data = await response.json();
    products = data;
    return data;
}

/* ----------------------------------------------------- */
// Rendering elements
/* ----------------------------------------------------- */

function renderNavListLinks(categories) {
    const html = categories.map(category => `<li class="header__nav-link">${category}</li>`).join("");
    navList.innerHTML = `<li class="header__nav-link">All</li>` + html;
}

function renderProducts(products) {
    shuffleArray(products);

    productsContainer.innerHTML = products
    .filter(product => {
        if (filter === "All") return product;
        else if (filter) return product.category === filter;
        else return product;
    })
    .sort((a, b) => {
        if (priceSort.value === "high") return b.price - a.price;
        else if (priceSort.value === "low") return a.price - b.price;
        return a;
    })
    .map(({id, title, price, category}) => { 
        const [priceStart, priceEnd] = price.toFixed(2).split(".");

        return `
        <div class="products__item product ${productInCart(id) ? "in-cart" : ""}" data-id="${id}" data-category="${category}">
            <div class="products__item-image">${getCategoryIcon(category)}</div>
            <div class="products__item-title">${title}</div>
            <div class="products__item-price">${priceStart}<span class="products__price-end">${priceEnd}</span></div>
            <button class="add-to-cart-btn">${productInCart(id) ? "Remove from cart" : "Add to cart"}</button>
        </div>
    `}).join("");
}

function renderCart() {
    cartContent.innerHTML = cart.map(item => `
        <div class="cart__item product" data-id="${item.id}">
        <div class="cart__item-image">${getCategoryIcon(item.category)}</div>
        <div class="cart__item-title">${item.title}</div>
        <div class="cart__item-price">${item.price}</div>
        <div class="cart__item-quantity">${item.quantity}</div>
        <button title="Remove from cart" class="cart__remove-from-cart-btn">Remove</button>
        </div>
    `).join("");
    updateCartHeading();
}

function updateCartHeading() {
    cartHeading.innerHTML = `
        Cart
        <span class="pill">${cart.length > 0 ? `${cart.length} items in cart` : "No items in cart"}</span>
    `;
    cartTotalValue.textContent = getCartTotal().toFixed(2);
    
}

function updateProductElement(id, remove = false) {
    const element = productsContainer.querySelector(`.product[data-id="${id}"]`);
    let btn = element.querySelector(".add-to-cart-btn");

    if (remove) {
        element.classList.remove("in-cart");
        btn.textContent = "Add to cart";
    }
    else {
        element.classList.add("in-cart");
        btn.textContent = "Remove from cart";
    }

    if (productDetails.open) {
        btn = productDetailsContent.querySelector(".add-to-cart-btn");
        if (btn) {
            btn.textContent = remove ? "Add to cart" : "Remove from cart";
            const product = btn.closest(".product");
            product.classList.toggle("in-cart");
        }
    }
}

/* ----------------------------------------------------- */
// Cart logic
/* ----------------------------------------------------- */

function addToCart(id) {
    const product = products.find(product => product.id === id);

    updateProductElement(id);

    if (productInCart(id)) productInCart.quantity++;
    else cart.push({...product, quantity: 1});

    gtag('event', 'add_to_cart', {
        'event_category': 'Cart',
        'event_label': product.title,
        'value': product.price,
        'debug_mode': true
    });

   saveCart();
}

function removeFromCart(id) {
    const cartItem = cart.find(item => item.id === id);

    cartItem.quantity--;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
        updateProductElement(id, true);
    }

    gtag('event', 'remove_from_cart', {
        'event_category': 'Cart',
        'event_label': cartItem.title,
        'value': cartItem.price,
        'debug_mode': true
    });

    saveCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* ----------------------------------------------------- */
// Product details modal
/* ----------------------------------------------------- */

function showProductDetails(product) {
    const id = parseInt(product.dataset.id);
    const { title, price, category, description } = products.find(product => product.id === id);

    gtag('event', 'view_item', {
        'event_category': 'Product',
        'event_label': title,
        'value': price,
        'debug_mode': true
    });

    productDetails.showModal();

    productDetailsContent.innerHTML = `
        <div class="product-details__item product ${productInCart(id) ? "in-cart" : ""}" data-id="${id}">
            <div class="product-details__item-image">${getCategoryIcon(category)}</div>
            <div class="product-details__item-details">
                <div class="product-details__item-title">${title} - $${price}</div>
                <div class="product-details__item-description">${description}</div>
                <button class="add-to-cart-btn">${productInCart(id) ? "Remove from cart" : "Add to cart"}</button>
            </div>
        </div>
    `;
}

function hideProductDetails() {
    productDetails.close();
}

/* ----------------------------------------------------- */
// Initial load + render content
/* ----------------------------------------------------- */

loadCategories().then(categories => renderNavListLinks(categories));

loadProducts()
    .then(products => {
        // Load cart from local storage
        if (localStorage.getItem("cart")) {
            cart = JSON.parse(localStorage.getItem("cart") || []);
            renderCart();
        }
        // Render products on page
        renderProducts(products);
    });

// -----------------------------------------------------
// Event listeners
// -----------------------------------------------------

navList.addEventListener("click", function(e) {
    // Filter products by category
    const el = e.target.closest(".header__nav-link");
    const category = el.textContent;
    filter = category;
    renderProducts(products);
});

document.addEventListener("click", function(e) {
    // Add to cart
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (addToCartBtn) {
        const productItem = addToCartBtn.closest(".product");
        const id = parseInt(productItem.dataset.id);

        if (productInCart(id)) removeFromCart(id);
        else addToCart(id);

        renderCart();
        return;
    }

    // Show product details modal
    const productItem = e.target.closest(".products__item");
    if (productItem) {
        showProductDetails(productItem);
    }
});

cartContent.addEventListener("click", function(e) {
    // Remove from cart
    const removeBtn = e.target.closest(".cart__remove-from-cart-btn");
    if (removeBtn) {
        const productItem = removeBtn.closest(".cart__item");
        const id = parseInt(productItem.dataset.id);

        removeFromCart(id);
        renderCart();
    }
});

productDetailsCloseBtn.addEventListener("click", function() {
    hideProductDetails();
});

// Sort products by price
priceSort.addEventListener("change", function() {
    gtag('event', 'sort_products', {
        'event_category': 'Products',
        'event_label': priceSort.value,
        'debug_mode': true
    });

    renderProducts(products);
});

cartToggleBtn.addEventListener("click", () => {
    cartElement.classList.toggle("open");
});
