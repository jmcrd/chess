const board = document.getElementById('board');
const targetDisplay = document.getElementById('target-display');
const resultsDiv = document.getElementById('results');
const overlay = document.getElementById('overlay');
const mistakeList = document.getElementById('mistake-list');
const statsSummary = document.getElementById('stats-summary');
const focusArea = document.getElementById('focus-area');
const focusList = document.getElementById('focus-list');

let score = 0;
let totalAttempts = 0;
let mistakes = []; 
let timeLeft = 0;
let timerInterval;
let currentTarget = { type: '', value: '' };
let lastTargetValue = ''; 
let isGameActive = false;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

/**
 * Generates the board based on the selected perspective (White or Black)
 */
function initBoard() {
    board.innerHTML = '';
    
    // Get selected side from radio buttons
    const sideEl = document.querySelector('input[name="side"]:checked');
    const side = sideEl ? sideEl.value : 'white';

    // Clone arrays so we don't mutate the originals
    let displayFiles = [...files];
    let displayRanks = [...ranks];

    // If Black side is selected, reverse both axes
    if (side === 'black') {
        displayFiles.reverse(); // h to a
        displayRanks.reverse(); // 1 to 8
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            
            // Logic for coloring squares remains consistent
            // (r + c) parity works regardless of array direction
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            
            // Assign actual chess coordinates to the dataset
            square.dataset.file = displayFiles[c];
            square.dataset.rank = displayRanks[r];
            
            square.onclick = () => handleSquareClick(square);
            board.appendChild(square);
        }
    }
}

// Event listeners for mode changes
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (isGameActive) nextQuestion();
    });
});

function startGame() {
    isGameActive = true;
    score = 0;
    totalAttempts = 0;
    mistakes = [];
    timeLeft = 0;
    lastTargetValue = ''; 
    updateUI();
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'block';
    nextQuestion();
    
    timerInterval = setInterval(() => {
        timeLeft++;
        updateUI();
    }, 1000);
}

function stopGame() {
    isGameActive = false;
    clearInterval(timerInterval);
    
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    statsSummary.innerHTML = `
        Time: <b>${timeLeft}s</b> | Accuracy: <b>${accuracy}%</b><br>
        Correct: <span style="color:var(--correct)">${score}</span> | 
        Wrong: <span style="color:var(--wrong)">${totalAttempts - score}</span>
    `;

    // Focus Logic
    const counts = {};
    mistakes.forEach(m => { counts[m.target] = (counts[m.target] || 0) + 1; });
    const sortedTrouble = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    if (sortedTrouble.length > 0) {
        focusArea.style.display = "block";
        focusList.innerText = sortedTrouble.slice(0, 3).join(", ");
    } else {
        focusArea.style.display = "none";
    }

    // History Logic
    mistakeList.innerHTML = '';
    if (mistakes.length === 0) {
        mistakeList.innerHTML = '<li>Perfect session! 🏆</li>';
    } else {
        mistakes.forEach(m => {
            const li = document.createElement('li');
            const modeName = m.mode === 'both' ? 'Full' : m.mode;
            li.innerHTML = `
                <span>
                    <span class="mode-tag">${modeName}</span>
                    Target <b class="mistake-val">${m.target}</b>
                </span> 
                <span>Hit <b class="mistake-wrong">${m.clicked}</b></span>
            `;
            mistakeList.appendChild(li);
        });
    }

    overlay.classList.remove('hidden');
}

function nextQuestion() {
    const modeEl = document.querySelector('input[name="mode"]:checked');
    const gameMode = modeEl ? modeEl.value : 'both';
    let newValue = '';
    
    // Pick random coordinates
    const randomFile = files[Math.floor(Math.random() * 8)];
    const randomRank = ranks[Math.floor(Math.random() * 8)];

    // Descriptive labels for the user
    if (gameMode === 'file') {
        newValue = randomFile;
        targetDisplay.innerHTML = `Select <span class="highlight">File ${newValue.toUpperCase()}</span>`;
    } else if (gameMode === 'rank') {
        newValue = randomRank;
        targetDisplay.innerHTML = `Select <span class="highlight">Rank ${newValue}</span>`;
    } else {
        newValue = randomFile + randomRank;
        targetDisplay.innerHTML = `Select <span class="highlight">${newValue}</span>`;
    }

    // Prevent duplicates
    if (newValue === lastTargetValue) {
        return nextQuestion();
    }

    currentTarget = { type: gameMode, value: newValue };
    lastTargetValue = newValue;
}

function handleSquareClick(square) {
    if (!isGameActive) return;
    totalAttempts++;
    
    const clickedFile = square.dataset.file;
    const clickedRank = square.dataset.rank;
    let isCorrect = false;
    let clickedNotation = "";
    let targetNotation = "";

    // 1. Determine notation based on current mode
    if (currentTarget.type === 'file') {
        isCorrect = (clickedFile === currentTarget.value);
        clickedNotation = "File " + clickedFile.toUpperCase();
        targetNotation = "File " + currentTarget.value.toUpperCase();
    } else if (currentTarget.type === 'rank') {
        isCorrect = (clickedRank === currentTarget.value);
        clickedNotation = "Rank " + clickedRank;
        targetNotation = "Rank " + currentTarget.value;
    } else {
        isCorrect = (clickedFile + clickedRank === currentTarget.value);
        clickedNotation = clickedFile + clickedRank;
        targetNotation = currentTarget.value;
    }

    if (isCorrect) {
        score++;
        flashSquare(square, 'flash-correct');
        nextQuestion();
    } else {
        // --- NEW FEEDBACK LOGIC ---
        // Save the current target text
        const originalHTML = targetDisplay.innerHTML;
        
        // Show the wrong click in the display box temporarily
        targetDisplay.innerHTML = `<span style="color:var(--wrong)">Clicked: ${clickedNotation}</span>`;
        
        // Flash the square red
        flashSquare(square, 'flash-wrong');

        // Record the mistake for the end-game summary
        mistakes.push({
            target: targetNotation,
            clicked: clickedNotation,
            mode: currentTarget.type
        });

        // Revert the text back after 600ms so they can try again
        setTimeout(() => {
            if (isGameActive) {
                targetDisplay.innerHTML = originalHTML;
            }
        }, 600);
    }
    updateUI();
}
function flashSquare(el, className) {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), 150);
}

function updateUI() {
    resultsDiv.innerText = `Score: ${score} | Time: ${timeLeft}s`;
}

function closeOverlay() {
    overlay.classList.add('hidden');
    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('stop-btn').style.display = 'none';
    targetDisplay.innerText = "READY?";
    updateUI();
}

// Initial Board Generation
initBoard();