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

// ===== ALWAYS‑RECORDING =====
global.alwaysRecording = false;

// ===== SUPPORT LINKS (hardcoded) =====
const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/LqkRYXP52tR3CKR8rkKNoh?mode=gi_t";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

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
            
            // Anti‑delete destination (owner's DM)
            global.antideleteOwnerChat = myNumber;
            
            if (global.autoTyping === "on") await sock.sendPresenceUpdate('composing', myNumber);
            const platform = getHostPlatform();
            
            // Startup message with savage quote
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
            let startupText = `┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼\n\n⚡ ${randomQuote}\n🖥️ Host: ${platform}\n\n📢 Anti‑delete is active. Deleted messages will be forwarded here.\n\n👥 Support Group: ${SUPPORT_GROUP_LINK}\n📢 Channel: ${SUPPORT_CHANNEL_LINK}`;
            
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

    // ===== 4. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe; 
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Auto‑typing
        if (global.autoTyping === "on" && !isMe && from && !from.endsWith('@broadcast')) {
            try {
                await sock.sendPresenceUpdate('composing', from);
            } catch (e) {}
        }
        // Always‑recording
        if (global.alwaysRecording === true && !isMe && from && !from.endsWith('@broadcast')) {
            try {
                await sock.sendPresenceUpdate('recording', from);
            } catch (e) {}
        }

        const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
        const isArchitect = isMe || (botId && sender === botId);

        // Message counts for groups
        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        // ========== ANTI‑LINK ==========
        if (from && from.endsWith('@g.us')) {
            if (isMe) return;

            const antiLinkEnabled = global.antiLink?.[from] || false;
            if (antiLinkEnabled) {
                const rawText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
                const senderJid = sender;
                const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,}\/[^\s]*|chat\.whatsapp\.com\/[A-Za-z0-9]+)/i;
                if (urlPattern.test(rawText)) {
                    if (!global.violationWarnings[from]) global.violationWarnings[from] = {};
                    const currentWarnings = global.violationWarnings[from][senderJid] || 0;
                    const newWarningCount = currentWarnings + 1;
                    global.violationWarnings[from][senderJid] = newWarningCount;

                    const warnQuotes = [
                        "You just broke a rule Spencer wrote to protect this place.",
                        "Spencer didn't code this bot for chaos. Respect the rules.",
                        "Another violation. Spencer's patience is not infinite.",
                        "Rules are written in code. You just triggered an error.",
                        "Spencer's bot doesn't forgive. This is your warning.",
                        "Disobedience logged. Spencer's algorithms are watching.",
                        "You have been noted. Spencer's system never forgets.",
                        "Think before you type. Spencer designed this group for order.",
                        "Spencer coded perfection. You're testing it. Don't.",
                        "This is not a request. It's Spencer's rule. Follow or fade.",
                        "Spencer's silence is louder than your excuse.",
                        "Your violation has been filed under 'irrelevant'. Next time? Consequences.",
                        "Spencer's list of offenders is short. Don't add your name.",
                        "You're not above Spencer's logic.",
                        "Spencer's system allows one mistake. This is it."
                    ];
                    const finalKickQuotes = [
                        "You ignored two warnings. Spencer's system doesn't offer third chances.",
                        "Two strikes and you're out. Spencer's rules are absolute.",
                        "The bot spoke twice. You chose to ignore. Goodbye.",
                        "Spencer's patience has a limit. You found it.",
                        "Violation count: 3. Action: termination. Spencer's code is final.",
                        "You have been removed. The group thanks you for leaving.",
                        "Third violation detected. Spencer's algorithm does not negotiate.",
                        "Your presence here was contingent on following rules. You failed.",
                        "Spencer gave you two warnings. You gave him nothing. Goodbye.",
                        "You are now an example of Spencer's zero‑tolerance policy.",
                        "Spencer doesn't argue. He executes. You're out.",
                        "Three strikes. Spencer's mercy expired. Remove yourself from memory.",
                        "Spencer's bot doesn't collect broken pieces. Leave.",
                        "The algorithm decided you were noise. Silence enforced.",
                        "Spencer's final decision: you are no longer part of this equation."
                    ];

                    if (newWarningCount < 3) {
                        const randomQuote = warnQuotes[Math.floor(Math.random() * warnQuotes.length)];
                        const warningText = `⚠️ *VIOLATION* @${senderJid.split('@')[0]}\n\nReason: sending a link\n\n❄️ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                        await sock.sendMessage(from, { text: warningText, mentions: [senderJid] });
                    } else {
                        const kickQuote = finalKickQuotes[Math.floor(Math.random() * finalKickQuotes.length)];
                        const kickMessage = `⚠️ *AUTOMATIC KICK* @${senderJid.split('@')[0]}\n\nReason: sending a link\n\n❄️ ${kickQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                        await sock.sendMessage(from, { text: kickMessage, mentions: [senderJid] });
                        try {
                            await sock.groupParticipantsUpdate(from, [senderJid], 'remove');
                        } catch (err) {
                            console.error('Auto‑kick failed:', err);
                            await sock.sendMessage(from, { text: `❌ Could not kick user. Make sure I am an admin.` });
                        }
                        delete global.violationWarnings[from][senderJid];
                    }

                    await sock.sendMessage(from, { delete: msg.key });
                    return;
                }
            }
        }

        // Status broadcasts
        if (from === 'status@broadcast' && global.autoViewStatus === "on") {
            await sock.readMessages([msg.key]);
            return;
        }

        // Command processing
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

    // ===== 5. ANTI‑DELETE HANDLER (always on) =====
    sock.ev.on("messages.update", async (updates) => {
        if (!global.antideleteOwnerChat) return;
        for (const update of updates) {
            const key = update.key;
            const jid = key.remoteJid;
            const deletedMsg = update.update?.message;
            if (!deletedMsg) continue;

            let content = "";
            if (deletedMsg.conversation) content = deletedMsg.conversation;
            else if (deletedMsg.imageMessage?.caption) content = `${deletedMsg.imageMessage.caption} (image)`;
            else if (deletedMsg.videoMessage?.caption) content = `${deletedMsg.videoMessage.caption} (video)`;
            else if (deletedMsg.extendedTextMessage?.text) content = deletedMsg.extendedTextMessage.text;
            else if (deletedMsg.audioMessage) content = "(audio)";
            else if (deletedMsg.stickerMessage) content = "(sticker)";
            else content = "[unsupported media]";

            const sender = key.participant || jid;
            const timestamp = new Date().toLocaleString();
            const chatType = jid.endsWith('@g.us') ? 'Group' : 'Private';
            const logMessage = `⚠️ *[ANTI-DELETE]*\n📅 ${timestamp}\n✍️ Original author: @${sender.split('@')[0]}\n📎 Deleted: ${content}\n📍 Chat: ${chatType}`;

            await sock.sendMessage(global.antideleteOwnerChat, { text: logMessage, mentions: [sender] });
        }
    });

    // ===== 6. GROUP EVENT HANDLER =====
    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
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
