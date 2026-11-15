import { useState, useEffect, useRef, useCallback } from 'react';

function stripMarkdownForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`~>\[\]]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSpeech({ language, selectedVoiceURI, speechRate = 1.0 }) {
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const sttSupported = Boolean(SpeechRecognition);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [voices, setVoices] = useState([]);

  const recognitionRef = useRef(null);

  // Load system voices (Android Chrome populates asynchronously)
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [ttsSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (onFinalResult) => {
      if (!SpeechRecognition) {
        setSpeechError('unsupported');
        return;
      }

      setSpeechError('');
      // Cancel TTS if currently speaking
      if (ttsSupported) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-SA' : 'de-DE';
      recognition.continuous = false; // Essential for stable Android Chrome behavior
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        setInterimTranscript(interim);
        if (finalText.trim()) {
          onFinalResult(finalText.trim());
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setSpeechError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        setIsListening(false);
        setSpeechError(err.message);
      }
    },
    [SpeechRecognition, language, ttsSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [ttsSupported]);

  const speak = useCallback(
    (text, messageId = null) => {
      if (!ttsSupported || !text) return;
      window.speechSynthesis.cancel();

      const cleanText = stripMarkdownForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLangPrefix = language === 'ar' ? 'ar' : 'de';
      utterance.lang = language === 'ar' ? 'ar-SA' : 'de-DE';
      utterance.rate = speechRate;

      if (selectedVoiceURI) {
        const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (chosen) utterance.voice = chosen;
      } else {
        const matchingVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(targetLangPrefix)
        );
        if (matchingVoice) utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsSupported, language, speechRate, selectedVoiceURI, voices]
  );

  const hasArabicVoice = voices.some((v) => v.lang.toLowerCase().startsWith('ar'));
  const hasGermanVoice = voices.some((v) => v.lang.toLowerCase().startsWith('de'));

  return {
    sttSupported,
    ttsSupported,
    isListening,
    interimTranscript,
    speechError,
    isSpeaking,
    speakingMessageId,
    voices,
    hasArabicVoice,
    hasGermanVoice,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
