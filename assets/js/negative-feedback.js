const API_URL = API_BASE_URL;

// --- Auth (same pattern as dashboard.js) -----------------------------

function getAdminToken() {
    return sessionStorage.getItem("adminToken");
}

function requireLoginOrRedirect() {
    if (!getAdminToken()) {
        window.location.replace("login.html");
        return false;
    }
    return true;
}

function authHeaders() {
    return {
        "Authorization": "Bearer " + getAdminToken()
    };
}

function handleAuthFailure(response) {
    if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        window.location.replace("login.html");
        return true;
    }
    return false;
}

function logout() {

    localStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminToken");

    window.location.replace("../index.html");
}


// --- Date range state --------------------------------------------------

let currentStartDate = "";
let currentEndDate = "";

// Cache of AI suggestions already generated this session, keyed by
// feedback row id, so re-clicking an item doesn't re-call Gemini.
const suggestionCache = {};

let negativeItems = [];
let selectedItemId = null;


async function loadDateBounds() {

    try {

        const response = await fetch(
            API_URL + "/feedback-date-range",
            { headers: authHeaders() }
        );

        if (handleAuthFailure(response)) {
            return;
        }

        if (!response.ok) {
            return;
        }

        const bounds = await response.json();

        const startInput = document.getElementById("startDate");
        const endInput = document.getElementById("endDate");

        if (startInput && endInput) {
            startInput.min = bounds.earliest_date;
            startInput.max = bounds.latest_date;
            endInput.min = bounds.earliest_date;
            endInput.max = bounds.latest_date;
        }

    } catch (err) {

        console.log("Could not load date bounds:", err);

    }

}


function updateDateFilterStatus() {

    const status = document.getElementById("dateFilterStatus");

    if (!status) {
        return;
    }

    if (!currentStartDate && !currentEndDate) {
        status.textContent = "Showing all-time data";
    } else {
        status.textContent =
            "Showing " + currentStartDate + " to " + currentEndDate;
    }

}


function buildQueryString() {

    const params = new URLSearchParams();

    if (currentStartDate) {
        params.set("start_date", currentStartDate);
    }

    if (currentEndDate) {
        params.set("end_date", currentEndDate);
    }

    return params.toString() ? "?" + params.toString() : "";
}


function showError(message) {

    const el = document.getElementById("errorMessage");

    if (!el) {
        return;
    }

    el.innerHTML =
        '<div class="neg-error">' + message + "</div>";
}


function clearError() {

    const el = document.getElementById("errorMessage");

    if (el) {
        el.innerHTML = "";
    }

}


// --- Loading the negative feedback list --------------------------------

async function loadNegativeFeedback() {

    const listEl = document.getElementById("negativeList");
    const countEl = document.getElementById("negCount");

    listEl.innerHTML = '<p class="neg-empty-hint">Loading...</p>';

    clearError();

    try {

        const response = await fetch(
            API_URL + "/negative-feedback" + buildQueryString(),
            { headers: authHeaders() }
        );

        if (handleAuthFailure(response)) {
            return;
        }

        if (!response.ok) {
            throw new Error("Server returned HTTP " + response.status);
        }

        const data = await response.json();

        negativeItems = data.feedback || [];
        countEl.textContent = data.count ?? negativeItems.length;

        renderNegativeList();

    } catch (err) {

        console.log("Failed to load negative feedback:", err);

        listEl.innerHTML = "";
        showError(
            "Unable to load negative feedback. Make sure the backend " +
            "is running at " + API_BASE_URL
        );

    }

}


function renderNegativeList() {

    const listEl = document.getElementById("negativeList");

    if (!negativeItems.length) {
        listEl.innerHTML =
            '<p class="neg-empty-hint">No negative feedback found for ' +
            "the selected period. 🎉</p>";
        return;
    }

    listEl.innerHTML = "";

    negativeItems.forEach((item) => {

        const card = document.createElement("div");

        card.className =
            "neg-item" +
            (item.id === selectedItemId ? " selected" : "");

        const dateLabel = item.created_at
            ? new Date(item.created_at).toLocaleString()
            : "";

        const tags = [
            item.service,
            item.waiting,
            item.staff,
            item.office,
            item.parking
        ].filter(Boolean);

        const tagsHtml = tags
            .map((t) => '<span class="neg-item-tag">' + escapeHtml(t) + "</span>")
            .join("");

        const commentText = item.comment
            ? escapeHtml(item.comment)
            : "<em>(no comment left)</em>";

        card.innerHTML =
            '<div class="neg-item-date">' + escapeHtml(dateLabel) + "</div>" +
            '<div class="neg-item-tags">' + tagsHtml + "</div>" +
            '<div class="neg-item-comment">' + commentText + "</div>";

        card.addEventListener("click", () => selectItem(item));

        listEl.appendChild(card);

    });

}


function escapeHtml(str) {

    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;

}


// --- Per-item AI suggestion (generated on demand) -----------------------

async function selectItem(item) {

    selectedItemId = item.id;

    renderNegativeList();

    const panel = document.getElementById("suggestionContent");

    const previewHtml =
        '<div class="neg-selected-preview">' +
        escapeHtml(item.comment || "(no comment left)") +
        "</div>";

    if (suggestionCache[item.id]) {

        panel.innerHTML =
            previewHtml +
            '<div class="neg-suggestion-text">' +
            escapeHtml(suggestionCache[item.id]) +
            "</div>";

        return;

    }

    panel.innerHTML =
        previewHtml +
        '<div class="neg-loading">⏳ Generating suggestion...</div>';

    try {

        const response = await fetch(
            API_URL + "/negative-feedback/improve",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify({
                    service: item.service,
                    phone: item.phone,
                    waiting: item.waiting,
                    staff: item.staff,
                    office: item.office,
                    parking: item.parking,
                    comment: item.comment
                })
            }
        );

        if (handleAuthFailure(response)) {
            return;
        }

        if (!response.ok) {

            const errData = await response.json().catch(() => ({}));

            throw new Error(
                errData.detail || "Server returned HTTP " + response.status
            );

        }

        const data = await response.json();

        suggestionCache[item.id] = data.suggestion;

        // Guard against the admin clicking a different item while this
        // request was still in flight.
        if (selectedItemId !== item.id) {
            return;
        }

        panel.innerHTML =
            previewHtml +
            '<div class="neg-suggestion-text">' +
            escapeHtml(data.suggestion) +
            "</div>";

    } catch (err) {

        console.log("Failed to generate suggestion:", err);

        if (selectedItemId !== item.id) {
            return;
        }

        panel.innerHTML =
            previewHtml +
            '<div class="neg-error">Could not generate a suggestion: ' +
            escapeHtml(err.message) +
            "</div>";

    }

}


// --- Overall AI summary --------------------------------------------------

async function generateOverallSummary() {

    const btn = document.getElementById("generateSummaryBtn");
    const content = document.getElementById("summaryContent");

    const originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "⏳ Generating...";

    content.innerHTML =
        '<div class="neg-loading">⏳ Analyzing negative feedback for this period...</div>';

    try {

        const response = await fetch(
            API_URL + "/negative-feedback/summary" + buildQueryString(),
            { headers: authHeaders() }
        );

        if (handleAuthFailure(response)) {
            return;
        }

        if (!response.ok) {

            const errData = await response.json().catch(() => ({}));

            throw new Error(
                errData.detail || "Server returned HTTP " + response.status
            );

        }

        const data = await response.json();

        content.innerHTML =
            '<div class="neg-suggestion-text">' +
            escapeHtml(data.summary) +
            "</div>";

    } catch (err) {

        console.log("Failed to generate summary:", err);

        content.innerHTML =
            '<div class="neg-error">Could not generate a summary: ' +
            escapeHtml(err.message) +
            "</div>";

    } finally {

        btn.disabled = false;
        btn.innerHTML = originalLabel;

    }

}


// --- Init ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    if (!requireLoginOrRedirect()) {
        return;
    }

    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    const applyBtn = document.getElementById("applyDateFilter");
    const todayBtn = document.getElementById("filterToday");
    const allTimeBtn = document.getElementById("filterAllTime");
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");
    const summaryBtn = document.getElementById("generateSummaryBtn");

    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            currentStartDate = startInput.value || "";
            currentEndDate = endInput.value || "";
            updateDateFilterStatus();
            selectedItemId = null;
            loadNegativeFeedback();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            const today = new Date().toISOString().slice(0, 10);
            startInput.value = today;
            endInput.value = today;
            currentStartDate = today;
            currentEndDate = today;
            updateDateFilterStatus();
            selectedItemId = null;
            loadNegativeFeedback();
        });
    }

    if (allTimeBtn) {
        allTimeBtn.addEventListener("click", () => {
            startInput.value = "";
            endInput.value = "";
            currentStartDate = "";
            currentEndDate = "";
            updateDateFilterStatus();
            selectedItemId = null;
            loadNegativeFeedback();
        });
    }

    if (summaryBtn) {
        summaryBtn.addEventListener("click", generateOverallSummary);
    }

    updateDateFilterStatus();
    loadDateBounds();
    loadNegativeFeedback();

});
