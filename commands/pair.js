const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
    name: "pair",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let target = args[0]?.replace(/[^0-9]/g, "");

        if (!target) return sock.sendMessage(from, { text: "⚡ *SYSTEM:* Provide a number. (.pair 254...)" });

        await sock.sendMessage(from, { text: "🌌 *Savage-Tech:* Generating Neural Link..." });

        try {
            // Using a unique path for the temp session
            const { state } = await useMultiFileAuthState(`./temp_pairs/${target}`);
            
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

                const responseText = `
╔════════════════════════╗
   ⚡ *NEURAL LINK ESTABLISHED* ⚡
╠════════════════════════╣
║
║ 💠 *NODE:* ${target}
║ 🧬 *AUTH:* ${code.toUpperCase().split('').join(' ')}
║
╠════════════════════════╣
║ 1. Open WA > Linked Devices    ║
║ 2. Link with phone number      ║
║ 3. Input the Neural Code       ║
╚════════════════════════╝
                `.trim();

                await sock.sendMessage(from, { text: responseText }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(from, { text: "💀 *FAILURE:* Link rejected." });
        }
    }
};
