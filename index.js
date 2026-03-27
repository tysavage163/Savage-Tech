const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    // --- Optimized Command Loader ---
    const commands = new Map();
    const loadCommands = () => {
        const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.set(command.name, command);
        }
        console.log(`🚀 SAVAGE TECH: ${commands.size} Commands Loaded Successfully!`);
    };

    if (fs.existsSync('./commands')) loadCommands();

    // --- Connection Handler ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        } else if (connection === 'open') {
            console.log('✅ Savage-Tech V1 is Online! Connected to WhatsApp.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- Message Handler ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const prefix = '!'; // Set to ! for Savage-Tech

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            try {
                await command.execute(sock, m, args);
            } catch (err) {
                console.error("Savage Tech Error:", err);
                await sock.sendMessage(m.key.remoteJid, { text: '❌ An error occurred while running this command.' });
            }
        }
    });
}

startSavage();
