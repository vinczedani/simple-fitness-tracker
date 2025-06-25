// Simple audio utility for fitness tracker sound effects
class AudioManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported');
    }
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

  async playBeep(frequency: number = 800, duration: number = 0.1) {
    try {
      if (!this.audioContext) {
        this.initAudioContext();
      }

      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = await this.createBeep(frequency, duration);
      const source = this.audioContext!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext!.destination);
      source.start();
    } catch (error) {
      console.warn('Could not play audio:', error);
    }
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
