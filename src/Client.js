const readline = require('readline')
const GameState = require('./GameState')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class Client {
  constructor(game) {
    this.game = game

    // Bind listeners
    this.handleAskInput = this.handleAskInput.bind(this)
    this.handleWin = this.handleWin.bind(this)
    this.handleLose = this.handleLose.bind(this)

    // Register listeners
    this.game.on(GameState.ASK_USER_INPUT, this.handleAskInput)
    this.game.on(GameState.WIN, this.handleWin)
    this.game.on(GameState.LOSE, this.handleLose)
  }

  showAllBoards() {
    const gameBoard = this.game.getGameBoard()
    console.log('Game Board:')
    console.log(gameBoard)

    const userBoard = this.game.getUserBoard()
    console.log('User Board:')
    console.log(userBoard)
  }

  showBoard() {
    const userBoard = this.game.getUserBoard()
    console.log('User Board:')
    console.log(userBoard)
  }

  handleWin() {
    this.showAllBoards()
    console.log('You Won!')
  }

  handleLose() {
    this.showAllBoards()
    console.log('You Lose')
  }

  // Handlers
  handleAskInput() {
    this.showBoard()

    rl.question('Enter cell [One-based. Ex: 1 1]: ', (answer) => {
      const [row, col] = answer.trim().split(' ')
      console.log('You picked: ', row, col)
      // Game pick is zero-based
      this.game.pickCell(row - 1, col - 1)
    })
  }

  start() {
    console.log('========== Welcome to Minesweeper! ==========')
    rl.question('Press any key to continue', () => {
      this.game.start()
    })
  }

  close() {
    rl.close()
  }
}

module.exports = Client
