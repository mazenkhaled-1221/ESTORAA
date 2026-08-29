/* =========================================================
   ESTORA — ADMIN DASHBOARD
   Property Management System
========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
========================================================= */

const PROPERTIES_KEY = "estoraAdminProperties";


/* =========================================================
   WHATSAPP — NEW UNIT NOTIFICATIONS
   -----------------------------------------------------
   Sends a request to /api/notify-whatsapp (a Vercel
   Serverless Function) which loads every subscriber from
   Supabase and sends them a WhatsApp message via the
   Meta WhatsApp Business API.

   ADMIN_API_SECRET must match the ADMIN_API_SECRET
   environment variable set on the backend
   (Vercel → Project → Settings → Environment Variables).
   Pick any random string — it just has to match on both sides.
========================================================= */

const ADMIN_API_SECRET = "YOUR_ADMIN_API_SECRET";


async function notifySubscribersOfNewProperty(
    property
) {

    if (ADMIN_API_SECRET === "YOUR_ADMIN_API_SECRET") {

        console.warn(
            "ESTORA: WhatsApp notifications are not configured yet — " +
            "set ADMIN_API_SECRET at the top of admin.js (and on the server)."
        );

        return;

    }


    const propertyLink =
        `${window.location.origin}/property-details.html?id=${encodeURIComponent(property.id)}`;


    try {

        const response =
            await fetch(
                "/api/notify-whatsapp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-secret": ADMIN_API_SECRET
                    },
                    body: JSON.stringify({
                        property: {
                            title:
                                property.title || "New Property",

                            location:
                                property.location || "",

                            price:
                                formatPrice(
                                    property.price
                                ),

                            type:
                                property.type || "",

                            link:
                                propertyLink
                        }
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "ESTORA: WhatsApp notification request failed",
                data
            );

            return;

        }


        console.log(
            `ESTORA: WhatsApp notifications sent to ${data.sent} subscriber(s)` +
            (data.failed ? `, ${data.failed} failed.` : ".")
        );


    } catch (error) {

        console.error(
            "ESTORA: Could not reach the WhatsApp notification API",
            error
        );

    }

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const propertyFormWrapper =
    document.getElementById("propertyFormWrapper");

const propertyForm =
    document.getElementById("propertyForm");

const openAddProperty =
    document.getElementById("openAddProperty");

const cancelProperty =
    document.getElementById("cancelProperty");

const propertyImages =
    document.getElementById("propertyImages");

const imagePreview =
    document.getElementById("imagePreview");

const adminPropertiesGrid =
    document.getElementById("adminPropertiesGrid");

const formTitle =
    document.getElementById("formTitle");


/* =========================================================
   FORM INPUTS
========================================================= */

const propertyId =
    document.getElementById("propertyId");

const propertyTitle =
    document.getElementById("propertyTitle");

const propertyType =
    document.getElementById("propertyType");

const propertyLocation =
    document.getElementById("propertyLocation");

const propertyPrice =
    document.getElementById("propertyPrice");

const propertyBedrooms =
    document.getElementById("propertyBedrooms");

const propertyBathrooms =
    document.getElementById("propertyBathrooms");

const propertyArea =
    document.getElementById("propertyArea");

const propertyFloor =
    document.getElementById("propertyFloor");

const propertyPurpose =
    document.getElementById("propertyPurpose");

const propertyBadge =
    document.getElementById("propertyBadge");

const propertyDescription =
    document.getElementById("propertyDescription");


/* =========================================================
   STATE
========================================================= */

let properties = [];

let selectedImages = [];

let editingPropertyId = null;


/* =========================================================
   LOAD PROPERTIES
========================================================= */

function loadProperties() {

    try {

        const saved =
            localStorage.getItem(PROPERTIES_KEY);

        properties =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(properties)) {

            properties = [];

        }

    } catch (error) {

        console.error(
            "Could not load properties:",
            error
        );

        properties = [];

    }

}


/* =========================================================
   SAVE PROPERTIES
========================================================= */

function saveProperties() {

    try {

        localStorage.setItem(
            PROPERTIES_KEY,
            JSON.stringify(properties)
        );

        return true;

    } catch (error) {

        console.error(
            "Could not save properties:",
            error
        );

        alert(
            "The images are too large for browser storage. Please use smaller images."
        );

        return false;

    }

}


/* =========================================================
   GENERATE ID
========================================================= */

function generatePropertyId() {

    return (
        "property_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   FORMAT PRICE — EGP
========================================================= */

function formatPrice(price) {

    const number =
        Number(price) || 0;

    return new Intl.NumberFormat(
        "en-US"
    ).format(number);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   OPEN ADD FORM
========================================================= */

function openAddPropertyForm() {

    if (!propertyFormWrapper) return;

    editingPropertyId = null;

    if (formTitle) {

        formTitle.textContent =
            "Add New Unit";

    }

    propertyFormWrapper.hidden = false;

    resetPropertyForm();

    propertyFormWrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   RESET FORM
========================================================= */

function resetPropertyForm() {

    if (propertyForm) {

        propertyForm.reset();

    }

    if (propertyId) {

        propertyId.value = "";

    }

    editingPropertyId = null;

    selectedImages = [];

    if (imagePreview) {

        imagePreview.innerHTML = "";

    }

    if (formTitle) {

        formTitle.textContent =
            "Add New Unit";

    }

}


/* =========================================================
   CLOSE FORM
========================================================= */

function closePropertyForm() {

    if (!propertyFormWrapper) return;

    propertyFormWrapper.hidden = true;

    resetPropertyForm();

}


/* =========================================================
   IMAGE TO DATA URL
========================================================= */

function imageToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    reader.result
                );

            };

            reader.onerror = () => {

                reject(
                    new Error(
                        "Image could not be read."
                    )
                );

            };

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function renderImagePreview() {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    selectedImages.forEach(
        (image, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "preview-image";


            const img =
                document.createElement(
                    "img"
                );

            img.src = image;

            img.alt =
                "Property image";


            wrapper.appendChild(img);


            /*
             * Remove image button
             */

            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.type =
                "button";

            removeButton.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';

            removeButton.style.position =
                "absolute";

            removeButton.style.top =
                "8px";

            removeButton.style.right =
                "8px";

            removeButton.style.width =
                "30px";

            removeButton.style.height =
                "30px";

            removeButton.style.border =
                "none";

            removeButton.style.borderRadius =
                "50%";

            removeButton.style.background =
                "rgba(0,0,0,.75)";

            removeButton.style.color =
                "#fff";

            removeButton.style.cursor =
                "pointer";


            removeButton.addEventListener(
                "click",
                () => {

                    selectedImages.splice(
                        index,
                        1
                    );

                    renderImagePreview();

                }
            );


            wrapper.appendChild(
                removeButton
            );


            imagePreview.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   HANDLE IMAGE UPLOAD
========================================================= */

if (propertyImages) {

    propertyImages.addEventListener(
        "change",
        async function () {

            const files =
                Array.from(
                    this.files || []
                );


            if (!files.length) {

                return;

            }


            const validFiles =
                files.filter(
                    file =>
                        file.type.startsWith(
                            "image/"
                        )
                );


            if (!validFiles.length) {

                alert(
                    "Please select valid image files."
                );

                return;

            }


            try {

                const convertedImages =
                    await Promise.all(
                        validFiles.map(
                            imageToDataURL
                        )
                    );


                selectedImages.push(
                    ...convertedImages
                );


                renderImagePreview();


            } catch (error) {

                console.error(error);

                alert(
                    "Something went wrong while uploading images."
                );

            }


            /*
             * Allow selecting the same image again
             */

            this.value = "";

        }
    );

}


/* =========================================================
   GET FORM DATA
========================================================= */

function getFormData() {

    return {

        title:
            propertyTitle?.value.trim() || "",

        type:
            propertyType?.value || "Villa",

        location:
            propertyLocation?.value.trim() || "",

        price:
            Number(propertyPrice?.value) || 0,

        bedrooms:
            Number(propertyBedrooms?.value) || 0,

        bathrooms:
            Number(propertyBathrooms?.value) || 0,

        area:
            Number(propertyArea?.value) || 0,

        floor:
            propertyFloor?.value.trim() || "",

        purpose:
            propertyPurpose?.value || "Sale",

        badge:
            propertyBadge?.value.trim() || "",

        description:
            propertyDescription?.value.trim() || "",

        images:
            [...selectedImages]

    };

}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateProperty(data) {

    if (!data.title) {

        alert(
            "Please enter the property name."
        );

        propertyTitle?.focus();

        return false;

    }


    if (!data.location) {

        alert(
            "Please enter the property location."
        );

        propertyLocation?.focus();

        return false;

    }


    if (!data.price || data.price <= 0) {

        alert(
            "Please enter a valid price in EGP."
        );

        propertyPrice?.focus();

        return false;

    }


    return true;

}


/* =========================================================
   ADD / EDIT PROPERTY
========================================================= */

if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const data =
                getFormData();


            if (!validateProperty(data)) {

                return;

            }


            const isNewProperty =
                !editingPropertyId;


            /*
             * EDIT EXISTING PROPERTY
             */

            if (editingPropertyId) {

                const index =
                    properties.findIndex(
                        property =>
                            property.id ===
                            editingPropertyId
                    );


                if (index !== -1) {

                    const oldProperty =
                        properties[index];


                    properties[index] = {

                        ...oldProperty,

                        ...data,

                        id:
                            oldProperty.id,

                        status:
                            oldProperty.status ||
                            "available",

                        updatedAt:
                            new Date().toISOString()

                    };

                }


            }


            /*
             * ADD NEW PROPERTY
             */

            else {

                const newProperty = {

                    id:
                        generatePropertyId(),

                    ...data,

                    status:
                        "available",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()

                };


                properties.unshift(
                    newProperty
                );

            }


            /*
             * SAVE
             */

            const saved =
                saveProperties();


            if (!saved) {

                return;

            }


            /*
             * Refresh
             */

            renderProperties();

            updateStatistics();

            closePropertyForm();


            if (isNewProperty) {

                notifySubscribersOfNewProperty(
                    properties[0]
                );

            }


            alert(
                isNewProperty
                    ? "New unit added successfully."
                    : "Property updated successfully."
            );

        }
    );

}


/* =========================================================
   RENDER PROPERTIES
========================================================= */

function renderProperties() {

    if (!adminPropertiesGrid) return;


    if (!properties.length) {

        adminPropertiesGrid.innerHTML = `

            <div class="empty-subscribers"
                 style="grid-column:1/-1; background:#fff;">

                <i class="fa-solid fa-building"></i>

                <p>
                    No properties added yet.
                </p>

            </div>

        `;

        return;

    }


    adminPropertiesGrid.innerHTML =
        properties
            .map(
                property =>
                    createPropertyCard(
                        property
                    )
            )
            .join("");

}


/* =========================================================
   PROPERTY CARD
========================================================= */

function createPropertyCard(property) {

    const image =
        property.images &&
        property.images.length
            ? property.images[0]
            : "";


    const isSold =
        property.status === "sold";


    const imageHTML =
        image

            ? `
                <img
                    src="${image}"
                    alt="${escapeHTML(property.title)}"
                    loading="lazy"
                >
              `

            : `
                <div style="
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#aaa;
                    font-size:35px;
                ">
                    <i class="fa-solid fa-building"></i>
                </div>
              `;


    return `

        <article
            class="admin-property-card"
            data-id="${escapeHTML(property.id)}"
        >

            <div class="admin-property-image">

                ${imageHTML}


                <div
                    class="admin-status ${isSold ? "sold" : ""}"
                >

                    ${
                        isSold
                            ? "SOLD OUT"
                            : "AVAILABLE"
                    }

                </div>

            </div>


            <div class="admin-property-info">

                <h3>
                    ${escapeHTML(property.title)}
                </h3>


                <div class="admin-property-location">

                    <i class="fa-solid fa-location-dot"></i>

                    ${escapeHTML(property.location)}

                </div>


                <div class="admin-property-price">

                    EGP ${formatPrice(property.price)}

                </div>


                <div
                    class="admin-property-actions"
                >

                    <button
                        type="button"
                        class="edit-property"
                        data-action="edit"
                        data-id="${escapeHTML(property.id)}"
                    >

                        <i class="fa-solid fa-pen"></i>

                        EDIT

                    </button>


                    <button
                        type="button"
                        class="sold-property"
                        data-action="sold"
                        data-id="${escapeHTML(property.id)}"
                    >

                        <i class="fa-solid fa-check"></i>

                        ${
                            isSold
                                ? "AVAILABLE"
                                : "SOLD OUT"
                        }

                    </button>


                    <button
                        type="button"
                        class="delete-property"
                        data-action="delete"
                        data-id="${escapeHTML(property.id)}"
                    >

                        <i class="fa-solid fa-trash"></i>

                        DELETE

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   PROPERTY ACTIONS
========================================================= */

if (adminPropertiesGrid) {

    adminPropertiesGrid.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) return;


            const id =
                button.dataset.id;

            const action =
                button.dataset.action;


            if (!id) return;


            if (action === "edit") {

                editProperty(id);

            }


            if (action === "sold") {

                toggleSoldStatus(id);

            }


            if (action === "delete") {

                deleteProperty(id);

            }

        }
    );

}


/* =========================================================
   EDIT PROPERTY
========================================================= */

function editProperty(id) {

    const property =
        properties.find(
            item =>
                item.id === id
        );


    if (!property) {

        alert(
            "Property not found."
        );

        return;

    }


    editingPropertyId =
        property.id;


    if (formTitle) {

        formTitle.textContent =
            "Edit Unit";

    }


    if (propertyId) {

        propertyId.value =
            property.id;

    }


    if (propertyTitle) {

        propertyTitle.value =
            property.title || "";

    }


    if (propertyType) {

        propertyType.value =
            property.type || "Villa";

    }


    if (propertyLocation) {

        propertyLocation.value =
            property.location || "";

    }


    if (propertyPrice) {

        propertyPrice.value =
            property.price || "";

    }


    if (propertyBedrooms) {

        propertyBedrooms.value =
            property.bedrooms || "";

    }


    if (propertyBathrooms) {

        propertyBathrooms.value =
            property.bathrooms || "";

    }


    if (propertyArea) {

        propertyArea.value =
            property.area || "";

    }


    if (propertyFloor) {

        propertyFloor.value =
            property.floor || "";

    }


    if (propertyPurpose) {

        propertyPurpose.value =
            property.purpose || "Sale";

    }


    if (propertyBadge) {

        propertyBadge.value =
            property.badge || "";

    }


    if (propertyDescription) {

        propertyDescription.value =
            property.description || "";

    }


    selectedImages =
        Array.isArray(property.images)
            ? [...property.images]
            : [];


    renderImagePreview();


    if (propertyFormWrapper) {

        propertyFormWrapper.hidden =
            false;

        propertyFormWrapper.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   TOGGLE SOLD OUT
========================================================= */

function toggleSoldStatus(id) {

    const property =
        properties.find(
            item =>
                item.id === id
        );


    if (!property) return;


    const willBeSold =
        property.status !== "sold";


    if (willBeSold) {

        const confirmed =
            confirm(
                `Mark "${property.title}" as SOLD OUT?`
            );


        if (!confirmed) {

            return;

        }

    }


    property.status =
        willBeSold
            ? "sold"
            : "available";


    property.updatedAt =
        new Date().toISOString();


    saveProperties();

    renderProperties();

    updateStatistics();

}


/* =========================================================
   DELETE PROPERTY
========================================================= */

function deleteProperty(id) {

    const property =
        properties.find(
            item =>
                item.id === id
        );


    if (!property) return;


    const confirmed =
        confirm(
            `Delete "${property.title}" permanently?`
        );


    if (!confirmed) {

        return;

    }


    properties =
        properties.filter(
            item =>
                item.id !== id
        );


    saveProperties();

    renderProperties();

    updateStatistics();

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        properties.length;


    const sold =
        properties.filter(
            property =>
                property.status === "sold"
        ).length;


    const available =
        total - sold;


    const totalElement =
        document.getElementById(
            "totalProperties"
        );

    const availableElement =
        document.getElementById(
            "availableProperties"
        );

    const soldElement =
        document.getElementById(
            "soldProperties"
        );

    const subscribersElement =
        document.getElementById(
            "totalSubscribers"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (availableElement) {

        availableElement.textContent =
            available;

    }


    if (soldElement) {

        soldElement.textContent =
            sold;

    }


    if (subscribersElement) {

        fetch("/api/subscribers-count")

            .then(response =>
                response.json()
            )

            .then(data => {

                subscribersElement.textContent =
                    data.count || 0;

            })

            .catch(() => {

                subscribersElement.textContent =
                    "—";

            });

    }

}


/* =========================================================
   ADD PROPERTY BUTTON
========================================================= */

if (openAddProperty) {

    openAddProperty.addEventListener(
        "click",
        openAddPropertyForm
    );

}


/* =========================================================
   CANCEL BUTTON
========================================================= */

if (cancelProperty) {

    cancelProperty.addEventListener(
        "click",
        closePropertyForm
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            propertyFormWrapper &&
            !propertyFormWrapper.hidden
        ) {

            closePropertyForm();

        }

    }
);


/* =========================================================
   STORAGE EVENT
   Updates dashboard if another tab changes data
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            PROPERTIES_KEY
        ) {

            loadProperties();

            renderProperties();

            updateStatistics();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeAdmin() {

    loadProperties();

    renderProperties();

    updateStatistics();

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAdmin
    );

} else {

    initializeAdmin();

}