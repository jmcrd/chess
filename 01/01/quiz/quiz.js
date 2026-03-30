var current = 0;
var selected = -1;
var userAnswers = [];

function startQuiz() {
    current = 0;
    selected = -1;
    userAnswers = [];
    loadQuestion();
}

function loadQuestion() {
    if (current >= questions.length) {
        showResults();
        return;
    }

    var q = questions[current];

    document.getElementById("quizBox").innerHTML =
        renderQuestion(q, current, questions.length);

    var optionsDiv = document.getElementById("options");
    var nextBtn = document.getElementById("nextBtn");

    q.options.forEach(function (opt, index) {
        var div = document.createElement("div");
        div.className = "option";
        div.innerText = opt;

        div.onclick = function () {
            if (selected !== -1) return;

            selected = index;

            var correctIndex = q.correct;
            var allOptions = document.querySelectorAll(".option");

            allOptions.forEach(function (opt, i) {
                if (i === correctIndex) opt.classList.add("correct");
                else if (i === index) opt.classList.add("wrong");
            });

            userAnswers.push(selected);

            if (selected === correctIndex) {
                showPopup("✅ Correct!");
            } else {
                document.getElementById("feedback").innerHTML = `
                    <div class="explanation">
                        ❌ ${q.explanation}
                    </div>
                `;
            }

            nextBtn.style.display = "block";
            nextBtn.onclick = nextQuestion;
        };

        optionsDiv.appendChild(div);
    });
}

function nextQuestion() {
    current++;
    selected = -1;
    loadQuestion();
}

function showResults() {
    var score = 0;
    var box = document.getElementById("quizBox");

    box.innerHTML = "<h2>Final Results</h2>";

    questions.forEach(function (q, i) {
        var user = userAnswers[i];
        var correct = q.correct;

        var isCorrect = user === correct;
        if (isCorrect) score++;

        var div = document.createElement("div");
        div.className = "option";

        // 🎨 Left border color for quick visual
        div.style.borderLeft = isCorrect 
            ? "5px solid #2ecc71" 
            : "5px solid #e74c3c";

        if (isCorrect) {
            // ✅ ONLY show user's answer
            div.innerHTML = `
                <b>Q${i + 1}:</b> ${q.question}<br>
                ✅ <b>Correct Answer:</b> ${q.options[user]}
            `;
        } else {
            // ❌ Show everything (learning mode)
            div.innerHTML = `
                <b>Q${i + 1}:</b> ${q.question}<br>
                ❌ <b>Your Answer:</b> ${q.options[user]}<br>
                ✔ <b>Correct Answer:</b> ${q.options[correct]}
                <div class="explanation">
                    💡 ${q.explanation}
                </div>
            `;
        }

        div.classList.add(isCorrect ? "correct" : "wrong");
        box.appendChild(div);
    });

    box.innerHTML += `
        <div class="score-box">
            Your Score: ${score} / ${questions.length}
        </div>
        <button onclick="startQuiz()">Reattempt Quiz</button>
    `;
}

startQuiz();