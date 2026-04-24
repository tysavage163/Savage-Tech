const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");

const messagesCache = new Map();
global.commands = new Map();
global.prefix = ".";

function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) global.commands.set(command.name, command);
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
        // --- QR CODE ENABLED ---
        printQRInTerminal: true, 
        logger: pino({ level: "fatal" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        if (!messagesCache.has(from)) messagesCache.set(from, new Map());
        messagesCache.get(from).set(msg.key.id, msg);
    });

    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cached = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cached && cached.message) {
                const content = cached.message.conversation || cached.message.extendedTextMessage?.text || "Media Message";
                await sock.sendMessage(key.remoteJid, { text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` });
            }
        } catch (e) { }
    });

    sock.ev.on("connection.update", (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === "open") console.log("✅ BOT CONNECTED SUCCESSFULLY");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });
}

startSavage();
