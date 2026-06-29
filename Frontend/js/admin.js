/* ============================================================
   admin.js
   CineVault Admin Panel
============================================================ */

import { api } from "./api.js";
import { showToast } from "./common.js";

let movies = [];

const tableBody = document.getElementById("movieTableBody");
const totalMovies = document.getElementById("totalMovies");
const topRated = document.getElementById("topRated");
const languageCount = document.getElementById("languageCount");
const searchInput = document.getElementById("searchMovie");

document.addEventListener("DOMContentLoaded", () => {

    loadMovies();

});

/* ===========================
   LOAD MOVIES
=========================== */

async function loadMovies() {

    try {

        const result = await api.getMovies();

        if (Array.isArray(result)) {

            movies = result;

        }

        else if (Array.isArray(result.content)) {

            movies = result.content;

        }

        else {

            movies = [];

        }

        renderStats();

        renderTable(movies);

    }

    catch (err) {

        console.error(err);

        showToast("Unable to load movies", "error");

    }

}

/* ===========================
   STATS
=========================== */

function renderStats() {

    totalMovies.textContent = movies.length;

    if (movies.length === 0) {

        topRated.textContent = "--";

        languageCount.textContent = 0;

        return;

    }

    let best = movies[0];

    movies.forEach(movie => {

        if ((movie.rating || 0) > (best.rating || 0)) {

            best = movie;

        }

    });

    topRated.textContent = best.rating;

    const langs = new Set();

    movies.forEach(movie => {

        if (movie.language) {

            langs.add(movie.language);

        }

    });

    languageCount.textContent = langs.size;

}

/* ===========================
   TABLE
=========================== */

function renderTable(list) {

    tableBody.innerHTML = "";

    if (list.length === 0) {

        tableBody.innerHTML = `

        <tr>

            <td colspan="7" class="text-center">

                No Movies Found

            </td>

        </tr>

        `;

        return;

    }

    list.forEach((movie, index) => {

        tableBody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${movie.title}</td>

            <td>${movie.genre}</td>

            <td>${movie.language}</td>

            <td>${movie.releaseYear}</td>

            <td>${movie.rating}</td>

            <td>

                <button

                    class="btn btn-warning btn-sm edit-btn"

                    data-id="${movie.id}">

                    Edit

                </button>

                <button

                    class="btn btn-danger btn-sm delete-btn"

                    data-id="${movie.id}">

                    Delete

                </button>

            </td>

        </tr>

        `; }); attachEvents(); }
/* ===========================
   SEARCH
=========================== */

searchInput.addEventListener("input", () => {

    const text = searchInput.value.toLowerCase();

    const filtered = movies.filter(movie =>

        movie.title.toLowerCase().includes(text)

    );

    renderTable(filtered);

});

/* ===========================
   EVENTS
=========================== */

function attachEvents() {

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.id;

            window.location.href =
                `movie.html?id=${id}`;

        });

    });

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const id = btn.dataset.id;

            const ok = confirm(
                "Delete this movie?"
            );

            if (!ok) return;

            try {

                await api.deleteMovie(id);

                showToast(
                    "Movie Deleted Successfully",
                    "success"
                );

                await loadMovies();
                 

            } 

            catch (err) {

                console.error(err);

                showToast(
                    err.message ||
                    "Delete Failed",
                    "error"
                );

            }

        });

    });

}

/* ===========================
   LOGOUT
=========================== */

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", () => {

    localStorage.removeItem("token");

    localStorage.removeItem("cv_user");

    localStorage.removeItem("email");

    window.location.href = "login.html";

});

