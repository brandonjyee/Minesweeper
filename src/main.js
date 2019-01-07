const fs = require('fs')
const Game = require('./Game')
const Client = require('./Client')

function main() {
  // const contents = fs.readFileSync('/input.txt', 'utf-8')
  // console.log('contents', contents)
  const game = new Game({
    height: 4,
    width: 4,
    numMines: 11
  })
  const client = new Client(game)
  client.start()
}

main()
