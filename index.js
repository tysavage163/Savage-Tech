const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys");

// FIX: Bulletproof import for Store
const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore;

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

// ===== 1. SETTINGS & HIERARCHY =====
global.prefix = "."; 
global.architect = "254798841125"; // YOU: The God Mode
global.commands = new Map();
const store = makeInMemoryStore ? makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) : null;
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
    console.log(`✅ ${global.commands.size} Commands loaded.`);
};

// ===== 3. START SYSTEM =====
async function startSavage() {
    // --- SESSION ID RESTORATION ---
    const session_id = process.env.SESSION_ID;
    if (session_id && session_id.startsWith("SAVAGE-TECH~")) {
        const encodedData = session_id.split("SAVAGE-TECH~")[1];
        if (!fs.existsSync('./session')) fs.mkdirSync('./session');
        fs.writeFileSync('./session/creds.json', Buffer.from(encodedData, 'base64').toString());
        console.log("🛡️ Session restored from SAVAGE-TECH ID!");
    }

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

    if (store) store.bind(sock.ev);

    // Connection Updates
    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SCAN TO CONNECT SAVAGE-TECH:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Anti-Delete: Cache message
        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
        setTimeout(() => messageStore.delete(msg.key.id), 3600000);

        const isMe = msg.key.fromMe;
        const isArchitect = sender.includes(global.architect);
        const hasAccess = isArchitect || isMe;

        const
