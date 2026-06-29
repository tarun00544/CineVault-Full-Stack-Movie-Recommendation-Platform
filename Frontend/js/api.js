 /* ============================================================
   api.js
   CineVault API Service
============================================================ */

export const BASE_URL = "http://localhost:8080";

/* ---------------- TOKEN ---------------- */

export function getToken() {
    return localStorage.getItem("token");
}

export function setToken(token) {
    localStorage.setItem("token", token);
}

export function clearToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("cv_user");
}

export function isLoggedIn() {
    return getToken() !== null;
}

/* ---------------- JWT Decode ---------------- */

export function decodeToken(token) {

    try {

        const payload = token.split(".")[1];

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));

    } catch {

        return null;

    }

}
 export function isTokenExpired(token) {

    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {

        return true;

    }

    return Date.now() >= decoded.exp * 1000;

}

/* ---------------- REQUEST ---------------- */

async function request(url, options = {}) {

    const headers = options.headers || {};

    const token = getToken();

    if (token) {

        headers["Authorization"] = "Bearer " + token;

    }

    if (!(options.body instanceof FormData)) {

        headers["Content-Type"] = "application/json";

    }

    const response = await fetch(BASE_URL + url, {

        ...options,

        headers

    });

    if (response.status === 401) {

        clearToken();

        window.location.href = "login.html";

        return;

    }

    if (!response.ok) {

         let message = "Something went wrong";

     try {

    const error = await response.json();

    message = error.message || error.error || message;

       }
         catch{

    message = await response.text();

         }

         throw new Error(message);

    }

    if (response.status === 204) {

        return null;

    }

    return response.json();

}

/* ---------------- API ---------------- */

export const api = {

    /* AUTH */

    signup(user) {

        return request("/auth/signup", {

            method: "POST",

            body: JSON.stringify(user)

        });

    },

    login(user) {

        return request("/auth/login", {

            method: "POST",

            body: JSON.stringify(user)

        });

    },

    /* MOVIES */

     getMovies() {
    return request("/api/movies");
},

getMovie(id) {
    return request(`/api/movies/${id}`);
},
addMovie(movie) {
    return request("/api/movies", {
        method: "POST",
        body: JSON.stringify(movie)
    });
}
 ,

deleteMovie(id) {
    return request(`/api/movies/${id}`, {
        method: "DELETE"
    });
}

};