const DEFAULT_PROPERTIES = [
    {
        id: 1,
        title: "The Modern Residence",
        type: "Villa",
        purpose: "Sale",
        location: "New Cairo, Egypt",
        area: 420,
        bedrooms: 5,
        bathrooms: 4,
        price: 850000,
        currency: "$",
        badge: "FEATURED",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
        status: "available"
    },
    {
        id: 2,
        title: "Skyline Residence",
        type: "Apartment",
        purpose: "Sale",
        location: "New Cairo, Egypt",
        area: 215,
        bedrooms: 3,
        bathrooms: 3,
        price: 420000,
        currency: "$",
        badge: "NEW",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
        status: "available"
    },
    {
        id: 3,
        title: "The Garden House",
        type: "House",
        purpose: "Rent",
        location: "Sheikh Zayed, Egypt",
        area: 360,
        bedrooms: 4,
        bathrooms: 4,
        price: 3500,
        currency: "$",
        badge: "EXCLUSIVE",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
        status: "available"
    }
];

const ESTORA_PROPERTIES_KEY = "estoraAdminProperties";

const allProperties = document.getElementById("allProperties");
const result = document.getElementById("propertiesResult");
const purposeFilter = document.getElementById("filterPurpose");
const locationFilter = document.getElementById("filterLocation");
const typeFilter = document.getElementById("filterType");
const priceFilter = document.getElementById("filterPrice");
const clearFilters = document.getElementById("clearFilters");
const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getProperties() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(ESTORA_PROPERTIES_KEY) || "[]"
        );

        if (Array.isArray(saved) && saved.length) {
            return saved;
        }
    } catch (error) {
        console.warn("Could not read ESTORA properties:", error);
    }

    return DEFAULT_PROPERTIES;
}

function money(property) {
    const value = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0
    }).format(Number(property.price) || 0);

    return `${escapeHTML(property.currency || "$")}${value}${
        String(property.purpose).toLowerCase() === "rent" ? " / month" : ""
    }`;
}

function getImage(property) {
    return property.images?.[0] || property.image || "";
}

function render(list) {
    if (!allProperties) return;

    allProperties.innerHTML = "";

    if (result) {
        result.textContent =
            `${list.length} ${list.length === 1 ? "PROPERTY" : "PROPERTIES"} FOUND`;
    }

    if (!list.length) {
        allProperties.innerHTML = `
            <div class="properties-page-empty">
                <i class="fa-regular fa-building"></i>
                <h2>No properties found</h2>
                <p>Try changing your filters.</p>
            </div>
        `;
        return;
    }

    list.forEach(property => {
        const card = document.createElement("article");
        card.className = "properties-page-card";

        const sold = String(property.status).toLowerCase() === "sold";
        const image = getImage(property);

        card.innerHTML = `
            <div class="properties-page-image">
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(property.title)}"
                    loading="lazy"
                >

                ${
                    property.badge
                        ? `<span class="properties-page-badge">${escapeHTML(property.badge)}</span>`
                        : ""
                }

                ${
                    sold
                        ? `<div class="property-sold">SOLD OUT</div>`
                        : ""
                }
            </div>

            <div class="properties-page-info">
                <div class="properties-page-type">
                    ${escapeHTML(String(property.type || "").toUpperCase())}
                    ·
                    ${escapeHTML(String(property.purpose || "").toUpperCase())}
                </div>

                <h2>${escapeHTML(property.title)}</h2>

                <div class="properties-page-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${escapeHTML(property.location)}
                </div>

                <div class="properties-page-meta">
                    <span>
                        <i class="fa-solid fa-ruler-combined"></i>
                        ${Number(property.area) || 0} m²
                    </span>
                    <span>
                        <i class="fa-solid fa-bed"></i>
                        ${Number(property.bedrooms) || 0} Beds
                    </span>
                    <span>
                        <i class="fa-solid fa-bath"></i>
                        ${Number(property.bathrooms) || 0} Baths
                    </span>
                </div>

                <div class="properties-page-bottom">
                    <strong class="properties-page-price">${money(property)}</strong>

                    <a
                        class="properties-page-view"
                        href="property-details.html?id=${encodeURIComponent(property.id)}"
                    >
                        VIEW PROPERTY
                    </a>
                </div>
            </div>
        `;

        allProperties.appendChild(card);
    });
}

function normalizePurpose(value) {
    const v = String(value || "").toLowerCase();

    if (v === "buy" || v === "sale") return "Sale";
    if (v === "rent") return "Rent";

    return "";
}

function normalizeLocation(value) {
    const map = {
        "new-cairo": "New Cairo",
        "new cairo": "New Cairo",
        "sheikh-zayed": "Sheikh Zayed",
        "sheikh zayed": "Sheikh Zayed",
        "north-coast": "North Coast",
        "north coast": "North Coast",
        "maadi": "Maadi"
    };

    return map[String(value || "").toLowerCase()] || String(value || "");
}

function normalizeType(value) {
    const map = {
        apartment: "Apartment",
        villa: "Villa",
        chalet: "Chalet",
        office: "Office",
        house: "House"
    };

    return map[String(value || "").toLowerCase()] || String(value || "");
}

function matchesPrice(property, price) {
    if (!price) return true;

    const amount = Number(property.price) || 0;

    switch (price) {
        case "0-500000":
            return amount <= 500000;
        case "500000-1000000":
            return amount > 500000 && amount <= 1000000;
        case "1000000+":
            return amount > 1000000;
        case "0-5000":
            return amount <= 5000;
        case "5000+":
            return amount > 5000;
        default:
            return true;
    }
}

function filterProperties() {
    const properties = getProperties();

    const purpose = normalizePurpose(purposeFilter?.value);
    const location = normalizeLocation(locationFilter?.value);
    const type = normalizeType(typeFilter?.value);
    const price = priceFilter?.value || "";

    const filtered = properties.filter(property => {
        const matchesPurpose =
            !purpose ||
            String(property.purpose || "").toLowerCase() === purpose.toLowerCase();

        const matchesLocation =
            !location ||
            String(property.location || "")
                .toLowerCase()
                .includes(location.toLowerCase());

        const matchesType =
            !type ||
            String(property.type || "").toLowerCase() === type.toLowerCase();

        return (
            matchesPurpose &&
            matchesLocation &&
            matchesType &&
            matchesPrice(property, price)
        );
    });

    render(filtered);
}

function readURLFilters() {
    const params = new URLSearchParams(window.location.search);

    const purpose = params.get("purpose");
    const location = params.get("location");
    const type = params.get("type");
    const price = params.get("price");

    if (purposeFilter) {
        purposeFilter.value = normalizePurpose(purpose);
    }

    if (locationFilter) {
        locationFilter.value = normalizeLocation(location);
    }

    if (typeFilter) {
        typeFilter.value = normalizeType(type);
    }

    if (priceFilter && price) {
        priceFilter.value = price;
    }

    filterProperties();
}

if (purposeFilter) purposeFilter.addEventListener("change", filterProperties);
if (locationFilter) locationFilter.addEventListener("change", filterProperties);
if (typeFilter) typeFilter.addEventListener("change", filterProperties);
if (priceFilter) priceFilter.addEventListener("change", filterProperties);

if (clearFilters) {
    clearFilters.addEventListener("click", () => {
        if (purposeFilter) purposeFilter.value = "";
        if (locationFilter) locationFilter.value = "";
        if (typeFilter) typeFilter.value = "";
        if (priceFilter) priceFilter.value = "";
        render(getProperties());
    });
}

function handleNavbar() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", handleNavbar, { passive: true });
handleNavbar();

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
        const open = mobileMenu.classList.toggle("open");
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mobileMenu?.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        menuToggle?.classList.remove("active");
        menuToggle?.setAttribute("aria-expanded", "false");
    }
});

readURLFilters();
