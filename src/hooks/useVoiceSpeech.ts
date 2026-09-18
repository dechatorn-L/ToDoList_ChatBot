import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechLanguage } from '../utils/aiSettings';

export interface UseVoiceSpeechOptions {
  language?: SpeechLanguage;
  isMuted?: boolean;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceSpeechReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  cancelSpeech: () => void;
}

/**
 * Strips markdown and special symbols so speech synthesis speaks clean, natural text.
 */
export function cleanMarkdownForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, '') // remove code fences
    .replace(/`([^`]+)`/g, '$1')     // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')   // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^#+\s+/gm, '')        // headers
    .replace(/^[\*\-\+]\s+/gm, '')  // lists
    .replace(/\s+/g, ' ')           // multiple spaces
    .trim();
}

export const useVoiceSpeech = (options: UseVoiceSpeechOptions = {}): UseVoiceSpeechReturn => {
  const { language = 'th-TH', isMuted = false, onTranscript, onError } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognitionClass);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionClass) {
      const msg = 'Speech recognition not supported in this browser.';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    cancelSpeech();
    setError(null);

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            transcript += item[0].transcript;
          }
        }
        if (transcript.trim()) {
          onTranscriptRef.current?.(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        let errorMsg = 'Voice recognition error';
        if (event.error === 'not-allowed') {
          errorMsg = 'Microphone access denied. Please enable microphone permissions in your browser.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please try speaking closer to the microphone.';
        } else if (event.error) {
          errorMsg = `Voice error: ${event.error}`;
        }
        setError(errorMsg);
        setIsListening(false);
        onErrorRef.current?.(errorMsg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      const msg = err?.message || 'Failed to start microphone.';
      setError(msg);
      setIsListening(false);
      onErrorRef.current?.(msg);
    }
  }, [SpeechRecognitionClass, language, cancelSpeech]);

  const speak = useCallback(
    (rawText: string) => {
      if (isMuted) return;
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const cleanText = cleanMarkdownForSpeech(rawText);
      if (!cleanText) return;

      window.speechSynthesis.cancel();

      if (typeof (window as any).SpeechSynthesisUtterance === 'undefined') return;

      const utterance = new (window as any).SpeechSynthesisUtterance(cleanText);
      utterance.lang = language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, language]
  );

  useEffect(() => {
    return () => {
      stopListening();
      cancelSpeech();
    };
  }, [stopListening, cancelSpeech]);

  return {
    isListening,
    isSpeaking,
    isSupported,
    error,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
};
