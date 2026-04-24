const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");

// optional: QR in terminal
const qrcode = require("qrcode-terminal");

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false // we handle it manually
    });

    // 🔥 FORCE QR DISPLAY
    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            console.log("📱 Scan this QR:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ CONNECTED");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== 401;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                start();
            } else {
                console.log("❌ Logged out.");
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

start();
