/**
 * Valiant Men's Health — Member Meet-Up RSVP
 *
 * Form backend:
 * - Netlify Forms: form has `netlify` / `data-netlify="true"` and name="rsvp"
 * - Optional Formspree: set FORMSPREE_ACTION_URL below (leave empty by default)
 * - Local preview: validate, show success UI, console.log payload (no fake email send)
 */

/* ========== CONFIG (edit here) ========== */
const FORMSPREE_ACTION_URL = ""; // e.g. "https://formspree.io/f/xxxxxxxx" — empty = local / Netlify only

/**
 * Single source of truth for event copy on the page.
 * Prefer editing data-* on #event-config in index.html; this object is populated from there.
 */
const EVENT_CONFIG = {
  title: "Valiant Member Meet-Up",
  date: "Thursday, October 15, 2026",
  time: "5:00 PM – 8:00 PM",
  venue: "The Commonwealth Club",
  address: "401 West Franklin Street, Richmond, VA 23220",
  host: "Valiant Men's Health — Dr. Steven Bishop & Dr. Bo Vaughan",
  contactEmail: "hello@valiantmenshealth.com",
  contactUrl: "https://valiantmenshealth.com/",
};

/* ========== Boot ========== */

(function init() {
  hydrateConfigFromDom();
  bindEventCopy();
  setYear();
  setupGuestToggle();
  setupForm();
})();

function hydrateConfigFromDom() {
  const el = document.getElementById("event-config");
  if (!el) return;
  const map = {
    title: "title",
    date: "date",
    time: "time",
    venue: "venue",
    address: "address",
    host: "host",
    contactEmail: "contact-email",
    contactUrl: "contact-url",
  };
  Object.keys(map).forEach((key) => {
    const val = el.getAttribute("data-" + map[key]);
    if (val) EVENT_CONFIG[key] = val;
  });
  window.EVENT_CONFIG = EVENT_CONFIG;
}

function bindEventCopy() {
  document.querySelectorAll("[data-bind]").forEach((node) => {
    const key = node.getAttribute("data-bind");
    if (key && EVENT_CONFIG[key] != null) {
      node.textContent = EVENT_CONFIG[key];
    }
  });
  document.title =
    EVENT_CONFIG.title +
    " — " +
    EVENT_CONFIG.date +
    " | Valiant Men's Health";
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ========== Guest field ========== */

function setupGuestToggle() {
  const field = document.getElementById("guest-name-field");
  const input = document.getElementById("guest-name");
  const radios = document.querySelectorAll('input[name="bringing-guest"]');

  function sync() {
    const selected = document.querySelector('input[name="bringing-guest"]:checked');
    const yes = selected && selected.value === "yes";
    if (!field || !input) return;
    field.hidden = !yes;
    input.required = !!yes;
    if (!yes) {
      input.value = "";
      clearError("guest-name");
    }
  }

  radios.forEach((r) => r.addEventListener("change", sync));
  sync();
}

/* ========== Form ========== */

function setupForm() {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  if (FORMSPREE_ACTION_URL) {
    form.setAttribute("action", FORMSPREE_ACTION_URL);
  }

  form.addEventListener("submit", onSubmit);

  const again = document.getElementById("rsvp-another");
  if (again) {
    again.addEventListener("click", () => {
      showForm();
      form.reset();
      setupGuestToggle();
      clearAllErrors();
      form.querySelector("#full-name")?.focus();
    });
  }
}

function onSubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearAllErrors();

  if (!validate(form)) return;

  const payload = collectPayload(form);
  console.log("[RSVP] Submission payload:", payload);

  const isLocal =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "";

  // Local preview: never pretend an email was sent
  if (isLocal && !FORMSPREE_ACTION_URL) {
    console.log(
      "[RSVP] Local preview — validated only. Deploy to Netlify (or set FORMSPREE_ACTION_URL) to receive submissions."
    );
    showSuccess(payload);
    return;
  }

  // Formspree path
  if (FORMSPREE_ACTION_URL) {
    submitViaFetch(FORMSPREE_ACTION_URL, payload, form).then((ok) => {
      if (ok) showSuccess(payload);
      else alert("Something went wrong sending your RSVP. Please email hello@valiantmenshealth.com.");
    });
    return;
  }

  // Netlify Forms: POST as application/x-www-form-urlencoded (or multipart)
  const body = new URLSearchParams();
  Object.keys(payload).forEach((k) => {
    if (payload[k] != null && payload[k] !== "") body.append(k, payload[k]);
  });
  body.set("form-name", "rsvp");

  const btn = document.getElementById("submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending…";
  }

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Netlify form error " + res.status);
      showSuccess(payload);
    })
    .catch((err) => {
      console.error(err);
      // Fallback: native submit so Netlify still gets the post if fetch is blocked
      form.removeEventListener("submit", onSubmit);
      form.submit();
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Confirm RSVP";
      }
    });
}

function submitViaFetch(url, payload, form) {
  const btn = document.getElementById("submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending…";
  }
  const body = new FormData(form);
  return fetch(url, {
    method: "POST",
    body,
    headers: { Accept: "application/json" },
  })
    .then((res) => res.ok)
    .catch((err) => {
      console.error(err);
      return false;
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Confirm RSVP";
      }
    });
}

function collectPayload(form) {
  const fd = new FormData(form);
  const bringing = fd.get("bringing-guest") || "";
  return {
    "form-name": "rsvp",
    "full-name": String(fd.get("full-name") || "").trim(),
    email: String(fd.get("email") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    "bringing-guest": bringing,
    "guest-name": bringing === "yes" ? String(fd.get("guest-name") || "").trim() : "",
    notes: String(fd.get("notes") || "").trim(),
    "bot-field": String(fd.get("bot-field") || ""),
  };
}

function validate(form) {
  let ok = true;
  const name = form.querySelector("#full-name");
  const email = form.querySelector("#email");
  const guestRadios = form.querySelectorAll('input[name="bringing-guest"]');
  const guestName = form.querySelector("#guest-name");

  if (!name || !String(name.value).trim()) {
    setError("full-name", "Please enter your full name.");
    ok = false;
  }

  const emailVal = email ? String(email.value).trim() : "";
  if (!emailVal) {
    setError("email", "Please enter your email.");
    ok = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    setError("email", "Please enter a valid email address.");
    ok = false;
  }

  const guestSelected = Array.from(guestRadios).some((r) => r.checked);
  if (!guestSelected) {
    setError("bringing-guest", "Please let us know if you're bringing guests.");
    ok = false;
  }

  const bringingYes = form.querySelector('input[name="bringing-guest"][value="yes"]');
  if (bringingYes && bringingYes.checked) {
    if (!guestName || !String(guestName.value).trim()) {
      setError("guest-name", "Please list your guest names.");
      ok = false;
    }
  }

  if (!ok) {
    const first = form.querySelector(".is-invalid input, .is-invalid textarea, .field-radio.is-invalid");
    if (first) {
      const focusable = first.matches("input, textarea") ? first : first.querySelector("input");
      (focusable || first).focus();
    }
  }

  return ok;
}

function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const err = document.getElementById("error-" + fieldId);
  const wrap =
    fieldId === "bringing-guest"
      ? document.querySelector(".field-radio")
      : input
        ? input.closest(".field")
        : null;
  if (wrap) wrap.classList.add("is-invalid");
  if (err) {
    err.hidden = false;
    err.textContent = message;
  }
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const err = document.getElementById("error-" + fieldId);
  const wrap =
    fieldId === "bringing-guest"
      ? document.querySelector(".field-radio")
      : input
        ? input.closest(".field")
        : null;
  if (wrap) wrap.classList.remove("is-invalid");
  if (err) {
    err.hidden = true;
    err.textContent = "";
  }
}

function clearAllErrors() {
  ["full-name", "email", "bringing-guest", "guest-name"].forEach(clearError);
}

function showSuccess(payload) {
  const form = document.getElementById("rsvp-form");
  const success = document.getElementById("form-success");
  if (form) form.hidden = true;
  if (success) {
    success.hidden = false;
    const msg = document.getElementById("success-message");
    if (msg && payload["full-name"]) {
      msg.innerHTML =
        "Thanks, <strong>" +
        escapeHtml(payload["full-name"]) +
        "</strong>. We've received your RSVP" +
        (payload["bringing-guest"] === "yes" && payload["guest-name"]
          ? " for you and your guest(s): <strong>" + escapeHtml(payload["guest-name"].replace(/\n+/g, ", ")) + "</strong>"
          : "") +
        ". We look forward to seeing you on <span data-bind=\"date\">" +
        escapeHtml(EVENT_CONFIG.date) +
        "</span>.";
    }
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function showForm() {
  const form = document.getElementById("rsvp-form");
  const success = document.getElementById("form-success");
  if (form) form.hidden = false;
  if (success) success.hidden = true;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
