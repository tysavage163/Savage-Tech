const { move, render } = require('../lib/snakeEngine');

module.exports = {
    name: "snakeMove",
    category: "fun",

    async execute(sock, msg, args) {

        const from = msg.key.remoteJid;
        const game = global.snake?.[from];

        if (!game) {
            return sock.sendMessage(from, {
                text: "❌ No snake game running. Use .snake"
            });
        }

        const dir = args[0]?.toUpperCase();

        if (!["UP","DOWN","LEFT","RIGHT"].includes(dir)) {
            return sock.sendMessage(from, {
                text: "❌ Use: .snakeMove up/down/left/right"
            });
        }

        game.dir = dir;

        const { move: step, render } = require('../lib/snakeEngine');

        step(game);

        if (game.over) {
            delete global.snake[from];

            return sock.sendMessage(from, {
                text: `💀 Game Over!\nScore: ${game.score}`
            });
        }

        await sock.sendMessage(from, {
            text:
`🐍 SNAKE

Score: ${game.score}

${render(game)}`
        });
    }
};
