# Prime Cut Barbershop & Salon 💈

**Enugu's Finest Grooming — Pure Frontend Edition**

A fully self-contained, single-page booking website. **No backend, no server, no Python required.**
Bookings are confirmed client-side and a WhatsApp notification is sent to the business owner automatically.

---

## How Booking Works

1. Client fills in the booking form on the website.
2. Client clicks **Confirm Booking**.
3. The booking is saved locally (localStorage) and a reference number is generated.
4. **WhatsApp opens automatically** on the client's device with all booking details pre-filled.
5. Client taps **Send** — the business owner receives the notification instantly.
6. If the popup is blocked, a fallback **"Send WhatsApp Notification"** button is shown.

---

## Project Structure

```
prime_cut/
├── index.html          ← Full website (single file)
├── static/
│   ├── css/
│   │   └── styles.css  ← Main stylesheet
│   └── js/
│       └── app.js      ← All frontend logic
└── README.md
```

---

## Running Locally

Open `index.html` directly in any modern browser — no build step, no server needed.

Or serve it with any static host:

```bash
# Python (quickest)
python3 -m http.server 8000

# Node (npx)
npx serve .

# VS Code: just use Live Server
```

---

## Deployment

Drop the entire folder on any static host:

| Host | Steps |
|------|-------|
| **Vercel** | `vercel deploy` |
| **Netlify** | Drag & drop the folder |
| **GitHub Pages** | Push to `gh-pages` branch |
| **Shared hosting (cPanel)** | Upload via File Manager |

---

## WhatsApp Notification Number

Notifications go to **+234 8071607769**.
To change it, edit line 4 of `static/js/app.js`:

```javascript
const OWNER_WHATSAPP = '2348071607769'; // ← change this
```

---

## Bugs Fixed in This Version

- ✅ Removed duplicate scroll/testimonial/stats handlers (were registered twice — once in `app.js`, once inline)
- ✅ `resetForm()` now uses `innerHTML` (was using `textContent`, which stripped the arrow icon)
- ✅ Contact section opening hours now consistent with footer (Mon–Wed were missing)
- ✅ Phone validation now checks for valid Nigerian numbers
- ✅ Script `src` path changed from `/static/js/app.js` → `./static/js/app.js` (works for file:// and all hosts)
- ✅ Toast timer now cleared before being reset (no overlapping dismiss)
- ✅ Back-to-top changed from `<div>` to `<button>` for accessibility
- ✅ XSS-safe HTML escaping applied to all user input rendered in the success panel
- ✅ `{ passive: true }` added to scroll/resize listeners for performance
- ✅ Removed unused AOS library import
- ✅ Removed entire Python backend (FastAPI, SQLite, uvicorn, Docker)

---

© 2025 Prime Cut Barbershop & Salon, Enugu, Nigeria.
