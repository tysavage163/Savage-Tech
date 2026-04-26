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
            // Add the current group ID to the global Welcome Store
            global.welcomeStore.add(from);

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
            // Remove the group ID from the global Welcome Store
            global.welcomeStore.delete(from);

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
