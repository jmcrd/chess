// main.js

var game = new Chess();
var currentMoveIndex = 0;

// Global puzzle storage (same name as before → no breaking changes)
var chessPuzzles = [];

/**
 * Load puzzles from GitHub JSON
 */
async function loadPuzzlesFromGitHub() {
    const url = "https://raw.githubusercontent.com/jmcrd/chess/refs/heads/main/puzzle_solve/puzzle.json"; // 🔥 IMPORTANT

    try {
        const res = await fetch(url);
        const data = await res.json();

        const params = new URLSearchParams(window.location.search);

        const category = params.get("category") || "mate1";
        const set = parseInt(params.get("set")) || 1;

        const allPuzzles = data[category];

        if (!allPuzzles || allPuzzles.length === 0) {
            console.error("No puzzles found for category:", category);
            return [];
        }

        const start = (set - 1) * 25;
        const end = start + 25;

        console.log(`Loading ${category} | Set ${set} (${start} → ${end})`);

        return allPuzzles.slice(start, end);

    } catch (err) {
        console.error("Error loading puzzles:", err);
        return [];
    }
}

/**
 * Reset move index for each puzzle
 */
function resetMoveIndex() {
    currentMoveIndex = 0;
}

/**
 * Start the app AFTER puzzles are loaded
 */
async function startApp() {

    // Start splash animation
    if (typeof startLoading === "function") {
        startLoading();
    }

    // Load puzzles
    chessPuzzles = await loadPuzzlesFromGitHub();

    if (!chessPuzzles || chessPuzzles.length === 0) {
        alert("⚠️ No puzzles loaded. Check your GitHub link or category.");
        return;
    }

    console.log("Loaded puzzles:", chessPuzzles.length);

    // Start first puzzle
    if (typeof loadPuzzle === "function") {
        loadPuzzle(0);
    } else {
        console.error("loadPuzzle() not found!");
    }
}

// Run app
window.onload = startApp;