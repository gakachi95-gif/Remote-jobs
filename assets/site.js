/* RemotePath Jobs - shared script. Edit CONFIG only. */
const CONFIG = {
  siteName: "RemotePath Jobs",
  brand: "Earn with Vivy",
  contactEmail: "",   // Put your real email here later. Leave empty until then.
  categories: [
    "Customer Support", "Software Development", "Design",
    "Writing & Content", "Marketing", "Data & Analytics",
    "Operations & Admin", "Sales", "Education & Training", "Other"
  ]
};

const NAV = [
  ["index.html", "Home"], ["jobs.html", "Jobs"], ["categories.html", "Categories"],
  ["countries.html", "Countries"], ["guides.html", "Guides"], ["about.html", "About"]
];

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function todayISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

/* A job is shown only if it has the required fields and has not expired. */
function isListable(j) {
  if (!j || typeof j !== "object") return false;
  const need = ["id", "title", "employer", "category", "applyUrl", "verifiedOn", "expiresOn"];
  if (need.some(k => !j[k])) return false;
  if (!/^https:\/\//i.test(j.applyUrl)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.verifiedOn)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.expiresOn)) return false;
  return j.expiresOn >= todayISO();
}

async function loadJobs() {
  try {
    const r = await fetch("data/jobs.json", { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs.filter(isListable) : [];
    return { ok: true, jobs, lastReviewed: data.lastReviewed || null };
  } catch (e) {
    return { ok: false, jobs: [], lastReviewed: null, error: String(e) };
  }
}

function jobCard(j) {
  return '<article class="card">' +
    '<h3><a href="job.html?id=' + encodeURIComponent(j.id) + '">' + esc(j.title) + '</a></h3>' +
    '<p class="muted">' + esc(j.employer) + ' &middot; ' + esc(j.category) + '</p>' +
    '<p class="small">Verified ' + esc(j.verifiedOn) + ' &middot; Expires ' + esc(j.expiresOn) + '</p>' +
    '</article>';
}

function emptyState(failed) {
  return '<div class="empty"><h3>' +
    (failed ? "Listings could not be loaded" : "No verified vacancies right now") +
    '</h3><p>' +
    (failed
      ? "Please refresh the page. If this keeps happening, the data file may be missing or damaged."
      : "We only publish jobs that have been checked against the employer's own page. When none are verified, we show nothing rather than guess.") +
    '</p></div>';
}

function buildLayout() {
  const here = location.pathname.split("/").pop() || "index.html";
  const links = NAV.map(n =>
    '<a href="' + n[0] + '"' + (n[0] === here ? ' aria-current="page"' : "") + ">" + n[1] + "</a>").join("");
  const header = document.getElementById("site-header");
  if (header) header.innerHTML =
    '<div class="wrap bar"><a class="logo" href="index.html">' + CONFIG.siteName + '</a>' +
    '<button id="menuBtn" class="menu-btn" aria-label="Menu" aria-expanded="false">Menu</button>' +
    '<nav id="nav" class="nav">' + links + "</nav></div>";
  const footer = document.getElementById("site-footer");
  if (footer) footer.innerHTML =
    '<div class="wrap"><p><strong>' + CONFIG.siteName + '</strong> by ' + CONFIG.brand +
    '. Educational prototype. We do not guarantee jobs, income or hiring outcomes.</p>' +
    '<p class="small"><a href="privacy.html">Privacy</a> &middot; <a href="terms.html">Terms</a> &middot; ' +
    '<a href="disclaimer.html">Disclaimer</a> &middot; <a href="editorial-policy.html">Editorial policy</a> &middot; ' +
    '<a href="contact.html">Contact</a></p></div>';
  const btn = document.getElementById("menuBtn");
  if (btn) btn.addEventListener("click", () => {
    const open = document.getElementById("nav").classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", buildLayout);
