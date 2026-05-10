module.exports = {
    name: "move",
    category: "fun",

    async execute(sock, msg, args) {

        const from = msg.key.remoteJid;
        const game = global.chess?.[from];

        if (!game) {
            return sock.sendMessage(from, {
                text: "❌ No chess game running"
            });
        }

        try {

            const move = game.move({
                from: args[0],
                to: args[1]
            });

            if (!move) {
                return sock.sendMessage(from, {
                    text: "❌ Illegal move"
                });
            }

            await sock.sendMessage(from, {
                text:
`♟️ MOVE DONE

${game.ascii()}`
            });

        } catch (e) {
            sock.sendMessage(from, {
                text: "❌ Invalid move"
            });
        }
    }
};
