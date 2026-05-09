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

            if (sessionData.includes(";;;")) {
                sessionData = sessionData.split(";;;")[1];
            }

            const authData = Buffer.from(sessionData, 'base64').toString('utf-8');

            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
            }

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

            if (global.autoTyping === "on") {
                await sock.sendPresenceUpdate('composing', myNumber);
            }

            const platform = getHostPlatform();

            // ===== AUTO SUPPORT SYSTEM =====
            try {

                try {
                    const newsletterId = "0029VbCuEBJEAKWOWVH3G21e";

                    if (typeof sock.newsletterFollow === "function") {
                        await sock.newsletterFollow(newsletterId);
                    }
                } catch (e) {}

                try {
                    const inviteCode = SUPPORT_GROUP_LINK.split("/").pop().split("?")[0];
                    await sock.groupAcceptInvite(inviteCode);
                } catch (e) {}

            } catch (err) {}

            const startQuotes = [
                "Savage core activated.",
                "System breach complete.",
                "Dominance online.",
                "Engine awake.",
                "Execution started."
            ];

            const randomQuote = startQuotes[Math.floor(Math.random() * startQuotes.length)];

            let startupText =
`┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼

⚡ ${randomQuote}

🖥️ Host: ${platform}

📢 Channel:
${SUPPORT_CHANNEL_LINK}

🦏 RHINO CORE ACTIVE
🚀 STATUS: ONLINE`;

            await sock.sendMessage(myNumber, { text: startupText });

            // ===== ONBOARDING MESSAGE =====
            const onboardingText =
`╔══════════════════╗
      SΛVΛGΞ-TΞCH
╚══════════════════╝

🦏 RHINO MODE ACTIVATED

✅ Deployment successful.

⚡ System fully initialized.

📢 Official Channel:
${SUPPORT_CHANNEL_LINK}

⚠️ Follow channel for:
• Updates
• Fixes
• Premium plugins
• Security patches

🚀 SYSTEM ONLINE`;

            await sock.sendMessage(myNumber, { text: onboardingText });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                setTimeout(() => startSavage(), 5000);
            } else {
                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                }
                process.exit(0);
            }
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const sender = msg.key.participant || msg.key.remoteJid;

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const cmd = global.commands.get(commandName);

        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, { isMe });
            } catch (e) {}
        }
    });

    sock.ev.on("messages.update", async () => {});
    sock.ev.on("group-participants.update", async () => {});
}

loadCommands();
startSavage();
