const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function connectSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // QR is disabled for pairing mode
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- AUTOMATIC PAIRING CODE GENERATOR ---
    if (!sock.authState.creds.registered) {
        const myNumber = "254765956776"; 
        
        console.log("⏳ REQUESTING PAIRING CODE FOR:", myNumber);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(myNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("\n🔥 SAVAGE-TECH PAIRING CODE: " + code + "\n");
                console.log("👉 ON YOUR PHONE: Link a Device > Link with Phone Number Instead");
            } catch (err) {
                console.log("❌ PAIRING ERROR:", err);
            }
        }, 5000); // Gives the bot 5 seconds to wake up
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ SAVAGE-TECH IS OFFICIALLY ONLINE.');
            
            // Auto-load commands from the folder
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            console.log(`🚀 ${commandFiles.length} Savage Commands Ready!`);
        } else if (connection === 'close') {
            console.log("⚠️ Connection closed. Retrying...");
            connectSavage();
        }
    });

    // MESSAGE LISTENER
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const msg = m.message.conversation || m.message.extendedTextMessage?.text || "";
        
        if (msg.startsWith('!ping')) {
            await sock.sendMessage(m.key.remoteJid, { text: '⚡ Savage-Tech is Active and Lethal!' });
        }
    });
}

connectSavage();
