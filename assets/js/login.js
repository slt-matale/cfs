console.log("LOGIN PAGE LOADED");


const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        console.log("LOGIN BUTTON CLICKED");


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const error =
            document
                .getElementById("errorMessage");


        const button =
            document
                .getElementById("loginBtn");



        error.style.display = "none";

        button.disabled = true;
        const originalLabel = button.innerHTML;
        button.innerHTML = "⏳ Signing in...";

        try {

            // The backend is the only thing that decides whether these
            // credentials are correct - nothing is checked here in the
            // browser. On success it hands back a one-time token that
            // has to be sent along with every admin request afterward.
            const response = await fetch(
                API_BASE_URL + "/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                }
            );

            if (!response.ok) {
                throw new Error("Invalid username or password.");
            }

            const data = await response.json();

            console.log("LOGIN SUCCESS");

            // sessionStorage clears itself when the tab closes, which is
            // safer for an admin session than localStorage (which would
            // otherwise persist indefinitely on a shared computer).
            sessionStorage.setItem("adminToken", data.token);

            button.innerHTML = "⏳ Opening Dashboard...";

            window.location.href = "dashboard.html";

        } catch (err) {

            console.log("LOGIN FAILED", err);

            error.innerHTML =
                "❌ Invalid username or password.";

            error.style.display = "block";

            button.disabled = false;
            button.innerHTML = originalLabel;
        }

    }
);
