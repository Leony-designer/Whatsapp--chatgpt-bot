const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));
const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('📲 Escaneie o QR Code abaixo com o WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
});

client.on('message', async (message) => {
  if (!message.fromMe && message.body) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message.body }]
      });

      const reply = response.choices[0].message.content;
      client.sendMessage(message.from, reply);
    } catch (err) {
      console.error('Erro com OpenAI:', err.message);
      client.sendMessage(message.from, '⚠️ Erro ao responder com ChatGPT.');
    }
  }
});

client.initialize();
