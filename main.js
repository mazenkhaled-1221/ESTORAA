"use strict";

/* =========================================================
   ESTORA — MAIN JS
========================================================= */

const PROPERTIES_KEY = "estoraAdminProperties";
const FAVORITES_KEY = "estoraFavorites";

/* =========================================================
   DEFAULT PROPERTIES
========================================================= */

const defaultProperties = [
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
        currency: "EGP",
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
        currency: "EGP",
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
        currency: "EGP",
        badge: "EXCLUSIVE",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
        status: "available"
    }
];

/* =========================================================
   DOM
========================================================= */

const pageLoader = document.getElementById("pageLoader");
const navbar = document.getElementById("navbar");

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

const backToTop = document.getElementById("backToTop");

const featuredProperties =
    document.getElementById("featuredProperties");

const propertiesGrid =
    document.getElementById("propertiesGrid");

const favoritesButton =
    document.getElementById("favoritesButton");

const favoritesCount =
    document.getElementById("favoritesCount");

const propertySearch =
    document.getElementById("propertySearch");

const newsletterForm =
    document.getElementById("newsletterForm");

const subscriberPhone =
    document.getElementById("subscriberPhone");

const newsletterMessage =
    document.getElementById("newsletterMessage");

/* =========================================================
   LOADER
========================================================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        pageLoader?.classList.add("hidden");

    }, 1000);

});

/* =========================================================
   NAVBAR
========================================================= */

function handleNavbar() {

    navbar?.classList.toggle(
        "scrolled",
        window.scrollY > 40
    );

}

window.addEventListener(
    "scroll",
    handleNavbar,
    { passive: true }
);

handleNavbar();

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* =========================================================
   GET PROPERTIES
========================================================= */

function getProperties() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(PROPERTIES_KEY) || "[]"
            );

        if (Array.isArray(saved) && saved.length > 0) {

            return saved;

        }

    } catch (error) {

        console.error(
            "ESTORA: Failed to read properties",
            error
        );

    }

    return defaultProperties;

}

/* =========================================================
   PRICE
========================================================= */

function formatEGP(price) {

    return (
        new Intl.NumberFormat("en-EG", {
            maximumFractionDigits: 0
        }).format(Number(price) || 0)
        + " EGP"
    );

}

/* =========================================================
   CREATE PROPERTY CARD
========================================================= */

function createPropertyCard(property) {

    const sold =
        String(property.status || "").toLowerCase() === "sold";

    const image =
        property.images?.[0] ||
        property.image ||
        "";

    const price =
        String(property.purpose || "").toLowerCase() === "rent"
            ? `${formatEGP(property.price)} / month`
            : formatEGP(property.price);

    const card =
        document.createElement("article");

    card.className =
        `property-card ${sold ? "is-sold" : ""}`;

    card.dataset.id =
        property.id;

    card.innerHTML = `

        <div class="property-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(property.title)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div class="property-no-image">
                            <i class="fa-solid fa-building"></i>
                        </div>
                    `
            }

            <div class="property-overlay"></div>

            <div class="property-top">

                ${
                    property.badge
                        ? `
                            <span class="property-badge">
                                ${escapeHTML(property.badge)}
                            </span>
                        `
                        : `
                            <span></span>
                        `
                }

                <button
                    type="button"
                    class="property-favorite"
                    data-favorite-id="${escapeHTML(property.id)}"
                    aria-label="Add to favorites"
                >
                    <i class="fa-regular fa-heart"></i>
                </button>

            </div>

            ${
                sold
                    ? `
                        <div class="sold-overlay">
                            <span>SOLD OUT</span>
                        </div>
                    `
                    : ""
            }

        </div>

        <div class="property-info">

            <div class="property-type">

                ${escapeHTML(
                    String(property.type || "Property").toUpperCase()
                )}

                <span>·</span>

                ${escapeHTML(
                    String(property.purpose || "Sale").toUpperCase()
                )}

            </div>

            <h3>
                ${escapeHTML(
                    property.title || "Luxury Property"
                )}
            </h3>

            <p class="property-location">

                <i class="fa-solid fa-location-dot"></i>

                ${escapeHTML(
                    property.location || "Egypt"
                )}

            </p>

            <div class="property-details">

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

            <div class="property-bottom">

                <strong class="property-price">
                    ${price}
                </strong>

                ${
                    sold
                        ? `
                            <button
                                type="button"
                                class="property-view-button sold-button"
                                disabled
                            >
                                SOLD OUT
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="property-view-button"
                                data-property-id="${escapeHTML(property.id)}"
                            >
                                VIEW PROPERTY
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        `
                }

            </div>

        </div>
    `;

    return card;

}

/* =========================================================
   RENDER FEATURED
========================================================= */

function renderFeatured() {

    if (!featuredProperties) return;

    featuredProperties.innerHTML = "";

    const list =
        getProperties()
            .filter(property => {
                return String(property.status).toLowerCase() !== "sold";
            })
            .slice(0, 3);

    if (!list.length) {

        featuredProperties.innerHTML = `
            <div class="properties-empty">
                <i class="fa-regular fa-building"></i>
                <h3>No featured properties available.</h3>
            </div>
        `;

        return;

    }

    list.forEach(property => {

        featuredProperties.appendChild(
            createPropertyCard(property)
        );

    });

    setupFavoriteButtons();

}

/* =========================================================
   RENDER ALL PROPERTIES
========================================================= */

function renderAllProperties() {

    if (!propertiesGrid) return;

    propertiesGrid.innerHTML = "";

    const list =
        getProperties();

    if (!list.length) {

        propertiesGrid.innerHTML = `
            <div class="properties-empty">
                <i class="fa-regular fa-building"></i>
                <h3>New properties coming soon.</h3>
            </div>
        `;

        return;

    }

    list.forEach(property => {

        propertiesGrid.appendChild(
            createPropertyCard(property)
        );

    });

    setupFavoriteButtons();

}

/* =========================================================
   FAVORITES
========================================================= */

let favorites = [];

try {

    const saved =
        JSON.parse(
            localStorage.getItem(FAVORITES_KEY) || "[]"
        );

    if (Array.isArray(saved)) {

        favorites =
            saved
                .map(String)
                .filter(Boolean);

    }

} catch {

    favorites = [];

}

function saveFavorites() {

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );

}

/* =========================================================
   PRUNE INVALID FAVORITES
   Removes favorite IDs that no longer match an
   existing property, so the badge count and the
   panel list always stay in sync.
========================================================= */

function pruneInvalidFavorites() {

    const validIds =
        getProperties()
            .map(property =>
                String(property.id)
            );

    const before =
        favorites.length;

    favorites =
        favorites.filter(id =>
            validIds.includes(
                String(id)
            )
        );

    if (favorites.length !== before) {

        saveFavorites();

    }

}

pruneInvalidFavorites();

function updateFavoritesCount() {

    if (favoritesCount) {

        favoritesCount.textContent =
            favorites.length;

    }

}

function updateFavoriteButton(
    button,
    propertyId
) {

    const icon =
        button.querySelector("i");

    if (!icon) return;

    const active =
        favorites.includes(String(propertyId));

    icon.classList.toggle(
        "fa-solid",
        active
    );

    icon.classList.toggle(
        "fa-regular",
        !active
    );

    button.classList.toggle(
        "active",
        active
    );

}

/* =========================================================
   FAVORITE BUTTONS
========================================================= */

function setupFavoriteButtons() {

    document
        .querySelectorAll(".property-favorite")
        .forEach(button => {

            if (
                button.dataset.ready === "true"
            ) return;

            button.dataset.ready = "true";

            const id =
                String(
                    button.dataset.favoriteId
                );

            updateFavoriteButton(
                button,
                id
            );

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    const index =
                        favorites.indexOf(id);

                    if (index === -1) {

                        favorites.push(id);

                    } else {

                        favorites.splice(
                            index,
                            1
                        );

                    }

                    saveFavorites();

                    updateFavoritesCount();

                    document
                        .querySelectorAll(
                            ".property-favorite"
                        )
                        .forEach(
                            favoriteButton => {

                                updateFavoriteButton(
                                    favoriteButton,
                                    String(
                                        favoriteButton.dataset.favoriteId
                                    )
                                );

                            }
                        );

                    renderFavoritesPanel();

                }
            );

        });

}

updateFavoritesCount();

/* =========================================================
   FAVORITES PANEL
========================================================= */

function createFavoritesPanel() {

    if (
        !favoritesButton ||
        document.getElementById(
            "favoritesPanel"
        )
    ) return;

    const panel =
        document.createElement("div");

    panel.id =
        "favoritesPanel";

    panel.className =
        "favorites-panel";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    panel.innerHTML = `

        <div class="favorites-panel-header">

            <div>

                <span>ESTORA</span>

                <h3>
                    Favorite Properties
                </h3>

            </div>

            <button
                type="button"
                class="favorites-close"
                aria-label="Close favorites"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>

        <div
            class="favorites-list"
            id="favoritesList"
        ></div>

    `;

    document.body.appendChild(panel);

    panel
        .querySelector(".favorites-close")
        ?.addEventListener(
            "click",
            closeFavoritesPanel
        );

}

/* =========================================================
   RENDER FAVORITES
========================================================= */

function renderFavoritesPanel() {

    createFavoritesPanel();

    pruneInvalidFavorites();
    updateFavoritesCount();

    const list =
        document.getElementById(
            "favoritesList"
        );

    if (!list) return;

    const all =
        getProperties();

    const favoriteProperties =
        favorites
            .map(id =>
                all.find(
                    property =>
                        String(property.id) ===
                        String(id)
                )
            )
            .filter(Boolean);

    if (!favoriteProperties.length) {

        list.innerHTML = `

            <div class="favorites-empty">

                <i class="fa-regular fa-heart"></i>

                <h4>
                    No favorites yet
                </h4>

                <p>
                    Tap the heart on any property
                    to save it here.
                </p>

            </div>

        `;

        return;

    }

    list.innerHTML =
        favoriteProperties
            .map(property => {

                const image =
                    property.images?.[0] ||
                    property.image ||
                    "";

                return `

                    <article class="favorite-item">

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(property.title)}"
                                    >
                                `
                                : `
                                    <div class="favorite-no-image">
                                        <i class="fa-solid fa-building"></i>
                                    </div>
                                `
                        }

                        <div class="favorite-item-info">

                            <h4>
                                ${escapeHTML(property.title)}
                            </h4>

                            <span>
                                ${escapeHTML(property.location)}
                            </span>

                            <strong>
                                ${formatEGP(property.price)}
                            </strong>

                        </div>

                        <button
                            type="button"
                            class="favorite-remove"
                            data-remove-favorite="${escapeHTML(property.id)}"
                        >
                            <i class="fa-solid fa-heart"></i>
                        </button>

                    </article>

                `;

            })
            .join("");

    list
        .querySelectorAll(
            "[data-remove-favorite]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        String(
                            button.dataset.removeFavorite
                        );

                    favorites =
                        favorites.filter(
                            favoriteId =>
                                favoriteId !== id
                        );

                    saveFavorites();

                    updateFavoritesCount();

                    setupFavoriteButtons();

                    renderFavoritesPanel();

                }
            );

        });

}

/* =========================================================
   OPEN / CLOSE FAVORITES
========================================================= */

function openFavoritesPanel() {

    createFavoritesPanel();

    renderFavoritesPanel();

    const panel =
        document.getElementById(
            "favoritesPanel"
        );

    panel?.classList.add("open");

    panel?.setAttribute(
        "aria-hidden",
        "false"
    );

}

function closeFavoritesPanel() {

    const panel =
        document.getElementById(
            "favoritesPanel"
        );

    panel?.classList.remove("open");

    panel?.setAttribute(
        "aria-hidden",
        "true"
    );

}

favoritesButton?.addEventListener(
    "click",
    event => {

        event.preventDefault();
        event.stopPropagation();

        const panel =
            document.getElementById(
                "favoritesPanel"
            );

        if (
            panel?.classList.contains("open")
        ) {

            closeFavoritesPanel();

        } else {

            openFavoritesPanel();

        }

    }
);

/* =========================================================
   PROPERTY VIEW
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".property-view-button"
            );

        if (!button) return;

        if (button.disabled) return;

        const id =
            button.dataset.propertyId;

        if (!id) return;

        sessionStorage.setItem(
            "estoraSelectedProperty",
            id
        );

        window.location.href =
            `property-details.html?id=${encodeURIComponent(id)}`;

    }
);

/* =========================================================
   SEARCH
========================================================= */

propertySearch?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const purpose =
            document.getElementById(
                "searchPurpose"
            )?.value || "";

        const location =
            document.getElementById(
                "searchLocation"
            )?.value || "";

        const type =
            document.getElementById(
                "searchType"
            )?.value || "";

        const price =
            document.getElementById(
                "searchPrice"
            )?.value || "";

        const params =
            new URLSearchParams();

        if (purpose)
            params.set(
                "purpose",
                purpose
            );

        if (location)
            params.set(
                "location",
                location
            );

        if (type)
            params.set(
                "type",
                type
            );

        if (price)
            params.set(
                "price",
                price
            );

        const query =
            params.toString();

        window.location.href =
            `properties.html${
                query ? `?${query}` : ""
            }`;

    }
);

/* =========================================================
   MOBILE MENU
========================================================= */

menuToggle?.addEventListener(
    "click",
    () => {

        const open =
            mobileMenu?.classList.toggle(
                "open"
            );

        menuToggle.classList.toggle(
            "active",
            open
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(open)
        );

    }
);

mobileMenu
    ?.querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mobileMenu.classList.remove(
                    "open"
                );

                menuToggle?.classList.remove(
                    "active"
                );

            }
        );

    });

/* =========================================================
   BACK TO TOP
========================================================= */

function handleBackToTop() {

    backToTop?.classList.toggle(
        "show",
        window.scrollY > 500
    );

}

window.addEventListener(
    "scroll",
    handleBackToTop,
    { passive: true }
);

backToTop?.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

/* =========================================================
   COUNTERS
========================================================= */

let countersStarted = false;

function animateCounters() {

    if (countersStarted) return;

    const counters =
        document.querySelectorAll(
            ".stat strong[data-count]"
        );

    if (!counters.length) return;

    const section =
        document.querySelector(
            ".stats"
        );

    if (!section) return;

    const rect =
        section.getBoundingClientRect();

    if (
        rect.top >
        window.innerHeight * .8
    ) return;

    countersStarted = true;

    counters.forEach(counter => {

        const target =
            Number(
                counter.dataset.count
            ) || 0;

        const start =
            performance.now();

        function update(time) {

            const progress =
                Math.min(
                    (time - start) / 1800,
                    1
                );

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );

            counter.textContent =
                Math.floor(
                    target * eased
                ).toLocaleString();

            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            }

        }

        requestAnimationFrame(update);

    });

}

window.addEventListener(
    "scroll",
    animateCounters,
    { passive: true }
);

animateCounters();

/* =========================================================
   NEWSLETTER
========================================================= */

function showNewsletterMessage(
    message,
    type
) {

    if (!newsletterMessage) return;

    newsletterMessage.textContent =
        message;

    newsletterMessage.className =
        `newsletter-message ${type}`;

}

newsletterForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!subscriberPhone) return;

        const phone =
            subscriberPhone.value
                .trim();

        if (!phone) {

            showNewsletterMessage(
                "Please enter your WhatsApp number.",
                "error"
            );

            return;

        }

        const pattern =
            /^\+[1-9]\d{7,14}$/;

        if (!pattern.test(phone)) {

            showNewsletterMessage(
                "Please enter a valid number in international format, e.g. +201001234567.",
                "error"
            );

            return;

        }

        const consent =
            document.getElementById(
                "newsletterConsent"
            );

        if (
            consent &&
            !consent.checked
        ) {

            showNewsletterMessage(
                "Please confirm that you agree to receive notifications.",
                "error"
            );

            return;

        }

        const submitButton =
            newsletterForm.querySelector(
                "button[type='submit']"
            );

        if (submitButton) {

            submitButton.disabled = true;

        }

        try {

            const response =
                await fetch(
                    "/api/subscribe",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ phone })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                showNewsletterMessage(
                    data?.error ||
                        "Could not subscribe. Please try again.",
                    "error"
                );

                return;

            }

            newsletterForm.reset();

            showNewsletterMessage(

                data?.alreadySubscribed

                    ? "You are already subscribed."

                    : "Successfully subscribed. Thank you!",

                data?.alreadySubscribed
                    ? "error"
                    : "success"

            );

        } catch (error) {

            console.error(
                "ESTORA: Subscribe request failed",
                error
            );

            showNewsletterMessage(
                "Could not subscribe. Please check your connection and try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

            }

        }

    }
);

/* =========================================================
   STORAGE UPDATE
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === PROPERTIES_KEY
        ) {

            renderFeatured();
            renderAllProperties();

            pruneInvalidFavorites();
            updateFavoritesCount();
            renderFavoritesPanel();

        }

    }
);

/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape")
            return;

        closeFavoritesPanel();

        mobileMenu?.classList.remove(
            "open"
        );

        menuToggle?.classList.remove(
            "active"
        );

    }
);

/* =========================================================
   INIT
========================================================= */

function initEstora() {

    renderFeatured();

    renderAllProperties();

    setupFavoriteButtons();

    updateFavoritesCount();

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initEstora
    );

} else {

    initEstora();

}

console.log(
    "ESTORA — Real Estate Platform initialized."
);