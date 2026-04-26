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

// ===== 1. CORE SYSTEM SETTINGS =====
global.prefix = "."; 
global.commands = new Map();
global.blacklist = new Set(); 
global.antideleteMode = "on"; 
global.autoViewStatus = "on"; 
global.worktype = "public"; 
const messageStore = new Map(); 

const SESSION_ID = process.env.SESSION_ID || "PASTE_YOUR_ID_HERE"; 

// ===== 2. COMMAND LOADER =====
const loadCommands = () => {
    global.commands.clear();
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const fullPath = require.resolve(`./commands/${file}`);
            delete require.cache[fullPath]; 
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

// ===== 3. BOOT SEQUENCE =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: ["SΛVΛGΞ-TECH", "Chrome", "121.0.6167.85"] 
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr && (!SESSION_ID || SESSION_ID === "PASTE_YOUR_ID_HERE") && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN QR TO INITIALIZE NEURAL LINK:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            await sock.sendMessage(myNumber, { text: "╔════════════════════╗\n      ⛓️ **SΛVΛGΞ-TECH V1** ⛓️\n╚════════════════════╝\n\n📡 **STATUS:** MASTER RECOGNIZED\n👤 **ROLE:** ARCHITECT\n🛡️ **SYSTEM:** SECURE" });
        }
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(() => startSavage(), 5000);
            } else {
                console.log("❌ Logged out. Clearing session...");
                fs.rmSync("./session", { recursive: true, force: true });
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isMe = msg.key.fromMe; // The core master check

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        
        const cmd = global.commands.get(commandName);
        if (cmd) {
            // Permission Bridge
            if (global.worktype === 'private' && !isMe) return;

            try {
                await cmd.execute(sock, msg, args, { isArchitect: isMe, isMe });
            } catch (e) { 
                console.error(`❌ Command Error [${commandName}]:`, e);
                if (e.message.includes('toUpperCase')) {
                    await sock.sendMessage(from, { text: "⚠️ **SYSTEM ERROR:** Arguments required for this command." });
                }
            }
        }
    });
}

loadCommands();
startSavage();
