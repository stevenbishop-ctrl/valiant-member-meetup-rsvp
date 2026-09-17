# Valiant Member Meet-Up — RSVP site

Static one-pager for the **Valiant Member Meet-Up** (Thursday, October 15, 2026 · 5:00–8:00 PM · The Commonwealth Club, Richmond, VA).

Patients open this from a newsletter link, RSVP via the form, and submissions land in Netlify Forms (or optional Formspree).

## Quick local preview

```bash
cd /workspace/valiant-rsvp
# Any static server works, e.g.:
python3 -m http.server 8080
# then open http://127.0.0.1:8080/
```

Or open `index.html` directly in a browser (`file://`). Locally the form **validates**, shows the success UI, and **`console.log`s the payload** — it does **not** pretend an email was sent.

## Edit the event title (one place)

Preferred: `#event-config` in `index.html`:

```html
data-title="Valiant Member Meet-Up"
```

`script.js` also keeps an `EVENT_CONFIG` object (hydrated from those `data-*` attributes) and a single `FORMSPREE_ACTION_URL` constant at the top.

## Deploy to Netlify (same day)

### Option A — Drag and drop (fastest)

1. Zip is optional; you can drag the **folder** itself.
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) (signed in).
3. Drop the entire `valiant-rsvp` folder (`index.html`, `styles.css`, `script.js`).
4. Netlify gives you a live URL immediately (e.g. `https://random-name.netlify.app`).
5. Optional: Site settings → Domain management → add a custom subdomain.

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
cd /workspace/valiant-rsvp
netlify login
netlify deploy          # draft URL for a quick check
netlify deploy --prod   # production
```

When prompted, create a new site and set the publish directory to `.` (this folder — no build step).

### Enable form notification emails

1. Open the site in the Netlify UI → **Forms**.
2. After the first deploy, Netlify detects the form named **`rsvp`** (from `name="rsvp"` + `netlify` / `data-netlify="true"`).
3. Click the form → **Form notifications** → **Email notification**.
4. Add **`hello@valiantmenshealth.com`** as the recipient.
5. Save. New RSVPs email that inbox.

**Gotcha:** The form must be present in the **deployed HTML** (not only injected by JS) so Netlify’s build-time parser can register it. This project already includes the full `<form>` in `index.html`.

**Gotcha:** First submission after deploy may take a minute to appear under Forms; check spam for the notification email.

**Gotcha:** Honeypot field is `bot-field` (`netlify-honeypot="bot-field"`). Do not remove it.

### Optional: Formspree instead of / in addition to Netlify

In `script.js`:

```js
const FORMSPREE_ACTION_URL = "https://formspree.io/f/your-id";
```

Leave empty (`""`) for Netlify-only / local preview behavior.

## Form field names

| Field | `name` attribute | Required |
|-------|------------------|----------|
| Full name | `full-name` | yes |
| Email | `email` | yes |
| Phone | `phone` | no |
| Bringing guests? | `bringing-guest` (`yes` / `no`) | yes |
| Guest names | `guest-name` | only if bringing guests = yes (one per line) |
| Dietary / notes | `notes` | no |
| Honeypot | `bot-field` | leave empty |
| Form id (Netlify) | `form-name` = `rsvp` | hidden |

## Files

- `index.html` — page, meta/OG tags, Netlify form markup
- `styles.css` — premium dark charcoal/navy + cream/gold
- `script.js` — config, guest toggle, validation, submit
- `README.md` — this file

## Contact

- hello@valiantmenshealth.com
- https://valiantmenshealth.com/
