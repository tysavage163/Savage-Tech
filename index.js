const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// Configuration
global.prefix = "."; 
global.commands = new Map();
const store = new Map(); // For Antidelete tracking

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
            }
        } catch (err) {
            console.error(`Error loading ${file}:`, err.message);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded into the body.`);
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
        browser: ["Savage-Tech", "Safari", "1.0.0"],
        printQRInTerminal: true // 📸 This handles the QR generation
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") console.log("\n🚀 BOT IS LIVE & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    // --- MESSAGE HANDLER (Commands & Antidelete) ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // Store message for Antidelete logic
        if (!store.has(from)) store.set(from, new Map());
        store.get(from).set(msg.key.id, msg);

        // Prefix Command Logic
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = global.commands.get(cmdName);

            if (command) {
                try {
                    await command.execute(sock, msg, args, store);
                } catch (e) {
                    console.log(`Error executing ${cmdName}:`, e);
                }
            }
        }
    });
}

startSavage();
