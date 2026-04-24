const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

// ===== 1. SETTINGS & HIERARCHY =====
global.prefix = "."; 
global.architect = "254798841125"; // YOU: The Creator
global.commands = new Map();
global.antideleteMode = "on"; // Default mode
const messageStore = new Map(); // Memory for Antidelete

// ===== 2. COMMAND LOADER =====
const loadCommands = () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

// ===== 3. START SYSTEM =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SESSION NOT FOUND. SCAN TO CONNECT:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. MESSAGE HANDLER & HIERARCHY =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Anti-Delete: Deep copy message
