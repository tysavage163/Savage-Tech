const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// --- CONFIGURATION ---
const prefix = "!"; // Your default prefix
const ownerNumber = "254XXXXXXXXX"; // Change to your number

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false, // 🛡️ NO QR CODE
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 🛰️ INTERACTIVE PHONE PAIRING
    if (!sock.authState.creds.registered) {
        console.log("\n--- SAVAGE-TECH PANEL DEPLOYMENT ---");
        const phoneNumber = await question('📞 Enter phone number (e.g. 254123456789): ');
        const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanedNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n🚀 YOUR PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.error("Pairing Error:", err);
            }
        }, 3000);
    }

    // 💾 SAVE CREDS
    sock.ev.on('creds.update', saveCreds);

    // ✉️ MESSAGE HANDLER (Commands Logic)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const content = JSON.stringify(mek.message);
            const type = Object.keys(mek.message)[0];
            const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';

            // Example Command: !update
            if (command === 'update') {
                await sock.sendMessage(mek.key.remoteJid, { text: 'Checking for Savage-Tech updates...' });
                // Add your git pull logic here
            }

            // Example Command: !setprefix
            if (command === 'setprefix') {
                const newPrefix = body.slice(prefix.length + 10);
                await sock.sendMessage(mek.key.remoteJid, { text: `Prefix changed to: ${newPrefix}` });
            }

        } catch (err) {
            console.log(err);
        }
    });

    // 🔄 CONNECTION UPDATES
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        } else if (connection === 'open') {
            console.log('✅ Savage-Tech is Online!');
        }
    });
}

startSavage();
