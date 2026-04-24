const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
    name: "pair",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let target = args[0]?.replace(/[^0-9]/g, "");

        if (!target) return sock.sendMessage(from, { text: "❌ *Error:* Provide a number! (.pair 254...)" });

        await sock.sendMessage(from, { text: "⏳ *Savage-Tech:* Generating unique neural link code..." });

        // Create a temporary state for the other person
        const { state } = await useMultiFileAuthState(`./temp_pairs/${target}`);
        
        try {
            const tempSock = makeWASocket({
                auth: state,
                logger: pino({ level: "silent" }),
                printQRInTerminal: false
            });

            if (!tempSock.authState.creds.registered) {
                await delay(2000); // Wait for socket to stabilize
                const code = await tempSock.requestPairingCode(target);

                const responseText = `
╔══════════════════════╗
       🔑 *EXTERNAL PAIR* 🔑
╠══════════════════════╣
║
║ 📱 *TARGET:* ${target}
║ 🔐 *CODE:* ${code.toUpperCase()}
║
╠══════════════════════╣
   *“LINKING NEW NODE...”*
   
   Enter this code on your 
   WhatsApp "Link Device"
   section now.
╚══════════════════════╝
                `.trim();

                await sock.sendMessage(from, { text: responseText }, { quoted: msg });
                
                // Clean up: Close temp socket after 2 mins
                setTimeout(async () => {
                    await tempSock.logout();
                }, 120000);
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ *System Error:* Failed to link neural net." });
        }
    }
};
