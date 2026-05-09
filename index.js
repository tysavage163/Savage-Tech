const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const path = require("path");
const os = require("os");

// ================= CORE SETTINGS =================
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

global.alwaysRecording = false;

// ================= MEDIA + ANTI-DELETE STORAGE =================
global.msgStore = new Map();
const DB_FILE = "./antidelete-db.json";
const MEDIA_DIR = "./media";

if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = JSON.parse(fs.readFileSync(DB_FILE));
            for (const k in data) global.msgStore.set(k, data[k]);
        }
    } catch (e) {}
}

function saveDB() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(Object.fromEntries(global.msgStore), null, 2));
    } catch (e) {}
}

loadDB();

// ================= SUPPORT LINKS =================
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
    if (os.platform() === 'android') return 'Termux (Android)';
    if (os.platform() === 'linux') return 'Linux VPS';
    if (os.platform() === 'win32') return 'Windows';
    if (os.platform() === 'darwin') return 'macOS';
    return 'Unknown';
}

// ================= COMMAND LOADER =================
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
            console.log("❌", file, e.message);
        }
    }

    console.log(`✅ ${global.commands.size} Commands loaded.`);
};

// ================= MEDIA DOWNLOAD =================
async function downloadMedia(message, filePath) {
    const type = Object.keys(message)[0];
    const stream = await downloadContentFromMessage(message[type], type.replace("Message", ""));

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// ================= START BOT =================
async function startSavage() {
    const sessionPath = "./session";

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
        browser: ["RHINO-MD", "Chrome", "1.0"]
    });

    global.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    // ================= CONNECTION =================
    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === "open") {
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;

            const platform = getHostPlatform();

            const startQuotes = [
                "Savage core activated.",
                "System breach complete.",
                "Dominance online.",
                "Engine awake.",
                "Execution started."
            ];

            const randomQuote = startQuotes[Math.floor(Math.random() * startQuotes.length)];

            await sock.sendMessage(myNumber, {
                text:
`┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼

⚡ ${randomQuote}
🖥️ Host: ${platform}
📢 Channel:
${SUPPORT_CHANNEL_LINK}

🦏 RHINO CORE ACTIVE
🚀 STATUS: ONLINE`
            });

            await sock.sendMessage(myNumber, {
                text:
`╔══════════════════╗
      SΛVΛGΞ-TΞCH
╚══════════════════╝

🦏 RHINO MODE ACTIVATED

✅ Deployment successful
⚡ System initialized
📢 Channel:
${SUPPORT_CHANNEL_LINK}

🚀 SYSTEM ONLINE`
            });
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(startSavage, 5000);
            else process.exit(0);
        }
    });

    // ================= MESSAGE STORAGE + MEDIA BACKUP =================
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const id = msg.key.id;
        const from = msg.key.remoteJid;

        let record = {
            msg,
            time: Date.now(),
            mediaPath: null
        };

        try {
            const type = Object.keys(msg.message)[0];
            if (["imageMessage","videoMessage","audioMessage","documentMessage","stickerMessage"].includes(type)) {
                const filePath = path.join(MEDIA_DIR, `${id}`);
                await downloadMedia(msg.message, filePath);
                record.mediaPath = filePath;
            }
        } catch (e) {}

        global.msgStore.set(id, record);
        saveDB();

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const cmd = global.commands.get(commandName);

        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, { isMe: msg.key.fromMe });
            } catch (e) {}
        }
    });

    // ================= ANTI-DELETE (FULL MEDIA RECOVERY) =================
    sock.ev.on("messages.update", async (updates) => {
        for (const u of updates) {
            const data = global.msgStore.get(u.key.id);
            if (!data) continue;

            const sender = u.key.participant || u.key.remoteJid;

            // MEDIA RESTORE
            if (data.mediaPath && fs.existsSync(data.mediaPath)) {
                const buffer = fs.readFileSync(data.mediaPath);

                await sock.sendMessage(global.antideleteOwnerChat, {
                    image: buffer,
                    caption: `⚠️ MEDIA DELETED\n👤 @${sender.split('@')[0]}`,
                    mentions: [sender]
                });
            } else {
                await sock.sendMessage(global.antideleteOwnerChat, {
                    text:
`⚠️ TEXT DELETED
👤 @${sender.split('@')[0]}
💬 ${data.msg.message?.conversation || "media"}`,
                    mentions: [sender]
                });
            }

            global.msgStore.delete(u.key.id);
            saveDB();
        }
    });

    // ================= COMMANDS =================
    sock.ev.on("group-participants.update", async () => {});
}

loadCommands();
startSavage();
