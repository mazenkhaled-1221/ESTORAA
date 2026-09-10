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

const propertyLat =
    document.getElementById("propertyLat");

const propertyLng =
    document.getElementById("propertyLng");

const propertyMapElement =
    document.getElementById("propertyMap");

const mapCoordinates =
    document.getElementById("mapCoordinates");

const mapSearchInput =
    document.getElementById("mapSearch");

const mapSearchButton =
    document.getElementById("mapSearchButton");

const mapClearButton =
    document.getElementById("mapClearButton");


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


        /*
         * Also send the list to Supabase, so every visitor on
         * every device sees the same units — and so WhatsApp
         * can read them for the link preview.
         */

        pushPropertiesToServer();


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
   SAVE TO THE SERVER
========================================================= */

let serverSaveFailed = false;


async function pushPropertiesToServer() {

    if (!window.estoraPushProperties) return;


    const result =
        await window.estoraPushProperties(properties);


    setServerStatus(result.ok);


    if (!result.ok && !serverSaveFailed) {

        serverSaveFailed = true;

        console.warn(
            "ESTORA: The units were saved on this device only."
        );

    }


    if (result.ok) {

        serverSaveFailed = false;

    }

}


function setServerStatus(online) {

    const badge =
        document.getElementById("serverStatus");


    if (!badge) return;


    badge.className =
        `server-status ${online ? "online" : "offline"}`;


    badge.innerHTML =
        online

            ? '<i class="fa-solid fa-cloud"></i> Saved online — visible to everyone'

            : '<i class="fa-solid fa-triangle-exclamation"></i> This device only — not published yet';

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

    clearMapMarker();

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


                /*
                 * Show them straight away, then swap each one
                 * for its public URL once it is uploaded.
                 */

                const firstIndex =
                    selectedImages.length;


                selectedImages.push(
                    ...convertedImages
                );


                renderImagePreview();


                if (window.estoraUploadImage) {

                    const uploaded =
                        await Promise.all(
                            convertedImages.map(
                                window.estoraUploadImage
                            )
                        );


                    uploaded.forEach((url, offset) => {

                        selectedImages[firstIndex + offset] = url;

                    });


                    renderImagePreview();

                }


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

        lat:
            propertyLat?.value
                ? Number(propertyLat.value)
                : null,

        lng:
            propertyLng?.value
                ? Number(propertyLng.value)
                : null,

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


    setMapMarker(
        property.lat,
        property.lng
    );


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


    /*
     * The subscribers counter is filled in by
     * admin-subscribers.js, which also renders the list.
     */

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

async function initializeAdmin() {

    /* Paint from the cache right away */

    loadProperties();

    renderProperties();

    updateStatistics();


    /* Then pull the published list and paint again */

    if (window.estoraSyncProperties) {

        const changed =
            await window.estoraSyncProperties();


        setServerStatus(
            window.estoraServerOnline === true
        );


        if (changed) {

            loadProperties();

            renderProperties();

            updateStatistics();

        }

    }

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

/* =========================================================
   MAP LOCATION PICKER  (Leaflet + OpenStreetMap)
   ---------------------------------------------------------
   The text field "Location" is untouched — it still holds
   whatever the admin types. The map only adds two extra
   values to the property: lat and lng.
========================================================= */

const MAP_DEFAULT_CENTER = [30.0444, 31.2357];   /* Cairo */

const MAP_DEFAULT_ZOOM = 10;

let propertyMap = null;

let propertyMarker = null;


/* ---------------------------------------------------------
   Show the chosen point under the map
--------------------------------------------------------- */

function updateCoordinatesLabel(lat, lng) {

    if (!mapCoordinates) return;


    if (
        lat === null ||
        lat === undefined ||
        lng === null ||
        lng === undefined
    ) {

        mapCoordinates.textContent =
            "No location selected yet.";

        return;

    }


    mapCoordinates.textContent =
        `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;

}


/* ---------------------------------------------------------
   Store the point in the hidden inputs
--------------------------------------------------------- */

function storeCoordinates(lat, lng) {

    if (propertyLat) {

        propertyLat.value =
            lat === null || lat === undefined
                ? ""
                : lat;

    }


    if (propertyLng) {

        propertyLng.value =
            lng === null || lng === undefined
                ? ""
                : lng;

    }


    updateCoordinatesLabel(lat, lng);

}


/* ---------------------------------------------------------
   Fill the Location text field only when it is still empty
--------------------------------------------------------- */

async function suggestAddress(lat, lng) {

    if (!propertyLocation) return;

    if (propertyLocation.value.trim()) return;


    try {

        const response =
            await fetch(
                "https://nominatim.openstreetmap.org/reverse" +
                `?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=en`
            );


        if (!response.ok) return;


        const data =
            await response.json();


        if (data.display_name) {

            propertyLocation.value =
                data.display_name
                    .split(",")
                    .slice(0, 3)
                    .join(",")
                    .trim();

        }


    } catch (error) {

        console.warn(
            "ESTORA: Reverse geocoding failed.",
            error
        );

    }

}


/* ---------------------------------------------------------
   Place / move the pin
--------------------------------------------------------- */

function setMapMarker(lat, lng, options) {

    const hasPoint =
        Number.isFinite(Number(lat)) &&
        Number.isFinite(Number(lng)) &&
        Number(lat) !== 0 &&
        Number(lng) !== 0;


    if (!hasPoint) {

        clearMapMarker();

        return;

    }


    const point = [
        Number(lat),
        Number(lng)
    ];


    storeCoordinates(point[0], point[1]);


    if (!propertyMap) return;


    if (propertyMarker) {

        propertyMarker.setLatLng(point);

    } else {

        propertyMarker =
            L.marker(point, { draggable: true })
                .addTo(propertyMap);


        propertyMarker.on("dragend", () => {

            const position =
                propertyMarker.getLatLng();

            storeCoordinates(
                position.lat,
                position.lng
            );

        });

    }


    propertyMap.setView(
        point,
        options?.zoom || Math.max(propertyMap.getZoom(), 14)
    );

}


/* ---------------------------------------------------------
   Remove the pin
--------------------------------------------------------- */

function clearMapMarker() {

    if (propertyMarker && propertyMap) {

        propertyMap.removeLayer(propertyMarker);

    }


    propertyMarker = null;

    storeCoordinates(null, null);


    if (propertyMap) {

        propertyMap.setView(
            MAP_DEFAULT_CENTER,
            MAP_DEFAULT_ZOOM
        );

    }

}


/* ---------------------------------------------------------
   Build the map once
--------------------------------------------------------- */

function initPropertyMap() {

    if (
        propertyMap ||
        !propertyMapElement ||
        typeof L === "undefined"
    ) {

        return;

    }


    propertyMap =
        L.map(propertyMapElement)
            .setView(
                MAP_DEFAULT_CENTER,
                MAP_DEFAULT_ZOOM
            );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(propertyMap);


    propertyMap.on("click", event => {

        setMapMarker(
            event.latlng.lat,
            event.latlng.lng
        );

        suggestAddress(
            event.latlng.lat,
            event.latlng.lng
        );

    });

}


/* ---------------------------------------------------------
   Leaflet needs a resize once the form becomes visible
--------------------------------------------------------- */

function refreshMapSize() {

    if (!propertyMap) return;


    setTimeout(
        () => propertyMap.invalidateSize(),
        250
    );

}


if (propertyFormWrapper) {

    new MutationObserver(() => {

        if (!propertyFormWrapper.hidden) {

            initPropertyMap();

            refreshMapSize();


            /*
             * When editing, the coordinates are written into the
             * hidden inputs before the map exists. Draw the pin
             * now that it does.
             */

            if (
                propertyLat?.value &&
                propertyLng?.value &&
                !propertyMarker
            ) {

                setMapMarker(
                    propertyLat.value,
                    propertyLng.value
                );

            }

        }

    }).observe(
        propertyFormWrapper,
        {
            attributes: true,
            attributeFilter: ["hidden"]
        }
    );

}


/* ---------------------------------------------------------
   Search a place by name
--------------------------------------------------------- */

async function searchMapPlace() {

    const query =
        mapSearchInput?.value.trim();


    if (!query) return;


    if (mapSearchButton) {

        mapSearchButton.disabled = true;

    }


    try {

        const response =
            await fetch(
                "https://nominatim.openstreetmap.org/search" +
                `?format=json&limit=1&accept-language=en&q=${
                    encodeURIComponent(query)
                }`
            );


        const results =
            await response.json();


        if (!results.length) {

            alert(
                "That place could not be found. Try a different name, " +
                "or just click the map."
            );

            return;

        }


        setMapMarker(
            results[0].lat,
            results[0].lon,
            { zoom: 15 }
        );


    } catch (error) {

        console.error(
            "ESTORA: Map search failed.",
            error
        );

        alert(
            "The map search is unavailable right now. " +
            "You can still click directly on the map."
        );


    } finally {

        if (mapSearchButton) {

            mapSearchButton.disabled = false;

        }

    }

}


mapSearchButton?.addEventListener(
    "click",
    searchMapPlace
);


mapSearchInput?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchMapPlace();

        }

    }
);


mapClearButton?.addEventListener(
    "click",
    clearMapMarker
);
