const express = require('express');
const path = require('path');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve your "SΛVΛGΞ" HTML files from the public folder
app.use(express.static('public'));

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number is required" });

    // Clean the number (remove + or spaces)
    num = num.replace(/[^0-9]/g, '');

    const { state, saveCreds } = await useMultiFileAuthState('session_temp');

    try {
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"] 
        });

        if (!sock.authState.creds.registered) {
            await delay(1500); // Give it a moment to initialize
            const code = await sock.requestPairingCode(num);
            console.log(`💎 SΛVΛGΞ CODE FOR ${num}: ${code}`);
            res.json({ code: code });
        } else {
            res.json({ error: "Session already exists" });
        }
    } catch (error) {
        console.error("❌ Pairing Error:", error);
        res.status(500).json({ error: "Server Busy. Try Again." });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 SΛVΛGΞ-PAIR REBOOTED ON PORT ${PORT}
🔗 FOOTER: Inspired by Meryl (Active)
    `);
});
