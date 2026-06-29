/* ============================================================
   movies.js — Movies listing page + Movie Details page
   Both pages share this module; the active page is detected by
   which container elements are present in the DOM.
   ============================================================ */

import { api } from "./api.js";
import {
  showToast,
  debounce,
  formatRuntime,
  formatDate,
  escapeHtml,
  placeholderPoster,
  renderMovieCardHtml,
  wireMovieCardEvents,
  isInWishlist,
  toggleWishlist,
  spinnerHtml,
  skeletonCardsHtml,
  emptyStateHtml,
} from "./common.js";

const PAGE_SIZE = 12;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("moviesGrid")) initMoviesPage();
  if (document.getElementById("detailsRoot")) initMovieDetailsPage();
});

/* ===================== Movies listing page ===================== */

let allMovies = [];
let filteredMovies = [];
let currentPage = 1;

async function initMoviesPage() {
  const grid = document.getElementById("moviesGrid");
  const searchInput = document.getElementById("movieSearch");
  const genreSelect = document.getElementById("genreFilter");
  const languageSelect = document.getElementById("languageFilter");
  const sortSelect = document.getElementById("sortBy");
  const clearBtn = document.getElementById("clearFilters");
  const resultsCount = document.getElementById("resultsCount");
  const paginationEl = document.getElementById("pagination");

  grid.innerHTML = skeletonCardsHtml(8);
  grid.className = "movies-grid";

  // pre-select genre/sort from a URL query string, e.g. movies.html?genre=Action
  const params = new URLSearchParams(window.location.search);
  const presetGenre = params.get("genre");
  const presetSearch = params.get("q");

  try {
    const movies = normalizeList(await api.getMovies());
    allMovies = movies;
    populateGenreOptions(genreSelect, movies);
    populateLanguageOptions(languageSelect, movies);

    if (presetGenre && genreSelect) genreSelect.value = presetGenre;
    if (presetSearch && searchInput) searchInput.value = presetSearch;

    applyFiltersAndRender();
  } catch (err) {
    grid.innerHTML = emptyStateHtml({
      icon: "fa-triangle-exclamation",
      title: "Could not load movies",
      text: err.message || "Check that the backend is running at http://localhost:8080.",
    });
    showToast(err.message || "Failed to load movies.", "error");
    return;
  }

  const rerun = debounce(() => { currentPage = 1; applyFiltersAndRender(); }, 300);
  searchInput?.addEventListener("input", rerun);
  genreSelect?.addEventListener("change", () => { currentPage = 1; applyFiltersAndRender(); });
  languageSelect?.addEventListener("change", () => { currentPage = 1; applyFiltersAndRender(); });
  sortSelect?.addEventListener("change", () => { currentPage = 1; applyFiltersAndRender(); });
  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    genreSelect.value = "";
    languageSelect.value = "";
    sortSelect.value = "rating-desc";
    currentPage = 1;
    applyFiltersAndRender();
  });

  function applyFiltersAndRender() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const genre = genreSelect?.value || "";
    const language = languageSelect?.value || "";
    const sort = sortSelect?.value || "rating-desc";

    filteredMovies = allMovies.filter((m) => {
      const matchesQuery = !query || (m.title || "").toLowerCase().includes(query);
      const matchesGenre = !genre || (m.genre || "").toLowerCase().includes(genre.toLowerCase());
      const matchesLanguage = !language || (m.language || "").toLowerCase() === language.toLowerCase();
      return matchesQuery && matchesGenre && matchesLanguage;
    });

    sortMovies(filteredMovies, sort);

    if (resultsCount) {
      resultsCount.textContent = `${filteredMovies.length} ${filteredMovies.length === 1 ? "result" : "results"}`;
    }

    renderGrid(grid);
    renderPagination(paginationEl, filteredMovies.length);
  }

  function renderGrid(target) {
    if (!filteredMovies.length) {
      target.className = "";
      target.innerHTML = emptyStateHtml({
        icon: "fa-magnifying-glass",
        title: "No movies match your filters",
        text: "Try adjusting your search, genre, or language filters.",
      });
      return;
    }

    target.className = "movies-grid";
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredMovies.slice(start, start + PAGE_SIZE);
    target.innerHTML = pageItems.map(renderMovieCardHtml).join("");
    wireMovieCardEvents(target);
  }
}

function sortMovies(list, sort) {
  switch (sort) {
    case "rating-desc": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case "rating-asc": list.sort((a, b) => (a.rating || 0) - (b.rating || 0)); break;
    case "year-desc": list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0)); break;
    case "year-asc": list.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0)); break;
    case "title-asc": list.sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
    default: break;
  }
}

function renderPagination(container, totalItems) {
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (totalPages <= 1) { container.innerHTML = ""; return; }

  let html = `<button data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button data-page="${i}" class="${i === currentPage ? "active" : ""}">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<button disabled>…</button>`;
    }
  }
  html += `<button data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>`;
  container.innerHTML = html;

  container.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (!page || page < 1 || page > totalPages) return;
      currentPage = page;
      document.getElementById("moviesGrid").scrollIntoView({ behavior: "smooth", block: "start" });
      const grid = document.getElementById("moviesGrid");
      grid.innerHTML = filteredMovies
        .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        .map(renderMovieCardHtml)
        .join("");
      wireMovieCardEvents(grid);
      renderPagination(container, filteredMovies.length);
    });
  });
}

function populateGenreOptions(select, movies) {
  if (!select) return;
  const genres = new Set();
  movies.forEach((m) => (m.genre || "").split(",").forEach((g) => g.trim() && genres.add(g.trim())));
  select.innerHTML = `<option value="">All Genres</option>` +
    [...genres].sort().map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
}

function populateLanguageOptions(select, movies) {
  if (!select) return;
  const languages = new Set(movies.map((m) => m.language).filter(Boolean));
  select.innerHTML = `<option value="">All Languages</option>` +
    [...languages].sort().map((l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
}

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

/* ===================== Movie details page ===================== */

async function initMovieDetailsPage() {
  const root = document.getElementById("detailsRoot");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    root.innerHTML = emptyStateHtml({
      icon: "fa-triangle-exclamation",
      title: "No movie selected",
      text: "Go back to the movies page and choose a title to view.",
      actionHtml: `<a href="movies.html" class="btn-cv-primary mt-3 d-inline-block">Browse Movies</a>`,
    });
    return;
  }

  root.innerHTML = spinnerHtml("Fetching movie details...");

  try {
    const movie = await api.getMovie(id);
    renderMovieDetails(movie);
  } catch (err) {
    root.innerHTML = emptyStateHtml({
      icon: "fa-triangle-exclamation",
      title: "Could not load this movie",
      text: err.message || "It may have been removed, or the backend is unreachable.",
      actionHtml: `<a href="movies.html" class="btn-cv-primary mt-3 d-inline-block">Browse Movies</a>`,
    });
    showToast(err.message || "Failed to load movie.", "error");
  }
}

function renderMovieDetails(movie) {
  document.title = `${movie.title || "Movie"} — CineVault`;

  const backdrop = movie.backdropUrl || movie.posterUrl || placeholderPoster();
  const poster = movie.posterUrl || placeholderPoster();
  const castList = parseList(movie.cast);
  const active = isInWishlist(movie.id);

  const root = document.getElementById("detailsRoot");
  root.innerHTML = `
    <div class="details-hero">
      <div class="backdrop-img" style="background-image:url('${backdrop}')"></div>
      <div class="backdrop-fade"></div>
      <div class="details-body">
        <div class="details-poster">
          <img src="${poster}" alt="${escapeHtml(movie.title)} poster" onerror="this.src='${placeholderPoster()}'">
        </div>
        <div class="details-info">
          <h1>${escapeHtml(movie.title || "Untitled")}</h1>
          <div class="details-meta-row">
            ${movie.rating != null ? `<span class="rating-chip"><i class="fa-solid fa-star"></i> ${Number(movie.rating).toFixed(1)} / 10</span>` : ""}
            ${movie.releaseYear ? `<span>${escapeHtml(movie.releaseYear)}</span>` : ""}
            ${movie.duration ? `<span>${formatRuntime(movie.duration)}</span>` : ""}
            ${movie.language ? `<span>${escapeHtml(movie.language)}</span>` : ""}
          </div>
          <div class="details-genres">
            ${(movie.genre || "").split(",").filter((g) => g.trim()).map((g) => `<span class="badge-genre">${escapeHtml(g.trim())}</span>`).join("")}
          </div>
          <p class="details-description">${escapeHtml(movie.description || "No description available for this title yet.")}</p>
          <div class="details-actions">
            ${movie.trailerUrl ? `<button class="btn-cv-primary" id="trailerBtn"><i class="fa-solid fa-play me-2"></i>Watch Trailer</button>` : ""}
            <button class="btn-cv-outline" id="wishlistBtn" data-movie-id="${movie.id}">
              <i class="fa-solid fa-heart me-2" style="color:${active ? "var(--accent)" : "inherit"}"></i>
              <span>${active ? "In Your Wishlist" : "Add To Wishlist"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="details-sections">
      <div class="row g-4">
        <div class="col-lg-8">
          <h3 class="mb-3">Cast</h3>
          ${castList.length
            ? `<div class="crew-grid">${castList.map((name) => `
                <div class="crew-card">
                  <div class="crew-avatar"><i class="fa-solid fa-user"></i></div>
                  <div class="crew-name">${escapeHtml(name)}</div>
                </div>`).join("")}</div>`
            : `<p class="text-secondary">Cast information is not available for this title.</p>`}
        </div>
        <div class="col-lg-4">
          <div class="dash-panel">
            <h5 class="dash-panel-title">Details</h5>
            <ul class="info-list">
              <li><span>Director</span><span>${escapeHtml(movie.director || "—")}</span></li>
              <li><span>Language</span><span>${escapeHtml(movie.language || "—")}</span></li>
              <li><span>Release Year</span><span>${escapeHtml(movie.releaseYear || "—")}</span></li>
              <li><span>Duration</span><span>${formatRuntime(movie.duration)}</span></li>
              <li><span>Rating</span><span>${movie.rating != null ? Number(movie.rating).toFixed(1) : "—"}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="trailerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${escapeHtml(movie.title)} — Trailer</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="trailer-frame-wrap">
              <iframe id="trailerIframe" src="" title="Trailer" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("wishlistBtn")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const added = toggleWishlist(movie.id);
    btn.querySelector("i").style.color = added ? "var(--accent)" : "inherit";
    btn.querySelector("span").textContent = added ? "In Your Wishlist" : "Add To Wishlist";
    showToast(added ? "Added to your wishlist." : "Removed from your wishlist.", "success", 2200);
  });

  const trailerBtn = document.getElementById("trailerBtn");
  if (trailerBtn) {
    trailerBtn.addEventListener("click", () => {
      const iframe = document.getElementById("trailerIframe");
      iframe.src = toEmbedUrl(movie.trailerUrl);
      const modal = new window.bootstrap.Modal(document.getElementById("trailerModal"));
      modal.show();
      document.getElementById("trailerModal").addEventListener("hidden.bs.modal", () => { iframe.src = ""; }, { once: true });
    });
  }
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
}

function toEmbedUrl(url) {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  return url;
}
