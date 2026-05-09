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

// ===== LEVEL 2 ANTI-DELETE CACHE (ADDED FIX ONLY) =====
global._msgCache = new Map();
global._mediaCache = new Map();

// ===== 🔥 ANTI-STATUSMENTION SYSTEM (ADDED) =====
global.antistatusmention = {}; // per-group toggle
global.statusWarn = {};

// ===== ALWAYS-RECORDING =====
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

// =====🔥 ROTATING SAVAGE QUOTES =====
const warning1Quotes = [
"You just broke a rule Spencer wrote to protect this place.",
"Spencer didn't code this bot for chaos. Respect the rules.",
"Think before you type. Spencer designed this group for order.",
"Spencer coded perfection. You're testing it. Don't.",
"Disobedience logged. Spencer's algorithms are watching.",
"You have been noted. Spencer's system never forgets.",
"This is not a request. It's Spencer's rule. Follow or fade."
];

const warning2Quotes = [
"Another violation. Spencer's patience is not infinite.",
"Rules are written in code. You just triggered an error.",
"Spencer's bot doesn't forgive mistakes twice.",
"Your behavior is being monitored. Closely.",
"Spencer is still observing. This is your last chance.",
"You are approaching system tolerance limits.",
"Stop now. The next step is removal."
];

const finalQuotes = [
"You don't have the clearance. Try again when you're Spencer or my host.",
"Nice try. This console is locked to Spencer or my host only.",
"Your authority is denied. The system rejects you – only Spencer or my host may proceed.",
"You are not the architect. Step back. Spencer or my host holds the key.",
"Permission denied. Spencer or my host didn't grant you access.",
"Only Spencer or my host touches these settings. You? Irrelevant.",
"This command is not for your hands. Walk away – Spencer or my host owns this realm.",
"Access denied. Your biometrics do not match the host.",
"This is a restricted zone. Your presence has been logged.",
"You are not the architect. Step away from the console.",
"Classified information. Your clearance level is zero.",
"Intrusion detected. The system does not recognise your signature.",
"You have no authority here. The session remains sealed.",
"Only the host may peer into the core. You are irrelevant.",
"Your request has been filed under: unauthorised. Goodbye.",
"The vault does not open for strangers. Walk away.",
"You are trying to access something that does not belong to you.",
"Security override rejected. Your IP is now monitored.",
"This command is not for your eyes. The system is watching.",
"You lack the credentials to even look at this data."
];

// ===== GROUP HELPER =====
async function isAdmin(sock, groupId, user) {
    try {
        const meta = await sock.groupMetadata(groupId);
        const p = meta.participants.find(x => x.id === user);
        return p?.admin === "admin" || p?.admin === "superadmin";
    } catch {
        return false;
    }
}

async function startSavage() {
    const sessionPath = "./session";

    if (process.env.SESSION_ID) {
        try {
            let sessionData = process.env.SESSION_ID;
            if (sessionData.includes(";;;")) sessionData = sessionData.split(";;;")[1];
            const authData = Buffer.from(sessionData, 'base64').toString('utf-8');
            if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), authData);
        } catch (e) {}
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

        if (connection === "open") {
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;

            const platform = getHostPlatform();

            const randomQuote = warning1Quotes[Math.floor(Math.random() * warning1Quotes.length)];

            let startupText = `┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TECH OS
┕━━━━━━━━━━━━━━━╼

⚡ ${randomQuote}
🖥️ Host: ${platform}

📢 Channel: ${SUPPORT_CHANNEL_LINK}`;

            await sock.sendMessage(myNumber, { text: startupText });
        }
    });

    // ===== MAIN HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

        // =====🔥 ANTI STATUS MENTION =====
        if (from.endsWith("@g.us") && text) {
            const enabled = global.antistatusmention[from];
            if (enabled && text.includes("@all")) {

                const admin = await isAdmin(sock, from, sender);
                if (admin) return;

                if (!global.statusWarn[from]) global.statusWarn[from] = {};
                const warns = (global.statusWarn[from][sender] || 0) + 1;
                global.statusWarn[from][sender] = warns;

                await sock.sendMessage(from, { delete: msg.key });

                let quote;

                if (warns === 1) {
                    quote = warning1Quotes[Math.floor(Math.random() * warning1Quotes.length)];
                } else if (warns === 2) {
                    quote = warning2Quotes[Math.floor(Math.random() * warning2Quotes.length)];
                } else {
                    quote = finalQuotes[Math.floor(Math.random() * finalQuotes.length)];
                }

                await sock.sendMessage(from, {
                    text: `⚠️ @${sender.split("@")[0]}\n\n${quote}`,
                    mentions: [sender]
                });

                if (warns >= 2) {
                    try {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                    } catch {}
                    global.statusWarn[from][sender] = 0;
                }

                return;
            }
        }

        // ===== COMMAND HANDLER =====
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const cmd = global.commands.get(args.shift().toLowerCase());

        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, {});
            } catch {}
        }
    });
}

loadCommands();
startSavage();
