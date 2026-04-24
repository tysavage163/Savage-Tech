const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore =
    Baileys.makeInMemoryStore ||
    require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;

const pino = require("pino");
const fs = require("fs");
const readline = require("readline");

// ===== GLOBAL SETTINGS =====
global.prefix = "!"; // used by setprefix command

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" })
});

// ===== INPUT HELPER =====
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) =>
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
};

// ===== MAIN START =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    console.log("\nChoose pairing method:");
    console.log("1. QR Code");
    console.log("2. Phone Number\n");

    const choice = await question("Enter 1 or 2: ");
    const useQR = choice.trim() === "1";

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino({ level: "fatal" })
            )
        },
        printQRInTerminal: useQR,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        getMessage: async (key) => {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: "Savage-Tech" };
        }
    });

    store.bind(sock.ev);

    // ===== PHONE PAIRING =====
    if (!useQR && !sock.authState.creds.registered) {
        console.log("\n📞 PHONE NUMBER PAIRING");

        const phoneNumber = await question(
            "Enter number (e.g. 2547XXXXXXXX): "
        );

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(
                    phoneNumber.replace(/[^0-9]/g, "")
                );
                console.log(
                    `\n🔥 PAIRING CODE: ${code.match(/.{1,4}/g).join("-")}\n`
                );
            } catch (err) {
                console.error("Pairing error:", err);
            }
        }, 3000);
    }

    // ===== SAVE CREDS =====
    sock.ev.on("creds.update", saveCreds);

    // ===== CONNECTION =====
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                startSavage();
            }
        } else if (connection === "open") {
            console.log("✅ SAVAGE-TECH CONNECTED");
        }
    });

    // ===== COMMAND HANDLER =====
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages?.[0];
        if (!mek || !mek.message || mek.key.fromMe) return;

        const body =
            mek.message.conversation ||
            mek.message.extendedTextMessage?.text ||
            "";

        const from = mek.key.remoteJid;
        const sender = jidNormalizedUser(
            mek.key.participant || mek.key.remoteJid
        );

        if (!body.startsWith(global.prefix)) return;

        const args = body.slice(global.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        try {
            const files = fs
                .readdirSync("./commands")
                .filter((f) => f.endsWith(".js"));

            for (const file of files) {
                delete require.cache[
                    require.resolve(`./commands/${file}`)
                ];

                const cmd = require(`./commands/${file}`);

                if (cmd.name === command) {
                    return cmd.execute(sock, mek, args, {
                        prefix: global.prefix,
                        sender
                    });
                }
            }
        } catch (err) {
            console.error("Command error:", err);
        }
    });

    // ===== ANTI DELETE =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            if (update.update.message === null) {
                const msg = await store.loadMessage(
                    update.key.remoteJid,
                    update.key.id
                );

                if (!msg) return;

                const sender = update.key.participant || update.key.remoteJid;

                await sock.sendMessage(update.key.remoteJid, {
                    text: `🚨 *ANTI DELETE*\n\n👤 @${sender.split("@")[0]} deleted:\n${
                        msg.message?.conversation || "Media message"
                    }`,
                    mentions: [sender]
                });
            }
        }
    });
}

startSavage();
