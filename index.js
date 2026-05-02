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
global.antideleteEnabled = {};
global.antideleteLogChat = null;
global.goodbyeEnabled = {};
global.welcomeEnabled = {};

global.antiLink = {};               // only link protection remains
global.violationWarnings = {};

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
            if (global.autoTyping === "on") await sock.sendPresenceUpdate('composing', myNumber);
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

        // Track message counts for groups
        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        // ========== ANTI‑LINK (ONLY) ==========
        if (from && from.endsWith('@g.us')) {
            if (isMe) return;

            const antiLinkEnabled = global.antiLink?.[from] || false;
            if (!antiLinkEnabled) {
                // skip if anti-link is off
                // (no further action)
            } else {
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

                    try {
                        await sock.sendMessage(from, { delete: msg.key });
                    } catch (err) {
                        console.error('Delete failed:', err);
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
