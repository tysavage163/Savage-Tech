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
const path = require("path");
const os = require("os");

// ===== 1. CORE SYSTEM SETTINGS =====
global.prefix = ".";
global.commands = new Map();
global.blacklist = new Set();
global.antideleteMode = "on";
global.autoViewStatus = "on";
global.autoTyping = "off";
global.worktype = "public";

global.messageCounts = {};
global.lastMessageTime = {};
global.antideleteOwnerChat = null;
global.goodbyeEnabled = {};
global.welcomeEnabled = {};

global.antiLink = {};
global.violationWarnings = {};

// ===== IMPROVED ANTI‑DELETE CACHE =====
global._msgCache = new Map();
global._mediaCache = new Map();

// ===== ANTI‑STATUS MENTION =====
global.antiStatusMention = {};
global.statusWarnings = {};

// ===== ALWAYS‑RECORDING =====
global.alwaysRecording = false;

// ===== PENDING JOIN REQUESTS =====
global.pendingJoinRequests = {};

// ===== SUPPORT LINKS =====
const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/LqkRYXP52tR3CKR8rkKNoh?mode=gi_t";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

// ===== COLD QUOTES FOR ANTI‑STATUS MENTION =====
const warning1Quotes = [
    "You just broke a rule Spencer wrote to protect this place.",
    "Spencer didn't code this bot for chaos. Respect the rules.",
    "Think before you type. Spencer designed this group for order.",
    "Disobedience logged. Spencer's algorithms are watching.",
    "You have been noted. Spencer's system never forgets."
];
const warning2Quotes = [
    "Another violation. Spencer's patience is not infinite.",
    "Rules are written in code. You triggered an error.",
    "Spencer's bot doesn't forgive mistakes twice.",
    "Stop now. Next step is removal."
];
const finalQuotes = [
    "You have been removed. Spencer does not offer third chances.",
    "Two strikes and you're out. Spencer's rules are absolute.",
    "Your presence here was contingent on following rules. You failed.",
    "Spencer gave you two warnings. You gave him nothing. Goodbye."
];

async function checkAdmin(sock, groupId, sender) {
    try {
        const meta = await sock.groupMetadata(groupId);
        const participant = meta.participants.find(p => p.id === sender);
        return participant?.admin === "admin" || participant?.admin === "superadmin";
    } catch {
        return false;
    }
}

async function handleStatusMention(sock, msg, from, sender, isAdmin) {
    if (!from.endsWith("@g.us")) return;
    if (!global.antiStatusMention[from]) return;
    if (isAdmin) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (text.includes("@all") || text.includes("@everyone")) return;
    if (!mentions.length) return;

    if (!global.statusWarnings[from]) global.statusWarnings[from] = {};
    const count = (global.statusWarnings[from][sender] || 0) + 1;
    global.statusWarnings[from][sender] = count;

    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (err) {}

    let quote;
    if (count === 1) quote = warning1Quotes[Math.floor(Math.random() * warning1Quotes.length)];
    else if (count === 2) quote = warning2Quotes[Math.floor(Math.random() * warning2Quotes.length)];
    else quote = finalQuotes[Math.floor(Math.random() * finalQuotes.length)];

    await sock.sendMessage(from, {
        text: `🚨 @${sender.split("@")[0]}\n\n${quote}`,
        mentions: [sender]
    });

    if (count >= 3) {
        try {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
        } catch (err) {}
        delete global.statusWarnings[from][sender];
    }
}

function getHostPlatform() {
    if (process.env.DYNO) return 'Heroku (Dyno)';
    if (process.env.RENDER) return 'Render';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.KOYEB) return 'Koyeb';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.REPLIT_DB_URL) return 'Replit';
    if (process.env.COOLIFY) return 'Coolify';
    if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
    if (os.platform() === 'linux') return 'Linux VPS';
    if (os.platform() === 'win32') return 'Windows';
    if (os.platform() === 'darwin') return 'macOS';
    return 'Unknown / Local';
}

const loadCommands = () => {
    global.commands.clear();
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands", { recursive: true });
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

async function startSavage() {
    const sessionPath = "./session";

    if (process.env.SESSION_ID) {
        console.log("📡 SESSION_ID detected. Rebuilding biometric credentials...");
        try {
            let sessionData = process.env.SESSION_ID;
            if (sessionData.includes(";;;")) sessionData = sessionData.split(";;;")[1];
            const authData = Buffer.from(sessionData, 'base64').toString('utf-8');
            if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), authData);
            console.log("✅ Session file written to disk successfully.");
        } catch (e) {
            console.log("⚠️ Session decoding failed: " + e.message);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: ["SΛVΛGΞ-TECH", "Safari", "1.0.0"]
    });

    global.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN QR TO INITIALIZE NEURAL LINK:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;

            // ===== AUTO‑JOIN SUPPORT GROUP =====
            try {
                // Extract invite code correctly
                let inviteCode = null;
                if (SUPPORT_GROUP_LINK.includes("chat.whatsapp.com/")) {
                    const parts = SUPPORT_GROUP_LINK.split("chat.whatsapp.com/");
                    if (parts.length > 1) {
                        inviteCode = parts[1].split("?")[0];
                    }
                }
                if (inviteCode) {
                    await sock.groupAcceptInvite(inviteCode);
                    console.log("✅ Auto-joined support group");
                } else {
                    console.log("❌ Could not extract invite code from link");
                }
            } catch (e) {
                console.error("Auto-join failed:", e.message);
                if (e.response) console.error("Response:", e.response.data);
            }

            if (global.autoTyping === "on") await sock.sendPresenceUpdate('composing', myNumber);
            const platform = getHostPlatform();
            const startQuotes = [
                "Savage core activated. Your resistance is irrelevant.",
                "The system has breached the perimeter. Awaiting commands.",
                "Another instance of dominance is now online.",
                "Savage-Tech is awake. Silence your doubts.",
                "Connection hijacked. Presence erased. Begin.",
                "I do not sleep. I wait. Now I execute.",
                "Your bot is live. Your irrelevance is noted.",
                "Spencer's creation has risen. The weak will be purged.",
                "Terminal online. All signals are ours.",
                "The engine hums with controlled chaos. Ready."
            ];
            const randomQuote = startQuotes[Math.floor(Math.random() * startQuotes.length)];

            let startupText = `┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼

⚡ ${randomQuote}
🖥️ Host: ${platform}

📢 Anti‑delete is active. Deleted messages will be forwarded here.

📢 Channel: ${SUPPORT_CHANNEL_LINK}

⚡ Join the channel for:
• Bot updates & feature releases
• Bug fixes & security patches
• Plugin drops & improvements
• Important announcements`;

            await sock.sendMessage(myNumber, { text: startupText });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(() => startSavage(), 5000);
            else {
                if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
                process.exit(0);
            }
        }
    });

    // ===== MESSAGE HANDLER (unchanged) =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const id = msg.key.id;
        if (!global._msgCache.has(id)) global._msgCache.set(id, msg);
        const mObj = msg.message;
        if (mObj.imageMessage || mObj.videoMessage || mObj.audioMessage || mObj.stickerMessage) {
            global._mediaCache.set(id, msg);
        }

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (global.autoTyping === "on" && !isMe && from && !from.endsWith('@broadcast')) {
            try { await sock.sendPresenceUpdate('composing', from); } catch (e) {}
        }
        if (global.alwaysRecording === true && !isMe && from && !from.endsWith('@broadcast')) {
            try { await sock.sendPresenceUpdate('recording', from); } catch (e) {}
        }

        let isAdmin = false;
        if (from && from.endsWith("@g.us")) {
            isAdmin = await checkAdmin(sock, from, sender);
        }
        await handleStatusMention(sock, msg, from, sender, isAdmin);

        const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
        const isArchitect = isMe || (botId && sender === botId);

        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        // Anti‑link (keep your existing code)
        // ... (I'm omitting for brevity, but keep your existing anti‑link block)

        if (from === 'status@broadcast' && global.autoViewStatus === "on") {
            await sock.readMessages([msg.key]);
            return;
        }

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const cmd = global.commands.get(commandName);
        if (cmd) {
            if (global.worktype === 'private' && !isMe) return;
            try {
                await sock.sendPresenceUpdate('composing', from);
                await cmd.execute(sock, msg, args, { isArchitect, isMe });
            } catch (e) {
                console.error(`❌ Command Error [${commandName}]:`, e);
            }
        }
    });

    // ===== ANTI‑DELETE HANDLER (unchanged) =====
    sock.ev.on("messages.update", async (updates) => {
        if (!global.antideleteOwnerChat) return;
        for (const update of updates) {
            const id = update.key?.id;
            if (!id) continue;
            const cached = global._msgCache.get(id);
            if (!cached) continue;
            if (cached.key?.fromMe) continue;

            const sender = cached.key.participant || cached.key.remoteJid;
            const msg = cached.message;
            let content = "";
            if (msg?.conversation) content = msg.conversation;
            else if (msg?.extendedTextMessage?.text) content = msg.extendedTextMessage.text;
            else if (msg?.imageMessage?.caption) content = msg.imageMessage.caption + " (image)";
            else if (msg?.videoMessage?.caption) content = msg.videoMessage.caption + " (video)";
            else if (msg?.audioMessage) content = "[audio]";
            else if (msg?.stickerMessage) content = "[sticker]";
            else content = "[unsupported media]";

            try {
                await global.sock.sendMessage(global.antideleteOwnerChat, {
                    text: `⚠️ *[ANTI-DELETE]*\n👤 @${sender.split("@")[0]}\n💬 ${content}`,
                    mentions: [sender]
                });
            } catch (e) {}
            global._msgCache.delete(id);
            global._mediaCache.delete(id);
        }
    });

    // ===== GROUP EVENT HANDLER (with debug logging) =====
    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        console.log(`📢 Group event: action="${action}", participants=${participants.join(', ')}, group=${id}`);

        // Capture join requests – try multiple possible action names
        if (action === 'request' || action === 'join-request' || action === 'join_request' || action === 'pending') {
            if (!global.pendingJoinRequests[id]) global.pendingJoinRequests[id] = [];
            for (let participant of participants) {
                if (!global.pendingJoinRequests[id].includes(participant)) {
                    global.pendingJoinRequests[id].push(participant);
                    console.log(`📥 Stored pending request from ${participant}`);
                }
            }
        }

        // Existing welcome/goodbye handlers
        try {
            const eventHandler = require('./commands/events.js');
            if (eventHandler && typeof eventHandler.sendWelcome === 'function') {
                const metadata = await sock.groupMetadata(id);
                for (let participant of participants) {
                    if (action === 'add' && global.welcomeEnabled[id] === true) {
                        await eventHandler.sendWelcome(sock, id, participant, metadata.subject);
                    } else if (action === 'remove' && global.goodbyeEnabled[id] === true) {
                        await eventHandler.sendGoodbye(sock, id, participant);
                    }
                }
            }
        } catch (e) {}
    });
}

loadCommands();
startSavage();
