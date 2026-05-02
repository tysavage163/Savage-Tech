module.exports = {
  name: 'ping',
  category: 'engine',
  description: 'Check bot response speed',
  async execute(sock, msg, args) {
    const start = Date.now();
    const latency = Date.now() - start;

    const quotes = [
      "Speed isn't a gift, it's a consequence of discipline.",
      "Your hesitation is the only enemy.",
      "I don't compete, I dominate.",
      "Weakness is a choice – reject it.",
      "Victory whispers your name when you stop listening to excuses.",
      "Built different, built savage.",
      "Comfort is a trap – stay restless.",
      "They watch. You conquer.",
      "Silence your fears or they will scream for you.",
      "The grind stops when I say it stops.",
      "Legends are not born, they are forged in silence.",
      "Your doubts are irrelevant.",
      "I don't chase dreams, I hunt them.",
      "Only the relentless reach the throne.",
      "Pressure creates diamonds – and I am the hardest stone.",
      "Every 'no' is fuel.",
      "You either lead or become a memory.",
      "Consistency is my weapon, results are my proof.",
      "While you sleep, I sharpen.",
      "The arena doesn't care about your feelings – neither do I."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const text = `⚡ *SΛVΛGΞ-TECH SPEED* ⚡\n╔══════════════════════╗\n║       ◆ PONG!       ║\n║    ${latency} ms    ║\n╚══════════════════════╝\n\n${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
    await sock.sendMessage(msg.key.remoteJid, { text: text });
  }
};
