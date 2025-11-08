// Importa os pacotes
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Para enviar a resposta

const app = express().use(bodyParser.json());

// --- CONFIGURE AQUI ---
// Coloque o Token de Acesso (temporário ou permanente) que o Facebook te deu
const WHATSAPP_TOKEN = 'EAAcFEZAozGeMBPyWH9mN7fdNEWLLSQYwS8Lq2PUBdKUDfrSvW3nUbodZB44E87aLB38qc5ttAYZBHBTdSt0YcRtXimL1JyrfBXP3DbWMMoYuGlrmQT7O1LaQZAVjassNye2ijrfZAUwSkLODP131Kj8AQHWc5hgR7KbZA3Yd5LHGMDibSyz40mEkmjTZAZBzGsZB3t6cvl4fSqn4KbagMvLt4ydyBc6QFt0dvZCoLRDj2z942ZBaG6BZCKK1tTbpfvEQ7HxKuWxwfI4VIEUw5x4BMOr4A6Cn';
// Coloque o ID do seu número de telefone (que o Facebook te deu)
const WHATSAPP_PHONE_ID = '797715193434137';
// Crie qualquer senha, será usada no Passo 4
const VERIFY_TOKEN = 'rosaparks'; 
// --- FIM DA CONFIGURAÇÃO ---

// Define a porta (Render vai configurar isso)
const port = process.env.PORT || 3000;

// Inicia o servidor
app.listen(port, () => {
  console.log(`Webhook está ouvindo na porta ${port}`);
});

// Endpoint para receber mensagens dos usuários
app.post('/webhook', (req, res) => {
  let body = req.body;

  // Loga a mensagem recebida para debug
  console.log(JSON.stringify(body, null, 2));

  // Verifica se é uma mensagem do WhatsApp
  if (body.object === 'whatsapp_business_account') {
    body.entry.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.field === 'messages' && change.value.messages) {

          let msg = change.value.messages[0];
          let from = msg.from; // Número do usuário
          let msg_body = msg.text.body; // Texto da mensagem

          // Lógica simples do Bot: Responder "Oi" com "Olá!"
          if (msg_body.toLowerCase() === 'oi') {

            // Envia a resposta de volta
            axios({
              method: 'POST',
              url: `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
              headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
              },
              data: {
                messaging_product: 'whatsapp',
                to: from,
                text: { body: 'Olá! Você disse Oi.' }
              }
            }).catch(error => {
              console.error('Erro ao enviar resposta:', error.response.data);
            });
          }
        }
      });
    });

    res.sendStatus(200); // Responde OK para o WhatsApp
  } else {
    res.sendStatus(404); // Se não for do WhatsApp, retorna erro
  }
});

// Endpoint para o WhatsApp verificar seu servidor (Webhook)
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});