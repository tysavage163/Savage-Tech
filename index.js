const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal'); // Added for better QR display

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false // We will handle QR manually below
    });

    // --- Command Loader ---
    const commands = new Map();
    const loadCommands = () => {
        const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.set(command.name, command);
        }
        console.log(`🚀 SAVAGE TECH: ${commands.size} Commands Loaded!`);
    };
    if (fs.existsSync('./commands')) loadCommands();

    // --- QR & Connection Handler ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Show QR Code manually if it exists
        if (qr) {
            console.log('--- SCAN THE QR CODE BELOW ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Connection closed. Reconnecting in 5 seconds...');
            if (shouldReconnect) {
                setTimeout(() => startSavage(), 5000); // Wait 5 seconds before retrying
            }
        } else if (connection === 'open') {
            console.log('✅ SAVAGE-TECH ONLINE: Connected to WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- Message Handler ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const prefix = '!';
        if (!text.startsWith(prefix)) return;
        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        if (commands.has(commandName)) {
            try {
                await commands.get(commandName).execute(sock, m, args);
            } catch (err) {
                console.error(err);
            }
        }
    });
}

startSavage();
