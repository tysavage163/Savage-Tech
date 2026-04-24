const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

let prefix = "!";

// ===== START =====
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
        logger: pino({ level: "silent" })
    });

    // ===== QR HANDLER =====
    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            console.log("\n📱 SCAN QR BELOW:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ BOT CONNECTED");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                startSavage();
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return; // ✅ FIXED (no longer blocks your own messages)

        const from = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        try {
            const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

            for (const file of files) {
                delete require.cache[require.resolve(`./commands/${file}`)];
                const cmd = require(`./commands/${file}`);

                if (cmd.name === commandName) {
                    // ✅ pass msg properly so commands can reply correctly
                    return cmd.execute(sock, msg, args);
                }
            }
        } catch (e) {
            console.error("Command error:", e);

            // ✅ FIXED reply visibility
            await sock.sendMessage(from, {
                text: "⚠️ Error executing command"
            }, { quoted: msg });
        }
    });

    // ===== ANTI DELETE =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            if (update.update.message === null) {
                const key = update.key;
                const sender = key.participant || key.remoteJid;

                await sock.sendMessage(key.remoteJid, {
                    text: `🚨 Anti-Delete\n\n@${sender.split("@")[0]} deleted a message`,
                    mentions: [sender]
                });
            }
        }
    });
}

startSavage();
