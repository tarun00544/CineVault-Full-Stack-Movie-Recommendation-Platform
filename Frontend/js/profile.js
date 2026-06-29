/* ============================================================
   profile.js — Profile page logic
   No dedicated GET/PUT /profile endpoint is defined in the
   backend contract, so user info is read from the JWT + the
   locally cached signup/login details, and saved back to
   localStorage. Swap saveProfile() for a real API call once a
   backend profile endpoint is available.
   ============================================================ */

import { getToken, decodeToken } from "./api.js";
import { requireAuth, getCurrentUser, setCurrentUser, showToast, getInitials, logout, formatDate } from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  const token = getToken();
  const decoded = decodeToken(token);

  // header
  document.getElementById("profileAvatar").textContent = getInitials(user?.name);
  document.getElementById("profileName").textContent = user?.name || "User";
  document.getElementById("profileEmail").textContent = user?.email || "—";

  // form fields
  const form = document.getElementById("profileForm");
  form.querySelector("#name").value = user?.name || "";
  form.querySelector("#email").value = user?.email || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();

    if (!name) {
      showToast("Name cannot be empty.", "error");
      return;
    }

    setCurrentUser({ name, email });
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;
    document.getElementById("profileAvatar").textContent = getInitials(name);
    showToast("Profile updated.", "success");
  });

  // JWT token information panel
  const tokenPanel = document.getElementById("tokenInfo");
  if (tokenPanel) {
    if (decoded) {
      const exp = decoded.exp ? formatDate(new Date(decoded.exp * 1000).toISOString()) : "—";
      const iat = decoded.iat ? formatDate(new Date(decoded.iat * 1000).toISOString()) : "—";
      tokenPanel.innerHTML = `
        <li><span>Subject</span><span>${decoded.sub || "—"}</span></li>
        <li><span>Issued At</span><span>${iat}</span></li>
        <li><span>Expires</span><span>${exp}</span></li>
        <li><span>Token</span><span class="text-mono small">${token.slice(0, 18)}…</span></li>
      `;
    } else {
      tokenPanel.innerHTML = `<li><span>Token</span><span class="text-mono small">${token.slice(0, 18)}…</span></li>`;
    }
  }

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("copyTokenBtn")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(token);
      showToast("Token copied to clipboard.", "success");
    } catch (e) {
      showToast("Could not copy token.", "error");
    }
  });
});
