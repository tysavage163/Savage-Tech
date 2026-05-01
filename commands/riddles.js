const riddles = [
  { q: "What has keys but can't open locks?", a: "A piano." },
  { q: "What has a head, a tail, but no body?", a: "A coin." },
  { q: "What gets wetter as it dries?", a: "A towel." },
  { q: "What has to be broken before you can use it?", a: "An egg." },
  { q: "I'm tall when I'm young and short when I'm old. What am I?", a: "A candle." },
  { q: "What has a face and two hands but no arms or legs?", a: "A clock." },
  { q: "What can you catch but not throw?", a: "A cold." },
  { q: "What has cities, but no houses; forests, but no trees; and water, but no fish?", a: "A map." },
  { q: "What goes up but never comes down?", a: "Your age." },
  { q: "What has a mouth but cannot speak?", a: "A river." },
  { q: "What has a ring but no finger?", a: "A telephone." },
  { q: "What has a thumb and four fingers but is not alive?", a: "A glove." },
  { q: "What is full of holes but still holds water?", a: "A sponge." },
  { q: "What kind of band never plays music?", a: "A rubber band." },
  { q: "What has a neck but no head?", a: "A bottle." },
  { q: "What has words but never speaks?", a: "A book." },
  { q: "What can run but never walks, has a mouth but never talks?", a: "A river." },
  { q: "What has a bottom at the top?", a: "Your legs." },
  { q: "What has a heart that doesn't beat?", a: "An artichoke." },
  { q: "What has one eye but cannot see?", a: "A needle." },
  { q: "What has a thousand words but cannot speak?", a: "A book." },
  { q: "What has a face and a back but no body?", a: "A watch." },
  { q: "What can you hold without ever touching?", a: "Your breath." },
  { q: "What is always in front of you but can't be seen?", a: "The future." },
  { q: "What is black when you buy it, red when you use it, and gray when you throw it away?", a: "Charcoal." },
  { q: "What has a head and a tail but no body?", a: "A coin." },
  { q: "What has many keys but can't open a door?", a: "A piano." },
  { q: "What has a spine but no bones?", a: "A book." },
  { q: "What has a foot on each side but no legs?", a: "A pair of shoes." },
  { q: "What has a face that doesn’t frown, and hands that don’t wave?", a: "A clock." }
];
module.exports = {
  name: 'riddles',
  category: 'fun',
  description: 'Random riddle (answer hidden)',
  async execute(sock, msg, args) {
    const random = riddles[Math.floor(Math.random() * riddles.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🧩 *Riddle for @${senderName}*\n\n${random.q}\n\n(Answer will be sent in 10 seconds...)\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
    setTimeout(async () => {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔓 *Answer:* ${random.a}` });
    }, 10000);
  }
};
