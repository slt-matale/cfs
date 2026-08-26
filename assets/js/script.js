const API_URL = API_BASE_URL;

let questions = [];
let currentQuestion = 0;
let answers = {};

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const inputArea = document.getElementById("inputArea");


async function loadQuestions() {

    try {

        const response =
            await fetch(API_URL + "/questions");

        if (!response.ok) {
            throw new Error("Could not load questions");
        }

        questions =
            await response.json();

        startChat();

    } catch (error) {

        console.error(error);

        addBotMessage(
            '<i data-lucide="x-circle" style="width:16px; height:16px; vertical-align:middle; margin-right:4px; color:#dc3545;"></i> Cannot connect to the Python server.'
        );

        addBotMessage(
            "Please make sure FastAPI is running on port 8000."
        );
    }
}


function startChat() {

    chatBox.innerHTML = "";

    currentQuestion = 0;

    answers = {};

    inputArea.style.display = "flex";

    userInput.value = "";

    addBotMessage(
        '<i data-lucide="hand" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;"></i> Hello! Welcome to SLTMobitel.'
    );

    addBotMessage(
        "I would like to know about your experience today. It will only take a minute."
    );

    setTimeout(() => {

        showQuestion();

    }, 600);
}



function showQuestion() {

    if (currentQuestion >= questions.length) {

        finishChat();

        return;
    }

    const question =
        questions[currentQuestion];

    addBotMessage(
        question.question
    );


    // Clear input
    userInput.value = "";


    if (question.key === "phone") {

        userInput.placeholder =
            "Enter 10-digit phone number (Optional)";

        userInput.type = "tel";

        userInput.maxLength = 10;

        userInput.focus();

        const skipButton =
            document.createElement("button");

        skipButton.className =
            "skip-button";

        skipButton.textContent =
            "Skip";

        skipButton.onclick =
            function () {

                addUserMessage("Skipped");

                saveAnswer("");

            };

        chatBox.appendChild(skipButton);

        chatBox.scrollTop =
            chatBox.scrollHeight;

        return;
    }


    if (question.key === "comment") {

        userInput.placeholder =
            "Type your comment...";

        userInput.type = "text";

        userInput.removeAttribute("maxLength");

        userInput.focus();

        return;
    }


    userInput.placeholder =
        "Type your answer...";

    userInput.type = "text";

    userInput.removeAttribute("maxLength");


    if (
        question.options &&
        question.options.length > 0
    ) {

        const optionsDiv =
            document.createElement("div");

        optionsDiv.className =
            "options";


        question.options.forEach(option => {

            const button =
                document.createElement("button");

            button.className =
                "option-button";

            button.textContent =
                option;


            button.onclick =
                function () {

                    selectOption(option);

                };


            optionsDiv.appendChild(button);

        });


        chatBox.appendChild(optionsDiv);

        chatBox.scrollTop =
            chatBox.scrollHeight;
    }
}


function selectOption(option) {

    addUserMessage(option);

    saveAnswer(option);
}


function sendAnswer() {

    const answer =
        userInput.value.trim();

    if (answer === "") {

        const question =
            questions[currentQuestion];

        if (
            question.key === "phone"
        ) {

            addUserMessage("Skipped");

            saveAnswer("");

            return;
        }

        if (
            question.key === "comment"
        ) {

            addUserMessage("No comment");

            saveAnswer("");

            return;
        }

        return;
    }

    const question =
        questions[currentQuestion];


    if (
        question.key === "phone"
    ) {

        const phone =
            answer.replace(/\s/g, "");

        if (!/^\d{10}$/.test(phone)) {

            addBotMessage(
                '<i data-lucide="alert-triangle" style="width:16px; height:16px; vertical-align:middle; margin-right:4px; color:#f0ad4e;"></i> Please enter a valid 10-digit phone number.'
            );

            return;
        }

        addUserMessage(phone);

        userInput.value = "";

        saveAnswer(phone);

        return;
    }
    addUserMessage(answer);

    userInput.value = "";

    saveAnswer(answer);
}


function saveAnswer(answer) {

    const question =
        questions[currentQuestion];


    answers[question.key] =
        answer;


    currentQuestion++;


    setTimeout(() => {

        showQuestion();

    }, 400);
}


function addBotMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "bot-message";

    div.innerHTML =
        message;

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    if (window.lucide) {
        lucide.createIcons();
    }
}


function addUserMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "user-message";

    div.innerHTML =
        message;

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    if (window.lucide) {
        lucide.createIcons();
    }
}

async function finishChat() {

    inputArea.style.display = "none";


    addBotMessage(
        '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;"></i> Saving your feedback...'
    );


    console.log(
        "Customer Answers:",
        answers
    );


    const feedbackData = {

        service:
            answers.service || null,

        phone:
            answers.phone || null,

        waiting:
            answers.waiting || null,

        staff:
            answers.staff || null,

        office:
            answers.office || null,

        parking:
            answers.parking || null,

        comment:
            answers.comment || null
    };


    console.log(
        "Sending to Python:",
        feedbackData
    );


    try {

        const response =
            await fetch(
                API_URL + "/feedback",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            feedbackData
                        )
                }
            );


        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Failed to save feedback"
            );
        }



        addBotMessage(
            '<i data-lucide="check-circle-2" style="width:16px; height:16px; vertical-align:middle; margin-right:4px; color:#198754;"></i> Thank you for your feedback!'
        );

        addBotMessage(
            'Your feedback has been successfully recorded. <i data-lucide="heart" style="width:16px; height:16px; vertical-align:middle; margin-left:4px; color:#dc3545; fill:#dc3545;"></i>'
        );


        setTimeout(() => {

            addBotMessage(
                '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;"></i> Starting a new feedback session...'
            );

        }, 1500);


        setTimeout(() => {

            startChat();

        }, 3000);


    } catch (error) {

        console.error(
            "Save error:",
            error
        );


        inputArea.style.display =
            "flex";


        addBotMessage(
            '<i data-lucide="x-circle" style="width:16px; height:16px; vertical-align:middle; margin-right:4px; color:#dc3545;"></i> Sorry, your feedback could not be saved.'
        );

        addBotMessage(
            "Please check that the Python server and Supabase are running."
        );
    }
}


userInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendAnswer();
        }

    }
);

loadQuestions();