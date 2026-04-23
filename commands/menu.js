const os = require('os');

module.exports = {
    name: 'menu',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "User";
        
        // --- 🖼️ IMAGE ROTATION LOGIC ---
        const menuImages = [
            "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/0c780413-5837-4d2c-bc94-5c91851e7a93.png",
            "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/273388b5-6a81-4c46-9c77-55e947d3c57e.png",
            "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/f2ec0991-7b69-40ec-944f-ff1ef0b201f7.png",
            "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/36d8c5fa-f6a1-4584-be49-6f0a80db6db7.png"
        ];
        const selectedImg = menuImages[Math.floor(Math.random() * menuImages.length)];

        // --- 📊 SYSTEM DIAGNOSTICS ---
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        // Memory Logic
        const usedMem = process.memoryUsage().rss;
        const totalMem = os.totalmem();
        const memPercent = Math.round((usedMem / totalMem) * 100);
        
        // Progress Bar [████░░░░░░]
        const barTotal = 10;
        const completed = Math.round((memPercent / 100) * barTotal);
        const bar = "█".repeat(completed) + "░".repeat(barTotal - completed);

        const menuText = `
┎──────────────────────────╼
┃   ✨ 𝐒𝐀𝐕𝐀𝐆𝐄-𝐓𝐄𝐂𝐇 𝐕𝟏 ✨
┖──────────────────────────╼

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🖥️  𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐈𝐀𝐆𝐍𝐎𝐒𝐓𝐈𝐂𝐒
┃ 👤 *OPERATOR:* ${pushName}
┃ 🕰️ *TIME:* ${time}
┃ 📅 *DATE:* ${date}
┃ ⏳ *UPTIME:* ${hours}h ${minutes}m
┃ 🧠 *RAM:* [${bar}] ${memPercent}%
┃ 🌐 *STATUS:* OPTIMIZED
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭╼『 ⚔️ 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐈𝐕𝐈𝐋𝐄𝐆𝐄𝐒 』
┃ ⚓ .kick 
┃ ⚓ .promote
┃ ⚓ .demote
┃ ⚓ .hidetag
┃ 🚫 .block (Owner)
╰━━━━━━━━━━━━━━━━━━━━━━━━╼

╭╼『 🛸 𝐌𝐄𝐃𝐈𝐀 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄 』
┃ 📂 .vv (View-Once Bypass)
┃ 🎵 .play (YT Music)
┃ 🖼️ .sticker (Media Conv)
╰━━━━━━━━━━━━━━━━━━━━━━━━╼

╭╼『 🛠️ 𝐂𝐎𝐑𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 』
┃ ⚡ .ping (Latency)
┃ 🤖 .alive (Current State)
┃ 👤 .owner (Contact)
╰━━━━━━━━━━━━━━━━━━━━━━━━╼

┌──────────────────────────┐
    "𝐏𝐞𝐫𝐟𝐞𝐜𝐭𝐢𝐨𝐧 𝐢𝐬 𝐧𝐨𝐭 𝐚𝐧 
     𝐨𝐩𝐭𝐢𝐨𝐧, 𝐢𝐭 𝐢𝐬 𝐭𝐡𝐞 
     𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐦𝐞𝐧𝐭."
        — 𝑩𝒆𝒄𝒌 𝑺𝒑𝒆𝒏𝒄𝒆𝒓
└──────────────────────────┘
`;

        await sock.sendMessage(from, { 
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: "Savage-Tech: Neural Interface v1.0",
                    body: "System Integrity: 100%",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: selectedImg, 
                    sourceUrl: "https://github.com/tysavage163/Savage-Tech"
                }
            }
        }, { quoted: msg });
    }
};
