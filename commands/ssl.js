const tls = require('tls');
module.exports = {
  name: 'ssl',
  category: 'ethical hacking',
  description: 'Check SSL certificate details',
  async execute(sock, msg, args) {
    const host = args[0];
    if (!host) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .ssl <domain>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔐 Fetching SSL cert for ${host}...`, mentions: [jid] });
      const cert = await new Promise((resolve, reject) => {
        const socket = tls.connect({ host, port: 443, rejectUnauthorized: false }, () => {
          const cert = socket.getPeerCertificate();
          socket.end();
          resolve(cert);
        });
        socket.on('error', reject);
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
      if (!cert || Object.keys(cert).length === 0) throw new Error('No certificate found');
      let text = `🔒 SSL Certificate for ${host}\n`;
      text += `Subject: ${cert.subject?.CN || 'N/A'}\n`;
      text += `Issuer: ${cert.issuer?.CN || 'N/A'}\n`;
      text += `Valid from: ${cert.valid_from || 'N/A'}\n`;
      text += `Valid to: ${cert.valid_to || 'N/A'}\n`;
      text += `Algorithm: ${cert.sigalg || 'N/A'}\n`;
      text += `Fingerprint: ${cert.fingerprint || 'N/A'}`;
      const output = `🛡️ *SSL Check*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${host}\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ SSL error: ${err.message}` });
    }
  }
};
