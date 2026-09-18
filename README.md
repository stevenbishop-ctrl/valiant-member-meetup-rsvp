# Valiant Member Meet-Up — RSVP site

Static one-pager for the **Valiant Member Meet-Up** (Thursday, October 15, 2026 · 5:00–8:00 PM · The Commonwealth Club, Richmond, VA).

Patients open this from a newsletter link, RSVP via the form, and submissions are emailed to **hello@valiantmenshealth.com** via [FormSubmit](https://formsubmit.co/).

## Quick local preview

```bash
cd valiant-rsvp
python3 -m http.server 8080
# then open http://127.0.0.1:8080/
```

Locally the form **validates**, shows the success UI, and **`console.log`s the payload** — it does **not** send email.

## Form backend (FormSubmit)

- Endpoint: `https://formsubmit.co/ajax/hello@valiantmenshealth.com`
- HTML `action` fallback: `https://formsubmit.co/hello@valiantmenshealth.com`
- **First submission:** FormSubmit emails `hello@valiantmenshealth.com` a one-time activation link. Confirm that once; later RSVPs arrive as normal email.
- Check spam for the activation message and for RSVPs.

Netlify Forms are **not** used (they were returning 404 until form detection + redeploy).

## Deploy to Netlify

Drag the folder (`index.html`, `styles.css`, `script.js`) onto the **existing** site’s Deploys page (`classy-pony-118cc8`), or push this repo if the site is linked to GitHub.

## Form field names

| Field | `name` attribute | Required |
|-------|------------------|----------|
| Full name | `full-name` | yes |
| Email | `email` | yes |
| Phone | `phone` | no |
| Bringing guests? | `bringing-guest` (`yes` / `no`) | yes |
| Guest names | `guest-name` | only if bringing guests = yes |
| Dietary / notes | `notes` | no |
| Honeypot | `_honey` | leave empty |

## Contact

- hello@valiantmenshealth.com
- https://valiantmenshealth.com/
