// Lee texto en voz alta usando las voces gratuitas que ya trae el navegador
// (Web Speech API). No requiere ninguna cuenta ni costo.

export function getAvailableVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

export function speak(text, { voice, rate = 1, onEnd, onBoundary } = {}) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  if (onEnd) utterance.onend = onEnd;
  if (onBoundary) utterance.onboundary = onBoundary;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function pauseSpeech() {
  window.speechSynthesis.pause();
}

export function resumeSpeech() {
  window.speechSynthesis.resume();
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
