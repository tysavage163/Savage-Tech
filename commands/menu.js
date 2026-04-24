const fs = require('fs');
const os = require('os');

module.exports = {
    name: "menu",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const userJid = msg.key.participant || msg.key.remoteJid;

        // --- 📊 SYSTEM DATA ---
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        
        const uptimeSeconds = os.uptime();
        const days = Math.floor(uptimeSeconds / (24 * 3600));
        const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
        const mins = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeString = `${days}d ${hours}h ${mins}m`;

        const files = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
        const commandNames = files.map(f => f.replace(".js", ""));

        // --- 🧬 THE SAVAGE-TECH GRID ---
        let menuText = `
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
      ⚡ 𝐒𝐀𝐕𝐀𝐆𝐄-𝐓𝐄𝐂𝐇 ⚡
┗━━━━━━━━━━━━━━━━━━━━━━━━┛

┌───  🛰️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎  ───
│ 👤 𝐃𝐄𝐕: 𝐒𝐩𝐞𝐧𝐜𝐞𝐫
│ 🤖 𝐍𝐀𝐌𝐄: 𝐒𝐚𝐯𝐚𝐠𝐞-𝐓𝐞𝐜𝐡
│ 🌐 𝐇𝐎𝐒𝐓: 𝐓𝐞𝐫𝐦𝐮𝐱 (𝐀𝐧𝐝𝐫𝐨𝐢𝐝)
│ ⏳ 𝐔𝐏𝐓𝐈𝐌𝐄: ${uptimeString}
│ 🧠 𝐑𝐀𝐌: ${usedMem}𝐆𝐁 / ${totalMem}𝐆𝐁
└────────────────────────

───  💠 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐆𝐑𝐈𝐃  ───\n\n`;

        commandNames.forEach((name, index) => {
            menuText += `  ▫️ .${name.padEnd(12)}`;
            if ((index + 1) % 2 === 0) menuText += '\n'; 
        });

        menuText += `\n\n───  🛡️ 𝐆𝐑𝐈𝐃 𝐒𝐓𝐀𝐓𝐔𝐒  ───
  🧬 𝐄𝐕𝐎𝐋𝐔𝐓𝐈𝐎𝐍: 𝐀𝐂𝐓𝐈𝐕𝐄
  📊 𝐋𝐎𝐀𝐃𝐄𝐃: ${commandNames.length} 𝐔𝐍𝐈𝐓𝐒

_“The grid is yours to command.”_`;

        try {
            await sock.sendMessage(from, { 
                image: { url: "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/0c780413-5837-4d2c-bc94-5c91851e7a93.png" }, 
                caption: menuText,
                mentions: [userJid]
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: menuText, mentions: [userJid] }, { quoted: msg });
        }
    }
};
