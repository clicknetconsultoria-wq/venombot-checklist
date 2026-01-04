const venom = require('venom-bot');
const express = require('express');
const app = express();

let lastQr = null;
let clientInstance = null;

// ===============================
// VENOM BOT
// ===============================
venom.create(
  'checklist-session',

  // QR CODE
  (base64Qr) => {
    lastQr = base64Qr;
    console.log('📲 QR Code gerado');
  },

  // STATUS
  (status) => {
    console.log('📡 Status:', status);
  },

  // OPTIONS
{
  headless: true,
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ],
  disableWelcome: true
}

  //{
  //  headless: false, // IMPORTANTE na 1ª vez
  //  browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  //  disableWelcome: true
  //}
)
.then((client) => {
  clientInstance = client;
  console.log('✅ Venom conectado');

  // Envia QR automaticamente quando logar
  if (lastQr) {
    enviarQrWhatsapp(client);
  }
})
.catch(err => {
  console.error('❌ Erro Venom:', err);
});

// ===============================
// ENVIO AUTOMÁTICO DO QR
// ===============================
async function enviarQrWhatsapp(client) {
  const meuNumero = '5582982108611@c.us'; // EX: 5511999999999@c.us

  await client.sendImage(
    meuNumero,
    lastQr,
    'qrcode.png',
    '📲 Escaneie este QR para conectar o WhatsApp'
  );

  console.log('📤 QR enviado para WhatsApp');
}

// ===============================
// API
// ===============================
app.get('/qr', (req, res) => {
  if (!lastQr) {
    return res.status(404).json({ error: 'QR ainda não disponível' });
  }
  res.json({ qr: lastQr });
});

app.get('/qr-view', (req, res) => {
  if (!lastQr) {
    return res.send('<h2>QR ainda não gerado</h2>');
  }

  res.send(`
    <html>
      <head>
        <title>QR WhatsApp</title>
      </head>
      <body style="text-align:center;font-family:Arial">
        <h2>Escaneie o QR Code</h2>
        <img src="${lastQr}" />
      </body>
    </html>
  `);
});

app.listen(8080, () => {
  console.log('🚀 API rodando na porta 8080');
});
