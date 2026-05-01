const truths = [
  "What's the biggest lie you've ever told?",
  "Have you ever pretended to be sick to avoid something?",
  "What's something you've never told anyone?",
  "What's the last thing you searched on your phone that you'd be embarrassed to share?",
  "What's a rumor you've started about someone?",
  "Have you ever lied to your best friend?",
  "What's the biggest secret you've kept from your parents?",
  "What's something you regret buying?",
  "What's one thing you're jealous of in someone else?",
  "What's the worst thing you've done for money?",
  "Have you ever betrayed a friend?",
  "What's something you've done that no one knows about?",
  "What's the biggest mistake you've made in a relationship?",
  "What's something you've stolen?",
  "What's a secret you've kept from your partner?",
  "What's the most childish thing you still do?",
  "What's something you're insecure about?",
  "What's the worst thing you've said to someone you love?",
  "What's a lie you told to get out of trouble?",
  "Have you ever pretended to be busy to avoid someone?",
  "What's something you're hiding from your current partner?",
  "What's the biggest risk you've taken?",
  "What's something you'd change about your past?",
  "Have you ever said 'I love you' without meaning it?",
  "What's something you're afraid people will find out about you?",
  "What's the worst thing you've done to a sibling?",
  "Have you ever cheated on a test?",
  "What's something you've done but would never admit publicly?",
  "What's the biggest favor someone has done for you that you never repaid?",
  "What's the most embarrassing thing that's happened to you?"
];
module.exports = {
  name: 'truth',
  category: 'fun',
  description: 'Truth question for games',
  async execute(sock, msg, args) {
    const random = truths[Math.floor(Math.random() * truths.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🔍 *Truth for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
