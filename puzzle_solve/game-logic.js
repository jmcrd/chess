var game = new Chess();
var currentMoveIndex = 0;

/**
 * Resets the move counter for a new puzzle
 */
function resetMoveIndex() { 
    currentMoveIndex = 0; 
}

/**
 * Executes the opponent's move based on the puzzle data
 * Now includes drawing the move arrow for the first move and responses.
 */
function makeOpponentMove(puzzle, board) {
    if (currentMoveIndex >= puzzle.moves.length) return;

    const moveUci = puzzle.moves[currentMoveIndex];
    const from = moveUci.substring(0, 2);
    const to = moveUci.substring(2, 4);
    const promo = moveUci.length === 5 ? moveUci[4] : 'q';

    // 1. Draw the arrow first so the user sees the opponent's intent
    drawMoveArrow(from, to);

    // 2. Update the internal chess engine
    game.move({ from: from, to: to, promotion: promo });
    currentMoveIndex++;
    
    // 3. Update the visual board and highlight the move
    board.position(game.fen());
    highlightMove(from, to);
}

/**
 * Handles the player's move execution and checks if it's correct
 */
function handleMoveExecution(source, target, puzzle, board, promo = 'q') {
    let move = game.move({ from: source, to: target, promotion: promo });
    
    if (move === null) return 'snapback';

    // 1. Show player's move
    highlightMove(source, target);
    board.position(game.fen());
    currentMoveIndex++;

    // 2. If more moves exist → opponent should move FIRST
    if (currentMoveIndex < puzzle.moves.length) {

        // Delay so player can SEE their move
        setTimeout(() => {

            // Opponent move
            makeOpponentMove(puzzle, board);

            // Delay again so opponent move is visible
            setTimeout(() => {
                showOverlay('correct');
                updateStatusUI('✅ Correct!', '#4caf50');
            }, 700); // <-- adjust feel here

        }, 500); // <-- delay after player move

    } else {
        // Final move (puzzle solved)

        setTimeout(() => {
            showOverlay('solved');
            updateStatusUI('🏆 Puzzle Solved!', '#ffd700');
        }, 1000); // give time to SEE final move
    }
}