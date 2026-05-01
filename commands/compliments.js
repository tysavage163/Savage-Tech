const compliments = [
  "You have a great smile.",
  "Your energy is contagious.",
  "You're a great listener.",
  "You're so thoughtful.",
  "You light up the room.",
  "You're incredibly brave.",
  "You make me feel so special.",
  "You have a beautiful soul.",
  "You're one of a kind.",
  "Your kindness is unmatched.",
  "You're so talented at everything you do.",
  "You have a great sense of humor.",
  "You're a true friend.",
  "You're so strong – mentally and emotionally.",
  "You have a heart of gold.",
  "You're so creative.",
  "You're a fantastic problem solver.",
  "You're always so positive.",
  "You have amazing ideas.",
  "You're so generous.",
  "You're a great leader.",
  "You're so smart and funny at the same time.",
  "Your presence makes everything better.",
  "You're a wonderful human being.",
  "You're so easy to talk to.",
  "You have the best taste in everything.",
  "You're so reliable.",
  "You're a ray of sunshine.",
  "You're absolutely stunning.",
  "You inspire me to be better."
];
module.exports = {
  name: 'compliments',
  category: 'fun',
  description: 'Random compliment',
  async execute(sock, msg, args) {
    const random = compliments[Math.floor(Math.random() * compliments.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🌸 *Compliment for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
