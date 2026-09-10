/* =========================================================
   ESTORA — /api/subscribers-count
   Vercel Serverless Function
   Returns how many subscribers are saved in Supabase,
   used by the admin dashboard stats.
========================================================= */

module.exports = async function handler(req, res) {

    const {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;


    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {

        res.status(200).json({ count: 0 });

        return;

    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/subscribers?select=id`,
                {
                    headers: {
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        "Prefer": "count=exact"
                    }
                }
            );


        if (!response.ok) {

            res.status(200).json({ count: 0 });

            return;

        }


        const data =
            await response.json();

        res.status(200).json({
            count:
                Array.isArray(data)
                    ? data.length
                    : 0
        });


    } catch (error) {

        console.error(
            "ESTORA: subscribers-count error",
            error
        );

        res.status(200).json({ count: 0 });

    }

};
