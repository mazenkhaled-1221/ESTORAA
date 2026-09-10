"use strict";

/* =========================================================
   ESTORA — PROPERTY DATA LAYER
   ---------------------------------------------------------
   One place that decides where the units come from.

   The pages paint instantly from the local cache, then this
   file fetches the real list from /api/properties and asks
   them to re-render. If the API is not reachable — while you
   are opening the files from your computer, for example —
   the cache is all there is and everything still works.
========================================================= */

window.ESTORA_PROPERTIES_KEY = "estoraAdminProperties";


/* =========================================================
   CACHE
========================================================= */

window.estoraReadProperties = function () {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    window.ESTORA_PROPERTIES_KEY
                ) || "[]"
            );


        return Array.isArray(saved)
            ? saved
            : [];

    } catch (error) {

        console.warn(
            "ESTORA: Could not read the property cache.",
            error
        );

        return [];

    }

};


window.estoraWriteProperties = function (list) {

    try {

        localStorage.setItem(
            window.ESTORA_PROPERTIES_KEY,
            JSON.stringify(list)
        );

        return true;

    } catch (error) {

        console.warn(
            "ESTORA: Could not write the property cache.",
            error
        );

        return false;

    }

};


/* =========================================================
   ADMIN HEADER
========================================================= */

window.estoraAdminHeader = function () {

    const secret =
        window.ESTORA_CONFIG?.adminSecret || "";


    return secret &&
        secret !== "YOUR_ADMIN_API_SECRET"

        ? { "x-admin-secret": secret }
        : {};

};


/* =========================================================
   PULL FROM THE SERVER
   Resolves to true when the list actually changed, so a page
   only re-renders when there is something new to show.
========================================================= */

let lastFingerprint = "";

window.estoraServerOnline = false;


window.estoraSyncProperties = async function () {

    try {

        const response =
            await fetch("/api/properties");


        if (!response.ok) {

            throw new Error(
                `API responded with ${response.status}`
            );

        }


        const data =
            await response.json();


        const list =
            Array.isArray(data.properties)
                ? data.properties
                : [];


        const fingerprint =
            JSON.stringify(list);


        const changed =
            fingerprint !==
            JSON.stringify(
                window.estoraReadProperties()
            );


        lastFingerprint = fingerprint;

        window.estoraServerOnline = true;


        if (changed) {

            window.estoraWriteProperties(list);

        }


        return changed;


    } catch (error) {

        console.warn(
            "ESTORA: Properties API unavailable — using cached units.",
            error
        );

        window.estoraServerOnline = false;

        return false;

    }

};


/* =========================================================
   PUSH TO THE SERVER  (admin only)
========================================================= */

window.estoraPushProperties = async function (list) {

    try {

        const response =
            await fetch(
                "/api/properties",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...window.estoraAdminHeader()
                    },
                    body: JSON.stringify({
                        properties: list
                    })
                }
            );


        if (!response.ok) {

            const data =
                await response
                    .json()
                    .catch(() => ({}));


            throw new Error(
                data.error ||
                `API responded with ${response.status}`
            );

        }


        lastFingerprint =
            JSON.stringify(list);


        return { ok: true };


    } catch (error) {

        console.error(
            "ESTORA: Could not save the units to the server.",
            error
        );

        return {
            ok: false,
            error: error.message
        };

    }

};


/* =========================================================
   UPLOAD AN IMAGE  (admin only)
   Returns a public URL, or the original base64 string when
   the API is not available so nothing is ever lost.
========================================================= */

window.estoraUploadImage = async function (dataUrl) {

    if (!/^data:image\//.test(dataUrl)) {

        /* Already a URL */

        return dataUrl;

    }


    try {

        const response =
            await fetch(
                "/api/upload",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...window.estoraAdminHeader()
                    },
                    body: JSON.stringify({
                        image: dataUrl
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `API responded with ${response.status}`
            );

        }


        const data =
            await response.json();


        return data.url || dataUrl;


    } catch (error) {

        console.warn(
            "ESTORA: Image upload unavailable — keeping it locally.",
            error
        );

        return dataUrl;

    }

};
