const dares = [
  "Send an embarrassing photo to the last person you texted.",
  "Post something silly on your social media right now.",
  "Do 20 jumping jacks.",
  "Sing the chorus of your favorite song out loud.",
  "Show the last five photos in your camera roll.",
  "Send a heartfelt message to someone you haven't talked to in a while.",
  "Do a dramatic reading of the last message you received.",
  "Let the group choose your profile picture for an hour.",
  "Act like a monkey for 15 seconds.",
  "Send a random compliment to three people in your contacts.",
  "Do 10 pushups.",
  "Tell a joke (if someone laughs, you lose).",
  "Make a funny face and take a selfie.",
  "Send a voice note of you laughing.",
  "Text your crush 'I like you' and screenshot the reaction (no send needed).",
  "Change your ringtone to something embarrassing for a day.",
  "Show your browser history (safe mode).",
  "Share a childhood memory that makes you cringe.",
  "Do a TikTok dance without music.",
  "Send 'I'm thinking of you' to someone random.",
  "Eat a spoonful of hot sauce (or something spicy).",
  "Let someone write on your hand with a marker.",
  "Record yourself saying 'I love watching paint dry' and send it.",
  "Pretend to be a celebrity for the next round.",
  "Send a cheesy pickup line to a friend.",
  "Do 15 sit-ups.",
  "Answer your phone on speaker if it rings.",
  "Send the word 'banana' 20 times to the last person you messaged.",
  "Make up a rap about vegetables.",
  "Send a selfie with a funny filter."
];
module.exports = {
  name: 'dares',
  category: 'fun',
  description: 'Dare for games',
  async execute(sock, msg, args) {
    const random = dares[Math.floor(Math.random() * dares.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `⚡ *Dare for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
