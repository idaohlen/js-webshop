const navList = document.querySelector(".header__nav-list");
const productsContainer = document.querySelector(".products");
const productDetails = document.querySelector(".product-details");
const productDetailsContent = document.querySelector(".product-details__content");
const productDetailsCloseBtn = document.querySelector(".product-details__close-btn");


let products = [];
let filter = "All";

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
    const icons = [
        { category: "electronics", icon: "🖥️" },
        { category: "jewelery", icon: "💍" },
        { category: "men's clothing", icon: "👕" },
        { category: "women's clothing", icon: "👗" }
    ];

    shuffleArray(products);

    productsContainer.innerHTML = products
    .filter(product => {
        if (filter === "All") return product;
        else if (filter) return product.category === filter;
        else return product;
    })
    .sort((a, b) => {
        return a;
    })
    .map(({id, title, price, category}) => `
        <div class="products__item" data-id="${id}" data-category="${category}">
            <div class="products__item-image">${icons.find(item=> item.category === category).icon}</div>
            <div class="products__item-title">${title}</div>
            <div class="products__item-price">$${price}</div>
        </div>
    `).join("");
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
    const el = e.target.closest(".products__item");
    const id = parseInt(el.dataset.id);
    const {title, price, description} = products.find(product => product.id === id);

    productDetails.showModal();

    productDetailsContent.innerHTML = `
        <div class="product-details__item-title">${title} - $${price}</div>
        <div class="product-details__item-description">${description}</div>
    `;
});

productDetailsCloseBtn.addEventListener("click", function() {
    productDetails.close();
});