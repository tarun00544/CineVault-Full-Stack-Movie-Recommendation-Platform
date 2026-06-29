 /* ============================================================
   auth.js
   Authentication Controller
   Login + Signup
============================================================ */
console.log("AUTH JS LOADED");
import { api, setToken, decodeToken } from "./api.js";

import {
    showToast,
    redirectIfAuthed,
    setCurrentUser
} from "./common.js";

/* ---------------- REGEX ---------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------------- DOM READY ---------------- */

document.addEventListener("DOMContentLoaded", () => {

    redirectIfAuthed("dashboard.html");

    wirePasswordToggles();

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        initLoginForm(loginForm);

    }

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {

        initSignupForm(signupForm);

    }

});

/* ---------------- PASSWORD TOGGLE ---------------- */

function wirePasswordToggles() {

    document.querySelectorAll(".toggle-password").forEach(btn => {

        btn.addEventListener("click", () => {

            const input = btn.parentElement.querySelector("input");

            if (!input) return;

            if (input.type === "password") {

                input.type = "text";

                btn.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            }

            else {

                input.type = "password";

                btn.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

            }

        });

    });

}

/* ---------------- BUTTON LOADING ---------------- */

function setButtonLoading(button, loading) {

    button.disabled = loading;

    button.classList.toggle("btn-loading", loading);

}

/* ---------------- LOGIN ---------------- */

function initLoginForm(form) {

    const email =
        form.querySelector("#email");

    const password =
        form.querySelector("#password");

    const rememberMe =
        form.querySelector("#rememberMe");

    const submitButton =
        form.querySelector("button[type='submit']");

    /* Remember Email */

    const remembered =
        localStorage.getItem("cv_remember_email");

    if (remembered) {

        email.value = remembered;

        if (rememberMe) {

            rememberMe.checked = true;

        }

    }

    /* Login */

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!EMAIL_RE.test(email.value.trim())) {

            showToast(
                "Please enter valid email",
                "error"
            );

            return;

        }

        if (password.value.trim().length < 6) {

            showToast(
                "Password must contain at least 6 characters",
                "error"
            );

            return;

        }

        setButtonLoading(submitButton, true);

        try {

            const data = await api.login({

                email: email.value.trim(),

                password: password.value

            });

            /* Save JWT */

            setToken(data.token);

            /* Decode JWT */

            const decoded =
                decodeToken(data.token);

            /* Save Current User */

            setCurrentUser({

                email: decoded?.sub || email.value.trim()

            });

            /* Remember Me */

            if (rememberMe?.checked) {

                localStorage.setItem(

                    "cv_remember_email",

                    email.value.trim()

                );

            }

            else {

                localStorage.removeItem(

                    "cv_remember_email"

                );

            }

            showToast(

                "Login Successful",

                "success"

            );

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        }

        catch (err) {

            showToast(

                err.message ||

                "Login Failed",

                "error"

            );

        }

        finally {

            setButtonLoading(

                submitButton,

                false

            );

        }

    });

}
/* ============================================================
   SIGNUP
============================================================ */

function initSignupForm(form) {

    const name =
        form.querySelector("#name");

    const email =
        form.querySelector("#email");

    const password =
        form.querySelector("#password");

    const confirmPassword =
        form.querySelector("#confirmPassword");

    const submitButton =
        form.querySelector("button[type='submit']");

    const strengthBar =
        document.getElementById("strengthBar");

    const strengthLabel =
        document.getElementById("strengthLabel");

    /* ---------------- Validation ---------------- */

    function validateName() {

        if (name.value.trim().length < 2) {

            showToast(
                "Enter your full name",
                "error"
            );

            return false;

        }

        return true;

    }

    function validateEmail() {

        if (!EMAIL_RE.test(email.value.trim())) {

            showToast(
                "Invalid email address",
                "error"
            );

            return false;

        }

        return true;

    }

    function passwordScore(pass) {

        let score = 0;

        if (pass.length >= 8) score++;

        if (/[A-Z]/.test(pass)) score++;

        if (/[0-9]/.test(pass)) score++;

        if (/[^A-Za-z0-9]/.test(pass)) score++;

        return score;

    }

    function updateStrength() {

        if (!strengthBar || !strengthLabel)
            return;

        const score =
            passwordScore(password.value);

        const colors = [

            "#dc3545",

            "#fd7e14",

            "#ffc107",

            "#20c997",

            "#198754"

        ];

        const labels = [

            "Very Weak",

            "Weak",

            "Fair",

            "Good",

            "Strong"

        ];

        strengthBar.style.width =
            (score * 25) + "%";

        strengthBar.style.background =
            colors[score];

        strengthLabel.innerText =
            labels[score];

    }

    function validatePassword() {

        const score =
            passwordScore(password.value);

        if (score < 3) {

            showToast(
                "Password is too weak",
                "error"
            );

            return false;

        }

        return true;

    }

    function validateConfirmPassword() {

        if (
            password.value !==
            confirmPassword.value
        ) {

            showToast(
                "Passwords do not match",
                "error"
            );

            return false;

        }

        return true;

    }

    /* ---------------- Events ---------------- */

    password.addEventListener(
        "input",
        updateStrength
    );

    /* ---------------- Submit ---------------- */

    form.addEventListener(
        "submit",

        async function (e) {

            e.preventDefault();

            if (
                !validateName() ||
                !validateEmail() ||
                !validatePassword() ||
                !validateConfirmPassword()
            ) {

                return;

            }

            setButtonLoading(
                submitButton,
                true
            );

            try {

                await api.signup({

                    name: name.value.trim(),

                    email: email.value.trim(),

                    password: password.value

                });

                showToast(

                    "Account Created Successfully",

                    "success"

                );

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);

            }

            catch (err) {

                showToast(

                    err.message ||

                    "Signup Failed",

                    "error"

                );

            }

            finally {

                setButtonLoading(

                    submitButton,

                    false

                );

            }

        }

    );

}