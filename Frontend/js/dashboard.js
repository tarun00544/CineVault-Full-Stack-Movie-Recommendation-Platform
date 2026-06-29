/* ============================================================
   dashboard.js — Dashboard page logic
   Stats, genre distribution, and recent movies are derived
   client-side from GET /api/movies (no separate stats endpoint
   is defined in the backend contract).
   ============================================================ */

import { api } from "./api.js";
import { requireAuth, getCurrentUser, showToast, formatDate, spinnerHtml, emptyStateHtml } from "./common.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  const greetingEl = document.getElementById("welcomeName");
  if (greetingEl) greetingEl.textContent = user?.name?.split(" ")[0] || "there";

  const recentList = document.getElementById("recentMoviesList");
  const genreList = document.getElementById("genreDistributionList");
  if (recentList) recentList.innerHTML = spinnerHtml("Fetching your dashboard...");

  try {
    const movies = normalizeList(await api.getMovies());
    renderStats(movies);
    renderRecentMovies(movies);
    renderGenreDistribution(movies);
  } catch (err) {
    showToast(err.message || "Could not load dashboard data.", "error");
    if (recentList) {
      recentList.innerHTML = emptyStateHtml({
        icon: "fa-triangle-exclamation",
        title: "Could not load movies",
        text: err.message || "Check that the backend is running.",
      });
    }
  }
});

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content; // Spring Page response
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function renderStats(movies) {
  const total = movies.length;
  const topRated = movies.reduce((best, m) => ((m.rating || 0) > (best?.rating || 0) ? m : best), null);
  const trendingCount = movies.filter((m) => Number(m.rating) >= 7).length;
  const currentYear = new Date().getFullYear();
  const latestCount = movies.filter((m) => Number(m.releaseYear) >= currentYear - 1).length;

  setText("statTotalMovies", total);
  setText("statTopRated", topRated ? `${Number(topRated.rating).toFixed(1)} ★` : "—");
  setText("statTopRatedTitle", topRated ? topRated.title : "No movies yet");
  setText("statTrending", trendingCount);
  setText("statLatest", latestCount);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderRecentMovies(movies) {
  const container = document.getElementById("recentMoviesList");
  if (!container) return;

  if (!movies.length) {
    container.innerHTML = emptyStateHtml({
      icon: "fa-clapperboard",
      title: "No movies yet",
      text: "Movies added to the catalog will show up here.",
    });
    return;
  }

  const recent = [...movies]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6);

  container.innerHTML = recent
    .map(
      (m) => `
      <div class="recent-movie-row">
        <img src="${m.posterUrl || placeholderPoster()}" alt="${escapeAttr(m.title)}" onerror="this.src='${placeholderPoster()}'">
        <div class="flex-grow-1">
          <div class="rm-title">${escapeAttr(m.title || "Untitled")}</div>
          <div class="rm-meta">${escapeAttr(m.genre || "—")} • ${m.releaseYear || "—"}</div>
        </div>
        <div class="text-gold text-mono small">${m.rating ? Number(m.rating).toFixed(1) : "—"} ★</div>
      </div>`
    )
    .join("");
}

function renderGenreDistribution(movies) {
  const container = document.getElementById("genreDistributionList");
  if (!container) return;

  if (!movies.length) {
    container.innerHTML = `<p class="text-secondary small mb-0">No genre data available yet.</p>`;
    return;
  }

  const counts = {};
  movies.forEach((m) => {
    const genres = String(m.genre || "Unspecified").split(",").map((g) => g.trim());
    genres.forEach((g) => { counts[g] = (counts[g] || 0) + 1; });
  });

  const max = Math.max(...Object.values(counts));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  container.innerHTML = sorted
    .map(
      ([genre, count]) => `
      <div class="genre-bar-row">
        <div class="genre-bar-label"><span>${escapeAttr(genre)}</span><span>${count}</span></div>
        <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${(count / max) * 100}%"></div></div>
      </div>`
    )
    .join("");
}

function placeholderPoster() {
  return "https://placehold.co/100x140/181818/767676?text=No+Image";
}

function escapeAttr(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}
