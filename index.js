const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const qrcode = require('qrcode-terminal'); // This forces the QR into the terminal

async function startSavageTech() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version } = await fetchLatestBaileysVersion();

    console.log("📡 INITIALIZING ENGINE...");

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true, // Internal Baileys QR
        logger: require('pino')({ level: 'silent' }),
    });

    // 1. LOAD COMMANDS
    const commands = new Map();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.set(command.name, command);
    }
    console.log(`🚀 SAVAGE TECH: ${commands.size} Commands Loaded!`);

    // 2. CONNECTION MONITOR
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // FORCE QR DISPLAY IF IT APPEARS
        if (qr) {
            console.log('📸 SCAN THE QR CODE BELOW:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavageTech();
        } else if (connection === 'open') {
            console.log('✅ SYSTEM ONLINE: Savage-Tech is connected.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 3. MESSAGE HANDLER
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const msgText = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (!msgText.startsWith('!')) return;

        const args = msgText.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = commands.get(commandName);

        if (command) {
            try {
                await command.execute(sock, m, args);
            } catch (err) {
                console.log("Command Error:", err);
            }
        }
    });
}

startSavageTech();
