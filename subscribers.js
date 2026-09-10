/* =========================================================
   ESTORA — /api/subscribers
   Vercel Serverless Function
   ---------------------------------------------------------
   GET     -> returns every subscriber  [{ id, phone, created_at }]
   DELETE  -> removes one subscriber    ?phone=+201001234567
                                        (or ?id=<uuid>)
   ---------------------------------------------------------
   THIS is the file that was missing before: the admin page
   was only deleting numbers from localStorage, so Supabase
   still had them and the number came back on refresh.
   ---------------------------------------------------------
   Required Environment Variables:

     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY
     ADMIN_API_SECRET   (must match adminSecret in estora-config.js)
========================================================= */

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


    /* -----------------------------------------------------
       Only the admin dashboard may read or delete numbers.
    ----------------------------------------------------- */

    if (
        ADMIN_API_SECRET &&
        req.headers["x-admin-secret"] !== ADMIN_API_SECRET
    ) {

        res.status(401).json({
            error: "Unauthorized"
        });

        return;

    }


    const headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    };


    /* =====================================================
       LIST SUBSCRIBERS
    ===================================================== */

    if (req.method === "GET") {

        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/subscribers` +
                    `?select=id,phone,created_at&order=created_at.desc`,
                    { headers }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            const data =
                await response.json();


            res.status(200).json({
                subscribers:
                    Array.isArray(data)
                        ? data
                        : []
            });


        } catch (error) {

            console.error(
                "ESTORA: Could not load subscribers:",
                error
            );

            res.status(500).json({
                error: "Could not load subscribers."
            });

        }

        return;

    }


    /* =====================================================
       DELETE A SUBSCRIBER
    ===================================================== */

    if (req.method === "DELETE") {

        const id =
            req.query?.id ||
            req.body?.id ||
            "";

        const phone =
            String(
                req.query?.phone ||
                req.body?.phone ||
                ""
            ).trim();


        if (!id && !phone) {

            res.status(400).json({
                error: "Send ?id= or ?phone= to delete a subscriber."
            });

            return;

        }


        const filter =
            id
                ? `id=eq.${encodeURIComponent(id)}`
                : `phone=eq.${encodeURIComponent(phone)}`;


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/subscribers?${filter}`,
                    {
                        method: "DELETE",
                        headers: {
                            ...headers,
                            "Prefer": "return=representation"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            const deleted =
                await response.json();


            if (
                Array.isArray(deleted) &&
                deleted.length === 0
            ) {

                res.status(404).json({
                    error: "That subscriber was not found."
                });

                return;

            }


            res.status(200).json({
                success: true,
                deleted:
                    Array.isArray(deleted)
                        ? deleted.length
                        : 1
            });


        } catch (error) {

            console.error(
                "ESTORA: Could not delete subscriber:",
                error
            );

            res.status(500).json({
                error: "Could not delete the subscriber."
            });

        }

        return;

    }


    res.status(405).json({
        error: "Method not allowed"
    });

};
