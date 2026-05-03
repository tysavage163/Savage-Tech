const os = require('os');
module.exports = {
    name: 'system',
    category: 'engine',
    description: 'Show system hardware and OS info',
    async execute(sock, msg, args) {
        const platform = os.platform();
        const release = os.release();
        const arch = os.arch();
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
        const usedMem = (totalMem - freeMem).toFixed(0);
        const hostname = os.hostname();
        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown';
        const cpuSpeed = cpus[0]?.speed || 0;
        const sender = msg.pushName || 'User';
        const jid = msg.key.participant || msg.key.remoteJid;
        const text = `🖥️ *SYSTEM INFO*\n👤 REQUESTED BY: @${sender}\n━━━━━━━━━━━━━━━━━━━━\n💻 Hostname: ${hostname}\n🖧 OS: ${platform} ${release}\n🔧 Arch: ${arch}\n🧠 CPU: ${cpuModel} @ ${cpuSpeed}MHz\n💪 Cores: ${cpus.length}\n🧮 RAM: ${usedMem} MB / ${totalMem} MB used\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
        await sock.sendMessage(msg.key.remoteJid, { text: text, mentions: [jid] });
    }
};
