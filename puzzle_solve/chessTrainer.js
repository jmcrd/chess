var board = null;
var currentPuzzleIndex = 0;
var sourceSquare = null; // Stores the square from the first click

/**
 * Updates the visibility of navigation buttons based on puzzle index
 */
function updateButtonVisibility() {
    if (!chessPuzzles || chessPuzzles.length === 0) return;

    $('#prev-btn').css('visibility', currentPuzzleIndex === 0 ? 'hidden' : 'visible');
    $('#next-btn').css('visibility', currentPuzzleIndex === chessPuzzles.length - 1 ? 'hidden' : 'visible');
}

/**
 * Main function to initialize or reset a puzzle
 */
function loadPuzzle(index) {

    // ✅ SAFETY CHECK (prevents crash)
    if (!chessPuzzles || chessPuzzles.length === 0) {
        console.error("Puzzles not loaded yet!");
        return;
    }

    const puzzle = chessPuzzles[index];

    if (!puzzle) {
        console.error("Invalid puzzle index:", index);
        return;
    }

    game.load(puzzle.fen);
    resetMoveIndex();

    // Reset state and visuals
    sourceSquare = null;
    $('.chess-arrow-svg').remove();
    removeHighlights();

    const playerSide = game.turn() === 'w' ? 'black' : 'white';

    if (board) board.destroy();

    board = Chessboard('board', {
        draggable: false,
        position: puzzle.fen,
        orientation: playerSide,
        pieceTheme: pieceTheme
    });

    // --- Click-to-Move Interaction Logic ---
    $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function () {

        const clickedSquare = $(this).attr('data-square');
        const piece = game.get(clickedSquare);
        const puzzle = chessPuzzles[currentPuzzleIndex];
        const expectedMoveUci = puzzle.moves[currentMoveIndex];

        // FIRST CLICK
        if (!sourceSquare) {
            if (piece && piece.color === game.turn()) {
                sourceSquare = clickedSquare;
                removeHighlights();
                $(this).addClass('highlight-from');
            } else if (piece && piece.color !== game.turn()) {
                shakeBoard();
            }
            return;
        }

        // SECOND CLICK
        if (clickedSquare === sourceSquare) {
            sourceSquare = null;
            removeHighlights();
            return;
        }

        const moveUci = sourceSquare + clickedSquare;

        if (moveUci === expectedMoveUci.substring(0, 4)) {

            let promo = expectedMoveUci.length === 5 ? expectedMoveUci[4] : 'q';

            drawMoveArrow(sourceSquare, clickedSquare);

            handleMoveExecution(sourceSquare, clickedSquare, puzzle, board, promo);

            sourceSquare = null;

        } else {
            showOverlay('wrong');
            removeHighlights();
            sourceSquare = null;

            if (piece && piece.color === game.turn()) {
                sourceSquare = clickedSquare;
                $(this).addClass('highlight-from');
            }
        }
    });

    // Reset UI
    $('#overlay').hide();
    updateButtonVisibility();
    updateStatusUI('Opponent is moving...', '#aaa');

    // Start puzzle
    setTimeout(() => {
        makeOpponentMove(puzzle, board);
        $('#turn-display').text(`Turn: Your Move (${playerSide})`);
        updateStatusUI('Your move!', 'white');
    }, 800);
}

// --- Navigation Buttons ---

$('#next-btn').click(() => {
    if (!chessPuzzles || chessPuzzles.length === 0) return;

    if (currentPuzzleIndex < chessPuzzles.length - 1) {
        currentPuzzleIndex++;
        loadPuzzle(currentPuzzleIndex);
    }
});

$('#prev-btn').click(() => {
    if (!chessPuzzles || chessPuzzles.length === 0) return;

    if (currentPuzzleIndex > 0) {
        currentPuzzleIndex--;
        loadPuzzle(currentPuzzleIndex);
    }
});

$('#retry-btn').click(() => {
    if (!chessPuzzles || chessPuzzles.length === 0) return;

    loadPuzzle(currentPuzzleIndex);
});

// --- Show Solution ---

$('#show-solution-btn').click(() => {

    if (!chessPuzzles || chessPuzzles.length === 0) return;

    const puzzle = chessPuzzles[currentPuzzleIndex];

    if (currentMoveIndex >= puzzle.moves.length) return;

    const moveUci = puzzle.moves[currentMoveIndex];
    const from = moveUci.substring(0, 2);
    const to = moveUci.substring(2, 4);
    const promo = moveUci[4] || 'q';

    $(`.square-${from}`).css('box-shadow', 'inset 0 0 3px 3px yellow');

    setTimeout(() => {
        $(`.square-${from}`).css('box-shadow', '');
        drawMoveArrow(from, to);
        handleMoveExecution(from, to, puzzle, board, promo);
        board.position(game.fen());
    }, 500);
});

/**
 * ❌ IMPORTANT: REMOVE AUTO START
 * We DO NOT call loadPuzzle here anymore
 * main.js will handle it after GitHub loads
 */
$(document).ready(() => {
    console.log("Trainer ready. Waiting for puzzles...");
});
