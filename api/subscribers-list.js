/* =========================================================
   ESTORA — /api/subscribers-list
   Vercel Serverless Function
   Returns the list of subscriber phone numbers saved in
   Supabase, used by the admin dashboard subscribers panel.
========================================================= */

module.exports = async function handler(req, res) {

    const {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;


    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {

        res.status(200).json({ subscribers: [] });

        return;

    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/subscribers?select=phone,created_at&order=created_at.desc`,
                {
                    headers: {
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                    }
                }
            );


        if (!response.ok) {

            res.status(200).json({ subscribers: [] });

            return;

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
            "ESTORA: subscribers-list error",
            error
        );

        res.status(200).json({ subscribers: [] });

    }

};
