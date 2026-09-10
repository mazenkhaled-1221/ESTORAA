/* =========================================================
   ESTORA — /api/upload
   Vercel Serverless Function
   ---------------------------------------------------------
   Takes a base64 image from the admin dashboard, stores it
   in Supabase Storage and returns a normal public URL.

   Why this matters:
     - base64 images were filling up localStorage (that is
       what the "images are too large" alert was about)
     - WhatsApp cannot show a base64 image in a preview,
       it needs a real URL
     - pages load far faster with real image files
   ---------------------------------------------------------
   Run this once in Supabase -> Storage:

     Create a bucket named:  property-images
     Tick "Public bucket".

   Required Environment Variables:

     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY
     ADMIN_API_SECRET
========================================================= */

const BUCKET = "property-images";


module.exports = async function handler(req, res) {

    if (req.method !== "POST") {

        res.status(405).json({
            error: "Method not allowed"
        });

        return;

    }


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


    if (
        ADMIN_API_SECRET &&
        req.headers["x-admin-secret"] !== ADMIN_API_SECRET
    ) {

        res.status(401).json({
            error: "Unauthorized"
        });

        return;

    }


    const image =
        String(req.body?.image || "");


    const match =
        image.match(
            /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
        );


    if (!match) {

        res.status(400).json({
            error: "Send { image: \"data:image/...;base64,...\" }"
        });

        return;

    }


    const contentType = match[1];

    const binary =
        Buffer.from(match[2], "base64");


    /* Roughly 5 MB after decoding */

    if (binary.length > 5 * 1024 * 1024) {

        res.status(413).json({
            error: "That image is larger than 5 MB. Please use a smaller one."
        });

        return;

    }


    const extension =
        contentType
            .split("/")[1]
            .replace("jpeg", "jpg")
            .replace("+xml", "");


    const fileName =
        `unit_${Date.now()}_${
            Math.random().toString(36).slice(2, 8)
        }.${extension}`;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": contentType,
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        "x-upsert": "true"
                    },
                    body: binary
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }


        res.status(200).json({
            success: true,
            url:
                `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`
        });


    } catch (error) {

        console.error(
            "ESTORA: Image upload failed:",
            error
        );

        res.status(500).json({
            error: "Could not upload the image."
        });

    }

};
