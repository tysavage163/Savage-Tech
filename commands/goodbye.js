module.exports = {
  name: 'goodbye',
  category: 'group',
  description: 'Toggle goodbye messages on/off (owner only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
    if (global.goodbyeEnabled === undefined) global.goodbyeEnabled = true;
    const newState = !global.goodbyeEnabled;
    global.goodbyeEnabled = newState;
    await sock.sendMessage(from, { text: `✅ Goodbye messages are now *${newState ? "ON" : "OFF"}*` });
  }
};
