import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeVietglishVoiceTranscript } from '../utils/vietglishNormalizer';
import { audioChimes } from '../utils/audioChimes';

// SpeechRecognition type declarations for browser support
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance;
}

interface IWindow extends Window {
  SpeechRecognition?: ISpeechRecognitionConstructor;
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
}

export type VoiceLanguageMode = 'bilingual' | 'vi-VN' | 'en-US';

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  audioVolume: number;
  isSupported: boolean;
  languageMode: VoiceLanguageMode;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setManualTranscript: (text: string) => void;
  setLanguageMode: (mode: VoiceLanguageMode) => void;
}

export const useVoiceRecognition = (onFinalResult?: (result: string) => void): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [languageMode, setLanguageModeState] = useState<VoiceLanguageMode>('bilingual');

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const shouldListenRef = useRef<boolean>(false);
  const languageModeRef = useRef<VoiceLanguageMode>('bilingual');

  languageModeRef.current = languageMode;

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

    // Thiết lập mã ngôn ngữ nhận diện
    const currentMode = languageModeRef.current;
    if (currentMode === 'en-US') {
      recognition.lang = 'en-US';
    } else {
      // Cho cả 'vi-VN' và 'bilingual' (mặc định dùng vi-VN kèm Vietglish Lexicon normalizer)
      recognition.lang = 'vi-VN';
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          currentFinal += text + ' ';
        } else {
          currentInterim += text;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => {
          let updatedRaw = (prev + ' ' + currentFinal).trim();
          // Chuẩn hóa Vietglish song ngữ nếu ở chế độ song ngữ hoặc tiếng Việt
          if (languageModeRef.current !== 'en-US') {
            updatedRaw = normalizeVietglishVoiceTranscript(updatedRaw);
          }
          if (onFinalResult) onFinalResult(updatedRaw);
          return updatedRaw;
        });
      }

      // Chuẩn hóa hiển thị tạm thời
      if (currentInterim) {
        if (languageModeRef.current !== 'en-US') {
          setInterimTranscript(normalizeVietglishVoiceTranscript(currentInterim));
        } else {
          setInterimTranscript(currentInterim);
        }
      } else {
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // Tự động bỏ qua lỗi im lặng, duy trì trạng thái
        return;
      }

      if (event.error === 'not-allowed') {
        setError('Quyền truy cập Microphone bị từ chối. Vui lòng cho phép trình duyệt sử dụng Micro.');
        shouldListenRef.current = false;
        setIsListening(false);
      } else if (event.error === 'network') {
        setError(
          'Máy chủ giọng nói Google STT không phản hồi hoặc bị gián đoạn mạng/VPN. Bạn vẫn có thể nhập trực tiếp khẩu lệnh bằng bàn phím vào ô bên dưới.'
        );
        shouldListenRef.current = false;
        setIsListening(false);
      } else if (event.error === 'audio-capture') {
        setError('Không tìm thấy thiết bị thu âm (Microphone). Vui lòng cắm hoặc kích hoạt Micro.');
        shouldListenRef.current = false;
        setIsListening(false);
      } else {
        setError(`Lỗi nhận diện âm thanh (${event.error}). Bạn có thể gõ nội dung trực tiếp vào ô bên dưới.`);
        shouldListenRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Cơ chế tự động kết nối lại nếu người dùng chưa bấm dừng (chống ngắt ngầm của Chrome)
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // Nếu start thất bại ngay, ngắt lắng nghe an toàn
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [onFinalResult]);

  // Start Audio Analyzer for Visualizer Bars
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      // Ignore audio context error if user denies mic or device busy
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
      audioContextRef.current.close().catch(() => {});
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
    shouldListenRef.current = true;
    audioChimes.playStartListen();

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      recognitionRef.current = initRecognition();
      recognitionRef.current?.start();
      startAudioAnalyzer();
    } catch (e: unknown) {
      console.warn('Recognition start exception:', e);
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    audioChimes.playStopListen();

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

  const setManualTranscript = (text: string) => {
    setTranscript(text);
    setInterimTranscript('');
  };

  const setLanguageMode = (mode: VoiceLanguageMode) => {
    setLanguageModeState(mode);
    languageModeRef.current = mode;

    // Nếu đang lắng nghe, khởi động lại để áp dụng ngôn ngữ mới ngay lập tức
    if (shouldListenRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      setTimeout(() => {
        if (shouldListenRef.current) {
          recognitionRef.current = initRecognition();
          try {
            recognitionRef.current?.start();
          } catch {
            // Ignore
          }
        }
      }, 100);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      stopAudioAnalyzer();
      try {
        recognitionRef.current?.abort();
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
    languageMode,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    setLanguageMode,
  };
};
