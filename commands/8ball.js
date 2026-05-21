module.exports = {
  name: '8ball',
  category: 'fun',
  description: 'Ask the magic 8‑ball a question',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(from, { text: '❌ Ask a yes/no question: .8ball Will I win?' }, { quoted: msg });
    const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Ask later', 'Very likely', 'Outlook not good', 'Signs point to yes'];
    const random = answers[Math.floor(Math.random() * answers.length)];
    await sock.sendMessage(from, { text: `🎱 *Question:* ${args.join(' ')}\n🎱 *Answer:* ${random}` }, { quoted: msg });
  }
};
