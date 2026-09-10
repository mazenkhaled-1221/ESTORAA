/* =========================================================
   ESTORA — GLOBAL CONFIGURATION
   ---------------------------------------------------------
   Change the values here only. Every page reads from
   window.ESTORA_CONFIG, so you never have to edit the
   number in more than one place.
========================================================= */

window.ESTORA_CONFIG = {

    /*
     * Company WhatsApp number — international format,
     * digits only, no "+" and no spaces.
     *
     *   +20 100 123 4567   ->   "201001234567"
     */

    whatsappNumber: "201022192066",


    /*
     * Company display name (used inside WhatsApp messages)
     */

    companyName: "ESTORA",


    /*
     * The public address of the site, with no trailing slash.
     *
     *   siteUrl: "https://estora.vercel.app"
     *
     * Leave it empty and the WhatsApp message will simply skip
     * the link while you are testing from your computer, instead
     * of sending the client a useless "file:///D:/..." path.
     */

    siteUrl: "",


    /*
     * Must match ADMIN_API_SECRET on the server
     * (Vercel -> Settings -> Environment Variables).
     */

    adminSecret: "YOUR_ADMIN_API_SECRET"

};


/* =========================================================
   WHATSAPP HELPERS
========================================================= */

/**
 * Cleans any phone number into the wa.me format
 * ("+20 100 123 4567" -> "201001234567").
 */

window.estoraCleanPhone = function (phone) {

    return String(phone || "")
        .replace(/[^\d]/g, "")
        .replace(/^0+/, "");

};


/**
 * Builds a wa.me link with an optional pre-filled message.
 */

window.estoraWhatsAppLink = function (phone, message) {

    const number =
        window.estoraCleanPhone(phone);


    if (!number) {

        return "#";

    }


    const text =
        message
            ? `?text=${encodeURIComponent(message)}`
            : "";


    return `https://wa.me/${number}${text}`;

};


/**
 * Link to the company WhatsApp account.
 */

window.estoraCompanyWhatsApp = function (message) {

    return window.estoraWhatsAppLink(
        window.ESTORA_CONFIG.whatsappNumber,
        message
    );

};
