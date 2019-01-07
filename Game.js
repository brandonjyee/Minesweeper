/*
- Have a board with width & height
  - Represented by a matrix of cells
- Cells can contain either a mine or a number indicating the number of mines surrounding it (up to 8?)
- Player can pick a cell one at a time
  - If the cell is a bomb, the player loses
  - If the cell is a number, it reveals the
- Initiate the board cells with M mines randomly placed on the board
- Be able to print out the board -- put '?' in places unrevealed, otherwise show the number or 'M' for mine
- Take command line input from user for cell, show the board, then wait for another input from user, etc. Do this until player wins or loses

*/

const EventEmitter = require('events');
const GameState = require('./GameState');


/**
 * Shuffles array in place. Fisher-Yates algo.
 * @param {Array} a items An array containing the items.
 */
const shuffle = function(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};

class Board {
  constructor(options = {}) {
    // console.log('board options in ctor', options)
    this.options = {
      height: 10,
      width: 10,
      defaultChar: '0'
    };
    // Override default settings with any user-specified ones
    Object.assign(this.options, options);
    // Make the options top-level fields
    for (const key in this.options) {
      this[key] = this.options[key];
    }
    this.matrix = new Array(this.height);
    for (let i = 0; i < this.matrix.length; i++) {
      this.matrix[i] = new Array(this.width).fill(this.defaultChar);
    }
  }

  // ==== Reads (No state modification) ====

  // Would tie this component to console
  _print() {
    for (const row of this.matrix) {
      console.log(row.join(' '));
    }
  }

  get(row, col) {
    // Input validation. TODO

    return this.matrix[row][col];
  }

  // ==== Writes (State modification) ====

  set(row, col, val) {
    // Input validation. TODO

    this.matrix[row][col] = val;
  }

}

class Player {}


class Game extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = {
      height: 10,
      width: 10,
      numMines: 30,
      defaultGameChar: '0',
      defaultUserChar: '?',
      mineChar: 'M'
    }
    Object.assign(this.options, options)

    // Modifiable State
    this.reset()

    // this.gameState = null;
    // this.events = null;
    // this.player = new Player();
    // Undo & Redo
  }

  // ==== Reads (No state modification) ====
  _getMineCount(board, row, col) {
    const {mineChar} = this.options
    function _isOutOfBounds(board, row, col) {
      return (row < 0 || row >= board.height || col < 0 || col >= board.width)
    }
    function _mineCount(board, row, col) {
      if (!_isOutOfBounds(board, row, col)
          && board.get(row, col) === mineChar) {
        return 1
      }
      return 0
    }
    let count = 0
    // U
    count += _mineCount(board, row - 1, col)
    // UR
    count += _mineCount(board, row - 1, col + 1)
    // R
    count += _mineCount(board, row, col + 1)
    // DR
    count += _mineCount(board, row + 1, col + 1)
    // D
    count += _mineCount(board, row + 1, col)
    // DL
    count += _mineCount(board, row + 1, col - 1)
    // L
    count += _mineCount(board, row, col - 1)
    // UL
    count += _mineCount(board, row - 1, col - 1)

    return count
  }

  _copyBoard(board) {
    const matrix = new Array(board.height)
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(board.width)
      for (let j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = board.get(i, j)
      }
    }
    return matrix
  }

  getUserBoard() {
    return this._copyBoard(this.userBoard);
  }

  getGameBoard() {
    return this._copyBoard(this.gameBoard);
  }

  // ==== Modifies state ====

  _setupBoard() {
    // Set mines
    this._setMines()
    // Set numbers
    this._setNumbers()
  }

  _setMines() {
    const {height, width, numMines, mineChar} = this.options
    const numCells = height * width
    // TODO: check if numMines is > numCells
    const nums = new Array(numCells)
    for (let i = 0; i < nums.length; i++) {
      nums[i] = i
    }
    // Shuffle the nums in place
    shuffle(nums)
    // Pop off as many as you need
    for (let i = 0; i < numMines; i++) {
      const idx = nums.pop()
      const row = Math.floor(idx / width)
      const col = Math.floor(idx % width)
      this.gameBoard.set(row, col, mineChar)
    }
  }

  _setNumbers() {
    const {width, height, mineChar} = this.options
    // For each cell
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = this.gameBoard.get(i, j)
        if (cell === mineChar) continue

        const count = this._getMineCount(this.gameBoard, i, j)
        this.gameBoard.set(i, j, count.toString())
      }
    }
  }

  pickCell(row, col) {
    // console.log('Game received pickCell:', row, col)
    const {mineChar} = this.options
    const gameCell = this.gameBoard.get(row, col)
    this.userBoard.set(row, col, gameCell)
    if (gameCell === mineChar) {
      this.emit(GameState.LOSE)
    } else {
      // TODO: Reveal other parts of the board if zeroes?
      this.picksToWin--
      // console.log(this.picksToWin)
      if (this.picksToWin <= 0) {
        this.emit(GameState.WIN)
      } else {
        this.emit(GameState.ASK_USER_INPUT)
      }
    }
  }

  start() {
    //
    this.reset()
    this._setupBoard()
    this.gameState = GameState.ASK_USER_INPUT;
    this.emit(GameState.ASK_USER_INPUT)
  }

  reset() {
    const {height, width, numMines, defaultGameChar, defaultUserChar} = this.options
    this.gameBoard = new Board({
      height,
      width,
      defaultChar: defaultGameChar
    });
    this.userBoard = new Board({
      height,
      width,
      defaultChar: defaultUserChar
    });
    this.numCells = height * width
    this.picksToWin = this.numCells - numMines
  }

  // undo() {}
  // redo() {}
}

module.exports = Game;
