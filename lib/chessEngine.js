const { Chess } = require('chess.js');

function createGame() {
    return new Chess();
}

module.exports = { createGame };
