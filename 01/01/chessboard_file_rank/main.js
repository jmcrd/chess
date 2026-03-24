// =============================
// Global Game State
// =============================
let board = null;
let currentTask = ''; 
let targetColor = 'light'; 
let targetCoord = ''; 
let lastTask = ''; // Track previous task

// =============================
// Splash / Start / Stop Elements
// =============================
const splash = document.getElementById("splash");
const startBtnContainer = document.getElementById("start-btn-container");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const overlay = document.getElementById("overlay");
const backBtn = document.getElementById("back-btn");
const gameContainer = document.getElementById("game-container");
const topBar = document.querySelector(".top-bar");
const progressBar = document.getElementById("progress-bar");

// =============================
// Window Onload - start loading
// =============================
window.onload = () => {
    startLoading();
};

// =============================
// Splash Loader / Progress
// =============================
function startLoading() {
    let progress = 0;

    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);

            // Fade progress bar slightly
            progressBar.style.opacity = "0.3";

            // Show Start button
            startBtnContainer.style.display = "block";
            startBtnContainer.style.opacity = "0";

            setTimeout(() => {
                startBtnContainer.style.transition = "opacity 0.5s ease";
                startBtnContainer.style.opacity = "1";
            }, 50);
        }

    }, 120);
}

// =============================
// Start Button Click
// =============================
startBtn.addEventListener("click", () => {
    // Fade out splash
    splash.style.transition = "opacity 0.5s ease";
    splash.style.opacity = 0;

    setTimeout(() => {
        splash.style.display = "none";

        // Show topbar
        topBar.style.opacity = "1";
        topBar.style.transform = "translateY(0) scale(1)";

        // Show game container
        gameContainer.style.display = "flex";

        // Show stop button
        stopBtn.style.display = "block";

        // Initialize game board and tasks
        initGame();
    }, 500);
});

// =============================
// Stop Button Click
// =============================
stopBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
});

// =============================
// Back Button Click
// =============================
backBtn.addEventListener("click", () => {
    overlay.style.display = "none";
});

// =============================
// Initialize Chessboard & Tasks
// =============================
function initGame() {
    const config = {
        position: 'empty', 
        showNotation: true, 
        orientation: 'white',
        draggable: false,
        pieceTheme: () => '' 
    };
    
    board = Chessboard('myBoard', config);
    $(window).on('resize', board.resize);

    setTimeout(shuffleTask, 500);

    $('#myBoard').on('click', '.square-55d63', function() {
        const squareCoord = $(this).attr('data-square');
        const isDark = $(this).hasClass('black-3c85d');
        const clickedColor = isDark ? 'dark' : 'light';

        if (currentTask === 'color') {
            handleColorClick(clickedColor, squareCoord);
        } else {
            handlePlacementClick(squareCoord);
        }
    });
}

// =============================
// Shuffle Task
// =============================
function shuffleTask() {
    const feedback = $('#instruction-text');
    const prompt = $('#target-prompt');

    // Recolor the board for this task
    recolorBoard();

    $('.square-55d63').css('opacity', 1); // reset any previous animations

    do {
        currentTask = Math.random() > 0.5 ? 'color' : 'placement';
    } while (currentTask === lastTask);
    lastTask = currentTask;

    if (currentTask === 'color') {
        targetColor = Math.random() > 0.5 ? 'light' : 'dark';
        const colorClass = (targetColor === 'light') ? 'light-text' : 'dark-text';

        feedback.html("<strong>Task: Square Identification</strong>");
        prompt.html(`Select any <span class="${colorClass}">${targetColor}</span> square.`);
    } else {
        const side = Math.random() > 0.5 ? 'white' : 'black';
        targetCoord = (side === 'white') ? 'h1' : 'a8';

        feedback.html("<strong>Task: Mental Orientation</strong>");
        prompt.html(`If you were playing as <strong>${side.toUpperCase()}</strong>,<br>which square would be your <u>bottom-right</u>?`);
    }
}

// =============================
// Handle Color Click
// =============================
function handleColorClick(clickedColor, coord) {
    if (clickedColor === targetColor) {
        $('#instruction-text').html(`<span style="color:#2ecc71">Correct! ${coord.toUpperCase()} is ${clickedColor}.</span>`);
        visualPop(coord);
        setTimeout(shuffleTask, 1200);
    } else {
        $('#instruction-text').html(`<span style="color:#e74c3c">Actually, ${coord.toUpperCase()} is ${clickedColor}.</span>`);
    }
}

// =============================
// Handle Placement Click
// =============================
function handlePlacementClick(coord) {
    if (coord === targetCoord) {
        $('#instruction-text').html(`<span style="color:#2ecc71">Correct! You've localized the perspective perfectly.</span>`);
        $(`[data-square="${coord}"]`).css('background-color', '#edab4e');
        setTimeout(shuffleTask, 1500);
    } else {
        $('#instruction-text').html(`<span style="color:#e74c3c">Wrong! Think about where your right hand would be if you sat on that side.</span>`);
    }
}

// =============================
// Visual Pop Animation
// =============================
function visualPop(coord) {
    $(`[data-square="${coord}"]`).stop().css('opacity', '0.3').animate({opacity: 1}, 400);
}

// =============================
// Recolor Board for Each Task (Direct Coloring)
// =============================
function recolorBoard() {
    // Modern primary palette (light and dark squares)
    const lightPalette = ['#4fc3f7', '#81c784', '#ffb74d', '#ba68c8', '#90caf9']; // light squares
    const darkPalette  = ['#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#1976d2']; // dark squares

    // Randomly pick colors for this task
    const lightColor = lightPalette[Math.floor(Math.random() * lightPalette.length)];
    const darkColor  = darkPalette[Math.floor(Math.random() * darkPalette.length)];

    // Apply colors directly to squares
    $('.square-55d63').each(function() {
        if ($(this).hasClass('white-1e1d7')) {
            $(this).css({
                'background-color': lightColor,
                'color': getContrastColor(lightColor) // label readability
            });
        } else if ($(this).hasClass('black-3c85d')) {
            $(this).css({
                'background-color': darkColor,
                'color': getContrastColor(darkColor)
            });
        }
    });
}

// =============================
// Contrast Checker for Label Text
// =============================
function getContrastColor(hexColor) {
    // Convert hex to RGB
    const rgb = hexColor.replace('#','').match(/.{2}/g).map(x => parseInt(x,16));
    const brightness = (rgb[0]*299 + rgb[1]*587 + rgb[2]*114) / 1000;
    return brightness > 150 ? '#000000' : '#ffffff';
}