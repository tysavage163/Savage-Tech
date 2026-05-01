const pickups = [
  "Are you a loan? Because you have my interest.",
  "Do you have a name, or can I call you mine?",
  "Is your name Netflix? Because I could watch you all day.",
  "Are you made of sugar? Because you're so sweet.",
  "If you were a triangle, you'd be acute one.",
  "Do you have 11 protons? Because you're sodium fine.",
  "Are you a time machine? Because every time I see you, time stands still.",
  "Is your name Summer? Because you're hot.",
  "Do you have a mirror in your pocket? Because I can see myself in your pants.",
  "Are you a campfire? Because you're hot and I want s'more.",
  "Is your name Wifi? Because I'm really feeling a connection.",
  "Do you have a Band-Aid? Because I just fell for you.",
  "Are you a UFO? Because you're out of this world.",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Is your dad a boxer? Because you're a knockout.",
  "Do you like Star Wars? Because Yoda one for me.",
  "Are you a cake? Because I want a piece of you.",
  "Is your name Ariel? Because we mermaid for each other.",
  "Do you have a map? I keep getting lost in your eyes.",
  "Are you a dog? Because you're ruff on my heart.",
  "If you were a cat, you'd purr-fect.",
  "Is your name Cinderella? Because I see that dress disappearing at midnight.",
  "Do you like raisins? How do you feel about a date?",
  "Are you a banana? Because I find you a-peeling.",
  "Is your name Lana? Because I'm Lana love with you.",
  "Do you have a quarter? I promised my mom I'd call when I fell in love.",
  "Are you a parking ticket? Because you've got fine written all over you.",
  "If you were a steak, you'd be well done.",
  "Is your name Ruby? Because you're a gem.",
  "Do you believe in fate? Because I think we're meant to be."
];
module.exports = {
  name: 'pickuplines',
  category: 'fun',
  description: 'Random pickup line',
  async execute(sock, msg, args) {
    const random = pickups[Math.floor(Math.random() * pickups.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💘 *Pickup line for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
