/* =========================================================
   ESTORA — /api/unit?id=...
   Vercel Serverless Function
   ---------------------------------------------------------
   This is the link that goes inside the WhatsApp message.

   WhatsApp cannot receive an attached image through a wa.me
   link, but it DOES read the page behind any URL in the
   message and turns it into a card with a photo, a title and
   a description. That card is what the client taps, and it
   opens the unit on the site.

   So this endpoint returns a tiny page whose only job is to
   carry the Open Graph tags for one unit, then send a real
   visitor straight to property-details.html.

   It reads the unit from Supabase, so it keeps working for
   every unit you add, with no extra step.
========================================================= */

const DATA_KEY = "properties";


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatPrice(property) {

    const amount =
        new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0
        }).format(Number(property.price) || 0);


    const currency =
        property.currency || "EGP";


    const suffix =
        String(property.purpose || "").toLowerCase() === "rent"
            ? " / month"
            : "";


    return `${currency} ${amount}${suffix}`;

}


module.exports = async function handler(req, res) {

    const {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;


    const id =
        String(req.query?.id || "");


    const origin =
        `https://${
            req.headers["x-forwarded-host"] ||
            req.headers.host
        }`;


    const target =
        `${origin}/property-details.html?id=${encodeURIComponent(id)}`;


    let property = null;


    if (
        id &&
        SUPABASE_URL &&
        SUPABASE_SERVICE_ROLE_KEY
    ) {

        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/site_data` +
                    `?key=eq.${DATA_KEY}&select=value`,
                    {
                        headers: {
                            "apikey": SUPABASE_SERVICE_ROLE_KEY,
                            "Authorization":
                                `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                        }
                    }
                );


            if (response.ok) {

                const rows =
                    await response.json();


                const list =
                    Array.isArray(rows) && rows.length
                        ? rows[0].value
                        : [];


                if (Array.isArray(list)) {

                    property =
                        list.find(
                            item =>
                                String(item.id) === id
                        ) || null;

                }

            }


        } catch (error) {

            console.error(
                "ESTORA: unit preview lookup failed:",
                error
            );

        }

    }


    /* -----------------------------------------------------
       Nothing found -> just send them to the unit page,
       which shows its own "not found" screen.
    ----------------------------------------------------- */

    if (!property) {

        res.writeHead(302, { Location: target });

        res.end();

        return;

    }


    const image =
        (Array.isArray(property.images) && property.images[0]) ||
        property.image ||
        "";


    /* A base64 image cannot be used in a preview */

    const previewImage =
        /^https?:\/\//.test(image)
            ? image
            : "";


    const title =
        `${property.title || "Property"} — ${
            property.type || ""
        }`.trim();


    const description = [
        property.location,
        Number(property.area)
            ? `${Number(property.area)} m²`
            : "",
        Number(property.bedrooms)
            ? `${Number(property.bedrooms)} bedrooms`
            : "",
        formatPrice(property)
    ]
        .filter(Boolean)
        .join("  •  ");


    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(title)}</title>

<meta property="og:type" content="website">
<meta property="og:site_name" content="ESTORA">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(description)}">
<meta property="og:url" content="${escapeHTML(target)}">
${
    previewImage
        ? `<meta property="og:image" content="${escapeHTML(previewImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escapeHTML(previewImage)}">`
        : `<meta name="twitter:card" content="summary">`
}
<meta name="twitter:title" content="${escapeHTML(title)}">
<meta name="twitter:description" content="${escapeHTML(description)}">

<meta http-equiv="refresh" content="0; url=${escapeHTML(target)}">
<script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body>
<p>Opening the property…
<a href="${escapeHTML(target)}">Continue</a></p>
</body>
</html>`;


    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
    );

    res.status(200).send(html);

};
