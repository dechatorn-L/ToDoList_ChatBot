import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceSpeech } from './useVoiceSpeech';

describe('useVoiceSpeech', () => {
  let mockRecognitionInstance: any;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    const MockRecognitionConstructor = vi.fn().mockImplementation(() => mockRecognitionInstance);
    (window as any).SpeechRecognition = MockRecognitionConstructor;
    (window as any).webkitSpeechRecognition = MockRecognitionConstructor;

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speaking: false,
      paused: false,
      getVoices: vi.fn().mockReturnValue([]),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });

    (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({
      text,
      lang: '',
      rate: 1,
      pitch: 1,
      onstart: null,
      onend: null,
      onerror: null,
    }));
  });

  afterEach(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });

  it('reports isSupported true when APIs exist in window', () => {
    const { result } = renderHook(() => useVoiceSpeech());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('reports isSupported false when SpeechRecognition does not exist', () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const { result } = renderHook(() => useVoiceSpeech());
    expect(result.current.isSupported).toBe(false);
  });

  it('starts speech recognition with specified language (defaults to th-TH)', () => {
    const { result } = renderHook(() => useVoiceSpeech({ language: 'th-TH' }));

    act(() => {
      result.current.startListening();
    });

    expect(mockRecognitionInstance.lang).toBe('th-TH');
    expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);

    // Simulate recognition onstart
    act(() => {
      mockRecognitionInstance.onstart?.();
    });
    expect(result.current.isListening).toBe(true);

    // Simulate recognition onend
    act(() => {
      mockRecognitionInstance.onend?.();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('captures transcript and triggers onTranscript callback', () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() => useVoiceSpeech({ onTranscript }));

    act(() => {
      result.current.startListening();
    });

    const mockEvent = {
      resultIndex: 0,
      results: [
        [
          { transcript: 'เพิ่มงานซื้อของ' },
        ],
      ],
    };
    (mockEvent.results[0] as any).isFinal = true;

    act(() => {
      mockRecognitionInstance.onresult?.(mockEvent);
    });

    expect(onTranscript).toHaveBeenCalledWith('เพิ่มงานซื้อของ');
  });

  it('handles recognition errors gracefully', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useVoiceSpeech({ onError }));

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'not-allowed' });
    });

    expect(result.current.error).toContain('denied');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('denied'));
  });

  it('speaks text when not muted and cleans markdown tokens', () => {
    const { result } = renderHook(() => useVoiceSpeech({ isMuted: false, language: 'th-TH' }));

    act(() => {
      result.current.speak('**สวัสดีครับ** สร้างงาน `เขียนโค้ด` ให้เรียบร้อย!');
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);

    const utteranceArg = mockSpeechSynthesis.speak.mock.calls[0][0];
    expect(utteranceArg.text).toBe('สวัสดีครับ สร้างงาน เขียนโค้ด ให้เรียบร้อย!');
    expect(utteranceArg.lang).toBe('th-TH');
  });

  it('does not speak when isMuted is true', () => {
    const { result } = renderHook(() => useVoiceSpeech({ isMuted: true }));

    act(() => {
      result.current.speak('Hello world');
    });

    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('cancels speech synthesis when cancelSpeech is called', () => {
    const { result } = renderHook(() => useVoiceSpeech());

    act(() => {
      result.current.cancelSpeech();
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('assigns matching Thai voice to utterance.voice when Thai voice exists', () => {
    const thaiVoice = { name: 'Microsoft Premwadee', lang: 'th-TH', default: false };
    const englishVoice = { name: 'Google US English', lang: 'en-US', default: true };
    mockSpeechSynthesis.getVoices.mockReturnValue([thaiVoice, englishVoice]);

    const { result } = renderHook(() => useVoiceSpeech({ isMuted: false, language: 'th-TH' }));

    act(() => {
      result.current.speak('สวัสดีครับ มีอะไรให้ช่วยไหม');
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = mockSpeechSynthesis.speak.mock.calls[0][0];
    expect(utteranceArg.voice).toEqual(thaiVoice);
    expect(utteranceArg.lang).toBe('th-TH');
  });

  it('selects best natural English voice when speaking English text', () => {
    const legacyVoice = { name: 'Microsoft David Desktop', lang: 'en-US', default: true };
    const naturalVoice = { name: 'Microsoft Jenny Natural', lang: 'en-US', default: false };
    mockSpeechSynthesis.getVoices.mockReturnValue([legacyVoice, naturalVoice]);

    const { result } = renderHook(() => useVoiceSpeech({ isMuted: false, language: 'en-US' }));

    act(() => {
      result.current.speak('Task completed successfully');
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = mockSpeechSynthesis.speak.mock.calls[0][0];
    expect(utteranceArg.voice).toEqual(naturalVoice);
  });

  it('prevents sending Thai text to English voice engine when no Thai voice is installed', () => {
    const englishVoice = { name: 'Microsoft David Desktop', lang: 'en-US', default: true };
    mockSpeechSynthesis.getVoices.mockReturnValue([englishVoice]);

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useVoiceSpeech({ isMuted: false, language: 'th-TH', onError })
    );

    act(() => {
      result.current.speak('สวัสดีครับ');
    });

    // Should NOT send Thai text to English voice engine (which causes alien gibberish)
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Thai'));
  });
});
