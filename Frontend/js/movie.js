 /* ============================================================
   movie.js
   CineVault - Add / Edit Movie
============================================================ */

import { api } from "./api.js";
import { showToast } from "./common.js";

const form = document.getElementById("movieForm");
const pageTitle = document.getElementById("pageTitle");
const saveBtn = document.getElementById("saveBtn");

const posterInput = document.getElementById("posterFile");
const posterPreview = document.getElementById("posterPreview");

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

/* ===========================================
   INITIALIZE
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (movieId) {

        pageTitle.textContent = "Edit Movie";

        saveBtn.innerHTML =
            '<i class="fa-solid fa-pen me-2"></i>Update Movie';

        loadMovie(movieId);

    }

});

/* ===========================================
   LIVE POSTER PREVIEW
=========================================== */

 posterInput?.addEventListener("change", () => {

    const file = posterInput.files[0];

    if (file) {

        posterPreview.src = URL.createObjectURL(file);

    } else {

        posterPreview.src =
            "https://placehold.co/250x350?text=Poster";

    }

});

/* ===========================================
   LOAD MOVIE
=========================================== */

async function loadMovie(id) {

    try {

        const movie = await api.getMovie(id);

        document.getElementById("title").value =
            movie.title || "";

        document.getElementById("genre").value =
            movie.genre || "";

        document.getElementById("language").value =
            movie.language || "";

        document.getElementById("releaseYear").value =
            movie.releaseYear || "";

        document.getElementById("duration").value =
            movie.duration || "";

        document.getElementById("rating").value =
            movie.rating || "";

        document.getElementById("director").value =
            movie.director || "";

        document.getElementById("cast").value =
            Array.isArray(movie.cast)
                ? movie.cast.join(", ")
                : (movie.cast || "");

        document.getElementById("description").value =
            movie.description || "";

         

        document.getElementById("trailerUrl").value =
            movie.trailerUrl || "";
         
            if (movie.posterUrl) {
            posterPreview.src = movie.posterUrl;
              }

           
    }

    catch (err) {

        console.error(err);

        showToast("Unable to load movie", "error");

    }

}

/* ===========================================
   SAVE MOVIE
=========================================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();
 
const movie = {
    title: document.getElementById("title").value,
    genre: document.getElementById("genre").value,
    language: document.getElementById("language").value,
    releaseYear: Number(document.getElementById("releaseYear").value),
    duration: Number(document.getElementById("duration").value),
    rating: Number(document.getElementById("rating").value),
    director: document.getElementById("director").value,
    cast: document.getElementById("cast").value.split(","),
    description: document.getElementById("description").value,
    trailerUrl: document.getElementById("trailerUrl").value,
    posterUrl: document.getElementById("posterUrl").value
};
    try {

        if(movieId){

    showToast("Edit poster upload will be added next","info");

}else{
   await api.addMovie(movie);

}

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 1200);

    }

    catch (err) {

        console.error(err);

        showToast(
            err.message || "Operation Failed",
            "error"
        );

    }

});


