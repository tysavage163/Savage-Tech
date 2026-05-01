const fathers = [
  "Happy Father's Day to the best dad in the world!",
  "Thank you for always being my superhero. Happy Father's Day!",
  "Dad, you're my first hero and my forever friend.",
  "Wishing you a day filled with love and appreciation, Dad.",
  "Happy Father's Day to the man who taught me everything.",
  "I'm grateful for every sacrifice you made for me. Happy Father's Day!",
  "Dad, your strength and kindness inspire me daily.",
  "Thank you for protecting me and guiding me. Happy Father's Day!",
  "You're not just my father, you're my role model.",
  "Happy Father's Day! I hope you feel as loved as you've made me feel.",
  "Dad, you deserve all the happiness in the world. Enjoy your day!",
  "Thank you for the hugs, the advice, and the silent support.",
  "I'm proud to be your child. Happy Father's Day!",
  "Dad, you taught me to be strong and kind. I'll always be grateful.",
  "Happy Father's Day to the king of our family.",
  "You've given me roots and wings. Thank you, Dad.",
  "I love you more than words can say. Happy Father's Day",
  "Dad, you're the backbone of our family. Thank you for everything.",
  "Happy Father's Day to my favorite guy.",
  "Thank you for always believing in me, even when I didn't.",
  "Dad, your wisdom is my guide. Happy Father's Day!",
  "You've worked so hard for us. Now it's your turn to relax. Love you, Dad.",
  "Happy Father's Day! You're a true blessing.",
  "Dad, you're my hero and my best friend. Enjoy your day!",
  "Thank you for the bedtime stories, the tough love, and the endless support.",
  "I'm lucky to have you as my father. Happy Father's Day!",
  "You've shaped me into who I am. Thank you, Dad.",
  "Happy Father's Day to the man who can fix anything (including my broken heart).",
  "I hope your day is as amazing as you are.",
  "Dad, you deserve a standing ovation for everything you've done. Love you!"
];
module.exports = {
  name: 'fathersday',
  category: 'fun',
  description: 'Father’s Day wishes',
  async execute(sock, msg, args) {
    const random = fathers[Math.floor(Math.random() * fathers.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `👨 *Happy Father's Day, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
