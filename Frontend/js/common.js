/* ============================================================
   common.js — Shared utilities used across every page
   Toasts, navbar behavior, auth guards, wishlist persistence,
   and small formatting helpers.
   ============================================================ */

import { getToken, clearToken, decodeToken, isTokenExpired } from "./api.js";

/* ---------------- Toast notifications ---------------- */
let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "cv-toast-container";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const TOAST_ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-exclamation",
  info: "fa-circle-info",
};

export function showToast(message, type = "info", duration = 4000) {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `cv-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.info}"></i>
    <span>${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss notification"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add("closing");
    setTimeout(() => toast.remove(), 250);
  };
  toast.querySelector(".toast-close").addEventListener("click", remove);
  setTimeout(remove, duration);
}

/* ---------------- Small helpers ---------------- */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function formatRuntime(minutes) {
  if (!minutes || isNaN(minutes)) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

/* ---------------- Current user ---------------- */
export function getCurrentUser() {
  const cached = localStorage.getItem("cv_user");
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { /* fall through */ }
  }
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return {
    name: decoded.name || decoded.sub || "User",
    email: decoded.email || decoded.sub || "",
  };
}

export function setCurrentUser(user) {
  localStorage.setItem("cv_user", JSON.stringify(user));
}

/* ---------------- Auth guards ---------------- */
export function requireAuth() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    clearToken();
    window.location.href = "login.html";
    return false;
  }
  return true;
}

export function redirectIfAuthed(destination = "dashboard.html") {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    window.location.href = destination;
  }
}

export function logout() {
  clearToken();
  showToast("You have been logged out.", "success");
  setTimeout(() => (window.location.href = "login.html"), 600);
}

/* ---------------- Navbar behavior (shared partial) ---------------- */
export function initNavbar() {
  const navbar = document.querySelector(".cv-navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });

  // highlight active page link
  const current = window.location.pathname.split("/").pop() || "index.html";
  navbar.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });

  // collapse mobile menu after a link is tapped
  const collapseEl = navbar.querySelector(".navbar-collapse");
  if (collapseEl) {
    collapseEl.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (collapseEl.classList.contains("show") && window.bootstrap) {
          window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
        }
      });
    });
  }

  // populate user pill if logged in
  const userPill = navbar.querySelector("[data-user-pill]");
  const token = getToken();
  if (userPill) {
    if (token && !isTokenExpired(token)) {
      const user = getCurrentUser();
      userPill.style.display = "flex";
      const avatar = userPill.querySelector("[data-avatar]");
      const nameEl = userPill.querySelector("[data-username]");
      if (avatar) avatar.textContent = getInitials(user?.name);
      if (nameEl) nameEl.textContent = user?.name || "Account";
    } else {
      userPill.style.display = "none";
    }
  }

  navbar.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });

  // show/hide auth-only vs guest-only nav items
  const loggedIn = token && !isTokenExpired(token);
  navbar.querySelectorAll("[data-auth-only]").forEach((el) => {
    el.style.display = loggedIn ? "" : "none";
  });
  navbar.querySelectorAll("[data-guest-only]").forEach((el) => {
    el.style.display = loggedIn ? "none" : "";
  });
}

/* ---------------- Wishlist persistence ----------------
   No dedicated wishlist endpoint is defined in the provided
   backend contract (only /auth/* and /api/movies are specified),
   so the wishlist is persisted client-side per logged-in user.
   Swap getWishlistIds/toggleWishlist for real API calls here if
   a backend wishlist endpoint becomes available.
------------------------------------------------------------- */
function wishlistKey() {
  const user = getCurrentUser();
  const id = user?.email || "guest";
  return `cv_wishlist_${id}`;
}

export function getWishlistIds() {
  try {
    return JSON.parse(localStorage.getItem(wishlistKey())) || [];
  } catch (e) {
    return [];
  }
}

export function isInWishlist(movieId) {
  return getWishlistIds().includes(String(movieId));
}

export function toggleWishlist(movieId) {
  const ids = getWishlistIds();
  const idStr = String(movieId);
  const idx = ids.indexOf(idStr);
  let added;
  if (idx >= 0) {
    ids.splice(idx, 1);
    added = false;
  } else {
    ids.push(idStr);
    added = true;
  }
  localStorage.setItem(wishlistKey(), JSON.stringify(ids));
  return added;
}

/* ---------------- Shared movie card rendering ---------------- */
export function placeholderPoster() {
  return "https://placehold.co/300x450/181818/767676?text=No+Poster";
}

/**
 * Renders a single movie card. `movie` is expected to loosely match:
 * { id, title, posterUrl, rating, genre, language, releaseYear, duration }
 */
export function renderMovieCardHtml(movie) {
  const id = movie.id ?? movie.movieId;
  const title = movie.title || "Untitled";
  const rating = movie.rating != null ? Number(movie.rating).toFixed(1) : null;
  const year = movie.releaseYear || movie.year || "";
  const genre = (movie.genre || "").split(",")[0]?.trim();
  const active = isInWishlist(id);

  return `
    <div class="movie-card" data-movie-id="${id}" tabindex="0" role="button" aria-label="View details for ${escapeHtml(title)}">
      <button class="wishlist-toggle ${active ? "is-active" : ""}" data-wishlist-btn data-movie-id="${id}" aria-label="Toggle wishlist for ${escapeHtml(title)}">
        <i class="fa-solid fa-heart"></i>
      </button>
      <div class="poster-wrap">
        <img src="${movie.posterUrl || placeholderPoster()}" alt="${escapeHtml(title)} poster" loading="lazy" onerror="this.src='${placeholderPoster()}'">
        ${rating ? `<span class="rating-badge"><i class="fa-solid fa-star"></i> ${rating}</span>` : ""}
      </div>
      <div class="card-overlay">
        <div class="card-title">${escapeHtml(title)}</div>
        <div class="card-meta">
          ${genre ? `<span>${escapeHtml(genre)}</span>` : ""}
          ${year ? `<span>${escapeHtml(year)}</span>` : ""}
        </div>
      </div>
    </div>`;
}

/**
 * Delegated click handler for a container of rendered movie cards:
 * navigates to movie-details.html on card click, and toggles wishlist
 * state when the heart icon is clicked (without navigating).
 */
export function wireMovieCardEvents(container, { onWishlistChange } = {}) {
  if (!container || container.dataset.wired === "1") return;
  container.dataset.wired = "1";

  container.addEventListener("click", (e) => {
    const wishlistBtn = e.target.closest("[data-wishlist-btn]");
    if (wishlistBtn) {
      e.stopPropagation();
      const id = wishlistBtn.dataset.movieId;
      const added = toggleWishlist(id);
      wishlistBtn.classList.toggle("is-active", added);
      showToast(added ? "Added to your wishlist." : "Removed from your wishlist.", "success", 2200);
      if (onWishlistChange) onWishlistChange(id, added);
      return;
    }

    const card = e.target.closest(".movie-card");
    if (card) {
      const id = card.dataset.movieId;
      if (id) window.location.href = `movie-details.html?id=${encodeURIComponent(id)}`;
    }
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const card = e.target.closest(".movie-card");
    if (card) {
      const id = card.dataset.movieId;
      if (id) window.location.href = `movie-details.html?id=${encodeURIComponent(id)}`;
    }
  });
}

/* ---------------- Loading / skeleton helpers ---------------- */
export function spinnerHtml(label = "Loading...") {
  return `<div class="cv-spinner-wrap"><div class="cv-spinner"></div><span>${escapeHtml(label)}</span></div>`;
}

export function skeletonCardsHtml(count = 8) {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-poster"></div>
        <div class="skeleton-line" style="width: 80%;"></div>
        <div class="skeleton-line" style="width: 50%;"></div>
      </div>`;
  }
  return html;
}

export function emptyStateHtml({ icon = "fa-film", title = "Nothing here yet", text = "", actionHtml = "" }) {
  return `
    <div class="empty-state">
      <i class="fa-solid ${icon}"></i>
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(text)}</p>
      ${actionHtml}
    </div>`;
}

/* Run on every page load */
document.addEventListener("DOMContentLoaded", initNavbar);
