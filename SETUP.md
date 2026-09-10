# ESTORA — Setup

Three steps, then everything works.

---

## 1. Supabase — create the table

Supabase → SQL Editor → New query → paste → Run:

```sql
create table if not exists site_data (
  key         text primary key,
  value       jsonb not null default '[]'::jsonb,
  updated_at  timestamptz default now()
);
```

If you have not created the subscribers table yet, run this too:

```sql
create table if not exists subscribers (
  id          uuid primary key default gen_random_uuid(),
  phone       text unique,
  created_at  timestamptz default now()
);
```

---

## 2. Supabase — create the image bucket

Supabase → Storage → New bucket

- Name: `property-images`
- Public bucket: **ON**

The name must match exactly. Without it, images stay as base64 and the
WhatsApp preview will have no photo.

---

## 3. Vercel — environment variables

Vercel → your project → Settings → Environment Variables

| Name | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | same page → `service_role` key (**not** anon) |
| `ADMIN_API_SECRET` | any random string you invent |
| `WHATSAPP_TOKEN` | only for the new-unit notifications |
| `WHATSAPP_PHONE_NUMBER_ID` | only for the new-unit notifications |
| `WHATSAPP_TEMPLATE_NAME` | only for the new-unit notifications |

Then open `estora-config.js` and set:

```js
adminSecret: "the same string you put in ADMIN_API_SECRET",
siteUrl: "https://your-project.vercel.app",
```

Redeploy after adding the variables — Vercel does not apply them to an
existing deployment.

---

## Folder layout

```
estora/
├── index.html
├── admin.html
├── admin-login.html
├── properties.html
├── property-details.html
├── estora-config.js
├── estora-data.js
├── i18n.js
├── main.js
├── admin.js
├── admin-subscribers.js
├── properties.js
├── properties-page.js
├── property-details.js
├── style.css
├── admin-style.css
├── property-details.css
└── api/
    ├── properties.js
    ├── upload.js
    ├── unit.js
    ├── subscribers.js
    ├── subscribe.js
    ├── notify-whatsapp.js
    └── subscribers-count.js
```

---

## How to tell it is working

Open the admin dashboard. Above the unit list there is a badge:

- **green — "Saved online, visible to everyone"** → units are on Supabase
- **orange — "This device only, not published yet"** → the API is not
  reachable. Normal when you open the files from your computer with
  `file:///`. Not normal on the live site — check the environment
  variables and that you redeployed.

---

## Testing locally with the API

Opening the files directly (`file:///D:/...`) means no `/api/...`, so the
site falls back to this-device-only mode. To run the real thing on your
computer:

```
npm i -g vercel
vercel dev
```

then open `http://localhost:3000`.
