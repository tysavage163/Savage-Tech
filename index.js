const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    downloadMediaMessage
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

// ===== ANTI‑LINK & ANTI‑GROUP‑MENTION =====
global.antiLink = {};
global.violationWarnings = {};
global.antiGroupMention = {};
global.groupMentionWarnings = {};

// ===== ANTI‑STATUS MENTION (old feature) =====
global.antiStatusMention = {};
global.statusWarnings = {};

// ===== ANTI‑DELETE CACHE =====
global._msgCache = new Map();
global._mediaCache = new Map();
global._statusCache = new Map();

// ===== ALWAYS‑RECORDING =====
global.alwaysRecording = false;

// ===== PENDING JOIN REQUESTS =====
global.pendingJoinRequests = {};

// ===== SUPPORT LINKS =====
const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/LqkRYXP52tR3CKR8rkKNoh?mode=gi_t";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

// ===== COLD QUOTES FOR ANTI‑LINK & ANTI‑MENTION =====
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

const kickQuotes = [
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

async function getGroupName(sock, groupId) {
    try {
        const meta = await sock.groupMetadata(groupId);
        return meta.subject || groupId;
    } catch {
        return groupId;
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

    // ===== KEEP‑ALIVE PING =====
    setInterval(async () => {
        if (global.sock && global.sock.user) {
            try {
                await global.sock.sendPresenceUpdate('available', global.sock.user.id);
            } catch (e) {}
        }
    }, 30000);

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

            // Auto‑join support group
            try {
                const groupInviteCode = SUPPORT_GROUP_LINK.split("https://chat.whatsapp.com/")[1]?.split("?")[0];
                if (groupInviteCode) {
                    await sock.groupAcceptInvite(groupInviteCode);
                    console.log("✅ Auto-joined support group");
                }
            } catch (e) {
                if (e.message === 'conflict') {
                    console.log("⚠️ Bot already in the support group");
                } else {
                    console.error("Auto-join failed:", e.message);
                }
            }

            if (global.autoTyping === "on") await sock.sendPresenceUpdate('composing', myNumber);
            const platform = getHostPlatform();
            const cmdCount = global.commands.size;
            const activeTime = new Date().toLocaleString();

            // ===== NEW STARTUP MESSAGE (dashboard with progress bar) =====
            let startupText = `════════════════════════════════════════
          SAVAGE-TECH DASHBOARD          
════════════════════════════════════════
👑 Spencer               💻 ${platform}
📦 ${cmdCount} commands loaded
🕒 Active: ${activeTime}
🔄 [████████████████████] Awaiting commands
🛡️ Anti‑delete: ✅ ON
────────────────────────────────────────
📌 CHANNEL BENEFITS:
🔹 Bot updates & new features
🔹 Security patches & bug fixes
🔹 Command changes & removals
🔹 Sneak peeks & giveaways
────────────────────────────────────────
🔗 ${SUPPORT_CHANNEL_LINK}
💡 .menu → explore commands
════════════════════════════════════════`;

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

    // ===== MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        // ─── ANTI‑DELETE DETECTION (revoke) ───
        const protocolMsg = msg.message?.protocolMessage;
        if (protocolMsg?.type === 0) {
            const revokedKey = protocolMsg.key;
            if (revokedKey) {
                const deletedMsgId = revokedKey.id;
                let cachedMsg = global._msgCache.get(deletedMsgId);
                let isStatus = false;
                if (!cachedMsg) {
                    cachedMsg = global._statusCache.get(deletedMsgId);
                    isStatus = true;
                }
                if (cachedMsg && !cachedMsg.key?.fromMe && global.antideleteOwnerChat) {
                    const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid;
                    const isGroup = cachedMsg.key.remoteJid?.endsWith('@g.us');
                    let chatName = "Private chat";
                    if (isGroup) chatName = await getGroupName(sock, cachedMsg.key.remoteJid);
                    const senderName = sender.split('@')[0];
                    const mediaData = global._mediaCache.get(deletedMsgId);
                    
                    if (mediaData && mediaData.buffer) {
                        try {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                [mediaData.type]: mediaData.buffer,
                                caption: `🚨 *Savage Tech anti‑delete system* 🚨\n\n👤 *Sender:* @${senderName}\n💬 *Chat:* ${chatName}\n📎 *Message:* ${mediaData.caption || "No caption"}`,
                                mentions: [sender]
                            });
                        } catch (e) {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                text: `🚨 *Savage Tech anti‑delete system* 🚨\n\n👤 *Sender:* @${senderName}\n💬 *Chat:* ${chatName}\n💬 *Message:* [Media failed to restore: ${mediaData.type}]`,
                                mentions: [sender]
                            });
                        }
                    } else {
                        const msgObj = cachedMsg.message;
                        let content = "";
                        if (msgObj?.conversation) content = msgObj.conversation;
                        else if (msgObj?.extendedTextMessage?.text) content = msgObj.extendedTextMessage.text;
                        else if (msgObj?.imageMessage?.caption) content = msgObj.imageMessage.caption + " (image)";
                        else if (msgObj?.videoMessage?.caption) content = msgObj.videoMessage.caption + " (video)";
                        else if (msgObj?.audioMessage) content = "[audio]";
                        else if (msgObj?.stickerMessage) content = "[sticker]";
                        else content = "[unsupported media]";
                        const typeLabel = isStatus ? " (status)" : "";
                        await sock.sendMessage(global.antideleteOwnerChat, {
                            text: `🚨 *Savage Tech anti‑delete system* 🚨${typeLabel}\n\n👤 *Sender:* @${senderName}\n💬 *Chat:* ${chatName}\n💬 *Message:* ${content}`,
                            mentions: [sender]
                        });
                    }
                }
                global._msgCache.delete(deletedMsgId);
                global._mediaCache.delete(deletedMsgId);
                global._statusCache.delete(deletedMsgId);
            }
            return;
        }

        // ─── CACHE NORMAL MESSAGES ───
        const id = msg.key.id;
        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        if (!global._msgCache.has(id)) {
            global._msgCache.set(id, msg);
            setTimeout(() => {
                if (global._msgCache.has(id)) global._msgCache.delete(id);
                if (global._mediaCache.has(id)) global._mediaCache.delete(id);
            }, 5 * 60 * 1000);
        }

        if (from === 'status@broadcast' && !global._statusCache.has(id)) {
            global._statusCache.set(id, msg);
            setTimeout(() => global._statusCache.delete(id), 5 * 60 * 1000);
        }

        // Download media for anti‑delete (if not too large)
        const messageContent = msg.message;
        let mediaType = null;
        let mediaObj = null;
        if (messageContent.imageMessage) { mediaType = "image"; mediaObj = messageContent.imageMessage; }
        else if (messageContent.videoMessage) { mediaType = "video"; mediaObj = messageContent.videoMessage; }
        else if (messageContent.stickerMessage) { mediaType = "sticker"; mediaObj = messageContent.stickerMessage; }
        else if (messageContent.audioMessage) { mediaType = "audio"; mediaObj = messageContent.audioMessage; }

        if (mediaType && mediaObj) {
            const fileSize = mediaObj.fileLength ? parseInt(mediaObj.fileLength) : 0;
            const maxSize = mediaType === "video" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
            if (fileSize <= maxSize) {
                try {
                    const buffer = await downloadMediaMessage(msg, "buffer", {});
                    if (buffer && buffer.length) {
                        global._mediaCache.set(id, {
                            buffer: buffer,
                            mimetype: mediaObj.mimetype,
                            caption: mediaObj.caption || "",
                            type: mediaType
                        });
                    }
                } catch (err) {}
            }
        }

        // Auto‑typing / recording
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

        // ─── ANTI‑LINK (skip admins) ───
        if (from && from.endsWith('@g.us') && !isMe) {
            const antiLinkEnabled = global.antiLink?.[from] || false;
            if (antiLinkEnabled) {
                const rawText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
                const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,}\/[^\s]*|chat\.whatsapp\.com\/[A-Za-z0-9]+)/i;
                if (urlPattern.test(rawText)) {
                    if (!isAdmin) {
                        if (!global.violationWarnings[from]) global.violationWarnings[from] = {};
                        const currentWarnings = global.violationWarnings[from][sender] || 0;
                        const newWarningCount = currentWarnings + 1;
                        global.violationWarnings[from][sender] = newWarningCount;

                        if (newWarningCount < 3) {
                            const randomQuote = warnQuotes[Math.floor(Math.random() * warnQuotes.length)];
                            const warningText = `⚠️ *VIOLATION* @${sender.split('@')[0]}\n\nReason: sending a link\n\n❄️ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                            await sock.sendMessage(from, { text: warningText, mentions: [sender] });
                        } else {
                            const kickQuote = kickQuotes[Math.floor(Math.random() * kickQuotes.length)];
                            const kickMessage = `⚠️ *AUTOMATIC KICK* @${sender.split('@')[0]}\n\nReason: sending a link\n\n❄️ ${kickQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                            await sock.sendMessage(from, { text: kickMessage, mentions: [sender] });
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                            } catch (err) {}
                            delete global.violationWarnings[from][sender];
                        }
                        await sock.sendMessage(from, { delete: msg.key });
                    }
                    return;
                }
            }
        }

        // ─── ANTI‑GROUP‑MENTION (detect group mention) ───
        if (from && from.endsWith('@g.us') && !isMe) {
            const antiMentionEnabled = global.antiGroupMention?.[from] || false;
            if (antiMentionEnabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const mentionsGroup = mentionedJid.includes(from);
                if (mentionsGroup) {
                    if (!isAdmin) {
                        if (!global.groupMentionWarnings[from]) global.groupMentionWarnings[from] = {};
                        const currentWarnings = global.groupMentionWarnings[from][sender] || 0;
                        const newWarningCount = currentWarnings + 1;
                        global.groupMentionWarnings[from][sender] = newWarningCount;

                        if (newWarningCount < 3) {
                            const randomQuote = warnQuotes[Math.floor(Math.random() * warnQuotes.length)];
                            const warningText = `⚠️ *VIOLATION* @${sender.split('@')[0]}\n\nReason: group mention (@group)\n\n❄️ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                            await sock.sendMessage(from, { text: warningText, mentions: [sender] });
                        } else {
                            const kickQuote = kickQuotes[Math.floor(Math.random() * kickQuotes.length)];
                            const kickMessage = `⚠️ *AUTOMATIC KICK* @${sender.split('@')[0]}\n\nReason: group mention (@group)\n\n❄️ ${kickQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                            await sock.sendMessage(from, { text: kickMessage, mentions: [sender] });
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                            } catch (err) {}
                            delete global.groupMentionWarnings[from][sender];
                        }
                        await sock.sendMessage(from, { delete: msg.key });
                    }
                    return;
                }
            }
        }

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

    // ===== GROUP EVENT HANDLER =====
    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        console.log(`📢 Group event: action="${action}", participants=${participants.join(', ')}, group=${id}`);

        if (action === 'request' || action === 'join-request' || action === 'join_request') {
            if (!global.pendingJoinRequests[id]) global.pendingJoinRequests[id] = [];
            for (let participant of participants) {
                if (!global.pendingJoinRequests[id].includes(participant)) {
                    global.pendingJoinRequests[id].push(participant);
                    console.log(`📥 Stored pending request from ${participant}`);
                }
            }
        }

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
