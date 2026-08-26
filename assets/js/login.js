console.log("LOGIN PAGE LOADED");


const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    function(event) {

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


        if (
            username === "admin" &&
            password === "admin123"
        ) {

            console.log(
                "LOGIN SUCCESS"
            );



            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            button.disabled = true;

            button.innerHTML =
                "⏳ Opening Dashboard...";



            window.location.href =
                "dashboard.html";


        } else {

            console.log(
                "LOGIN FAILED"
            );


            error.innerHTML =
                "❌ Invalid username or password.";

            error.style.display =
                "block";

        }

    }
);