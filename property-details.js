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
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90",
        status: "available",
        description: "A refined modern villa designed for comfortable family living, combining generous spaces, contemporary architecture and a premium location in New Cairo."
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
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=90",
        status: "available",
        description: "A sophisticated apartment with a clean contemporary design, spacious interiors and easy access to New Cairo's key destinations."
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
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=90",
        status: "available",
        description: "An elegant garden home offering generous living spaces, a calm residential atmosphere and a premium Sheikh Zayed location."
    }
];

const ESTORA_PROPERTIES_KEY = "estoraAdminProperties";
const container = document.getElementById("propertyDetails");
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

        if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {
        console.warn("Could not read ESTORA properties:", error);
    }

    return DEFAULT_PROPERTIES;
}

function getPropertyImages(property) {
    const images = Array.isArray(property.images)
        ? property.images.filter(Boolean)
        : [];

    if (!images.length && property.image) {
        images.push(property.image);
    }

    return images;
}

function money(property) {
    const formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0
    }).format(Number(property.price) || 0);

    return `${escapeHTML(property.currency || "$")}${formatted}${
        String(property.purpose).toLowerCase() === "rent" ? " / month" : ""
    }`;
}

const params = new URLSearchParams(window.location.search);
const rawId = params.get("id");
const property = getProperties().find(item => String(item.id) === String(rawId));

if (!container) {
    console.error("ESTORA: #propertyDetails was not found.");
} else if (!rawId || !property) {
    container.innerHTML = `
        <div class="details-error">
            <h1>Property Not Found</h1>
            <p style="color:#888;margin-top:12px;">
                The property you're looking for is not available.
            </p>
            <a href="properties.html" class="primary-button" style="margin-top:30px;">
                Back to Properties
            </a>
        </div>
    `;
} else {
    const images = getPropertyImages(property);

    const fallbackImages = [
        property.image,
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=85"
    ].filter(Boolean);

    while (images.length < 3 && fallbackImages[images.length]) {
        images.push(fallbackImages[images.length]);
    }

    const status = String(property.status || "available").toLowerCase();
    const isSold = status === "sold";

    container.innerHTML = `
        <a href="properties.html" class="details-back">
            <i class="fa-solid fa-arrow-left"></i>
            Back to properties
        </a>

        <div class="details-gallery">
            <div class="details-main-image">
                <img
                    src="${escapeHTML(images[0] || "")}"
                    alt="${escapeHTML(property.title)}"
                >
            </div>

            <div class="details-side">
                ${
                    images[1]
                        ? `<div class="details-side-image">
                               <img src="${escapeHTML(images[1])}" alt="${escapeHTML(property.title)}">
                           </div>`
                        : ""
                }

                ${
                    images[2]
                        ? `<div class="details-side-image">
                               <img src="${escapeHTML(images[2])}" alt="${escapeHTML(property.title)}">
                           </div>`
                        : ""
                }
            </div>
        </div>

        <div class="details-content">
            <div>
                <div class="details-type">
                    ${escapeHTML(String(property.type || "").toUpperCase())}
                    ·
                    ${escapeHTML(String(property.purpose || "").toUpperCase())}
                </div>

                <h1 class="details-title">${escapeHTML(property.title)}</h1>

                <div class="details-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${escapeHTML(property.location)}
                </div>

                <p class="details-description">
                    ${escapeHTML(
                        property.description ||
                        "Contact ESTORA for full property information and availability."
                    )}
                </p>

                <div class="details-features">
                    <div class="details-feature">
                        <i class="fa-solid fa-ruler-combined"></i>
                        <strong>${Number(property.area) || 0} m²</strong>
                        <span>Area</span>
                    </div>

                    <div class="details-feature">
                        <i class="fa-solid fa-bed"></i>
                        <strong>${Number(property.bedrooms) || 0}</strong>
                        <span>Bedrooms</span>
                    </div>

                    <div class="details-feature">
                        <i class="fa-solid fa-bath"></i>
                        <strong>${Number(property.bathrooms) || 0}</strong>
                        <span>Bathrooms</span>
                    </div>
                </div>
            </div>

            <aside class="details-card">
                <div class="details-price-label">Property Price</div>
                <div class="details-price">${money(property)}</div>

                <a
                    href="tel:+201000000000"
                    class="details-contact"
                    ${isSold ? 'aria-disabled="true"' : ""}
                >
                    <i class="fa-solid fa-phone"></i>
                    ${isSold ? "Contact About Property" : "Contact Agent"}
                </a>

                <a
                    href="mailto:hello@estora.com?subject=${encodeURIComponent(
                        `Property Inquiry - ${property.title}`
                    )}"
                    class="details-back-properties"
                >
                    <i class="fa-regular fa-envelope"></i>
                    Send Inquiry
                </a>

                <div class="details-status" style="${
                    isSold ? "color:#d98b8b;" : ""
                }">
                    <i class="fa-solid ${
                        isSold ? "fa-circle-xmark" : "fa-circle-check"
                    }"></i>
                    ${isSold ? "Sold Out" : "Available"}
                </div>
            </aside>
        </div>
    `;
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