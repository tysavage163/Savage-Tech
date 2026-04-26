module.exports = {
    name: 'welcome',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // 1. Group Check
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command is for Groups only.' }, { quoted: msg });
        }

        const status = args[0]?.toLowerCase();

        if (status === 'on') {
            const welcomeOn = `
╔════◇ 【 **ЩΣLCӨMΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Welcome
┣┫ ⚡ **STATUS:** ACTIVATED
║
┣━━◇ 【 **IПFӨ** 】 ◇━━┫
║
┣┫ ✨ New members will now be 
┣┫    greeted upon arrival.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: welcomeOn }, { quoted: msg });

        } else if (status === 'off') {
            const welcomeOff = `
╔════◇ 【 **ЩΣLCӨMΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Welcome
┣┫ ❌ **STATUS:** DEACTIVATED
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: welcomeOff }, { quoted: msg });

        } else {
            // Help Menu if they just type .welcome
            const welcomeHelp = `
╔════◇ 【 **ЩΣLCӨMΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 💡 **USAGE:**
┣┫ ↳ *.welcome on*
┣┫ ↳ *.welcome off*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: welcomeHelp }, { quoted: msg });
        }
    }
};
