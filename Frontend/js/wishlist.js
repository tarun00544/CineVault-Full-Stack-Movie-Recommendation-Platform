/* ============================================================
   wishlist.js — Wishlist page logic
   ============================================================ */

import { api } from "./api.js";
import {
  requireAuth,
  showToast,
  debounce,
  escapeHtml,
  placeholderPoster,
  getWishlistIds,
  toggleWishlist,
  spinnerHtml,
  emptyStateHtml,
} from "./common.js";

let wishlistMovies = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  const grid = document.getElementById("wishlistGrid");
  const searchInput = document.getElementById("wishlistSearch");
  const countLabel = document.getElementById("wishlistCount");

  grid.innerHTML = spinnerHtml("Loading your wishlist...");

  try {
    const ids = getWishlistIds();
    if (!ids.length) {
      renderEmpty(grid);
      if (countLabel) countLabel.textContent = "0 movies saved";
      return;
    }

    const allMovies = normalizeList(await api.getMovies());
    wishlistMovies = allMovies.filter((m) => ids.includes(String(m.id ?? m.movieId)));

    if (countLabel) countLabel.textContent = `${wishlistMovies.length} ${wishlistMovies.length === 1 ? "movie" : "movies"} saved`;
    render(grid, wishlistMovies);
  } catch (err) {
    grid.innerHTML = emptyStateHtml({
      icon: "fa-triangle-exclamation",
      title: "Could not load your wishlist",
      text: err.message || "Check that the backend is running.",
    });
    showToast(err.message || "Failed to load wishlist.", "error");
  }

  searchInput?.addEventListener(
    "input",
    debounce(() => {
      const q = searchInput.value.trim().toLowerCase();
      const filtered = wishlistMovies.filter((m) => (m.title || "").toLowerCase().includes(q));
      render(grid, filtered);
    }, 250)
  );
});

function render(grid, movies) {
  if (!movies.length) {
    renderEmpty(grid);
    return;
  }

  grid.className = "movies-grid";
  grid.innerHTML = movies
    .map(
      (m) => `
      <div class="movie-card" data-movie-id="${m.id}">
        <button class="wishlist-toggle is-active" data-remove-btn data-movie-id="${m.id}" aria-label="Remove ${escapeHtml(m.title)} from wishlist">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="poster-wrap" data-open-details data-movie-id="${m.id}">
          <img src="${m.posterUrl || placeholderPoster()}" alt="${escapeHtml(m.title)} poster" loading="lazy" onerror="this.src='${placeholderPoster()}'">
          ${m.rating != null ? `<span class="rating-badge"><i class="fa-solid fa-star"></i> ${Number(m.rating).toFixed(1)}</span>` : ""}
        </div>
        <div class="card-overlay" data-open-details data-movie-id="${m.id}">
          <div class="card-title">${escapeHtml(m.title)}</div>
          <div class="card-meta"><span>${escapeHtml((m.genre || "").split(",")[0] || "")}</span><span>${escapeHtml(m.releaseYear || "")}</span></div>
        </div>
      </div>`
    )
    .join("");

  grid.querySelectorAll("[data-remove-btn]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.movieId;
      toggleWishlist(id);
      wishlistMovies = wishlistMovies.filter((m) => String(m.id) !== String(id));
      showToast("Removed from your wishlist.", "success", 2200);
      render(grid, wishlistMovies);
      const countLabel = document.getElementById("wishlistCount");
      if (countLabel) countLabel.textContent = `${wishlistMovies.length} ${wishlistMovies.length === 1 ? "movie" : "movies"} saved`;
    });
  });

  grid.querySelectorAll("[data-open-details]").forEach((el) => {
    el.addEventListener("click", () => {
      window.location.href = `movie-details.html?id=${encodeURIComponent(el.dataset.movieId)}`;
    });
  });
}

function renderEmpty(grid) {
  grid.className = "";
  grid.innerHTML = emptyStateHtml({
    icon: "fa-heart-crack",
    title: "Your wishlist is empty",
    text: "Movies you save will show up here so you never lose track of them.",
    actionHtml: `<a href="movies.html" class="btn-cv-primary mt-3 d-inline-block">Browse Movies</a>`,
  });
}

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}
