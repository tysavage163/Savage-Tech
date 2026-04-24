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

// Settings - FIXED: Changed to global so commands can see them
global.prefix = "."; 
global.commands = new Map();
const messageStore = new Map(); 

// ===== 1. LOAD COMMANDS ONCE =====
const loadCommands = () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd); // Fixed to global
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded into the body.`);
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
        
        // Anti-Delete Storage
        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));

        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "";

        if (!text.startsWith(global.prefix)) return; // Fixed to global

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const cmd = global.commands.get(commandName); // Fixed to global
        if (cmd) {
            try {
                await cmd.execute(sock, msg, args);
            } catch (e) {
                console.error(e);
            }
        }
    });

    // ===== 4. ANTI-DELETE LISTENER (STILL HERE!) =====
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
