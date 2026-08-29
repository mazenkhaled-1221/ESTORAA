/* =========================================================
   ESTORA — /api/notify-whatsapp
   Vercel Serverless Function
   Sends a WhatsApp message to every saved subscriber
   whenever the admin adds a new property.
   -----------------------------------------------------
   Required Environment Variables
   (Vercel → Project → Settings → Environment Variables):

     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY

     WHATSAPP_TOKEN             Meta access token
                                 (Meta App → WhatsApp → API Setup)
     WHATSAPP_PHONE_NUMBER_ID   "Phone number ID" from the same page
     WHATSAPP_TEMPLATE_NAME     the name of your APPROVED message
                                 template (see setup notes below)

     ADMIN_API_SECRET           any random string you choose —
                                 must match ADMIN_API_SECRET in admin.js

   -----------------------------------------------------
   IMPORTANT — Message Templates
   WhatsApp does NOT allow sending free-form text to someone who
   hasn't messaged you in the last 24 hours. Any "we have a new
   property!" style notification MUST use a pre-approved Message
   Template, created and approved inside Meta Business Manager
   (WhatsApp Manager → Message Templates → Create Template,
   category "Marketing" or "Utility").

   Example template body you can submit for approval:

     "New property available: {{1}}
      Type: {{2}}
      Location: {{3}}
      Price: {{4}}
      Details: {{5}}"

   Once Meta approves it, put its exact name in
   WHATSAPP_TEMPLATE_NAME below.
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
        SUPABASE_SERVICE_ROLE_KEY,
        WHATSAPP_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID,
        WHATSAPP_TEMPLATE_NAME,
        ADMIN_API_SECRET
    } = process.env;


    if (
        !SUPABASE_URL ||
        !SUPABASE_SERVICE_ROLE_KEY ||
        !WHATSAPP_TOKEN ||
        !WHATSAPP_PHONE_NUMBER_ID ||
        !WHATSAPP_TEMPLATE_NAME ||
        !ADMIN_API_SECRET
    ) {

        console.error(
            "ESTORA: WhatsApp/Supabase env vars are missing."
        );

        res.status(500).json({
            error: "Server is not configured yet."
        });

        return;

    }


    if (
        req.headers["x-admin-secret"] !==
        ADMIN_API_SECRET
    ) {

        res.status(401).json({
            error: "Unauthorized"
        });

        return;

    }


    const property =
        req.body?.property;


    if (!property || !property.title) {

        res.status(400).json({
            error: "Missing property data."
        });

        return;

    }


    try {

        const subscribersResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/subscribers?select=phone`,
                {
                    headers: {
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                    }
                }
            );


        if (!subscribersResponse.ok) {

            throw new Error(
                "Could not load subscribers from Supabase."
            );

        }


        const subscribers =
            await subscribersResponse.json();


        const results =
            await Promise.allSettled(

                subscribers.map(subscriber =>

                    fetch(
                        `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${WHATSAPP_TOKEN}`
                            },
                            body: JSON.stringify({
                                messaging_product: "whatsapp",
                                to: subscriber.phone,
                                type: "template",
                                template: {
                                    name: WHATSAPP_TEMPLATE_NAME,
                                    language: {
                                        code: "en_US"
                                    },
                                    components: [
                                        {
                                            type: "body",
                                            parameters: [
                                                { type: "text", text: property.title || "" },
                                                { type: "text", text: property.type || "" },
                                                { type: "text", text: property.location || "" },
                                                { type: "text", text: String(property.price || "") },
                                                { type: "text", text: property.link || "" }
                                            ]
                                        }
                                    ]
                                }
                            })
                        }
                    )

                )

            );


        const failed =
            results.filter(
                result =>
                    result.status === "rejected"
            );


        if (failed.length) {

            console.error(
                "ESTORA: Some WhatsApp messages failed:",
                failed
            );

        }


        res.status(200).json({
            success: true,
            sent: subscribers.length - failed.length,
            failed: failed.length
        });


    } catch (error) {

        console.error(
            "ESTORA: Notify error:",
            error
        );

        res.status(500).json({
            error: "Something went wrong while sending notifications."
        });

    }

};
