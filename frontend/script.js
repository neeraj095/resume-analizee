
function openResume() {
    window.location.href = "resume.html";
}

function openInterview() {
    window.location.href = "interview.html";
}

function openDashboard() {
    window.location.href = "dashboard.html";
}

const loginBtn = document.querySelector(".login-btn");

if (loginBtn) {
    loginBtn.addEventListener("click", function () {
        window.location.href = "resume.html";
    });
}

const resumeForm = document.getElementById("resumeForm");

if (resumeForm) {

    resumeForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const resumeFile = document.getElementById("resumeFile");
        const jobRole = document.getElementById("jobRole");
        const jobDescription = document.getElementById("jobDescription");

        const result = document.getElementById("resumeResult");
        const resultMessage = document.getElementById("resultMessage");

        const file = resumeFile.files[0];

        if (!file) {
            alert("Please upload your resume!");
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5 MB!");
            return;
        }

        if (!jobRole.value) {
            alert("Please select a job role!");
            return;
        }

        const formData = new FormData();

        formData.append("resume", file);
        formData.append("jobRole", jobRole.value);
        formData.append("jobDescription", jobDescription.value);

        result.style.display = "block";

        resultMessage.textContent = "Analyzing your resume...";

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/analyze-resume",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed");
            }

            resultMessage.replaceChildren();

            const scoreHeading = document.createElement("h2");

            scoreHeading.textContent = `ATS Score: ${data.atsScore}%`;

            resultMessage.appendChild(scoreHeading);

            const roleHeading = document.createElement("h3");

            roleHeading.textContent = "Selected Job Role";

            resultMessage.appendChild(roleHeading);

            const roleText = document.createElement("p");

            roleText.textContent = data.jobRole;

            resultMessage.appendChild(roleText);

            const foundHeading = document.createElement("h3");

            foundHeading.textContent = "Skills Found";

            resultMessage.appendChild(foundHeading);

            const foundText = document.createElement("p");

            foundText.textContent =
                data.foundSkills.join(", ") || "No skills found";

            resultMessage.appendChild(foundText);

            const missingHeading = document.createElement("h3");

            missingHeading.textContent = "Missing Skills";

            resultMessage.appendChild(missingHeading);

            const missingText = document.createElement("p");

            missingText.textContent =
                data.missingSkills.join(", ") || "No missing skills";

            resultMessage.appendChild(missingText);

            const info = document.createElement("p");

            info.textContent = `Total skills found: ${data.totalSkills}`;

            resultMessage.appendChild(info);

            const length = document.createElement("p");

            length.textContent = `Resume characters: ${data.resumeLength}`;

            resultMessage.appendChild(length);

            const message = document.createElement("p");

            message.textContent = data.message;

            resultMessage.appendChild(message);

        }

        catch (error) {

            resultMessage.textContent = "Error: " + error.message;

            console.error("Resume Analysis Error:", error);

        }

    });

}

const interviewQuestions = {

    "Frontend Developer": {

        Technical: [
            "What is HTML?",
            "What is CSS Flexbox?",
            "Difference between let, var and const?",
            "What is JavaScript DOM?",
            "Difference between map() and filter()?",
            "What is responsive web design?",
            "Difference between == and ===?"
        ],

        HR: [
            "Tell me about yourself.",
            "Why should we hire you?",
            "What are your strengths and weaknesses?",
            "Where do you see yourself in five years?",
            "Why do you want to become a Frontend Developer?"
        ]

    },

    "Backend Developer": {

        Technical: [
            "What is backend development?",
            "What is an API?",
            "What is Python?",
            "What is Flask?",
            "Difference between GET and POST?",
            "What is server-side programming?"
        ],

        HR: [
            "Tell me about yourself.",
            "Why should we hire you?",
            "How do you handle pressure?",
            "What are your career goals?"
        ]

    },

    "Full Stack Developer": {

        Technical: [
            "What is Full Stack Development?",
            "What is frontend and backend?",
            "What is SQL?",
            "What is an API?",
            "Difference between JavaScript and Python?",
            "What is database management?"
        ],

        HR: [
            "Tell me about yourself.",
            "Why do you want this job?",
            "What projects have you completed?",
            "What are your strengths?"
        ]

    },

    "Python Developer": {

        Technical: [
            "What is Python?",
            "What are Python data types?",
            "What is a list in Python?",
            "What is a dictionary?",
            "Difference between list and tuple?",
            "What is a function in Python?"
        ],

        HR: [
            "Tell me about yourself.",
            "Why did you choose Python?",
            "What are your strengths?",
            "Why should we hire you?"
        ]

    }

};

let currentQuestionNumber = 0;

let questionList = [];

const startBtn = document.getElementById("startInterview");

const submitBtn = document.getElementById("submitAnswer");

if (startBtn) {

    startBtn.addEventListener("click", function () {

        const role = document.getElementById("interviewRole").value;

        const category = document.getElementById("interviewCategory").value;

        if (!role) {
            alert("Please select a job role!");
            return;
        }

        questionList = [...interviewQuestions[role][category]];

        currentQuestionNumber = 0;

        questionList.sort(() => Math.random() - 0.5);

        document.getElementById("questionArea").style.display = "block";

        showQuestion();

    });

}

function showQuestion() {

    const questionText = document.getElementById("questionText");

    const userAnswer = document.getElementById("userAnswer");

    const feedback = document.getElementById("answerFeedback");

    if (currentQuestionNumber >= questionList.length) {

        questionText.textContent =
            "Interview completed! You answered all questions.";

        userAnswer.style.display = "none";

        submitBtn.style.display = "none";

        return;

    }

    questionText.textContent =
        `Question ${currentQuestionNumber + 1}: ${questionList[currentQuestionNumber]}`;

    userAnswer.value = "";

    userAnswer.style.display = "block";

    submitBtn.style.display = "block";

    feedback.style.display = "none";

}

if (submitBtn) {

    submitBtn.addEventListener("click", function () {

        const answer = document.getElementById("userAnswer").value.trim();

        if (!answer) {
            alert("Please write your answer!");
            return;
        }

        const feedback = document.getElementById("answerFeedback");

        feedback.style.display = "block";

        feedback.replaceChildren();

        const heading = document.createElement("h3");

        heading.textContent = "Answer Submitted!";

        feedback.appendChild(heading);

        const message = document.createElement("p");

        message.textContent =
            "Your answer has been submitted. AI evaluation will be added later.";

        feedback.appendChild(message);

        const nextBtn = document.createElement("button");

        nextBtn.textContent = "Next Question →";

        feedback.appendChild(nextBtn);

        nextBtn.addEventListener("click", function () {

            currentQuestionNumber++;

            showQuestion();

        });

    });

}

const resumeTableBody = document.getElementById("resumeTableBody");

if (resumeTableBody) {

    async function loadDashboard() {

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/resumes"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to load resumes");
            }

            const resumes = data.resumes;

            document.getElementById("totalResumes").textContent =
                data.totalResumes;

            let average = 0;

            if (resumes.length > 0) {

                const totalScore = resumes.reduce(
                    (sum, resume) => sum + resume.ats_score,
                    0
                );

                average = Math.round(totalScore / resumes.length);
            }

            document.getElementById("averageScore").textContent =
                average + "%";

            resumeTableBody.replaceChildren();

            if (resumes.length === 0) {

                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 4;
                cell.textContent = "No resume analysis found.";

                row.appendChild(cell);
                resumeTableBody.appendChild(row);

                return;
            }

            resumes.forEach(function (resume) {

                const row = document.createElement("tr");

                const filenameCell = document.createElement("td");
                filenameCell.textContent = resume.filename;

                const roleCell = document.createElement("td");
                roleCell.textContent = resume.job_role;

                const scoreCell = document.createElement("td");
                scoreCell.textContent = resume.ats_score + "%";

                const dateCell = document.createElement("td");
                dateCell.textContent = resume.created_at;

                row.append(
                    filenameCell,
                    roleCell,
                    scoreCell,
                    dateCell
                );

                resumeTableBody.appendChild(row);

            });

        } catch (error) {

            console.error("Dashboard Error:", error);

            resumeTableBody.textContent =
                "Unable to load resume history. Check your backend.";

        }
    }

    loadDashboard();
}
