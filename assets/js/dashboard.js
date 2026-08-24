const API_URL = API_BASE_URL;


let dashboardData = {};

let charts = {};

function safe(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value);

}

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        safe(value);

    return div.innerHTML;

}

function numberValue(value) {

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}

function percentage(value, total) {

    value =
        numberValue(value);

    total =
        numberValue(total);

    if (total <= 0) {

        return 0;

    }

    return Math.round(
        (value / total) * 1000
    ) / 10;

}

async function loadDashboard() {

    try {

        const response =
            await fetch(
                API_URL +
                "/dashboard-data",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Dashboard API returned HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Dashboard data:",
            data
        );


        dashboardData =
            data || {};


        updateDashboard();


        hideError();

    }

    catch(error) {

        console.error(
            "Dashboard Error:",
            error
        );


        showError(
            "Unable to load dashboard data. " +
            "Make sure the backend is running at " +
            API_BASE_URL
        );

    }

}

function updateDashboard() {

    const sentiment =
        dashboardData.sentiment || {};


    const total =
        numberValue(
            dashboardData.total_feedback
        );


    const positive =
        numberValue(
            sentiment.positive
        );


    const neutral =
        numberValue(
            sentiment.neutral
        );


    const negative =
        numberValue(
            sentiment.negative
        );


    const positivePercent =
        percentage(
            positive,
            total
        );


    const neutralPercent =
        percentage(
            neutral,
            total
        );


    const negativePercent =
        percentage(
            negative,
            total
        );


    document.getElementById(
        "totalFeedback"
    ).textContent =
        total;


    document.getElementById(
        "positiveFeedback"
    ).textContent =
        positive;


    document.getElementById(
        "neutralFeedback"
    ).textContent =
        neutral;


    document.getElementById(
        "negativeFeedback"
    ).textContent =
        negative;


    document.getElementById(
        "positivePercent"
    ).textContent =
        positivePercent +
        "% of total";


    document.getElementById(
        "neutralPercent"
    ).textContent =
        neutralPercent +
        "% of total";


    document.getElementById(
        "negativePercent"
    ).textContent =
        negativePercent +
        "% of total";

    updateAIReport(
        total,
        positive,
        neutral,
        negative,
        positivePercent,
        neutralPercent,
        negativePercent
    );

    createSentimentChart(
        positive,
        neutral,
        negative
    );


    createBarChart(
        "serviceChart",
        dashboardData.service || {},
        "Service"
    );


    createBarChart(
        "waitingChart",
        dashboardData.waiting || {},
        "Waiting"
    );


    createBarChart(
        "staffChart",
        dashboardData.staff || {},
        "Staff"
    );


    createBarChart(
        "officeChart",
        dashboardData.office || {},
        "Office"
    );


    createWeeklyChart(
        dashboardData.weekly || {}
    );


    displayComments(
        dashboardData.feedback || []
    );
    displayFeedbackTable(
        dashboardData.feedback || []
    );

}

function updateAIReport(
    total,
    positive,
    neutral,
    negative,
    positivePercent,
    neutralPercent,
    negativePercent
) {

    document.getElementById(
        "reportDate"
    ).textContent =
        "Report Generated: " +
        new Date().toLocaleString();




    document.getElementById(
        "overviewText"
    ).innerHTML = `

        <strong>Total Feedback:</strong>
        ${total}
        &nbsp;&nbsp; | &nbsp;&nbsp;

        <strong>Positive:</strong>
        ${positive}
        &nbsp;&nbsp; | &nbsp;&nbsp;

        <strong>Neutral:</strong>
        ${neutral}
        &nbsp;&nbsp; | &nbsp;&nbsp;

        <strong>Negative:</strong>
        ${negative}

    `;


    document.getElementById(
        "sentimentPercentages"
    ).innerHTML = `

        ${sentimentRow(
            "Positive",
            positivePercent,
            "progress-positive"
        )}

        ${sentimentRow(
            "Neutral",
            neutralPercent,
            "progress-neutral"
        )}

        ${sentimentRow(
            "Negative",
            negativePercent,
            "progress-negative"
        )}

    `;

    const service =
        dashboardData.service || {};


    document.getElementById(
        "serviceSummary"
    ).innerHTML =
        createSummaryList(
            service
        );


    const waiting =
        dashboardData.waiting || {};

    const staff =
        dashboardData.staff || {};

    const office =
        dashboardData.office || {};


    document.getElementById(
        "ratingSummary"
    ).innerHTML = `

        <strong>Waiting Time:</strong><br>

        ${createInlineSummary(waiting)}

        <br><br>

        <strong>Staff:</strong><br>

        ${createInlineSummary(staff)}

        <br><br>

        <strong>Office Environment:</strong><br>

        ${createInlineSummary(office)}

    `;


    let overall;

    if (
        positivePercent >= 60
    ) {

        overall =
            "Overall customer feedback is positive. " +
            "The majority of customers reported satisfactory " +
            "experiences. Management should continue maintaining " +
            "the strengths identified by customers while addressing " +
            "the negative feedback.";

    }

    else if (
        positivePercent >= 40
    ) {

        overall =
            "Overall customer feedback is mixed but generally satisfactory. " +
            "Positive experiences are present, while neutral and negative " +
            "feedback indicates areas where customer service can be improved.";

    }

    else {

        overall =
            "Overall customer feedback indicates that improvement is required. " +
            "Management should review the negative and neutral feedback " +
            "and take appropriate corrective actions.";

    }


    document.getElementById(
        "overallSummary"
    ).textContent =
        overall;




    const findings = [];


    if (
        positive > 0
    ) {

        findings.push(
            positive +
            " customers provided positive feedback (" +
            positivePercent +
            "%)."
        );

    }


    if (
        negative > 0
    ) {

        findings.push(
            negative +
            " customers provided negative feedback (" +
            negativePercent +
            "%) and should be reviewed."
        );

    }


    if (
        neutral > 0
    ) {

        findings.push(
            neutral +
            " customers provided neutral feedback (" +
            neutralPercent +
            "%)."
        );

    }


    const worstStaff =
        getLowestCategory(
            staff
        );


    if (
        worstStaff
    ) {

        findings.push(
            "Staff rating area requiring attention: " +
            worstStaff.key +
            " (" +
            worstStaff.value +
            ")."
        );

    }


    const worstWaiting =
        getLowestCategory(
            waiting
        );


    if (
        worstWaiting
    ) {

        findings.push(
            "Waiting-time rating requiring attention: " +
            worstWaiting.key +
            " (" +
            worstWaiting.value +
            ")."
        );

    }


    if (
        findings.length === 0
    ) {

        findings.push(
            "No sufficient feedback data is currently available."
        );

    }


    document.getElementById(
        "keyFindings"
    ).innerHTML =
        findings
            .map(
                item =>
                    `<li>${escapeHTML(item)}</li>`
            )
            .join("");

}


function sentimentRow(
    name,
    percent,
    cssClass
) {

    const width =
        Math.min(
            100,
            Math.max(
                0,
                percent
            )
        );


    return `

        <div class="sentiment-row">

            <div class="sentiment-top">

                <span>
                    ${escapeHTML(name)}
                </span>

                <strong>
                    ${percent}%
                </strong>

            </div>

            <div class="progress">

                <div
                    class="progress-bar ${cssClass}"
                    style="width:${width}%">

                </div>

            </div>

        </div>

    `;

}

function createSummaryList(values) {

    const keys =
        Object.keys(values);


    if (
        keys.length === 0
    ) {

        return "No data available.";

    }


    return keys
        .map(
            key =>
                `<strong>${escapeHTML(key)}:</strong> ${numberValue(values[key])}`
        )
        .join(
            " &nbsp; | &nbsp; "
        );

}



function createInlineSummary(values) {

    const keys =
        Object.keys(values);


    if (
        keys.length === 0
    ) {

        return "No data available.";

    }


    return keys
        .map(
            key =>
                `${escapeHTML(key)}: ${numberValue(values[key])}`
        )
        .join(
            " &nbsp; | &nbsp; "
        );

}


function getLowestCategory(values) {

    const entries =
        Object.entries(values)
        .filter(
            ([key, value]) =>
                numberValue(value) > 0
        );


    if (
        entries.length === 0
    ) {

        return null;

    }


    entries.sort(
        (a, b) =>
            numberValue(a[1]) -
            numberValue(b[1])
    );


    return {

        key:
            entries[0][0],

        value:
            entries[0][1]

    };

}

function displayComments(feedback) {

    const container =
        document.getElementById(
            "summaryComments"
        );


    const comments =
        feedback.filter(
            item =>
                item.comment &&
                safe(item.comment).trim() !== ""
        );


    if (
        comments.length === 0
    ) {

        container.innerHTML =
            `<div class="summary-text">
                No customer comments are available.
             </div>`;

        return;

    }


    container.innerHTML =
        comments
            .map(
                item => {

                    const sentiment =
                        safe(
                            item.sentiment ||
                            "Neutral"
                        );


                    let badgeClass =
                        "badge-neutral";


                    if (
                        sentiment.toLowerCase()
                        === "positive"
                    ) {

                        badgeClass =
                            "badge-positive";

                    }


                    if (
                        sentiment.toLowerCase()
                        === "negative"
                    ) {

                        badgeClass =
                            "badge-negative";

                    }


                    return `

                        <div class="comment">

                            <div class="comment-text">

                                ${escapeHTML(
                                    item.comment
                                )}

                            </div>

                            <span
                                class="badge ${badgeClass}">

                                ${escapeHTML(
                                    sentiment
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


function displayFeedbackTable(feedback) {

    const body =
        document.getElementById(
            "feedbackTableBody"
        );


    document.getElementById(
        "recordCount"
    ).textContent =
        feedback.length +
        " records";


    if (
        feedback.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td colspan="10">
                    No customer feedback available.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        feedback
            .map(
                item => `

                    <tr>

                        <td>
                            ${escapeHTML(item.id)}
                        </td>

                        <td>
                            ${escapeHTML(item.service)}
                        </td>

                        <td>
                            ${escapeHTML(item.phone)}
                        </td>

                        <td>
                            ${escapeHTML(item.waiting)}
                        </td>

                        <td>
                            ${escapeHTML(item.staff)}
                        </td>

                        <td>
                            ${escapeHTML(item.office)}
                        </td>

                        <td>
                            ${escapeHTML(item.parking)}
                        </td>

                        <td>
                            ${escapeHTML(item.comment)}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.sentiment ||
                                "Neutral"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.created_at
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}

function destroyChart(id) {

    if (
        charts[id]
    ) {

        charts[id].destroy();

        charts[id] = null;

    }

}

function createSentimentChart(
    positive,
    neutral,
    negative
) {

    const canvas =
        document.getElementById(
            "sentimentChart"
        );


    if (!canvas) return;


    destroyChart(
        "sentimentChart"
    );


    charts.sentimentChart =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data: {

                    labels: [

                        "Positive",

                        "Neutral",

                        "Negative"

                    ],

                    datasets: [

                        {

                            data: [

                                positive,

                                neutral,

                                negative

                            ],

                            backgroundColor: [

                                "#198754",

                                "#f0ad4e",

                                "#dc3545"

                            ],

                            borderWidth:
                                2

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}

function createBarChart(
    id,
    values,
    label
) {

    const canvas =
        document.getElementById(id);


    if (!canvas) return;


    destroyChart(id);


    const labels =
        Object.keys(values);


    const data =
        Object.values(values)
            .map(
                value =>
                    numberValue(value)
            );


    charts[id] =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                label,

                            data:
                                data,

                            backgroundColor:
                                "#005baa",

                            borderRadius:
                                4

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                stepSize:
                                    1

                            }

                        }

                    },

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    }

                }

            }
        );

}

function createWeeklyChart(
    weekly
) {

    const canvas =
        document.getElementById(
            "weeklyChart"
        );


    if (!canvas) return;


    destroyChart(
        "weeklyChart"
    );


    const labels = [

        "Monday",

        "Tuesday",

        "Wednesday",

        "Thursday",

        "Friday",

        "Saturday",

        "Sunday"

    ];


    const values =
        labels.map(
            day =>
                numberValue(
                    weekly[day]
                )
        );


    charts.weeklyChart =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Customer Feedback",

                            data:
                                values,

                            borderColor:
                                "#005baa",

                            backgroundColor:
                                "rgba(0,91,170,0.08)",

                            fill:
                                true,

                            tension:
                                0.3,

                            borderWidth:
                                2,

                            pointRadius:
                                4

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                stepSize:
                                    1

                            }

                        }

                    }

                }

            }
        );

}


async function downloadAISummaryWord() {

    try {

        const status =
            document.getElementById(
                "reportDate"
            );


        status.textContent =
            "Creating professional AI Summary Word report...";


        const {

            Document,

            Packer,

            Paragraph,

            TextRun,

            HeadingLevel,

            AlignmentType,

            Table,

            TableRow,

            TableCell,

            WidthType

        } = window.docx;


        const sentiment =
            dashboardData.sentiment || {};


        const total =
            numberValue(
                dashboardData.total_feedback
            );


        const positive =
            numberValue(
                sentiment.positive
            );


        const neutral =
            numberValue(
                sentiment.neutral
            );


        const negative =
            numberValue(
                sentiment.negative
            );


        const positivePercent =
            percentage(
                positive,
                total
            );


        const neutralPercent =
            percentage(
                neutral,
                total
            );


        const negativePercent =
            percentage(
                negative,
                total
            );


        const children = [];

        children.push(

            new Paragraph({

                text:
                    "AI CUSTOMER FEEDBACK SUMMARY REPORT",

                heading:
                    HeadingLevel.TITLE,

                alignment:
                    AlignmentType.CENTER

            })

        );


        children.push(

            new Paragraph({

                children: [

                    new TextRun({

                        text:
                            "SLTMobitel Customer Experience",

                        bold:
                            true

                    })

                ],

                alignment:
                    AlignmentType.CENTER

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Report Generated: " +
                    new Date().toLocaleString(),

                alignment:
                    AlignmentType.CENTER

            })

        );


        children.push(
            new Paragraph({
                text: ""
            })
        );


        children.push(

            new Paragraph({

                text:
                    "1. Feedback Overview",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Total Feedback: " +
                    total

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Positive Feedback: " +
                    positive

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Neutral Feedback: " +
                    neutral

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Negative Feedback: " +
                    negative

            })

        );


        children.push(

            new Paragraph({

                text:
                    "2. Sentiment Analysis",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Positive: " +
                    positivePercent +
                    "%"

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Neutral: " +
                    neutralPercent +
                    "%"

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Negative: " +
                    negativePercent +
                    "%"

            })

        );

        children.push(

            new Paragraph({

                text:
                    "3. Service Summary",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        addObjectToDocx(
            children,
            dashboardData.service || {}
        );

        children.push(

            new Paragraph({

                text:
                    "4. Waiting Time Summary",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        addObjectToDocx(
            children,
            dashboardData.waiting || {}
        );

        children.push(

            new Paragraph({

                text:
                    "5. Office Environment Summary",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        addObjectToDocx(
            children,
            dashboardData.office || {}
        );


        children.push(

            new Paragraph({

                text:
                    "6. Staff Summary",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        addObjectToDocx(
            children,
            dashboardData.staff || {}
        );

        children.push(

            new Paragraph({

                text:
                    "7. Overall Summary",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        let overallText;


        if (
            positivePercent >= 60
        ) {

            overallText =
                "Overall customer feedback is positive. " +
                "The majority of customers reported satisfactory " +
                "customer experiences. The organization should " +
                "continue maintaining the strengths identified by " +
                "customers while addressing negative feedback.";

        }

        else if (
            positivePercent >= 40
        ) {

            overallText =
                "Overall customer feedback is mixed but generally " +
                "satisfactory. Positive feedback is significant, " +
                "while neutral and negative responses identify " +
                "areas requiring further improvement.";

        }

        else {

            overallText =
                "Overall customer feedback indicates that " +
                "improvement is required. Management should " +
                "review negative and neutral responses and " +
                "take appropriate corrective action.";

        }


        children.push(

            new Paragraph({

                text:
                    overallText

            })

        );

        children.push(

            new Paragraph({

                text:
                    "8. Customer Comments",

                heading:
                    HeadingLevel.HEADING_1

            })

        );


        const comments =
            (dashboardData.feedback || [])
                .filter(
                    item =>
                        item.comment &&
                        safe(item.comment).trim()
                );


        if (
            comments.length === 0
        ) {

            children.push(

                new Paragraph({

                    text:
                        "No customer comments available."

                })

            );

        }

        else {

            comments.forEach(
                item => {

                    children.push(

                        new Paragraph({

                            text:
                                "• " +
                                safe(
                                    item.comment
                                )

                        })

                    );

                }
            );

        }

        const doc =
            new Document({

                sections: [

                    {

                        properties: {},

                        children:
                            children

                    }

                ]

            });


        const blob =
            await Packer.toBlob(
                doc
            );


        downloadBlob(
            blob,
            "SLTMobitel_AI_Customer_Feedback_Summary.docx"
        );


        status.textContent =
            "AI Summary Word report created successfully.";

    }

    catch(error) {

        console.error(
            "AI Word Error:",
            error
        );


        document.getElementById(
            "reportDate"
        ).textContent =
            "Could not create the AI Summary Word report.";

    }

}

function addObjectToDocx(
    children,
    values
) {

    Object.entries(values)
        .forEach(
            ([key, value]) => {

                children.push(

                    new window.docx.Paragraph({

                        text:
                            key +
                            ": " +
                            numberValue(value)

                    })

                );

            }
        );

}

async function downloadFeedbackWord() {

    try {

        const {

            Document,

            Packer,

            Paragraph,

            TextRun,

            HeadingLevel,

            Table,

            TableRow,

            TableCell,

            WidthType

        } = window.docx;


        const feedback =
            dashboardData.feedback || [];


        const children = [];


        children.push(

            new Paragraph({

                text:
                    "SLTMOBITEL CUSTOMER FEEDBACK DATA",

                heading:
                    HeadingLevel.TITLE

            })

        );


        children.push(

            new Paragraph({

                children: [

                    new TextRun({

                        text:
                            "Customer Feedback Database Report",

                        bold:
                            true

                    })

                ]

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Total Records: " +
                    feedback.length

            })

        );


        children.push(

            new Paragraph({

                text:
                    "Generated: " +
                    new Date().toLocaleString()

            })

        );


        children.push(

            new Paragraph({

                text: ""

            })

        );


        if (
            feedback.length === 0
        ) {

            children.push(

                new Paragraph({

                    text:
                        "No customer feedback records available."

                })

            );

        }

        else {

            feedback.forEach(
                (item, index) => {

                    children.push(

                        new Paragraph({

                            text:
                                "Feedback Record " +
                                (index + 1),

                            heading:
                                HeadingLevel.HEADING_2

                        })

                    );


                    addFeedbackField(
                        children,
                        "ID",
                        item.id
                    );


                    addFeedbackField(
                        children,
                        "Service",
                        item.service
                    );


                    addFeedbackField(
                        children,
                        "Phone",
                        item.phone
                    );


                    addFeedbackField(
                        children,
                        "Waiting",
                        item.waiting
                    );


                    addFeedbackField(
                        children,
                        "Staff",
                        item.staff
                    );


                    addFeedbackField(
                        children,
                        "Office",
                        item.office
                    );


                    addFeedbackField(
                        children,
                        "Parking",
                        item.parking
                    );


                    addFeedbackField(
                        children,
                        "Comment",
                        item.comment
                    );


                    addFeedbackField(
                        children,
                        "Sentiment",
                        item.sentiment
                    );


                    addFeedbackField(
                        children,
                        "Created At",
                        item.created_at
                    );


                    children.push(

                        new Paragraph({

                            text: ""

                        })

                    );

                }
            );

        }


        const doc =
            new Document({

                sections: [

                    {

                        children:
                            children

                    }

                ]

            });


        const blob =
            await Packer.toBlob(
                doc
            );


        downloadBlob(
            blob,
            "SLTMobitel_Customer_Feedback_Data.docx"
        );


        alert(
            "Customer Feedback Word report downloaded successfully."
        );

    }

    catch(error) {

        console.error(
            "Feedback Word Error:",
            error
        );


        alert(
            "Could not create Customer Feedback Word report."
        );

    }

}

function addFeedbackField(
    children,
    label,
    value
) {

    children.push(

        new window.docx.Paragraph({

            children: [

                new window.docx.TextRun({

                    text:
                        label +
                        ": ",

                    bold:
                        true

                }),

                new window.docx.TextRun({

                    text:
                        safe(value) ||
                        "-"

                })

            ]

        })

    );

}
function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}

function showError(
    message
) {

    const box =
        document.getElementById(
            "errorMessage"
        );


    box.textContent =
        message;


    box.style.display =
        "block";

}


function hideError() {

    document.getElementById(
        "errorMessage"
    ).style.display =
        "none";

}

function refreshDashboard() {

    loadDashboard();

}

async function refreshDashboard() {

    const button = document.getElementById("refreshBtn");

    if (!button) {
        console.error("Refresh button not found");
        return;
    }

    button.disabled = true;
    button.innerHTML = "⏳ Refreshing...";

    try {
        await loadDashboard();
        await loadAISummary();

        console.log("Dashboard refreshed successfully");

    } catch (error) {

        console.error("Refresh error:", error);

    } finally {

        button.disabled = false;
        button.innerHTML = "🔄 Refresh";

    }
}

function logout() {

    console.log("Logout clicked");

    localStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminLoggedIn");

    window.location.replace("../frontend/index.html");
}


document.addEventListener("DOMContentLoaded", function () {

    const refreshButton =
        document.getElementById("refreshBtn");

    const logoutButton =
        document.getElementById("logoutBtn");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshDashboard
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

});


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

        setInterval(
            loadDashboard,
            10000
        );

    }
);