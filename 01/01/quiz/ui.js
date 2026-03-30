function renderQuestion(q, current, total) {
    return `
        <div class="progress">
            Question ${current + 1} of ${total}
        </div>
        <h2>${q.question}</h2>
        <div id="options"></div>
        <div id="feedback"></div>
        <button id="nextBtn" style="display:none;">Next</button>
    `;
}

function showPopup(message) {
    let popup = document.createElement("div");
    popup.className = "overlay";

    popup.innerHTML = `
        <div class="popup">
            <h2>${message}</h2>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1200);
}