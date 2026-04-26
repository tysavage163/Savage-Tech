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
global.welcomeStore = new Set(); // Temporary store for toggled welcome groups
const messageStore = new Map(); 

const SESSION_ID = process.env.SESSION_ID || "PASTE_YOUR_ID_HERE"; 

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
    if (SESSION_ID && SESSION_ID !== "PASTE_YOUR_ID_HERE" && !fs.existsSync("./session/creds.json")) {
        if (!fs.existsSync("./session")) fs.mkdirSync("./session");
        try {
            const base64Data = SESSION_ID.includes("SΛVΛGΞ-MD~") ? SESSION_ID.split("SΛVΛGΞ-MD~")[1] : SESSION_ID;
            const credsData = Buffer.from(base64Data, "base64").toString("utf-8");
            fs.writeFileSync("./session/creds.json", credsData);
            console.log("💎 SESSION ID INSTALLED: Authenticating...");
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
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "121.0.6167.85"] 
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr && (!SESSION_ID || SESSION_ID === "PASTE_YOUR_ID_HERE") && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN QR OR USE YOUR PAIR SITE:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE AND CONNECTED!");
        }
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection lost. Reconnecting...");
                setTimeout(() => startSavage(), 5000);
            } else {
                console.log("❌ Logged out. Clearing session...");
                fs.rmSync("./session", { recursive: true, force: true });
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. GREETING ENGINE (WELCOME) =====
    sock.ev.on('group-participants.update', async (anu) => {
        // Only trigger if Welcome is ON for this group
        if (!global.welcomeStore.has(anu.id)) return;

        try {
            const metadata = await sock.groupMetadata(anu.id);
            const participants = anu.participants;
            
            for (let num of participants) {
                let ppuser;
                try {
                    ppuser = await sock.profilePictureUrl(num, 'image');
                } catch {
                    ppuser = 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png';
                }

                if (anu.action == 'add') {
                    const welcomeText = `
╔════◇ 【 **ЩΣLCӨMΣ** 】 ◇════╗
║
┣┫ 👤 **UƧΣЯ:** @${num.split('@')[0]}
┣┫ 👋 **STATUS:** Joined the territory
┣┫ 👥 **MEMBERS:** ${metadata.participants.length}
║
┣━━◇ 【 **VIBE CHECK** 】 ◇━━┫
║
┣┫ ✨ Hope you're the "Savage" type.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

                    await sock.sendMessage(anu.id, { 
                        image: { url: ppuser }, 
                        caption: welcomeText, 
                        mentions: [num] 
                    });
                }
            }
        } catch (err) {
            console.log(err);
        }
    });

    // ===== 5. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

        // ANTITAG
        if (global.antitag === 'on' && !msg.key.fromMe) {
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentions.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net')) {
                const reply = savageReplies[Math.floor(Math.random() * savageReplies.length)];
                await sock.sendMessage(from, { text: `*SΛVΛGΞ-TECH:* ${reply}`, mentions: [sender] }, { quoted: msg });
            }
        }

        // AUTO-VIEW STATUS
        if (from === "status@broadcast" && global.autoViewStatus === "on") {
            try { await sock.readMessages([msg.key]); } catch (e) {}
            return; 
        }

        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
        setTimeout(() => messageStore.delete(msg.key.id), 3600000);

        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        
        // Handle Welcome Toggle directly for reliability
        if (commandName === 'welcome') {
            const mode = args[0]?.toLowerCase();
            if (mode === 'on') {
                global.welcomeStore.add(from);
                return sock.sendMessage(from, { text: "✅ *SΛVΛGΞ Welcome System: ACTIVATED*" }, { quoted: msg });
            } else if (mode === 'off') {
                global.welcomeStore.delete(from);
                return sock.sendMessage(from, { text: "❌ *SΛVΛGΞ Welcome System: DEACTIVATED*" }, { quoted: msg });
            }
        }

        const cmd = global.commands.get(commandName);
        if (cmd) {
            const isArchitect = sender.includes(global.architect);
            const isMe = msg.key.fromMe;
            try {
                await cmd.execute(sock, msg, args, { isArchitect, isMe, hasAccess: (isArchitect || isMe) });
            } catch (e) { console.error(`❌ Error:`, e); }
        }
    });

    // ===== 6. ANTI-DELETE ENGINE =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            const isDelete = update.update.protocolMessage?.type === 0;
            if (isDelete && global.antideleteMode === "on") {
                const key = update.key || update.update.protocolMessage?.key;
                const prevMsg = messageStore.get(key.id);
                if (prevMsg) {
                    const senderJid = prevMsg.key.participant || prevMsg.key.remoteJid;
                    const content = prevMsg.message?.conversation || prevMsg.message?.extendedTextMessage?.text || "Media Content";
                    const log = `━━ SAVAGE-RECOVERY ━━\n\nSENDER: @${senderJid.split("@")[0]}\nDELETED: ${content}\n\n━━━━━━━━━━━━━━`;
                    await sock.sendMessage(sock.user.id.split(':')[0] + '@s.whatsapp.net', { text: log, mentions: [senderJid] });
                }
            }
        }
    });
}

loadCommands();
startSavage();
