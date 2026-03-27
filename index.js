const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('savage_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    // Save login progress
    sock.ev.on('creds.update', saveCreds);

    // Connection Logic
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('--- SCAN TO START SAVAGE TECH ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') console.log('Savage Tech is ONLINE ✅');
    });

    // Message Logic
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const messageText = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (!messageText.startsWith('.')) return;

        const args = messageText.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const from = m.key.remoteJid;

        // Command Handler (Looking into /commands folder)
        try {
            const commandFile = `./commands/${command}.js`;
            if (fs.existsSync(commandFile)) {
                const cmd = require(commandFile);
                await cmd.execute(sock, m, args);
            }
        } catch (error) {
            console.error("Command Error:", error);
        }
    });
}

// Create commands folder if it doesn't exist
if (!fs.existsSync('./commands')) fs.mkdirSync('./commands');

startSavage();
