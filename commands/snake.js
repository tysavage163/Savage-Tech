const { createGame, render } = require('../lib/snakeEngine');

module.exports = {
    name: "snake",
    category: "fun",

    async execute(sock, msg) {

        const from = msg.key.remoteJid;

        global.snake = global.snake || {};
        global.snake[from] = createGame();

        await sock.sendMessage(from, {
            text:
`🐍 SNAKE STARTED

Use:
.up .down .left .right

${render(global.snake[from])}`
        });
    }
};
