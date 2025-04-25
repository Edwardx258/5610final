// server/services/shipService.js
const BOARD_SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2];

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function canPlaceShip(board, row, col, size, horizontal) {
  for (let i = 0; i < size; i++) {
    const r = row + (horizontal ? 0 : i);
    const c = col + (horizontal ? i : 0);
    if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c] !== null)
      return false;
  }
  return true;
}

function placeShipsOnBoard(board) {
  const newBoard = board.map((r) => [...r]);
  SHIP_SIZES.forEach((size) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(
        Math.random() * (horizontal ? BOARD_SIZE : BOARD_SIZE - size + 1)
      );
      const col = Math.floor(
        Math.random() * (horizontal ? BOARD_SIZE - size + 1 : BOARD_SIZE)
      );
      if (canPlaceShip(newBoard, row, col, size, horizontal)) {
        for (let i = 0; i < size; i++) {
          const r = row + (horizontal ? 0 : i);
          const c = col + (horizontal ? i : 0);
          newBoard[r][c] = "S";
        }
        placed = true;
      }
    }
  });
  return newBoard;
}

module.exports = { createEmptyBoard, placeShipsOnBoard };
