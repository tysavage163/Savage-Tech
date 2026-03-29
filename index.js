const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    });

    const commands = new Map();
    const commandPath = './commands';
    
    if (fs.existsSync(commandPath)) {
        const files = fs.readdirSync(commandPath).filter(f => f.endsWith('.js'));
        for (const file of files) { 
            const command = require(`./commands/${file}`);
            if (command.name) {
                commands.set(command.name, command);
            }
        }
        console.log(`🚀 SAVAGE TECH: ${commands.size} Commands Loaded!`);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\n--- SCAN THIS QR CODE ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(() => startSavage(), 5000);
        } else if (connection === 'open') {
            console.log('✅ SAVAGE-TECH IS LIVE!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (!text.startsWith('!')) return;

        const args = text.slice(1).trim().split(/ +/);
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
