// Simple audio utility for fitness tracker sound effects
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false
  private html5AudioCache: Map<string, string> = new Map()

  constructor() {
    this.initAudioContext();
    this.setupAudioUnlock();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Audio context not supported');
    }
  }

  private setupAudioUnlock() {
    // Handle visibility change (app becoming active)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.audioContext) {
        this.audioContext.resume();
      }
    });
  }

  private async createBeep(frequency: number, duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    return buffer;
  }

  // HTML5 Audio fallback for iOS with caching
  private playHTML5Beep(frequency: number = 800, duration: number = 0.1) {
    try {
      const cacheKey = `${frequency}-${duration}`;

      // Check cache first
      let url = this.html5AudioCache.get(cacheKey);

      if (!url) {
        // Create and cache the audio file
        url = this.createHTML5AudioFile(frequency, duration);
        this.html5AudioCache.set(cacheKey, url);
      }

      const audio = new Audio(url);
      audio.volume = 0.5;

      audio.play().catch(() => {
        // If playback fails, try creating a fresh file
        const freshUrl = this.createHTML5AudioFile(frequency, duration);
        this.html5AudioCache.set(cacheKey, freshUrl);
        const freshAudio = new Audio(freshUrl);
        freshAudio.volume = 0.5;
        freshAudio.play().catch(() => {
          console.warn('HTML5 audio playback failed');
        });
      });
    } catch (error) {
      console.warn('HTML5 audio fallback failed:', error);
    }
  }

  private createHTML5AudioFile(frequency: number, duration: number): string {
    const sampleRate = 44100;
    const length = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Generate sine wave
    for (let i = 0; i < length; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async playBeep(frequency: number = 800, duration: number = 0.1) {
    try {
      if (this.isMuted) {
        return
      }

      // Try Web Audio API first
      if (this.audioContext) {
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        const buffer = await this.createBeep(frequency, duration);
        const source = this.audioContext!.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext!.destination);
        source.start();
      } else {
        // Fallback to HTML5 Audio for iOS
        this.playHTML5Beep(frequency, duration);
      }
    } catch (error) {
      console.warn('Web Audio failed, trying HTML5 fallback:', error);
      // Final fallback to HTML5 Audio
      this.playHTML5Beep(frequency, duration);
    }
  }

  // Unlock audio - call this when user starts workout
  async unlockAudio(): Promise<boolean> {
    if (!this.audioContext) {
      return false;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        return true;
      }
      return this.audioContext.state === 'running';
    } catch (error) {
      console.warn('Could not unlock audio:', error);
      return false;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
  }

  // Cleanup cached audio URLs to prevent memory leaks
  cleanup() {
    this.html5AudioCache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.html5AudioCache.clear();
  }

  isAudioMuted(): boolean {
    return this.isMuted
  }

  async playCountdownBeep() {
    await this.playBeep(600, 0.1);
  }

  async playPhaseChangeBeep() {
    await this.playBeep(800, 0.2);
  }

  async playWorkoutCompleteBeep() {
    await this.playBeep(1000, 0.5);
  }

  async playStartBeep() {
    await this.playBeep(1200, 0.3);
  }
}

export const audioManager = new AudioManager();
