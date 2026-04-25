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
    "Don't tag me unless it's a life or death situation. Even then, think twice.",
    "Your notification isn't worth my attention.",
    "I'm busy building; you're busy tagging. We aren't the same.",
    "Why mention the king when you have nothing to say?",
    "System busy. Don't disturb the silence.",
    "You're screaming in a void I've already left.",
    "My time is expensive. You're currently wasting it.",
    "Error 403: Access to my attention is denied.",
    "If I wanted your opinion, I would have programmed it into myself.",
    "Tags are for followers. I don't follow.",
    "You're a guest in this chat. Act like one.",
    "I don't respond to noise. Try logic next time.",
    "My silence was your answer. You should have taken it.",
    "I’m the architect of this system. You’re just a data point.",
    "Lower your tone when typing my name.",
    "Noted. Now go back to being irrelevant.",
    "Was that supposed to matter to me?",
    "Checking the logs... No one asked.",
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
    // Check for Session ID and convert it back to credentials
    if (SESSION_ID && SESSION_ID !== "PASTE_YOUR_ID_HERE" && !fs.existsSync("./session/creds.json")) {
        if (!fs.existsSync("./session")) fs.mkdirSync("./session");
        try {
            const credsData = Buffer.from(SESSION_ID.split("SΛVΛGΞ-MD~")[1], "base64").toString("utf-8");
            fs.writeFileSync("./session/creds.json", credsData);
            console.log("💎 SESSION ID DETECTED: Authenticating...");
        } catch (e) {
            console.log("⚠️ Session ID invalid or corrupted.");
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
        printQRInTerminal: false, // Handled manually for dual-mode
        logger: pino({ level: "silent" }),
        browser: ["SΛVΛGΞ TECH", "Safari", "1.0.0"]
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        
        // DUAL MODE: Show QR only if no session exists and no Session ID is provided
        if (qr && (!SESSION_ID || SESSION_ID === "PASTE_YOUR_ID_HERE") && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 NO SESSION FOUND. SCAN QR OR USE PAIR SITE:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH CONNECTED & READY!");
            console.log(`Protocol active for: ${sock.user.id.split(":")[0]}\n`);
        }
        
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection lost. Re-establishing protocol...");
                startSavage();
            } else {
                console.log("❌ Device logged out. Clear session folder and restart.");
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
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "").trim();

        // --- ANTITAG DETECTION ---
        if (global.antitag === 'on' && !msg.key.fromMe) {
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const isTagged = mentions.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');

            if (isTagged) {
                const reply = savageReplies[Math.floor(Math.random() * savageReplies.length)];
                await sock.sendMessage(from, { 
                    text: `*SΛVΛGΞ-TECH:* ${reply}`,
                    mentions: [sender]
                }, { quoted: msg });
            }
        }

        // --- AUTO-VIEW STATUS ---
        if (from === "status@broadcast" && global.autoViewStatus === "on") {
            try { await sock.readMessages([msg.key]); } catch (e) {}
            return; 
        }

        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
        setTimeout(() => messageStore.delete(msg.key.id), 3600000);

        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const isMe = msg.key.fromMe; 
        const isArchitect = sender.includes(global.architect); 
        const hasAccess = isArchitect || isMe; 

        const cmd = global.commands.get(commandName);
        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, { isArchitect, isMe, hasAccess });
            } catch (e) { console.error(`❌ Error in ${commandName}:`, e); }
        }
    });

    // ===== 5. ANTI-DELETE ENGINE =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            const isDelete = update.update.protocolMessage?.type === 0 || update.update.message === null;
            if (isDelete && global.antideleteMode === "on") {
                const key = update.key || update.update.protocolMessage?.key;
                const prevMsg = messageStore.get(key.id);
                if (prevMsg) {
                    const senderJid = prevMsg.key.participant || prevMsg.key.remoteJid;
                    const content = prevMsg.message?.conversation || prevMsg.message?.extendedTextMessage?.text || "Media Content (Image/Video/Audio)";
                    const log = `━━━ SAVAGE-RECOVERY ━━━\n\nSENDER: @${senderJid.split("@")[0]}\nCONTENT: ${content}\n\n━━━━━━━━━━━━━━━━━━━━`;
                    const hostJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    await sock.sendMessage(hostJid, { text: log, mentions: [senderJid] });
                }
            }
        }
    });
}

// ===== 6. BOOT =====
loadCommands();
startSavage();
