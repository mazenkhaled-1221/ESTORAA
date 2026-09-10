/* =========================================================
   ESTORA — /api/properties
   Vercel Serverless Function
   ---------------------------------------------------------
   GET  -> { properties: [...] }   public, anyone can read
   PUT  -> saves the whole list    admin only

   The units used to live in localStorage, which meant they
   only existed on the admin's own computer. Now they live in
   Supabase, so every visitor sees them and WhatsApp can read
   them to build the link preview.
   ---------------------------------------------------------
   Run this once in Supabase -> SQL Editor:

     create table if not exists site_data (
       key         text primary key,
       value       jsonb not null default '[]'::jsonb,
       updated_at  timestamptz default now()
     );

   Required Environment Variables:

     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY
     ADMIN_API_SECRET
========================================================= */

const DATA_KEY = "properties";


module.exports = async function handler(req, res) {

    const {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        ADMIN_API_SECRET
    } = process.env;


    if (
        !SUPABASE_URL ||
        !SUPABASE_SERVICE_ROLE_KEY
    ) {

        res.status(500).json({
            error: "Server is not configured yet."
        });

        return;

    }


    const headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    };


    /* =====================================================
       READ  —  open to everyone, this is the public catalogue
    ===================================================== */

    if (req.method === "GET") {

        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/site_data` +
                    `?key=eq.${DATA_KEY}&select=value`,
                    { headers }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            const rows =
                await response.json();


            const value =
                Array.isArray(rows) && rows.length
                    ? rows[0].value
                    : [];


            res.setHeader(
                "Cache-Control",
                "public, max-age=0, s-maxage=30, stale-while-revalidate=120"
            );


            res.status(200).json({
                properties:
                    Array.isArray(value)
                        ? value
                        : []
            });


        } catch (error) {

            console.error(
                "ESTORA: Could not load properties:",
                error
            );

            res.status(500).json({
                error: "Could not load properties."
            });

        }

        return;

    }


    /* =====================================================
       WRITE  —  admin only
    ===================================================== */

    if (
        req.method === "PUT" ||
        req.method === "POST"
    ) {

        if (
            ADMIN_API_SECRET &&
            req.headers["x-admin-secret"] !== ADMIN_API_SECRET
        ) {

            res.status(401).json({
                error: "Unauthorized"
            });

            return;

        }


        const properties =
            req.body?.properties;


        if (!Array.isArray(properties)) {

            res.status(400).json({
                error: "Send { properties: [ ... ] }"
            });

            return;

        }


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/site_data`,
                    {
                        method: "POST",
                        headers: {
                            ...headers,
                            "Prefer":
                                "resolution=merge-duplicates,return=minimal"
                        },
                        body: JSON.stringify({
                            key: DATA_KEY,
                            value: properties,
                            updated_at: new Date().toISOString()
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            res.status(200).json({
                success: true,
                saved: properties.length
            });


        } catch (error) {

            console.error(
                "ESTORA: Could not save properties:",
                error
            );

            res.status(500).json({
                error: "Could not save the properties."
            });

        }

        return;

    }


    res.status(405).json({
        error: "Method not allowed"
    });

};
