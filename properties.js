"use strict";

/* =========================================================
   ESTORA — PROPERTIES PAGE
   Responsible ONLY for displaying properties
========================================================= */

const ESTORA_CLIENT_PROPERTIES_KEY =
    "estoraAdminProperties";


/* =========================================================
   ELEMENTS
========================================================= */

const estoraPropertiesGrid =
    document.getElementById("propertiesGrid");

const estoraPropertiesEmpty =
    document.getElementById("propertiesEmpty");


/* =========================================================
   ESCAPE HTML
========================================================= */

function propertiesEscapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GET ADMIN PROPERTIES
========================================================= */

function getClientProperties() {

    try {

        const saved =
            localStorage.getItem(
                ESTORA_CLIENT_PROPERTIES_KEY
            );


        if (!saved) {

            return [];

        }


        const data =
            JSON.parse(saved);


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "ESTORA: Could not load properties",
            error
        );

        return [];

    }

}


/* =========================================================
   FORMAT EGP
========================================================= */

function propertiesFormatEGP(price) {

    return new Intl.NumberFormat(
        "en-EG",
        {
            maximumFractionDigits: 0
        }
    ).format(
        Number(price) || 0
    );

}


/* =========================================================
   CREATE PROPERTY CARD
========================================================= */

function createClientPropertyCard(
    property
) {

    const isSold =
        String(property.status)
            .toLowerCase() ===
        "sold";


    const images =
        Array.isArray(property.images)
            ? property.images
            : [];


    const mainImage =
        images.length
            ? images[0]
            : property.image || "";


    const card =
        document.createElement("article");


    card.className =
        `property-card ${
            isSold
                ? "property-sold"
                : ""
        }`;


    card.dataset.propertyId =
        property.id;


    const imageHTML =
        mainImage

            ? `
                <img
                    src="${propertiesEscapeHTML(mainImage)}"
                    alt="${propertiesEscapeHTML(
                        property.title ||
                        "Property"
                    )}"
                    loading="lazy"
                >
            `

            : `
                <div class="property-no-image">

                    <i class="fa-solid fa-building"></i>

                </div>
            `;


    card.innerHTML = `

        <div class="property-image">

            ${imageHTML}


            ${
                property.badge
                    ? `
                        <span class="property-badge">
                            ${propertiesEscapeHTML(
                                property.badge
                            )}
                        </span>
                    `
                    : ""
            }


            ${
                isSold
                    ? `
                        <div class="sold-overlay">

                            <span>
                                SOLD OUT
                            </span>

                        </div>
                    `
                    : ""
            }

        </div>


        <div class="property-content">

            <div class="property-top">

                <span class="property-type">

                    ${propertiesEscapeHTML(
                        property.type ||
                        "Property"
                    )}

                </span>


                <span class="property-purpose">

                    ${propertiesEscapeHTML(
                        property.purpose ||
                        "Sale"
                    )}

                </span>

            </div>


            <h3 class="property-title">

                ${propertiesEscapeHTML(
                    property.title ||
                    "Luxury Property"
                )}

            </h3>


            <div class="property-location">

                <i class="fa-solid fa-location-dot"></i>

                <span>

                    ${propertiesEscapeHTML(
                        property.location ||
                        "Egypt"
                    )}

                </span>

            </div>


            <div class="property-features">

                ${
                    property.area
                        ? `
                            <span>

                                <i class="fa-solid fa-ruler-combined"></i>

                                ${propertiesEscapeHTML(
                                    property.area
                                )}
                                m²

                            </span>
                        `
                        : ""
                }


                ${
                    property.bedrooms
                        ? `
                            <span>

                                <i class="fa-solid fa-bed"></i>

                                ${propertiesEscapeHTML(
                                    property.bedrooms
                                )}

                            </span>
                        `
                        : ""
                }


                ${
                    property.bathrooms
                        ? `
                            <span>

                                <i class="fa-solid fa-bath"></i>

                                ${propertiesEscapeHTML(
                                    property.bathrooms
                                )}

                            </span>
                        `
                        : ""
                }

            </div>


            <div class="property-bottom">

                <div class="property-price">

                    <small>
                        PRICE
                    </small>

                    <strong>

                        EGP
                        ${propertiesFormatEGP(
                            property.price
                        )}

                    </strong>

                </div>


                ${
                    isSold

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
                                data-property-id="${propertiesEscapeHTML(
                                    property.id
                                )}"
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
   RENDER PROPERTIES
========================================================= */

function renderClientProperties() {

    if (!estoraPropertiesGrid) {
        return;
    }


    const properties =
        getClientProperties();


    estoraPropertiesGrid.innerHTML =
        "";


    if (!properties.length) {

        if (estoraPropertiesEmpty) {

            estoraPropertiesEmpty.hidden =
                false;

        }

        return;

    }


    if (estoraPropertiesEmpty) {

        estoraPropertiesEmpty.hidden =
            true;

    }


    properties.forEach(property => {

        estoraPropertiesGrid.appendChild(
            createClientPropertyCard(
                property
            )
        );

    });

}


/* =========================================================
   OPEN PROPERTY DETAILS
========================================================= */

function openClientPropertyDetails(
    id
) {

    if (!id) {
        return;
    }


    const properties =
        getClientProperties();


    const property =
        properties.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!property) {

        alert(
            "This property is no longer available."
        );


        renderClientProperties();

        return;

    }


    sessionStorage.setItem(
        "estoraSelectedProperty",
        String(property.id)
    );


    window.location.href =
        `property-details.html?id=${encodeURIComponent(
            property.id
        )}`;

}


/* =========================================================
   BUTTON CLICK
========================================================= */

if (estoraPropertiesGrid) {

    estoraPropertiesGrid.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".property-view-button"
                );


            if (!button) {
                return;
            }


            if (button.disabled) {
                return;
            }


            const id =
                button.dataset.propertyId;


            openClientPropertyDetails(
                id
            );

        }
    );

}


/* =========================================================
   LIVE UPDATE
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            ESTORA_CLIENT_PROPERTIES_KEY
        ) {

            renderClientProperties();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        renderClientProperties
    );

} else {

    renderClientProperties();

}


console.log(
    "ESTORA — Properties JavaScript initialized."
);