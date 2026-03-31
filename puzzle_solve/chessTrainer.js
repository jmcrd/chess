var board = null;
var currentPuzzleIndex = 0;
var sourceSquare = null; // Stores the square from the first click

/**
 * Updates the visibility of navigation buttons based on puzzle index
 */
function updateButtonVisibility() {
    $('#prev-btn').css('visibility', currentPuzzleIndex === 0 ? 'hidden' : 'visible');
    $('#next-btn').css('visibility', currentPuzzleIndex === chessPuzzles.length - 1 ? 'hidden' : 'visible');
}

/**
 * Main function to initialize or reset a puzzle
 */
function loadPuzzle(index) {
    const puzzle = chessPuzzles[index];
    game.load(puzzle.fen);
    resetMoveIndex();
    
    // Reset state and visuals
    sourceSquare = null;
    $('.chess-arrow-svg').remove(); // Clear any existing arrows
    removeHighlights();
    
    const playerSide = game.turn() === 'w' ? 'black' : 'white';

    if (board) board.destroy();

    // Initialize board with dragging DISABLED for click-to-move
    board = Chessboard('board', {
        draggable: false, 
        position: puzzle.fen, 
        orientation: playerSide,
        pieceTheme: pieceTheme
    });

    // --- Click-to-Move Interaction Logic ---
    // We use .off().on() to prevent multiple event listeners being attached on reload
    $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function() {
        const clickedSquare = $(this).attr('data-square');
        const piece = game.get(clickedSquare);
        const puzzle = chessPuzzles[currentPuzzleIndex];
        const expectedMoveUci = puzzle.moves[currentMoveIndex];

        // 1. FIRST CLICK: Selecting a piece to move
        if (!sourceSquare) {
            if (piece && piece.color === game.turn()) {
                sourceSquare = clickedSquare;
                removeHighlights();
                $(this).addClass('highlight-from'); // Highlight selection
            } else if (piece && piece.color !== game.turn()) {
                // User clicked opponent's piece first
                shakeBoard();
            }
            return;
        }

        // 2. SECOND CLICK: Destination or Deselection
        if (clickedSquare === sourceSquare) {
            // Deselect if clicking the same square twice
            sourceSquare = null;
            removeHighlights();
            return;
        }

        const moveUci = sourceSquare + clickedSquare;

        // Check if the move is the correct one from the puzzle data
        if (moveUci === expectedMoveUci.substring(0, 4)) {
            let promo = expectedMoveUci.length === 5 ? expectedMoveUci[4] : 'q';
            
            // Draw the arrow visually
            drawMoveArrow(sourceSquare, clickedSquare);
            
            // Execute logic
            handleMoveExecution(sourceSquare, clickedSquare, puzzle, board, promo);
            sourceSquare = null; // Reset for next move
        } else {
            // Wrong move or invalid destination
            showOverlay('wrong');
            removeHighlights();
            sourceSquare = null;
            // If the user clicked another one of their own pieces, select it instead
            if (piece && piece.color === game.turn()) {
                sourceSquare = clickedSquare;
                $(this).addClass('highlight-from');
            }
        }
    });

    // Reset UI Status
    $('#overlay').hide();
    updateButtonVisibility();
    updateStatusUI('Opponent is moving...', '#aaa');

    // Start puzzle: Opponent makes the initial setup move
    setTimeout(() => {
        makeOpponentMove(puzzle, board);
        $('#turn-display').text(`Turn: Your Move (${playerSide})`);
        updateStatusUI('Your move!', 'white');
    }, 800); 
}

// --- Navigation Button Listeners ---

$('#next-btn').click(() => {
    if (currentPuzzleIndex < chessPuzzles.length - 1) {
        currentPuzzleIndex++;
        loadPuzzle(currentPuzzleIndex);
    }
});

$('#prev-btn').click(() => {
    if (currentPuzzleIndex > 0) {
        currentPuzzleIndex--;
        loadPuzzle(currentPuzzleIndex);
    }
});

$('#retry-btn').click(() => {
    loadPuzzle(currentPuzzleIndex);
});

// --- Show Solution Logic ---

$('#show-solution-btn').click(() => {
    const puzzle = chessPuzzles[currentPuzzleIndex];
    if (currentMoveIndex >= puzzle.moves.length) return;

    const moveUci = puzzle.moves[currentMoveIndex];
    const from = moveUci.substring(0, 2);
    const to = moveUci.substring(2, 4);
    const promo = moveUci[4] || 'q';
    
    // Hint highlight
    $(`.square-${from}`).css('box-shadow', 'inset 0 0 3px 3px yellow');

    setTimeout(() => {
        $(`.square-${from}`).css('box-shadow', '');
        drawMoveArrow(from, to); // Show the arrow for the solution
        handleMoveExecution(from, to, puzzle, board, promo);
        board.position(game.fen());
    }, 500);
});

// Initialize on page load
$(document).ready(() => {
    loadPuzzle(currentPuzzleIndex);
});