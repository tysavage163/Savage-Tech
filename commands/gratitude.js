const gratitude = [
  "Thank you for being you – you make the world better.",
  "I'm grateful for your smile and your kindness.",
  "Thanks for always being there when I need you.",
  "Grateful for the little things – especially you.",
  "Thank you for the joy you bring into my life.",
  "I appreciate everything you do, even when you don't realize it.",
  "Gratitude turns what we have into enough. Thank you.",
  "Thank you for being a source of light in my life.",
  "I'm thankful for the good times and the hard times – they all made me stronger.",
  "Today I'm grateful for your friendship.",
  "Thanks for making me laugh when I needed it most.",
  "Gratitude is the memory of the heart. Thank you for the memories.",
  "Thank you for being my safe space.",
  "I'm grateful for every moment we've shared.",
  "Thank you for your patience, your love, and your understanding.",
  "Gratitude is the best attitude. Thank you for everything.",
  "I may not say it enough, but I'm grateful for you every day.",
  "Thanks for believing in me when I didn't believe in myself.",
  "Thank you for the hugs, the talks, and the silent support.",
  "I'm thankful for the lessons from the past and the hope for the future.",
  "Thank you for showing me kindness without expecting anything back.",
  "Grateful for the roof over my head, the food on my plate, and the people in my heart.",
  "Thank you for being a blessing in my life.",
  "I'm grateful for the challenges – they made me better.",
  "Thanks for never giving up on me.",
  "Gratitude is the key to happiness. Thank you for giving me so much to be happy about.",
  "Thank you for your honesty, even when it hurt.",
  "I'm grateful for this moment, right now, and for you reading this.",
  "Thanks for the laughs, the tears, and everything in between.",
  "Gratitude unlocks the fullness of life. Thank you for being part of mine."
];
module.exports = {
  name: 'gratitude',
  category: 'fun',
  description: 'Gratitude messages',
  async execute(sock, msg, args) {
    const random = gratitude[Math.floor(Math.random() * gratitude.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🙏 *Gratitude for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
