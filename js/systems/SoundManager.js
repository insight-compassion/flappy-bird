/**
 * SoundManager: Hybrid Audio System
 * Uses local asset audio (Jump.wav, Hit7.wav) with seamless fallback to procedural Web Audio synthesis.
 * Built-in procedural chiptune BGM sequencer and synthesizer for Dash and Star chime.
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 126; // BPM

        this.masterGain = null;
        this.sfxGain = null;
        this.bgmGain = null;

        // Audio asset objects
        try {
            this.jumpAudio = new Audio('assets/audio/Jump.wav');
            this.hitAudio = new Audio('assets/audio/Hit7.wav');
        } catch (e) {
            this.jumpAudio = null;
            this.hitAudio = null;
        }

        // Catchy, upbeat chiptune sequence
        this.melody = [
            261.63, 0, 329.63, 392.00, 523.25, 392.00, 329.63, 0,
            220.00, 0, 261.63, 329.63, 440.00, 329.63, 261.63, 0,
            174.61, 0, 220.00, 261.63, 349.23, 261.63, 220.00, 0,
            196.00, 0, 246.94, 293.66, 392.00, 329.63, 293.66, 246.94
        ];

        this.bass = [
            130.81, 130.81, 130.81, 130.81,
            110.00, 110.00, 110.00, 110.00,
            87.31, 87.31, 87.31, 87.31,
            98.00, 98.00, 98.00, 98.00
        ];
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
            this.bgmGain.connect(this.masterGain);
        } catch (e) {
            console.warn('AudioContext unavailable', e);
        }
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.resume();
        this.muted = !this.muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
        }
        if (this.jumpAudio) this.jumpAudio.muted = this.muted;
        if (this.hitAudio) this.hitAudio.muted = this.muted;
        return this.muted;
    }

    /**
     * Jump SFX: Plays Jump.wav or falls back to synthesized chirp
     */
    playJump() {
        if (this.muted) return;
        this.resume();

        if (this.jumpAudio) {
            try {
                this.jumpAudio.currentTime = 0;
                const promise = this.jumpAudio.play();
                if (promise !== undefined) {
                    promise.catch(() => this.synthJump());
                }
                return;
            } catch (e) {
                this.synthJump();
                return;
            }
        }
        this.synthJump();
    }

    synthJump() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    /**
     * Dash SFX: Swift whoosh and pitch slide
     */
    playDash() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.19);

        this.playNoise(now, 0.14, 0.25);
    }

    /**
     * Bump / Impact SFX: Plays Hit7.wav or falls back to synthesized crash
     */
    playBump() {
        if (this.muted) return;
        this.resume();

        if (this.hitAudio) {
            try {
                this.hitAudio.currentTime = 0;
                const promise = this.hitAudio.play();
                if (promise !== undefined) {
                    promise.catch(() => this.synthBump());
                }
                return;
            } catch (e) {
                this.synthBump();
                return;
            }
        }
        this.synthBump();
    }

    synthBump() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);

        this.playNoise(now, 0.2, 0.4);
    }

    /**
     * Star / Coin pickup SFX: High bright twin chime
     */
    playStar() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [880, 1318.51].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const startTime = now + idx * 0.07;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.16);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.17);
        });
    }

    playNoise(startTime, duration, volume) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, startTime);
        filter.Q.setValueAtTime(1.5, startTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(startTime);
        noise.stop(startTime + duration);
    }

    /**
     * Start Looped Background Music
     */
    startBGM() {
        if (this.bgmPlaying) return;
        this.resume();
        this.bgmPlaying = true;
        this.currentStep = 0;

        const stepDuration = (60 / this.tempo) / 2; // 16th notes

        const scheduleStep = () => {
            if (!this.bgmPlaying || !this.ctx) return;

            const now = this.ctx.currentTime;
            const melodyFreq = this.melody[this.currentStep % this.melody.length];
            const bassStep = Math.floor(this.currentStep / 2) % this.bass.length;
            const bassFreq = this.bass[bassStep];

            // Melody voice
            if (melodyFreq > 0 && !this.muted) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(melodyFreq, now);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 0.9);

                osc.connect(gain);
                gain.connect(this.bgmGain);

                osc.start(now);
                osc.stop(now + stepDuration * 0.92);
            }

            // Bass voice
            if (this.currentStep % 2 === 0 && bassFreq > 0 && !this.muted) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(bassFreq, now);

                bassGain.gain.setValueAtTime(0.18, now);
                bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.8);

                bassOsc.connect(bassGain);
                bassGain.connect(this.bgmGain);

                bassOsc.start(now);
                bassOsc.stop(now + stepDuration * 1.85);
            }

            // Hi-hat percussion
            if (this.currentStep % 4 === 2 && !this.muted) {
                this.playBgmHiHat(now, 0.05);
            }

            this.currentStep++;
            this.bgmTimer = setTimeout(scheduleStep, stepDuration * 1000);
        };

        scheduleStep();
    }

    playBgmHiHat(startTime, duration) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3500, startTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        source.start(startTime);
        source.stop(startTime + duration);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
