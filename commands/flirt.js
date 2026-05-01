const flirts = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Is your name Google? Because you have everything I've been searching for.",
  "Do you have a map? I keep getting lost in your eyes.",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Are you made of copper and tellurium? Because you're Cu-Te.",
  "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
  "Can I follow you home? Cause my parents always told me to follow my dreams.",
  "Is your dad a baker? Because you're a cutie pie!",
  "You must be tired because you've been running through my mind all day.",
  "Are you a camera? Every time I look at you, I smile.",
  "I must be a snowflake, because I've fallen for you.",
  "Do you have a name, or can I call you mine?",
  "If beauty were time, you'd be an eternity.",
  "Are you a time traveler? Because I see you in my future.",
  "Is your name Wi-Fi? Because I'm feeling a connection.",
  "You're like a dictionary – you add meaning to my life.",
  "Do you believe in love at first sight, or should I walk by again?",
  "Are you an angel? Because heaven is missing one.",
  "If you were a fruit, you'd be a fineapple.",
  "I'm not a photographer, but I can picture us together.",
  "Your hand looks heavy, can I hold it for you?",
  "Are you a parking ticket? Because you've got FINE written all over you.",
  "Do you have a pencil? Because I want to erase your past and write our future.",
  "Is your name Chapstick? Because you're da balm.",
  "You're so sweet, you're giving me a toothache.",
  "Are you a 90° angle? Because you're looking right.",
  "I think there's something wrong with my eyes, because I can't take them off you.",
  "Do you have a sunburn, or are you always this hot?",
  "If you were a burger, you'd be a beaut-burger.",
  "You must be made of chocolate, because every time I see you I get a sweet craving."
];
module.exports = {
  name: 'flirt',
  category: 'fun',
  description: 'Flirty pickup line',
  async execute(sock, msg, args) {
    const random = flirts[Math.floor(Math.random() * flirts.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💕 *Flirt for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
