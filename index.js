const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const os = require("os");

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const warnings = {}; // Temporary memory for warnings

async function startSavage() {
    // --- 1. SESSION ID RESTORATION ---
    const session_id = process.env.SESSION_ID;
    if (session_id && session_id.startsWith("SAVAGE-TECH~")) {
        const encodedData = session_id.split("SAVAGE-TECH~")[1];
        if (!fs.existsSync('./session')) fs.mkdirSync('./session');
        fs.writeFileSync('./session/creds.json', Buffer.from(encodedData, 'base64').toString());
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"],
    });

    store.bind(sock.ev);
    sock.ev.on("creds.update", saveCreds);

    // --- 2. ANTIDELETE LOGIC ---
    sock.ev.on('messages.update', async (chatUpdate) => {
        for (const { key, update } of chatUpdate) {
            if (update.revoke) {
                const delegatedMsg = await store.loadMessage(key.remoteJid, key.id);
                if (!delegatedMsg) return;
                const sender = delegatedMsg.key.participant || delegatedMsg.key.remoteJid;
                await sock.sendMessage(key.remoteJid, { 
                    text: `*🚨 ANTIDELETE!* @${sender.split('@')[0]} tried to delete a message.`,
                    mentions: [sender]
                }, { quoted: delegatedMsg });
                await sock.copyNForward(key.remoteJid, delegatedMsg, false);
            }
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) startSavage();
        } else if (connection === "open") {
            console.log("✅ SAVAGE-TECH ONLINE | PREFIX: . | DEV: SPENCER");
        }
    });

    // --- 3. DYNAMIC COMMAND HANDLER ---
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;
            
            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || "";
            
            // --- PREFIX SETUP ---
            const prefix = '.'; 
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            const pushname = mek.pushName || "User";

            if (!isCmd) return;

            switch (command) {
                case 'menu':
                    let menuText = `*⚡ SAVAGE-TECH BOT ⚡*\n\n👤 *Dev:* Spencer\n🛡️ *Antidelete:* Active\n⌨️ *Prefix:* [ ${prefix} ]\n\n*MODERATION:* \n• ${prefix}warn @user\n• ${prefix}resetwarn @user\n\n*OTHERS:* \n• ${prefix}play\n• ${prefix}owner`;
                    await sock.sendMessage(from, { 
                        image: { url: 'https://i.ibb.co/680pZ7V/1777019342227.jpg' }, 
                        caption: menuText 
                    }, { quoted: mek });
                    break;

                case 'warn':
                    const mention = mek.message.extendedTextMessage?.contextInfo?.mentionedJid[0] || mek.key.participant;
                    if (!mention) return sock.sendMessage(from, { text: "Tag someone to warn!" });
                    
                    warnings[mention] = (warnings[mention] || 0) + 1;
                    await sock.sendMessage(from, { 
                        text: `*⚠️ WARNING ISSUED*\n\n👤 *User:* @${mention.split('@')[0]}\n📉 *Total Warns:* ${warnings[mention]}/3`,
                        mentions: [mention]
                    });
                    
                    if (warnings[mention] >= 3) {
                        await sock.sendMessage(from, { text: "Limit reached. User should be handled by admin." });
                    }
                    break;

                case 'resetwarn':
                    const target = mek.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
                    if (!target) return sock.sendMessage(from, { text: "Tag the user to reset." });
                    warnings[target] = 0;
                    await sock.sendMessage(from, { text: `Warns reset for @${target.split('@')[0]}`, mentions: [target] });
                    break;

                case 'owner':
                    await sock.sendMessage(from, { text: "My Developer is *Spencer* ⚡" });
                    break;
            }
        } catch (err) { console.log(err); }
    });
}

startSavage();
