const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");

// Configuration
global.prefix = "."; 
global.commands = new Map();

// --- DYNAMIC COMMAND LOADER ---
function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            }
        } catch (err) { }
    }
}

async function startSavage() {
    loadCommands();
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        logger: pino({ level: "fatal" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    // --- QR CODE HANDLER ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("\n📸 SCAN THE QR CODE BELOW:");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n✅ BOT CONNECTED!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- PREFIX & ANTIDELETE HANDLER ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = global.commands.get(cmdName);
            if (command) await command.execute(sock, msg, args);
        }
    });
}

startSavage();
