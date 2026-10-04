import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export async function recognizeSpanish() {
  const response = await fetch('/api/speech-token');

  if (!response.ok) {
    throw new Error('Impossible de récupérer le jeton Azure Speech.');
  }

  const { token, region } = await response.json();

  if (!token || !region) {
    throw new Error('Configuration Azure Speech incomplète.');
  }

  const speechConfig =
    SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);

  speechConfig.speechRecognitionLanguage = 'es-ES';

  const audioConfig =
    SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

  const recognizer =
    new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          resolve(result.text || '');
          return;
        }

        if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          reject(new Error('Je n’ai pas compris. Réessayez.'));
          return;
        }

        reject(new Error('La reconnaissance vocale a échoué.'));
      },
      (error) => {
        recognizer.close();
        reject(new Error(String(error)));
      }
    );
  });
}
