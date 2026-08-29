/* =========================================================
   ESTORA — /api/subscribe
   Vercel Serverless Function
   Stores a WhatsApp subscriber number in Supabase.
   -----------------------------------------------------
   Required Environment Variables
   (Vercel → Project → Settings → Environment Variables):

     SUPABASE_URL               e.g. https://xxxxxxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API
                                 → "service_role" key (NOT the anon key)

   Required Supabase table
   (Supabase → Table Editor → New table):

     name: subscribers
     columns:
       id          uuid       primary key, default: gen_random_uuid()
       phone       text       unique
       created_at  timestamp  default: now()
========================================================= */

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {

        res.status(405).json({
            error: "Method not allowed"
        });

        return;

    }


    const {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;


    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {

        console.error(
            "ESTORA: Supabase env vars are missing."
        );

        res.status(500).json({
            error: "Server is not configured yet."
        });

        return;

    }


    const phone =
        String(req.body?.phone || "")
            .trim();


    /* International format, e.g. +201001234567 */

    const phonePattern =
        /^\+[1-9]\d{7,14}$/;


    if (!phonePattern.test(phone)) {

        res.status(400).json({
            error:
                "Please enter a valid WhatsApp number in international format, e.g. +201001234567."
        });

        return;

    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/subscribers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        "Prefer": "resolution=ignore-duplicates,return=representation"
                    },
                    body: JSON.stringify({ phone })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "ESTORA: Supabase insert failed:",
                errorText
            );

            res.status(500).json({
                error: "Could not save your number. Please try again."
            });

            return;

        }


        const data =
            await response.json();


        if (
            Array.isArray(data) &&
            data.length === 0
        ) {

            /* Supabase silently ignored a duplicate phone number */

            res.status(200).json({
                success: true,
                alreadySubscribed: true
            });

            return;

        }


        res.status(200).json({
            success: true
        });


    } catch (error) {

        console.error(
            "ESTORA: Subscribe error:",
            error
        );

        res.status(500).json({
            error: "Something went wrong. Please try again."
        });

    }

};
