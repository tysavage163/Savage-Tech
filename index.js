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

// Settings
const prefix = "."; // Change this to your preferred prefix
const commands = new Map();
const messageStore = new Map(); // For Anti-Delete

// ===== 1. LOAD COMMANDS ONCE =====
const loadCommands = () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (cmd.name) commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${commands.size} Commands loaded into the body.`);
};

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    // ===== 2. QR & CONNECTION =====
    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SCAN THE QR BELOW:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 BOT CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 3. MESSAGE & COMMAND HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        
        // Anti-Delete: Store message content
        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));

        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "";

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const cmd = commands.get(commandName);
        if (cmd) {
            try {
                // This will reply to EVERYONE, including you
                await cmd.execute(sock, msg, args);
            } catch (e) {
                console.error(e);
            }
        }
    });

    // ===== 4. ANTI-DELETE LISTENER =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            if (update.update.message === null) {
                const key = update.key;
                const prevMsg = messageStore.get(key.id);
                if (!prevMsg) return;

                const sender = key.participant || key.remoteJid;
                const content = prevMsg.message.conversation || 
                                prevMsg.message.extendedTextMessage?.text || 
                                "Media/Image/System Message";

                await sock.sendMessage(key.remoteJid, {
                    text: `🚨 *Anti-Delete Detected*\n\n*User:* @${sender.split("@")[0]}\n*Message:* ${content}`,
                    mentions: [sender]
                }, { quoted: prevMsg });
            }
        }
    });
}

loadCommands();
startSavage();
