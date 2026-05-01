const nights = [
  "End your day with a grateful heart. Good night!",
  "Sleep tight – tomorrow is another chance to shine.",
  "Good night! Let your dreams take flight.",
  "The stars are beautiful because of the light they can't control. Good night.",
  "Rest now, for tomorrow you conquer the world.",
  "Good night! Don't forget to dream big.",
  "Sleep is the best meditation. Good night!",
  "May your dreams be as sweet as you are. Good night.",
  "Good night! You've done enough for today.",
  "Let your worries fade with the moonlight. Good night.",
  "Sleep well, wake up ready.",
  "Good night! The best is yet to come.",
  "Rest your mind, heal your soul. Good night.",
  "Close your eyes and let the peace of the night embrace you.",
  "Good night! Tomorrow you'll be stronger.",
  "May you sleep peacefully and wake up refreshed.",
  "Good night! Don't let today's struggles steal tomorrow's joy.",
  "The night is darker now, but the dawn will come. Good night.",
  "Sleep with a heart full of gratitude.",
  "Good night! You are loved, you are enough.",
  "Let silence heal what words cannot. Good night.",
  "Good night! May your bed be soft and your dreams be wild.",
  "Tomorrow is a new page. Sleep well.",
  "Good night! You've earned your rest.",
  "The moon is a reminder that even in darkness, you can shine.",
  "Good night! Don't forget to love yourself.",
  "Sleep tight, don't let the bed bugs bite (they're too scared of you).",
  "Good night! May your coffee be strong tomorrow.",
  "Rest up – you've got greatness to chase.",
  "Good night! Sweet dreams and starry skies."
];
module.exports = {
  name: 'goodnight',
  category: 'fun',
  description: 'Good night message',
  async execute(sock, msg, args) {
    const random = nights[Math.floor(Math.random() * nights.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🌙 *Good night, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
