module.exports = {
    name: 'alwaysrecording',
    category: 'owner',
    description: 'Toggle global always‑recording presence on/off (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
        if (global.alwaysRecording === undefined) global.alwaysRecording = false;
        const newState = !global.alwaysRecording;
        global.alwaysRecording = newState;
        await sock.sendMessage(from, { text: `🎙️ Always‑recording is now *${newState ? "ON" : "OFF"}* globally.` });
    }
};
