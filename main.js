const navList = document.querySelector(".header__nav-list");
const productsContainer = document.querySelector(".products");
const productDetails = document.querySelector(".product-details");
const productDetailsContent = document.querySelector(".product-details__content");
const productDetailsCloseBtn = document.querySelector(".product-details__close-btn");
const priceSort = document.querySelector("#price-sort");
const cartContent = document.querySelector(".cart__content");

let products = [];
let cart = [];
let filter = "All";

const icons = [
    { category: "electronics", icon: "🖥️" },
    { category: "jewelery", icon: "💍" },
    { category: "men's clothing", icon: "👕" },
    { category: "women's clothing", icon: "👗" }
];

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

function shuffleArray(array) {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

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
        <div class="products__item ${productInCart(id) ? "in-cart" : ""}" data-id="${id}" data-category="${category}">
            <div class="products__item-image">${icons.find(item=> item.category === category).icon}</div>
            <div class="products__item-title">${title}</div>
            <div class="products__item-price">${priceStart}<span class="products__price-end">${priceEnd}</span></div>
            <button class="products__add-to-cart-btn">${productInCart(id) ? "Remove from cart" : "Add to cart"}</button>
        </div>
    `}).join("");
}

function renderCart() {
    cartContent.innerHTML = cart.map(item => `
        <div class="cart__item" data-id="${item.id}">
        <div class="cart__item-image">${icons.find(obj=> obj.category === item.category).icon}</div>
        <div class="cart__item-title">${item.title}</div>
        <div class="cart__item-price">${item.price}</div>
        <div class="cart__item-quantity">${item.quantity}</div>
        <button title="Remove from cart" class="cart__remove-from-cart-btn">Remove</button>
        </div>
    `).join("");
}

function addToCart(id) {
    const product = products.find(product => product.id === id);

    updateProductElement(id);

    if (productInCart(id)) productInCart.quantity++;
    else cart.push({...product, quantity: 1});
}

function removeFromCart(id) {
    const cartItem = cart.find(item => item.id === id);
    const productEl = productsContainer.querySelector(`.products__item[data-id="${id}"]`);

    cartItem.quantity--;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
        updateProductElement(id, true);
    }
}

function productInCart(id) {
    return cart.find(item => item.id === id);
};

function updateProductElement(id, remove = false) {
    const element = productsContainer.querySelector(`.products__item[data-id="${id}"]`);
    const btn = element.querySelector(".products__add-to-cart-btn");

    if (remove) {
        element.classList.remove("in-cart");
        btn.textContent = "Add to cart";
    }
    else {
        element.classList.add("in-cart");
        btn.textContent = "Remove from cart";

    }
}

loadCategories().then(categories => renderNavListLinks(categories));

loadProducts()
    .then(products => {
        renderProducts(products);
        
    });

navList.addEventListener("click", function(e) {
    const el = e.target.closest(".header__nav-link");
    const category = el.textContent;
    filter = category;
    renderProducts(products);
});

productsContainer.addEventListener("click", function(e) {
    // Add to cart
    const addToCartBtn = e.target.closest(".products__add-to-cart-btn");
    if (addToCartBtn) {
        const productItem = addToCartBtn.closest(".products__item");
        const id = parseInt(productItem.dataset.id);

        if (productInCart(id)) removeFromCart(id);
        else addToCart(id);

        renderCart();
        return;
    }

    // Show product details
    const productItem = e.target.closest(".products__item");
    if (productItem) {
        const id = parseInt(productItem.dataset.id);
        const {title, price, description} = products.find(product => product.id === id);

        productDetails.showModal();

        productDetailsContent.innerHTML = `
            <div class="product-details__item-title">${title} - $${price}</div>
            <div class="product-details__item-description">${description}</div>
        `;
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
    productDetails.close();
});

priceSort.addEventListener("change", function() {
    renderProducts(products);
});