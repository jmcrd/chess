// Function to determine piece image path
function pieceTheme(piece) {
    return 'img/pieces/icpieces/' + piece + '.svg';
}

function removeHighlights() {
    $('.square-55d63').removeClass('highlight-from highlight-to');
}

function highlightMove(from, to) {
    removeHighlights();
    $(`.square-${from}`).addClass('highlight-from');
    $(`.square-${to}`).addClass('highlight-to');
}

function updateStatusUI(status, color = 'white') {
    $('#move-status').text(status).css('color', color);
}

function showOverlay(type) {
    const overlay = $('#overlay');
    const text = $('#overlay-text');
    const icon = $('#overlay-icon');
    const solvedScreen = $('#solved-screen');

    // Ensure the solved screen (YouTube/Retry) is hidden initially
    solvedScreen.hide();

    if (type === 'correct') {
        icon.text('✅');
        text.text('Correct!').css('color', '#4caf50');
        overlay.fadeIn(200).delay(600).fadeOut(400);
    } else if (type === 'wrong') {
        icon.text('❌');
        text.text('Wrong Move').css('color', '#ff4d4d');
        overlay.fadeIn(200).delay(600).fadeOut(400);
    } else if (type === 'solved') {
        icon.text('🏆');
        text.text('Puzzle Solved!').css('color', '#ffd700');
        
        // Show the main overlay immediately
        overlay.fadeIn(300);

        // DELAYED ACTION: Show the logo and buttons after 1.5 seconds
        setTimeout(() => {
            solvedScreen.fadeIn(500); // Smoothly fade in the YouTube/Retry buttons
        }, 1500); 
    }
}

// Function to draw an SVG arrow on the board with automatic fade-out
function drawMoveArrow(from, to) {
    $('.chess-arrow-svg').remove();

    const boardEl = $('#board');
    const fromEl = boardEl.find(`.square-${from}`);
    const toEl = boardEl.find(`.square-${to}`);

    if (!fromEl.length || !toEl.length) return;

    const boardPos = boardEl.offset();
    const fPos = fromEl.offset();
    const tPos = toEl.offset();
    const sqSize = fromEl.width();

    const x1 = fPos.left - boardPos.left + sqSize / 2;
    const y1 = fPos.top - boardPos.top + sqSize / 2;
    const x2 = tPos.left - boardPos.left + sqSize / 2;
    const y2 = tPos.top - boardPos.top + sqSize / 2;

    const arrowId = 'arrow-' + Date.now();

    const svg = `
        <svg id="${arrowId}" class="chess-arrow-svg" width="${boardEl.width()}" height="${boardEl.height()}" 
             style="position:absolute; top:0; left:0; pointer-events:none; z-index:10; transition: opacity 0.5s ease;">
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="rgba(255, 170, 0, 0.9)" />
                </marker>
            </defs>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                  stroke="rgba(255, 170, 0, 0.6)" stroke-width="6" marker-end="url(#arrowhead)" />
        </svg>`;
    
    boardEl.append(svg);

    setTimeout(() => {
        const $arrow = $(`#${arrowId}`);
        if($arrow.length) {
            $arrow.css('opacity', '0');
            setTimeout(() => $arrow.remove(), 500);
        }
    }, 2000);
}

function shakeBoard() {
    const board = $('#board');
    board.addClass('shake');
    setTimeout(() => board.removeClass('shake'), 500);
}