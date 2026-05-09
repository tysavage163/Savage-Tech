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

global.prefix = ".";
global.commands = new Map();
global.worktype = "public";
global.antideleteOwnerChat = null;
global._msgCache = new Map();

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
    console.log(`✅ ${global.commands.size} Commands loaded.`);
};

async function startSavage() {
    const sessionPath = "./session";

    if (process.env.SESSION_ID) {
        console.log("📡 SESSION_ID detected. Rebuilding credentials...");
        try {
            let sessionData = process.env.SESSION_ID;
            if (sessionData.includes(";;;")) sessionData = sessionData.split(";;;")[1];
            const authData = Buffer.from(sessionData, 'base64').toString('utf-8');
            if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), authData);
            console.log("✅ Session file written.");
        } catch (e) {
            console.log("⚠️ Session decoding failed.");
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
        browser: ["SΛVΛGΞ-TECH", "Chrome", "1.0.0"]
    });

    global.sock = sock;
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN QR CODE:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") {
            console.log("\n🚀 BOT IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;
            await sock.sendMessage(myNumber, { text: "Anti‑delete active. Deleted messages will be forwarded here." });
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

        // Cache every message
        const id = msg.key.id;
        if (!global._msgCache.has(id)) {
            global._msgCache.set(id, msg);
        }

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const sender = msg.key.participant || msg.key.remoteJid;

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
                await cmd.execute(sock, msg, args, { isArchitect: isMe, isMe });
            } catch (e) {
                console.error(`❌ Command Error [${commandName}]:`, e);
            }
        }
    });

    // ===== ANTI‑DELETE HANDLER =====
    sock.ev.on("messages.update", async (updates) => {
        if (!global.antideleteOwnerChat) return;
        for (const update of updates) {
            const deletedMsg = update.update?.message;
            if (!deletedMsg) continue; // not a deletion

            const key = update.key;
            const id = key.id;
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

            await global.sock.sendMessage(global.antideleteOwnerChat, {
                text: `⚠️ *[ANTI-DELETE]*\n👤 @${sender.split("@")[0]}\n💬 ${content}`,
                mentions: [sender]
            });
            global._msgCache.delete(id);
        }
    });
}

loadCommands();
startSavage();
