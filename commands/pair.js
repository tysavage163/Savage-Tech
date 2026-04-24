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
        const sender = msg.key.participant || msg.key.remoteJid;
        
        let target = args[0]?.replace(/[^0-9]/g, "");

        if (!target) {
            return sock.sendMessage(from, { 
                text: "⚡ *SYSTEM ERROR:* Provide a target number.\n*Format:* .pair 254..." 
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: "🌌 *Savage-Tech:* Piercing WhatsApp firewalls... generating node access." });

        const { state } = await useMultiFileAuthState(`./temp_pairs/${target}`);
        
        try {
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

                // 🌌 CYBER-GRID AESTHETIC
                const responseText = `
╔════════════════════════╗
   ⚡ *NEURAL LINK ESTABLISHED* ⚡
╠════════════════════════╣
║
║ 💠 *NODE:* ${target}
║ 🧬 *AUTH:* ${code.toUpperCase().split('').join(' ')}
║ ⏱️ *TTL:* 120 SECONDS
║
╠════════════════════════╣
║       *ACCESS PROTOCOL* ║
╠════════════════════════╣
║ 1. Open WA > Linked Devices    ║
║ 2. Link with phone number      ║
║ 3. Input the Neural Code       ║
╚════════════════════════╝
   *“FORGING THE SYNDICATE”*
                `.trim();

                await sock.sendMessage(from, { 
                    text: responseText,
                    mentions: [sender]
                }, { quoted: msg });

                setTimeout(async () => {
                    tempSock.ev.removeAllListeners();
                }, 120000);
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "💀 *CRITICAL FAILURE:* Neural link rejected by host." });
        }
    }
};
