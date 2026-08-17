import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browser support
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  audioVolume: number;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useVoiceRecognition = (onFinalResult?: (result: string) => void): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Check browser support
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  // Initialize SpeechRecognition instance
  const initRecognition = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Trình duyệt của bạn chưa hỗ trợ Web Speech API. Khuyên dùng Chrome hoặc Microsoft Edge.');
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN'; // Cấu hình nhận diện giọng nói Tiếng Việt

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0].transcript;
        if (item.isFinal) {
          currentFinal += text + ' ';
        } else {
          currentInterim += text;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => {
          const updated = (prev + ' ' + currentFinal).trim();
          if (onFinalResult) onFinalResult(updated);
          return updated;
        });
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // Tự động bỏ qua lỗi không có tiếng nói
        return;
      }
      if (event.error === 'not-allowed') {
        setError('Quyền truy cập Microphone bị từ chối. Vui lòng cho phép trình duyệt sử dụng Micro.');
      } else {
        setError(`Lỗi nhận diện âm thanh: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [onFinalResult]);

  // Start Audio Analyzer for Visualizer Bars
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);
      microphoneRef.current = micSource;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioVolume(normalized);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      // Ignore audio context error if user denies mic
    }
  };

  // Stop Audio Analyzer
  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioVolume(0);
  };

  // Public Methods
  const startListening = () => {
    setError(null);
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      recognitionRef.current?.start();
      startAudioAnalyzer();
    } catch (e: any) {
      console.warn('Recognition already started or error:', e);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    stopAudioAnalyzer();
    setIsListening(false);
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalyzer();
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    audioVolume,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
