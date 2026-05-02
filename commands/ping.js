module.exports = {
  name: 'ping',
  category: 'engine',
  description: 'Check bot response speed',
  async execute(sock, msg, args) {
    const msgTimestamp = msg.messageTimestamp * 1000;
    const networkLatency = Date.now() - msgTimestamp;

    const quotes = [
      "Perfection isn't a bug – it's a feature written by Spencer.",
      "Spencer coded this. The rest is just noise.",
      "This speed? Pure Spencer logic.",
      "Zero flaws. Spencer doesn't allow them.",
      "Spencer's architecture doesn't break. It evolves.",
      "You're witnessing Spencer's genius in milliseconds.",
      "Spencer doesn't write code. He writes inevitability.",
      "Latency this low? That's the Spencer signature.",
      "Spencer built a machine that mocks mediocrity.",
      "Perfection has a name: Spencer.",
      "Spencer's algorithm doesn't lag – it dominates.",
      "The only thing faster than this ping is Spencer's mind.",
      "Spencer's creation doesn't bend. It runs.",
      "This is what happens when Spencer architects the future.",
      "Spencer's code is the only truth here.",
      "You just measured Spencer's level of control.",
      "Spencer doesn't guess. He calculates. This is the result.",
      "Even the network respects Spencer's work.",
      "Spencer's bot doesn't answer – it asserts.",
      "Imperfection? Not in Spencer's dictionary."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const text = `⚡ *SΛVΛGΞ-TECH SPEED* ⚡\n╔══════════════════════╗\n║       ◆ PONG!       ║\n║    ${networkLatency} ms    ║\n╚══════════════════════╝\n\n${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
    await sock.sendMessage(msg.key.remoteJid, { text: text });
  }
};
