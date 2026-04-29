/*
╔══════════════════════════════════════════════════════╗
║  .pair – Get WhatsApp Pairing Code (Separate Socket) ║
║  Usage: .pair 254712345678                           ║
╚══════════════════════════════════════════════════════╝
*/
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: 'pair',
    category: 'tools',
    description: 'Generate a pairing code to link a new device',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const phoneNumber = args[0];

        if (!phoneNumber) {
            return await sock.sendMessage(from, {
                text: '❌ *Usage:* `.pair 254712345678`\n_Include country code without "+" or spaces._'
            });
        }
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return await sock.sendMessage(from, {
                text: '❌ *Invalid number!*\nUse only digits with country code (e.g., 254712345678).'
            });
        }

        await sock.sendMessage(from, {
            text: `📡 *Requesting pairing code for* \`${phoneNumber}\`...\n_This may take up to 20 seconds._`
        });

        // Create a temporary session directory (unique per request)
        const tempSession = path.join(__dirname, '../temp_pair_session');
        if (!fs.existsSync(tempSession)) fs.mkdirSync(tempSession, { recursive: true });

        try {
            const { state, saveCreds } = await useMultiFileAuthState(tempSession);
            const pairSocket = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
                browser: ['Windows', 'Chrome', '114.0.5735.198'],
                printQRInTerminal: false
            });

            pairSocket.ev.on('creds.update', saveCreds);

            let pairingCode = null;
            let errorOccurred = null;

            // Listen for the pairing code
            pairSocket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'open') {
                    // Once connected, request the pairing code
                    try {
                        pairingCode = await pairSocket.requestPairingCode(phoneNumber);
                    } catch (err) {
                        errorOccurred = err;
                    }
                } else if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    if (statusCode !== DisconnectReason.loggedOut && !pairingCode) {
                        errorOccurred = new Error(`Connection closed with code ${statusCode}`);
                    }
                }
            });

            // Wait for the pairing code or timeout after 30 seconds
            const result = await Promise.race([
                new Promise((resolve) => {
                    const interval = setInterval(() => {
                        if (pairingCode) {
                            clearInterval(interval);
                            resolve({ code: pairingCode });
                        } else if (errorOccurred) {
                            clearInterval(interval);
                            resolve({ error: errorOccurred });
                        }
                    }, 500);
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Pairing request timed out')), 30000))
            ]);

            if (result.error) throw result.error;

            // Send the code to the user
            await sock.sendMessage(from, {
                text: `🔐 *Your Pairing Code:*\n\`\`\`${result.code}\`\`\`\n\n📱 *How to use:*\n1️⃣ Open WhatsApp on your phone\n2️⃣ Go to *Settings* → *Linked Devices* → *Link a Device*\n3️⃣ Enter this code.\n\n⏳ *Expires in 5 minutes.*`
            });

            // Clean up: close the temp socket and delete session files
            await pairSocket.logout();
            if (fs.existsSync(tempSession)) {
                fs.rmSync(tempSession, { recursive: true, force: true });
            }
        } catch (error) {
            console.error('Pairing error:', error);
            await sock.sendMessage(from, {
                text: '❌ *Failed to generate pairing code.*\n' +
                    (error.message.includes('timeout') ? 'The request timed out. Please try again.' :
                     error.message.includes('rate') ? 'Too many attempts. Wait a few minutes.' :
                     'Check the number and try again (include country code, e.g., 254...).')
            });
            // Clean up temporary session if it exists
            if (fs.existsSync(tempSession)) {
                fs.rmSync(tempSession, { recursive: true, force: true });
            }
        }
    }
};
