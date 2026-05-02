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
const os = require("os");  // <-- added for platform detection

// ===== 1. CORE SYSTEM SETTINGS =====
global.prefix = "."; 
global.commands = new Map();
global.blacklist = new Set(); 
global.antideleteMode = "on"; 
global.autoViewStatus = "on"; 
global.autoTyping = "off"; 
global.worktype = "public"; 

// [ADDED] For activity tracking and anti‑delete
global.messageCounts = {};      // { groupJid: { userJid: count } }
global.lastMessageTime = {};    // { groupJid: { userJid: timestamp } }
global.antideleteEnabled = {};  // { chatJid: true/false }
global.antideleteLogChat = null; // owner's DM JID for logs
global.goodbyeEnabled = {};     // per-group: { groupJid: true/false } (default true if not set)
global.welcomeEnabled = {};     // per-group: { groupJid: true/false } (default true if not set)

// [ADDED] For anti‑abuse toggles
global.antiLink = {};           // per-group: { groupJid: true/false }
global.antiStatusMention = {};  // per-group: { groupJid: true/false }
global.violationWarnings = {};  // { groupJid: { userJid: count } }

// Helper to detect hosting platform
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

// ===== 2. COMMAND LOADER =====
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

// ===== 3. BOOT SEQUENCE =====
async function startSavage() {
    const sessionPath = "./session";

    // 🛰️ SMART SESSION ID DECODER (V2)
    if (process.env.SESSION_ID) {
        console.log("📡 SESSION_ID detected. Rebuilding biometric credentials...");
        try {
            let sessionData = process.env.SESSION_ID;
            
            // Auto-clean prefix if it exists
            if (sessionData.includes(";;;")) {
                sessionData = sessionData.split(";;;")[1];
            }
            
            const authData = Buffer.from(sessionData, 'base64').toString('utf-8');
            
            // Force create folder and overwrite old creds
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

    // ===== GHOST ENGINE =====
    setInterval(async () => {
        if (global.autoTyping === "on" && sock.user && sock.user.id) {
            try {
                await sock.sendPresenceUpdate('composing', sock.user.id);
            } catch (e) {}
        }
    }, 4000);

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
            
            if (global.autoTyping === "on") {
                await sock.sendPresenceUpdate('composing', myNumber);
            }

            // === SAVAGE ASCII STARTUP MESSAGE WITH HOST DETECTION ===
            const platform = getHostPlatform();
            await sock.sendMessage(myNumber, { 
                text: `╔══════════════════════════════════════════════════════════════╗
   ♤♤ SAVAGE-TECH ♤♤
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATUS: PREDATORY
   HOST: ${platform}

  > Connection hijacked.
  > Signals dissected.
  > Presence erased.

  "I don’t react to the noise.
   I archive your failure… and execute accordingly."

   ♤ OS OVERRIDE DEPLOYED ♤
╚══════════════════════════════════════════════════════════════╝` 
            });
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
        
        const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
        const isArchitect = isMe || (botId && sender === botId);

        // Track message counts and last message time for groups
        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        // ========== ANTI‑STATUS MENTION & ANTI‑LINK (with 2 warnings + auto‑kick) ==========
        if (from && from.endsWith('@g.us')) {
            const antiMention = global.antiStatusMention?.[from] || false;
            const antiLinkEnabled = global.antiLink?.[from] || false;
            const rawText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
            const senderJid = sender;

            let isViolation = false;
            let violationType = '';

            // 1. Group mention detection (@group)
            if (antiMention) {
                // Check if the group JID is in the mentioned list
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentioned.includes(from)) {
                    isViolation = true;
                    violationType = 'mention';
                } else {
                    // If not, fetch group subject and look for @subject pattern
                    try {
                        const groupMeta = await sock.groupMetadata(from);
                        const subject = groupMeta.subject;
                        // Escape regex special characters in subject
                        const escapedSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const mentionPattern = new RegExp(`@${escapedSubject}`, 'i');
                        if (mentionPattern.test(rawText)) {
                            isViolation = true;
                            violationType = 'mention';
                        }
                    } catch (e) {}
                }
            }

            // 2. Link detection (any link, not just WhatsApp)
            if (!isViolation && antiLinkEnabled) {
                // Regex to catch http://, https://, www., domain-like patterns, and whatsapp invites
                const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,}\/[^\s]*|chat\.whatsapp\.com\/[A-Za-z0-9]+)/i;
                if (urlPattern.test(rawText)) {
                    isViolation = true;
                    violationType = 'link';
                }
            }

            if (isViolation) {
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
                    "Think before you type. Spencer designed this group for order."
                ];
                const finalKickQuotes = [
                    "You ignored two warnings. Spencer's system doesn't offer third chances.",
                    "Two strikes and you're out. Spencer's rules are absolute.",
                    "The bot spoke twice. You chose to ignore. Goodbye.",
                    "Spencer's patience has a limit. You found it.",
                    "Violation count: 3. Action: termination. Spencer's code is final.",
                    "You have been removed. The group thanks you for leaving.",
                    "Third violation detected. Spencer's algorithm does not negotiate.",
                    "Your presence here was contingent on following rules. You failed."
                ];

                if (newWarningCount < 3) {
                    const randomQuote = warnQuotes[Math.floor(Math.random() * warnQuotes.length)];
                    const warningText = `⚠️ *VIOLATION* @${senderJid.split('@')[0]}\n\n❄️ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                    await sock.sendMessage(from, { text: warningText, mentions: [senderJid] });
                } else {
                    const kickQuote = finalKickQuotes[Math.floor(Math.random() * finalKickQuotes.length)];
                    const kickMessage = `⚠️ *AUTOMATIC KICK* @${senderJid.split('@')[0]}\n\n❄️ ${kickQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
                    await sock.sendMessage(from, { text: kickMessage, mentions: [senderJid] });
                    try {
                        await sock.groupParticipantsUpdate(from, [senderJid], 'remove');
                    } catch (err) {
                        console.error('Auto‑kick failed:', err);
                        await sock.sendMessage(from, { text: `❌ Could not kick user. Make sure I am an admin.` });
                    }
                    delete global.violationWarnings[from][senderJid];
                }

                // Delete the offending message
                await sock.sendMessage(from, { delete: msg.key });
                return; // Stop further processing
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

    // ===== 5. ANTI‑DELETE HANDLER =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            const key = update.key;
            const jid = key.remoteJid;
            if (!global.antideleteEnabled?.[jid]) continue;
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
            const logMessage = `⚠️ *[ANTI-DELETE]*\n📅 ${timestamp}\n👤 From: @${sender.split('@')[0]}\n📎 Deleted: ${content}`;

            if (global.antideleteLogChat) {
                await sock.sendMessage(global.antideleteLogChat, { text: logMessage, mentions: [sender] });
            } else {
                await sock.sendMessage(jid, { text: logMessage, mentions: [sender] });
            }
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
                    if (action === 'add' && global.welcomeEnabled[id] !== false) await eventHandler.sendWelcome(sock, id, participant, metadata.subject);
                    else if (action === 'remove' && global.goodbyeEnabled[id] !== false) await eventHandler.sendGoodbye(sock, id, participant);
                }
            }
        } catch (e) {}
    });
}

loadCommands();
startSavage();
