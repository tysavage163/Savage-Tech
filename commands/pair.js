const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
    name: "pair",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let target = args[0]?.replace(/[^0-9]/g, "");
        if (!target) return sock.sendMessage(from, { text: "⚡ *SYSTEM:* Target Required." });

        await sock.sendMessage(from, { text: "🛡️ *SAVAGE-V3:* Initiating secure handshake..." });

        try {
            const { state } = await useMultiFileAuthState("./temp_pairs/" + target);
            const tempSock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
                },
                logger: pino({ level: "silent" }),
                printQRInTerminal: false
            });

            if (!tempSock.authState.creds.registered) {
                await delay(3000);
                const code = await tempSock.requestPairingCode(target);
                
                // 💎 ELITE DOUBLE-LINE BLUEPRINT
                const responseText = `
╔════════════════════════╗
     ⚡ *SAVAGE CONNECTION* ⚡
╠════════════════════════╣
║
║  💠 *NODE:* +${target}
║  🧬 *CODE:* \`${code.toUpperCase().split("").join("  ")}\`
║  🛡️ *RANK:* ARCHITECT
║
╠════════════════════════╣
║     *ACCESS PROTOCOLS* ║
╠════════════════════════╣
║ 1. Linked Devices      ║
║ 2. Link with Number    ║
║ 3. Enter Neural Key    ║
╚════════════════════════╝
   *“FORGING THE SYNDICATE”*
                `.trim();

                await sock.sendMessage(from, { text: responseText }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(from, { text: "💀 *FATAL:* Link Interrupted." });
        }
    }
};
