// Twilio IVR (Interactive Voice Response) adapter
// Handles voice calls with speech-to-text and text-to-speech

import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

// IVR Configuration
const IVR_CONFIG = {
  voice: 'Polly.Joanna' as const,   // AWS Polly voice for English
  voiceEs: 'Polly.Penelope' as const, // AWS Polly voice for Spanish
  speechTimeout: 'auto' as const,
  speechModel: 'phone_call' as const,
  language: 'en-US' as const,
  languageEs: 'es-MX' as const,
  hints: 'city hall, permit, parks, doral, police, license, utility, water, event',
};

export interface IVRGreetingOptions {
  language?: 'en' | 'es';
}

// Generate initial greeting TwiML
export function generateGreeting(options: IVRGreetingOptions = {}): string {
  const response = new VoiceResponse();
  const language = options.language || 'en';

  const greetingEn = 'Hello! Welcome to the City of Doral virtual assistant. How can I help you today?';
  const greetingEs = 'Hola! Bienvenido al asistente virtual de la Ciudad de Doral. Como puedo ayudarle hoy?';

  // Language selection menu
  const gather = response.gather({
    input: ['speech', 'dtmf'],
    timeout: 5,
    numDigits: 1,
    action: '/api/ivr/process',
    method: 'POST',
    language: language === 'es' ? IVR_CONFIG.languageEs : IVR_CONFIG.language,
    speechTimeout: IVR_CONFIG.speechTimeout,
    speechModel: IVR_CONFIG.speechModel,
    hints: IVR_CONFIG.hints,
  });

  gather.say(
    { voice: language === 'es' ? IVR_CONFIG.voiceEs : IVR_CONFIG.voice },
    language === 'es' ? greetingEs : greetingEn
  );

  // If no input, prompt again
  response.say(
    { voice: IVR_CONFIG.voice },
    'I did not receive any input. Please try again.'
  );
  response.redirect('/api/ivr');

  return response.toString();
}

export interface IVRResponseOptions {
  message: string;
  language: 'en' | 'es';
  escalate?: boolean;
  sources?: Array<{ title: string; url: string }>;
}

// Generate response TwiML with AI response
export function generateResponse(options: IVRResponseOptions): string {
  const response = new VoiceResponse();
  const { message, language, escalate } = options;
  const voice = language === 'es' ? IVR_CONFIG.voiceEs : IVR_CONFIG.voice;

  // Speak the AI response
  response.say({ voice }, message);

  if (escalate) {
    // Offer to connect to a live agent
    const escalatePrompt = language === 'es'
      ? 'Si desea hablar con un agente, presione 1. Para continuar con el asistente, haga su siguiente pregunta.'
      : 'If you would like to speak with a live agent, press 1. To continue with the assistant, ask your next question.';

    const gather = response.gather({
      input: ['speech', 'dtmf'],
      timeout: 5,
      numDigits: 1,
      action: '/api/ivr/process',
      method: 'POST',
      language: language === 'es' ? IVR_CONFIG.languageEs : IVR_CONFIG.language,
      speechTimeout: IVR_CONFIG.speechTimeout,
      speechModel: IVR_CONFIG.speechModel,
      hints: IVR_CONFIG.hints,
    });

    gather.say({ voice }, escalatePrompt);
  } else {
    // Continue conversation
    const continuePrompt = language === 'es'
      ? 'Tiene otra pregunta?'
      : 'Do you have another question?';

    const gather = response.gather({
      input: ['speech', 'dtmf'],
      timeout: 8,
      action: '/api/ivr/process',
      method: 'POST',
      language: language === 'es' ? IVR_CONFIG.languageEs : IVR_CONFIG.language,
      speechTimeout: IVR_CONFIG.speechTimeout,
      speechModel: IVR_CONFIG.speechModel,
      hints: IVR_CONFIG.hints,
    });

    gather.say({ voice }, continuePrompt);
  }

  // Handle no input - goodbye
  const goodbyeMsg = language === 'es'
    ? 'Gracias por llamar a la Ciudad de Doral. Adios!'
    : 'Thank you for calling the City of Doral. Goodbye!';

  response.say({ voice }, goodbyeMsg);
  response.hangup();

  return response.toString();
}

// Generate escalation TwiML (transfer to live agent)
export function generateEscalation(language: 'en' | 'es'): string {
  const response = new VoiceResponse();
  const voice = language === 'es' ? IVR_CONFIG.voiceEs : IVR_CONFIG.voice;

  const transferMsg = language === 'es'
    ? 'Lo estamos conectando con un agente. Por favor espere.'
    : 'We are connecting you to a live agent. Please hold.';

  response.say({ voice }, transferMsg);

  // Transfer to City Hall main number (placeholder - configure actual number)
  const cityHallNumber = process.env.DORAL_CITY_HALL_PHONE || '+13055934700';
  response.dial(cityHallNumber);

  return response.toString();
}

// Generate error TwiML
export function generateError(language: 'en' | 'es'): string {
  const response = new VoiceResponse();
  const voice = language === 'es' ? IVR_CONFIG.voiceEs : IVR_CONFIG.voice;

  const errorMsg = language === 'es'
    ? 'Lo siento, hubo un problema. Por favor intente de nuevo mas tarde. Adios.'
    : 'I apologize, there was an issue. Please try again later. Goodbye.';

  response.say({ voice }, errorMsg);
  response.hangup();

  return response.toString();
}

// Generate goodbye TwiML
export function generateGoodbye(language: 'en' | 'es'): string {
  const response = new VoiceResponse();
  const voice = language === 'es' ? IVR_CONFIG.voiceEs : IVR_CONFIG.voice;

  const goodbyeMsg = language === 'es'
    ? 'Gracias por llamar a la Ciudad de Doral. Que tenga un buen dia!'
    : 'Thank you for calling the City of Doral. Have a great day!';

  response.say({ voice }, goodbyeMsg);
  response.hangup();

  return response.toString();
}

// Parse Twilio IVR request
export interface TwilioIVRRequest {
  CallSid: string;
  From: string;
  To: string;
  SpeechResult?: string;
  Digits?: string;
  CallStatus?: string;
  Direction?: string;
}

export function parseIVRRequest(body: Record<string, string>): TwilioIVRRequest {
  return {
    CallSid: body.CallSid || '',
    From: body.From || '',
    To: body.To || '',
    SpeechResult: body.SpeechResult,
    Digits: body.Digits,
    CallStatus: body.CallStatus,
    Direction: body.Direction,
  };
}
