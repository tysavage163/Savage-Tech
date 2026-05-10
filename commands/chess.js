const { createGame } = require('../lib/chessEngine');

module.exports = {
    name: "chess",
    category: "fun",

    async execute(sock, msg) {

        const from = msg.key.remoteJid;

        global.chess = global.chess || {};
        global.chess[from] = createGame();

        await sock.sendMessage(from, {
            text:
`♟️ CHESS STARTED

Use:
.move e2 e4`
        });
    }
};
