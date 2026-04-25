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
global.architect = "254798841125"; 
global.commands = new Map();
global.antideleteMode = "on"; 
global.autoViewStatus = "on"; 
global.antitag = "on"; 
const messageStore = new Map(); 

// Paste your Session ID here after forging it on your site
const SESSION_ID = "PASTE_YOUR_ID_HERE"; 

const savageReplies = [
    "Don't tag me unless it's a life or death situation.",
    "Your notification isn't worth my attention.",
    "I'm busy building; you're busy tagging. We aren't the same.",
    "Error 403: Access to my attention is denied.",
    "Connection terminated. Your input was unnecessary."
];

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

// ===== 3. START SYSTEM =====
async function startSavage() {
    // FIX 1: Improved Session Decoding
    if (SESSION_ID && SESSION_ID !== "PASTE_YOUR_ID_HERE" && !fs.existsSync("./session/creds.json")) {
        if (!fs.existsSync("./session")) fs.mkdirSync("./session");
        try {
            // Added check to ensure the ID contains the separator
            const base64Data = SESSION_ID.includes("SΛVΛGΞ-MD~") ? SESSION_ID.split("SΛVΛGΞ-MD~")[1] : SESSION_ID;
            const credsData = Buffer.from(base64Data, "base64").toString("utf-8");
            fs.writeFileSync("./session/creds.json", credsData);
            console.log("💎 SESSION ID INSTALLED SUCCESSFULLY.");
        } catch (e) {
            console.log("⚠️ Session ID invalid. Falling back to QR mode.");
        }
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
        // FIX 2: Stronger Browser Identity for Render/Termux
        browser: ["Ubuntu", "Chrome", "121.0.6167.85"] 
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        
        if (qr && (!SESSION_ID || SESSION_ID === "PASTE_YOUR_ID_HERE") && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN THE QR CODE BELOW:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
        }
        
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            // FIX 3: Robust Reconnection Logic
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection lost. Reconnecting...");
                setTimeout(() => startSavage(), 5000); // 5-second buffer to prevent loop
            } else {
                console.log("❌ Logged out. Delete 'session' folder to reset.");
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // [Rest of your Message Handler and Anti-Delete Engine remain the same]
    // ... (Handler code here)
}

loadCommands();
startSavage();
