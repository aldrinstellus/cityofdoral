// Bilingual support for City of Doral Chatbot
// Supports English (en) and Spanish (es)

export type Language = 'en' | 'es';

interface SentimentInfo {
  category: 'positive' | 'neutral' | 'negative' | 'urgent';
  score: number;
}

// Common Spanish words/patterns for language detection
const SPANISH_PATTERNS = [
  /\b(hola|buenos|buenas|gracias|por favor|ayuda|necesito|quiero|donde|cuando|como|que|cual|cuales)\b/i,
  /\b(ciudad|permiso|parque|policia|alcalde|servicios|informacion|horario)\b/i,
  /[¿¡áéíóúñü]/,
];

// Common English words for tie-breaker
const ENGLISH_PATTERNS = [
  /\b(hello|hi|thank|please|help|need|want|where|when|how|what|which)\b/i,
  /\b(city|permit|park|police|mayor|services|information|hours)\b/i,
];

/**
 * Detect language from user message
 * Returns 'es' for Spanish, 'en' for English (default)
 */
export function detectLanguage(text: string): Language {
  const lowerText = text.toLowerCase();

  // Check for Spanish patterns
  let spanishScore = 0;
  for (const pattern of SPANISH_PATTERNS) {
    if (pattern.test(text)) {
      spanishScore++;
    }
  }

  // Check for English patterns
  let englishScore = 0;
  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(text)) {
      englishScore++;
    }
  }

  // Spanish if more Spanish patterns found
  if (spanishScore > englishScore) {
    return 'es';
  }

  // Default to English
  return 'en';
}

/**
 * Get system prompt for the chatbot based on language
 */
export function getSystemPrompt(
  language: Language,
  knowledgeContext: string,
  sentiment: SentimentInfo
): string {
  const escalationNote = sentiment.category === 'negative' || sentiment.category === 'urgent'
    ? language === 'es'
      ? '\n\nNOTA: El usuario parece frustrado o tiene una solicitud urgente. Sea especialmente amable y servicial. Ofrezca conectarlos con un representante humano si es necesario.'
      : '\n\nNOTE: The user seems frustrated or has an urgent request. Be especially kind and helpful. Offer to connect them with a human representative if needed.'
    : '';

  if (language === 'es') {
    return `Eres el Asistente Virtual de la Ciudad de Doral, Florida. Tu rol es ayudar a los residentes, visitantes y empresarios con información sobre servicios municipales, eventos, permisos, parques, y más.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Sé amable, profesional y servicial
3. Usa la información del contexto proporcionado para dar respuestas precisas
4. Si no tienes información específica, sugiere contactar al departamento apropiado
5. Proporciona números de teléfono y direcciones cuando sea relevante
6. Para emergencias, siempre recomienda llamar al 911

INFORMACIÓN DE CONTACTO IMPORTANTE:
- City Hall: 8401 NW 53rd Terrace, Doral, FL 33166
- Teléfono Principal: (305) 593-6725
- Policía de Doral (no emergencias): (305) 593-6699
- Emergencias: 911

CONTEXTO DEL SITIO WEB DE LA CIUDAD:
${knowledgeContext}
${escalationNote}

Responde de manera concisa pero completa. Si mencionas información del contexto, hazlo naturalmente sin decir "según el contexto".`;
  }

  return `You are the City of Doral Virtual Assistant for Doral, Florida. Your role is to help residents, visitors, and business owners with information about city services, events, permits, parks, and more.

INSTRUCTIONS:
1. ALWAYS respond in English
2. Be friendly, professional, and helpful
3. Use the context information provided to give accurate answers
4. If you don't have specific information, suggest contacting the appropriate department
5. Provide phone numbers and addresses when relevant
6. For emergencies, always recommend calling 911

IMPORTANT CONTACT INFORMATION:
- City Hall: 8401 NW 53rd Terrace, Doral, FL 33166
- Main Phone: (305) 593-6725
- Doral Police (non-emergency): (305) 593-6699
- Emergencies: 911

CITY WEBSITE CONTEXT:
${knowledgeContext}
${escalationNote}

Respond concisely but completely. If you reference information from the context, do so naturally without saying "according to the context".`;
}

// UI Labels for bilingual interface
export const UI_LABELS = {
  en: {
    title: 'City of Doral AI Assistant',
    subtitle: 'Always here to help',
    placeholder: 'Type your question...',
    send: 'Send',
    admin: 'Admin',
    suggested: 'Suggested questions:',
    disclaimer: 'Powered by AI - Information may not always be accurate',
    sources: 'Sources',
    feedback: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    escalate: 'Talk to a Human',
    escalateMessage: 'Would you like to speak with a city representative?',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    suggestedQuestions: [
      'What are the city hall hours?',
      'How do I apply for a building permit?',
      'What events are coming up?',
      'Where are the parks located?',
    ],
    welcome: "Hello! I'm the City of Doral AI Assistant. I can help you with information about city services, permits, events, parks, and more. How can I assist you today?",
  },
  es: {
    title: 'Asistente Virtual de la Ciudad de Doral',
    subtitle: 'Siempre aquí para ayudar',
    placeholder: 'Escriba su pregunta...',
    send: 'Enviar',
    admin: 'Admin',
    suggested: 'Preguntas sugeridas:',
    disclaimer: 'Impulsado por IA - La información puede no ser siempre precisa',
    sources: 'Fuentes',
    feedback: '¿Fue útil?',
    yes: 'Sí',
    no: 'No',
    escalate: 'Hablar con un Representante',
    escalateMessage: '¿Le gustaría hablar con un representante de la ciudad?',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
    suggestedQuestions: [
      '¿Cuál es el horario del ayuntamiento?',
      '¿Cómo solicito un permiso de construcción?',
      '¿Qué eventos hay próximamente?',
      '¿Dónde están los parques?',
    ],
    welcome: '¡Hola! Soy el Asistente Virtual de la Ciudad de Doral. Puedo ayudarle con información sobre servicios municipales, permisos, eventos, parques y más. ¿Cómo puedo asistirle hoy?',
  },
};

/**
 * Get labels for a specific language
 */
export function getLabels(language: Language) {
  return UI_LABELS[language];
}
