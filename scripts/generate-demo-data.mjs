#!/usr/bin/env node
// Generate realistic demo data for City of Doral chatbot
// Includes multi-channel conversations (Web, IVR, SMS, Facebook, Instagram, WhatsApp)

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

// Ensure data directory exists
mkdirSync(dataDir, { recursive: true });

// Sample conversation topics
const topics = {
  en: [
    { q: "What are City Hall hours?", a: "City Hall is open Monday through Friday from 8:00 AM to 5:00 PM. We're closed on weekends and city holidays.", category: "hours" },
    { q: "How do I get a building permit?", a: "You can apply for a building permit through our online portal at permits.cityofdoral.com or visit the Building Department at City Hall. You'll need your property documents and project plans.", category: "permits" },
    { q: "When is the next city event?", a: "Our next major event is the Doral Food & Wine Festival on January 15th at Downtown Doral Park. There's also a community concert this Saturday at Morgan Levy Park.", category: "events" },
    { q: "Where can I pay my water bill?", a: "You can pay your water bill online at utilities.cityofdoral.com, by phone at 305-593-6700, at City Hall, or by mail. Auto-pay is also available.", category: "utilities" },
    { q: "How do I report a pothole?", a: "You can report potholes and road issues through our 311 app, by calling 305-593-6700, or online at cityofdoral.com/311. Please provide the exact location.", category: "311" },
    { q: "What parks are in Doral?", a: "Doral has over 20 parks including Doral Central Park, Morgan Levy Park, Veterans Park, and Doral Meadow Park. Each offers different amenities like playgrounds, sports fields, and walking trails.", category: "parks" },
    { q: "How do I get a business license?", a: "To obtain a business license, visit the Business Tax Receipt office at City Hall or apply online. You'll need your business registration documents and proof of address.", category: "business" },
    { q: "What's the police non-emergency number?", a: "For non-emergency police matters, please call the Doral Police Department at 305-593-6699. For emergencies, always call 911.", category: "police" },
  ],
  es: [
    { q: "¿Cuál es el horario del Ayuntamiento?", a: "El Ayuntamiento está abierto de lunes a viernes de 8:00 AM a 5:00 PM. Estamos cerrados los fines de semana y días festivos.", category: "hours" },
    { q: "¿Cómo obtengo un permiso de construcción?", a: "Puede solicitar un permiso de construcción en nuestro portal en línea permits.cityofdoral.com o visitando el Departamento de Construcción en el Ayuntamiento.", category: "permits" },
    { q: "¿Cuándo es el próximo evento de la ciudad?", a: "Nuestro próximo evento importante es el Festival de Comida y Vino de Doral el 15 de enero en Downtown Doral Park.", category: "events" },
    { q: "¿Dónde puedo pagar mi factura de agua?", a: "Puede pagar su factura de agua en línea en utilities.cityofdoral.com, por teléfono al 305-593-6700, en el Ayuntamiento o por correo.", category: "utilities" },
  ]
};

const channels = ['web', 'ivr', 'sms', 'facebook', 'instagram', 'whatsapp'];
const channelWeights = { web: 45, ivr: 15, sms: 20, facebook: 10, instagram: 5, whatsapp: 5 };
const sentiments = ['positive', 'neutral', 'negative'];
const sentimentWeights = { positive: 40, neutral: 50, negative: 10 };

function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * total;
  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) return key;
  }
  return entries[0][0];
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM - 8 PM
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function generateConversations(count) {
  const conversations = [];

  for (let i = 0; i < count; i++) {
    const language = Math.random() > 0.3 ? 'en' : 'es';
    const topicList = topics[language];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    const channel = weightedRandom(channelWeights);
    const sentiment = weightedRandom(sentimentWeights);
    const startTime = randomDate(30);
    const endTime = new Date(startTime.getTime() + Math.floor(Math.random() * 300000) + 30000);
    const escalated = sentiment === 'negative' && Math.random() > 0.7;

    const greeting = language === 'en'
      ? "Hello! I'm the City of Doral AI Assistant. How can I help you today?"
      : "¡Hola! Soy el Asistente de IA de la Ciudad de Doral. ¿Cómo puedo ayudarle hoy?";

    // Generate user ID based on channel
    let userId;
    switch (channel) {
      case 'ivr':
      case 'sms':
        userId = `+1305${Math.floor(Math.random() * 9000000 + 1000000)}`;
        break;
      case 'facebook':
      case 'instagram':
        userId = `user_${Math.random().toString(36).substr(2, 12)}`;
        break;
      case 'whatsapp':
        userId = `+1786${Math.floor(Math.random() * 9000000 + 1000000)}`;
        break;
      default:
        userId = `web_${Math.random().toString(36).substr(2, 9)}`;
    }

    conversations.push({
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      messages: [
        { role: 'assistant', content: greeting, timestamp: startTime.toISOString() },
        { role: 'user', content: topic.q, timestamp: new Date(startTime.getTime() + 5000).toISOString() },
        { role: 'assistant', content: topic.a, timestamp: endTime.toISOString() },
      ],
      language,
      sentiment,
      escalated,
      feedbackGiven: Math.random() > 0.7,
      channel,
      userId,
      userAgent: channel === 'web' ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' : channel,
      referrer: channel === 'web' ? 'https://cityofdoral.com' : channel,
    });
  }

  return conversations.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

function generateFeedback(conversations) {
  const feedback = [];
  const feedbackConvs = conversations.filter(c => c.feedbackGiven);

  for (const conv of feedbackConvs) {
    const isPositive = conv.sentiment !== 'negative' && Math.random() > 0.2;
    feedback.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: conv.id,
      rating: isPositive ? 'positive' : 'negative',
      query: conv.messages[1].content,
      response: conv.messages[2].content,
      timestamp: conv.endTime,
      language: conv.language,
      channel: conv.channel,
    });
  }

  return feedback;
}

// Generate data
console.log('Generating demo data...');
const conversations = generateConversations(250);
const feedback = generateFeedback(conversations);

// Summary
const channelCounts = {};
for (const c of conversations) {
  channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1;
}

console.log('\nConversation Distribution:');
console.log(`  Total: ${conversations.length}`);
for (const [ch, count] of Object.entries(channelCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${ch}: ${count} (${Math.round(count/conversations.length*100)}%)`);
}
console.log(`\nFeedback entries: ${feedback.length}`);

// Save data
const conversationsFile = join(dataDir, 'conversations.json');
const feedbackFile = join(dataDir, 'feedback.json');

writeFileSync(conversationsFile, JSON.stringify({
  conversations,
  lastUpdated: new Date().toISOString()
}, null, 2));

writeFileSync(feedbackFile, JSON.stringify({
  feedback,
  lastUpdated: new Date().toISOString()
}, null, 2));

console.log(`\nData saved to:`);
console.log(`  ${conversationsFile}`);
console.log(`  ${feedbackFile}`);
console.log('\nDemo data generation complete!');
