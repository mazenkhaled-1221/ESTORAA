"use strict";

/* =========================================================
   ESTORA — ADMIN SUBSCRIBERS
   ---------------------------------------------------------
   Owns everything in the "Subscribers" section:

     1. Loads the real subscribers from /api/subscribers
        (Supabase). If the API is unavailable — for example
        while you open the files locally — it falls back to
        the localStorage mirror "estoraSubscribers".

     2. Every number is a WhatsApp link: clicking it opens
        a chat with that person.

     3. DELETE actually deletes. It removes the row from
        Supabase AND from the local mirror, so the number
        does not come back after a refresh.
========================================================= */

const SUBSCRIBERS_MIRROR_KEY = "estoraSubscribers";

const subscriberList =
    document.getElementById("subscriberList");

const subscribersCountElement =
    document.getElementById("totalSubscribers");


/* State kept in memory so we can re-render without refetching */

let estoraSubscribers = [];

let subscribersSource = "local";   /* "api" | "local" */


/* =========================================================
   HELPERS
========================================================= */

function subscribersEscape(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/**
 * The mirror used to store plain strings ("+2010...").
 * Newer entries are objects. This accepts both.
 */

function normalizeSubscriber(entry) {

    if (typeof entry === "string") {

        return {
            id: "",
            phone: entry,
            created_at: ""
        };

    }


    return {
        id: entry?.id || "",
        phone: entry?.phone || "",
        created_at:
            entry?.created_at ||
            entry?.date ||
            ""
    };

}


function readMirror() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    SUBSCRIBERS_MIRROR_KEY
                ) || "[]"
            );


        return Array.isArray(saved)
            ? saved.map(normalizeSubscriber)
            : [];

    } catch (error) {

        console.warn(
            "ESTORA: Could not read the subscribers mirror.",
            error
        );

        return [];

    }

}


function writeMirror(list) {

    try {

        localStorage.setItem(
            SUBSCRIBERS_MIRROR_KEY,
            JSON.stringify(list)
        );

    } catch (error) {

        console.warn(
            "ESTORA: Could not write the subscribers mirror.",
            error
        );

    }

}


function adminSecretHeader() {

    const secret =
        window.ESTORA_CONFIG?.adminSecret || "";


    return secret &&
        secret !== "YOUR_ADMIN_API_SECRET"

        ? { "x-admin-secret": secret }
        : {};

}


function formatSubscribedDate(value) {

    if (!value) return "";


    const date = new Date(value);


    if (isNaN(date.getTime())) return "";


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   LOAD
========================================================= */

async function loadSubscribers() {

    try {

        const response =
            await fetch(
                "/api/subscribers",
                {
                    headers: adminSecretHeader()
                }
            );


        if (!response.ok) {

            throw new Error(
                `API responded with ${response.status}`
            );

        }


        const data =
            await response.json();


        estoraSubscribers =
            (data.subscribers || [])
                .map(normalizeSubscriber)
                .filter(item => item.phone);


        subscribersSource = "api";


        /* Keep the local mirror in sync with the server */

        writeMirror(estoraSubscribers);


    } catch (error) {

        console.warn(
            "ESTORA: Subscribers API unavailable — using local data.",
            error
        );

        estoraSubscribers =
            readMirror().filter(
                item => item.phone
            );

        subscribersSource = "local";

    }


    renderSubscribers();

}


/* =========================================================
   RENDER
========================================================= */

function renderSubscribers() {

    if (subscribersCountElement) {

        subscribersCountElement.textContent =
            estoraSubscribers.length;

    }


    if (!subscriberList) return;


    if (!estoraSubscribers.length) {

        subscriberList.innerHTML = `

            <div class="empty-subscribers">

                <i class="fa-brands fa-whatsapp"></i>

                <p>
                    No subscribers yet.
                </p>

            </div>

        `;

        return;

    }


    subscriberList.innerHTML =
        estoraSubscribers
            .map((subscriber, index) => {

                const phone =
                    subscribersEscape(
                        subscriber.phone
                    );


                const link =
                    window.estoraWhatsAppLink
                        ? window.estoraWhatsAppLink(
                            subscriber.phone,
                            `Hello, this is ${
                                window.ESTORA_CONFIG?.companyName ||
                                "ESTORA"
                            }. How can we help you today?`
                        )
                        : "#";


                const date =
                    formatSubscribedDate(
                        subscriber.created_at
                    );


                return `

                    <div class="subscriber-row">

                        <div class="subscriber-number">
                            ${index + 1}
                        </div>


                        <a
                            class="subscriber-phone"
                            href="${subscribersEscape(link)}"
                            target="_blank"
                            rel="noopener"
                            title="Open a WhatsApp chat with ${phone}"
                        >

                            <i class="fa-brands fa-whatsapp"></i>

                            <span>${phone}</span>

                        </a>


                        <span class="subscriber-date">
                            ${subscribersEscape(date)}
                        </span>


                        <div class="subscriber-actions">

                            <a
                                class="subscriber-chat"
                                href="${subscribersEscape(link)}"
                                target="_blank"
                                rel="noopener"
                            >
                                <i class="fa-brands fa-whatsapp"></i>
                                CHAT
                            </a>

                            <button
                                type="button"
                                class="subscriber-delete"
                                data-phone="${phone}"
                                data-id="${subscribersEscape(subscriber.id)}"
                            >
                                <i class="fa-solid fa-trash"></i>
                                DELETE
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   DELETE
========================================================= */

async function deleteSubscriber(phone, id, button) {

    const confirmed =
        confirm(
            `Delete ${phone} from the subscribers list?`
        );


    if (!confirmed) return;


    if (button) {

        button.disabled = true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i>';

    }


    let removedOnServer = true;


    if (subscribersSource === "api") {

        try {

            const query =
                id
                    ? `id=${encodeURIComponent(id)}`
                    : `phone=${encodeURIComponent(phone)}`;


            const response =
                await fetch(
                    `/api/subscribers?${query}`,
                    {
                        method: "DELETE",
                        headers: adminSecretHeader()
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


        } catch (error) {

            removedOnServer = false;

            console.error(
                "ESTORA: Delete failed:",
                error
            );

            alert(
                "The number could not be deleted from the server. " +
                "Please check your connection and try again."
            );

        }

    }


    if (!removedOnServer) {

        renderSubscribers();

        return;

    }


    /* Remove it from memory and from the local mirror */

    estoraSubscribers =
        estoraSubscribers.filter(item => {

            if (id && item.id) {

                return String(item.id) !== String(id);

            }

            return String(item.phone) !== String(phone);

        });


    writeMirror(estoraSubscribers);

    renderSubscribers();

}


if (subscriberList) {

    subscriberList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".subscriber-delete"
                );


            if (!button) return;


            deleteSubscriber(
                button.dataset.phone || "",
                button.dataset.id || "",
                button
            );

        }
    );

}


/* =========================================================
   REFRESH BUTTON (optional element)
========================================================= */

document
    .getElementById("refreshSubscribers")
    ?.addEventListener(
        "click",
        loadSubscribers
    );


/* =========================================================
   START
========================================================= */

loadSubscribers();


/* Pick up numbers that subscribe while the dashboard is open */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === SUBSCRIBERS_MIRROR_KEY &&
            subscribersSource === "local"
        ) {

            estoraSubscribers = readMirror();

            renderSubscribers();

        }

    }
);
