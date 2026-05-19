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

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

global.prefix = ".";
global.commands = new Map();
global.blacklist = new Set();
global.antideleteMode = "on";
global.autoViewStatus = "on";
global.autoTyping = "off";
global.worktype = "public";
global.autoRead = false;
global.alwaysOnline = true;
global.botFont = null;

global.messageCounts = {};
global.lastMessageTime = {};
global.antideleteOwnerChat = null;
global.goodbyeEnabled = {};
global.welcomeEnabled = {};

global.antiLink = {};
global.violationWarnings = {};
global.antiGroupMention = {};
global.groupMentionWarnings = {};

global.antiStatusMention = {};
global.statusWarnings = {};

global._msgCache = new Map();
global._mediaCache = new Map();
global._statusCache = new Map();

global.alwaysRecording = false;
global.pendingJoinRequests = {};

global.badWords = {};
global.badWordWarnings = {};
global.badWordEnabled = {};
global.badWordConfig = {};

global.antiLinkConfig = {};
global.antiLinkWarnings = {};

global.antiTagConfig = {};
global.antiTagWarnings = {};

global.antiTagAdminConfig = {};
global.antiTagAdminWarnings = {};

global.anticall = { mode: "off", msg: "❌ Calls are not accepted. Send a message instead." };

global.antiDeleteEnabled = false;
global.antiEditEnabled = false;

global.antiSpamConfig = {};
global.antiSpamWarnings = {};
global.antiSpamTrack = {};

global.antiBot = {};

const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/LqkRYXP52tR3CKR8rkKNoh?mode=gi_t";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

const ownerFile = path.join(__dirname, 'owner.json');
if (fs.existsSync(ownerFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(ownerFile, 'utf-8'));
        global.ownerJid = data.ownerJid;
        console.log(`[OWNER] Loaded owner JID: ${global.ownerJid}`);
    } catch (e) {}
}

async function checkAdmin(sock, groupId, sender) {
    try {
        const meta = await sock.groupMetadata(groupId);
        const senderNumber = sender.split('@')[0].split(':')[0];
        const participant = meta.participants.find(p => {
            const pNumber = p.id.split('@')[0].split(':')[0];
            return pNumber === senderNumber;
        });
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}
global.checkAdmin = checkAdmin;

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
    if (count === 1) quote = "First warning: status mention.";
    else if (count === 2) quote = "Second warning: status mention.";
    else quote = "Final warning: status mention. Removed.";

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

    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

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
        browser: ["SΛVΛGΞ-TECH", "Safari", "1.0.0"],
        syncFullHistory: true,
        emitOwnEvents: true,
        fireInitQueries: true
    });

    global.sock = sock;

    setInterval(async () => {
        if (global.alwaysOnline !== false && global.sock && global.sock.user) {
            try {
                await global.sock.sendPresenceUpdate('available', global.sock.user.id);
            } catch (e) {}
        }
    }, 30000);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("call", async (calls) => {
        for (const call of calls) {
            const from = call.from;
            if (global.anticall.mode === "off") return;
            if (global.anticall.mode === "decline") {
                try {
                    await sock.rejectCall(call.id, from);
                } catch (e) {}
            } else if (global.anticall.mode === "block") {
                try {
                    await sock.updateBlockStatus(from, "block");
                    await sock.rejectCall(call.id, from);
                } catch (e) {}
            }
            if (global.anticall.msg && global.anticall.msg.trim() !== "") {
                try {
                    await sock.sendMessage(from, { text: global.anticall.msg });
                } catch (e) {}
            }
            console.log(`[ANTICALL] ${global.anticall.mode.toUpperCase()} call from ${from}`);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            console.log("\n📸 SCAN QR TO INITIALIZE NEURAL LINK:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;
            global.botOwnerNumber = sock.user.id;

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

            const startupText = `┌─────────────────────────┐
│ ✅ Savage Tech ONLINE   │
├─────────────────────────┤
│ 🔒 OWNER MODE: LOCKED   │
│ → .regowner to unlock   │
│                         │
│ Host: ${platform.padEnd(20)}│
│ Commands: ${cmdCount.toString().padEnd(18)}│
└─────────────────────────┘`;

            await sock.sendMessage(myNumber, { text: startupText });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed, reconnecting in 5 seconds...");
                setTimeout(() => startSavage(), 5000);
            } else {
                console.error("Logged out. Session invalid. Delete session folder and restart.");
                if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
            }
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        if (global.broadcastMessage && !msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderName = msg.pushName || sender.split('@')[0];
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[media or unsupported]";
            global.broadcastMessage(senderName, text);
        }

        if (!msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
            let msgType = 'conversation';
            const msgObj = msg.message;
            if (msgObj?.extendedTextMessage) msgType = 'extendedTextMessage';
            else if (msgObj?.imageMessage) msgType = 'imageMessage';
            else if (msgObj?.videoMessage) msgType = 'videoMessage';
            else if (msgObj?.audioMessage) msgType = 'audioMessage';
            else if (msgObj?.stickerMessage) msgType = 'stickerMessage';
            else if (msgObj?.documentMessage) msgType = 'documentMessage';
            else if (msgObj?.protocolMessage) msgType = 'protocolMessage';
            
            const msgTimestamp = msg.messageTimestamp;
            const msgDate = new Date(msgTimestamp * 1000);
            const msgTimeStr = msgDate.toLocaleString(undefined, {
                weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false, timeZoneName: 'short'
            });
            
            const nowSec = Date.now() / 1000;
            let spentSec = (nowSec - msgTimestamp).toFixed(2);
            let speedRating = '';
            const spentNum = parseFloat(spentSec);
            if (spentNum < 1) speedRating = '| VERY FAST';
            else if (spentNum < 2) speedRating = '| FAST';
            else if (spentNum < 5) speedRating = '| MODERATE';
            else if (spentNum < 10) speedRating = '| SLOW';
            else speedRating = '| VERY SLOW';
            
            const senderJid = msg.key.participant || msg.key.remoteJid;
            let senderDisplay = msg.pushName;
            if (!senderDisplay) {
                const contact = await sock.contacts?.[senderJid];
                senderDisplay = contact?.name || contact?.verifiedName || senderJid.split('@')[0];
            }
            if (!senderDisplay) senderDisplay = senderJid.split('@')[0];
            
            const chatId = msg.key.remoteJid;
            let chatDisplay = chatId;
            if (chatId.endsWith('@g.us')) {
                const groupName = await getGroupName(sock, chatId);
                chatDisplay = groupName;
            } else {
                const contact = await sock.contacts?.[chatId];
                chatDisplay = contact?.name || contact?.verifiedName || chatId.split('@')[0];
            }
            
            let messageText = msgObj?.conversation || msgObj?.extendedTextMessage?.text || '';
            if (!messageText) {
                if (msgObj?.imageMessage) messageText = '📷 Image';
                else if (msgObj?.videoMessage) messageText = '🎥 Video';
                else if (msgObj?.audioMessage) messageText = '🎵 Audio';
                else if (msgObj?.stickerMessage) messageText = '💠 Sticker';
                else if (msgObj?.documentMessage) messageText = '📄 Document';
                else messageText = '[unsupported]';
            }
            
            const colors = {
                label: '\x1b[36m',
                value: '\x1b[32m',
                arrow: '\x1b[35m',
                reset: '\x1b[0m'
            };
            console.log(`\n${colors.label}» Message Type:${colors.reset} ${colors.value}${msgType}${colors.reset}`);
            console.log(`${colors.label}» Message Time:${colors.reset} ${colors.value}${msgTimeStr}${colors.reset}`);
            console.log(`${colors.label}» Speed:${colors.reset} ${colors.value}${spentSec}s ${speedRating}${colors.reset}`);
            console.log(`${colors.label}» Sender:${colors.reset} ${colors.value}${senderDisplay}${colors.reset}`);
            console.log(`${colors.label}» Chat:${colors.reset} ${colors.value}${chatDisplay}${colors.reset}`);
            console.log(`${colors.label}» Message:${colors.reset} ${colors.value}${messageText.substring(0, 300)}${colors.reset}`);
            console.log(`${colors.arrow}    └── SAVAGE-TECH ⬇️${colors.reset}`);
        }

        if (global.autoRead === true && !msg.key.fromMe) {
            try {
                await sock.readMessages([msg.key]);
                console.log(`[AUTO-READ] Marked read: ${msg.key.id}`);
            } catch (err) {
                console.log("AutoRead Error:", err);
            }
        }

        try {
            const autoReact = require('./commands/autoreact.js');
            if (typeof autoReact.reactToMessage === "function") {
                await autoReact.reactToMessage(sock, msg);
            }
        } catch (e) {}

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
                if (cachedMsg && !cachedMsg.key?.fromMe && global.antideleteOwnerChat && global.antiDeleteEnabled) {
                    const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid;
                    const isGroup = cachedMsg.key.remoteJid?.endsWith('@g.us');
                    let chatName = "Private chat";
                    if (isGroup) chatName = await getGroupName(sock, cachedMsg.key.remoteJid);
                    const senderName = sender.split('@')[0];
                    const mediaData = global._mediaCache.get(deletedMsgId);
                    const timestamp = new Date().toLocaleString();
                    let content = "";
                    let typeLabel = "text";
                    if (mediaData && mediaData.buffer) {
                        typeLabel = mediaData.type;
                        content = mediaData.caption || "[Media without caption]";
                    } else {
                        const msgObj = cachedMsg.message;
                        if (msgObj?.conversation) content = msgObj.conversation;
                        else if (msgObj?.extendedTextMessage?.text) content = msgObj.extendedTextMessage.text;
                        else if (msgObj?.imageMessage?.caption) content = msgObj.imageMessage.caption + " (image)";
                        else if (msgObj?.videoMessage?.caption) content = msgObj.videoMessage.caption + " (video)";
                        else if (msgObj?.audioMessage) content = "[audio]";
                        else if (msgObj?.stickerMessage) content = "[sticker]";
                        else content = "[unsupported media]";
                    }
                    const reportText = `🚨 *ANTI-DELETE*\n👤 Sender: @${senderName}\n💬 Chat: ${chatName}\n🕒 Time: ${timestamp}\n📎 Type: ${typeLabel}\n📝 Content: ${content}`;
                    if (mediaData && mediaData.buffer) {
                        try {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                [mediaData.type]: mediaData.buffer,
                                caption: reportText,
                                mentions: [sender]
                            });
                        } catch (e) {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                text: `${reportText}\n[Media failed to restore]`,
                                mentions: [sender]
                            });
                        }
                    } else {
                        await sock.sendMessage(global.antideleteOwnerChat, {
                            text: reportText,
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

        if (global.antiEditEnabled && protocolMsg?.type === 1) {
            const editedMsgId = protocolMsg.key.id;
            const originalMsg = global._msgCache.get(editedMsgId);
            if (originalMsg && !originalMsg.key.fromMe) {
                const from = msg.key.remoteJid;
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                const isGroup = from.endsWith('@g.us');
                let chatName = "Private chat";
                if (isGroup) chatName = await getGroupName(sock, from);
                const senderName = sender.split('@')[0];
                const timestamp = new Date().toLocaleString();
                const originalContent = originalMsg.message?.conversation || originalMsg.message?.extendedTextMessage?.text || "[unsupported]";
                const newContent = protocolMsg.editedMessage?.conversation || protocolMsg.editedMessage?.extendedTextMessage?.text || "[unsupported]";
                await sock.sendMessage(global.antideleteOwnerChat, {
                    text: `✏️ *ANTI-EDIT*\n👤 Sender: @${senderName}\n💬 Chat: ${chatName}\n🕒 Time: ${timestamp}\n📝 Original: ${originalContent}\n✏️ New: ${newContent}`,
                    mentions: [sender]
                });
            }
        }

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
        let isArchitect = isMe || (botId && sender === botId);

        if (!isArchitect && global.ownerJid && sender === global.ownerJid) {
            isArchitect = true;
            console.log(`[OWNER] Recognised via saved owner JID: ${sender}`);
        } else if (!isArchitect && global.botOwnerNumber && sender === global.botOwnerNumber) {
            isArchitect = true;
            console.log(`[OWNER] Recognised via bot's own number: ${sender}`);
        }

        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiLinkConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const rawText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
                const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,}\/[^\s]*|chat\.whatsapp\.com\/[A-Za-z0-9]+)/i;
                if (urlPattern.test(rawText)) {
                    let isSenderAdmin = false;
                    if (from.endsWith("@g.us")) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const senderNumber = sender.split('@')[0].split(':')[0];
                            const participant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === senderNumber;
                            });
                            isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                        } catch (e) {}
                    }
                    if (isSenderAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiLinkWarnings[from]) global.antiLinkWarnings[from] = {};
                        const warns = (global.antiLinkWarnings[from][sender] || 0) + 1;
                        global.antiLinkWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, Unauthorized link detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiLinkWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

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
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, group mention detected. Warning ${newWarningCount}/3`, mentions: [sender] });
                        } else {
                            await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (group mention).`, mentions: [sender] });
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                            } catch (err) {}
                            delete global.groupMentionWarnings[from][sender];
                        }
                        await sock.sendMessage(from, { delete: msg.key });
                    }
                    return;
                }
            }
        }

        if (global.badWordEnabled && global.badWordEnabled[from] && global.badWords && global.badWords[from]) {
            const msgText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
            const badSet = global.badWords[from];
            let found = false;
            for (let word of badSet) {
                if (msgText.includes(word)) {
                    found = true;
                    break;
                }
            }
            if (found && !isMe) {
                let isSenderAdmin = false;
                if (from.endsWith("@g.us")) {
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0].split(':')[0];
                        const participant = meta.participants.find(p => {
                            const pNumber = p.id.split('@')[0].split(':')[0];
                            return pNumber === senderNumber;
                        });
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                }
                if (isSenderAdmin) return;

                const cfg = global.badWordConfig[from] || { action: "delete", warnLimit: 3 };
                const action = cfg.action;
                let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                let shouldWarn = (action === "warn" || action === "warn+kick");
                let shouldKick = (action === "kick" || action === "warn+kick");

                if (shouldDelete) {
                    try {
                        await sock.sendMessage(from, { delete: msg.key });
                    } catch (err) {}
                }
                if (shouldWarn || shouldKick) {
                    if (!global.badWordWarnings[from]) global.badWordWarnings[from] = {};
                    const warns = (global.badWordWarnings[from][sender] || 0) + 1;
                    global.badWordWarnings[from][sender] = warns;
                    if (shouldWarn) {
                        await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, bad word detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                    }
                    if (shouldKick && warns >= cfg.warnLimit) {
                        try {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            delete global.badWordWarnings[from][sender];
                            await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                        } catch (err) {}
                    }
                }
                return;
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiTagConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const hasMention = mentionedJid.length > 0;
                if (hasMention) {
                    let isSenderAdmin = false;
                    if (from.endsWith("@g.us")) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const senderNumber = sender.split('@')[0].split(':')[0];
                            const participant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === senderNumber;
                            });
                            isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                        } catch (e) {}
                    }
                    if (isSenderAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiTagWarnings[from]) global.antiTagWarnings[from] = {};
                        const warns = (global.antiTagWarnings[from][sender] || 0) + 1;
                        global.antiTagWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, Unauthorized mention detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiTagWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiTagAdminConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentionedJid.length > 0) {
                    let isSenderAdmin = false;
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0].split(':')[0];
                        const participant = meta.participants.find(p => {
                            const pNumber = p.id.split('@')[0].split(':')[0];
                            return pNumber === senderNumber;
                        });
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                    if (isSenderAdmin) return;

                    let mentionedAnyAdmin = false;
                    for (const mJid of mentionedJid) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const mNumber = mJid.split('@')[0].split(':')[0];
                            const mParticipant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === mNumber;
                            });
                            if (mParticipant?.admin === 'admin' || mParticipant?.admin === 'superadmin') {
                                mentionedAnyAdmin = true;
                                break;
                            }
                        } catch (e) {}
                    }
                    if (!mentionedAnyAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiTagAdminWarnings[from]) global.antiTagAdminWarnings[from] = {};
                        const warns = (global.antiTagAdminWarnings[from][sender] || 0) + 1;
                        global.antiTagAdminWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, mentioning an admin is not allowed. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiTagAdminWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiSpamConfig?.[from];
            if (cfg && cfg.enabled) {
                const msgText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
                const now = Date.now();
                if (!global.antiSpamTrack[from]) global.antiSpamTrack[from] = {};
                let userTrack = global.antiSpamTrack[from][sender];
                if (!userTrack) {
                    userTrack = { timestamps: [], lastMsg: '', lastMsgTime: 0 };
                    global.antiSpamTrack[from][sender] = userTrack;
                }
                
                userTrack.timestamps.push(now);
                userTrack.timestamps = userTrack.timestamps.filter(ts => ts > now - cfg.timeWindow * 1000);
                
                const isDuplicate = (userTrack.lastMsg === msgText && (now - userTrack.lastMsgTime) < cfg.duplicateWindow * 1000);
                const exceededRate = userTrack.timestamps.length > cfg.maxMessages;
                
                let violated = false;
                if (exceededRate || (msgText !== '' && isDuplicate)) violated = true;
                
                if (violated) {
                    let isSenderAdmin = false;
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0];
                        const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                    if (!isSenderAdmin) {
                        const action = cfg.action;
                        const warnLimit = cfg.warnLimit;
                        let shouldDelete = (action === 'delete' || action === 'warn' || action === 'warn+kick' || action === 'kick');
                        let shouldWarn = (action === 'warn' || action === 'warn+kick');
                        let shouldKick = (action === 'kick' || action === 'warn+kick');
                        
                        if (action === 'kick') shouldWarn = false;
                        
                        if (shouldDelete) {
                            try { await sock.sendMessage(from, { delete: msg.key }); } catch (err) {}
                        }
                        if (shouldWarn) {
                            if (!global.antiSpamWarnings[from]) global.antiSpamWarnings[from] = {};
                            const warns = (global.antiSpamWarnings[from][sender] || 0) + 1;
                            global.antiSpamWarnings[from][sender] = warns;
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, spam detected. Warning ${warns}/${warnLimit}`, mentions: [sender] });
                            if (shouldKick && warns >= warnLimit) {
                                try {
                                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                    delete global.antiSpamWarnings[from][sender];
                                    await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded spam limit).`, mentions: [sender] });
                                } catch (err) {}
                            }
                        } else if (shouldKick) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed for spamming.`, mentions: [sender] });
                            } catch (err) {}
                        }
                        userTrack.lastMsg = msgText;
                        userTrack.lastMsgTime = now;
                        global.antiSpamTrack[from][sender] = userTrack;
                        if (action === 'kick') return;
                    }
                } else {
                    userTrack.lastMsg = msgText;
                    userTrack.lastMsgTime = now;
                    global.antiSpamTrack[from][sender] = userTrack;
                }
            }
        }

        if (from === 'status@broadcast') {
            if (global.autoViewStatus === "on") {
                await sock.readMessages([msg.key]);
            }
            try {
                const autoReactStatus = require('./commands/autoreactstatus.js');
                if (typeof autoReactStatus.reactToStatus === "function") {
                    await autoReactStatus.reactToStatus(sock, msg);
                }
            } catch (e) {}
            try {
                const autoLike = require('./commands/autolike.js');
                if (typeof autoLike.likeStatus === "function") {
                    await autoLike.likeStatus(sock, msg);
                }
            } catch (e) {}
            return;
        }

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        
        if (global.prefix === "none") {
            const firstWord = text.split(/\s+/)[0];
            const restArgs = text.slice(firstWord.length).trim().split(/\s+/).filter(a => a);
            const potentialCmd = global.commands.get(firstWord.toLowerCase());
            if (potentialCmd) {
                if (global.worktype === 'private' && !isMe) return;
                try {
                    await sock.sendPresenceUpdate('composing', from);
                    await potentialCmd.execute(sock, msg, restArgs, { isArchitect, isMe });
                } catch (e) {
                    console.error(`❌ Command Error [${firstWord}]:`, e);
                }
                return;
            }
        }

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

        if (action === 'remove') {
            if (global.antiLeave && global.antiLeave[id]) {
                for (let user of participants) {
                    try {
                        await sock.groupParticipantsUpdate(id, [user], "add");
                        await sock.sendMessage(id, {
                            text: `🛡️ *ANTI-LEAVE ACTIVE*\n\n👤 @${user.split("@")[0]} attempted to leave\n🔁 Re-added automatically\n\n⚡ Savage Tech Enforcement`,
                            mentions: [user]
                        });
                    } catch (err) {
                        try {
                            const code = await sock.groupInviteCode(id);
                            const link = `https://chat.whatsapp.com/${code}`;
                            await sock.sendMessage(user, {
                                text: `🛡️ You tried to leave a protected group.\n\nRe-entry link:\n${link}\n\n⚡ Savage Tech Anti-Leave System`
                            });
                        } catch (e) {}
                    }
                }
            }
        }

        if (action === 'add') {
            if (global.antiBot && global.antiBot[id]) {
                for (let user of participants) {
                    if (user === sock.user.id) continue;
                    try {
                        await sock.groupParticipantsUpdate(id, [user], 'remove');
                        await sock.sendMessage(id, { text: `🤖 @${user.split('@')[0]} removed (anti‑bot active).`, mentions: [user] });
                    } catch (err) {}
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
