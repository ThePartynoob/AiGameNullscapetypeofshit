// Setup sound system
    // --- INTERMISSION AUDIO ENGINE ---
// Setup sound system
// --- MULTI-TRACK INTERMISSION AUDIO ENGINE ---
let intermissionAudio = null;
let currentTrackFile = ""; // Track what file is currently loaded

window.playIntermissionMusic = function(intermissionNum) {
    // 1. Define your playlist and their level ranges here
    const playlist = [
        {
            file: 'AudioIntermission2.ogg',
            minLvl: 1,
            maxLvl: 20,
            parts: [
                { min: 1,  max: 2,  start: 0,   end: 75 },   // Part 1
                { min: 3,  max: 4,  start: 76,  end: 152 },  // Part 2
                { min: 5,  max: 6,  start: 153, end: 230 },  // Part 3
                { min: 7,  max: 8,  start: 268, end: 344 },  // Part 4
                { min: 9,  max: 14, start: 345, end: 420 },  // Part 5
                { min: 15, max: 20, start: 421, end: 500 }   // Part 6 (Expanded to cover up to 20)
            ]
        },
        {
            file: 'FearBeforeFailure.ogg', // <-- Put your level 21+ song filename here
            minLvl: 21,
            maxLvl: 35,
            parts: [
                { min: 21, max: 25, start: 0,   end: 33 },   // Late Game Part 1: example timestamps
                { min: 26, max: 30, start: 34,  end: 173 },  // Late Game Part 2
                { min: 31, max: 35, start: 174, end: 268 } // Late Game Part 3...
            ]
        },
        {
            file: 'Unforeseen-Unforgiving.mp3', // <-- Put your level 21+ song filename here
            minLvl: 36,
            maxLvl: 50,
            parts: [
                { min: 36, max: 40, start: 0,   end: 171 },   // Late Game Part 1: example timestamps
                { min: 41, max: 50, start: 172,  end: 349 }
            ]
        },
        {
            file: 'Choir-of-the-Bells.mp3', // <-- Put your level 21+ song filename here
            minLvl: 51,
            maxLvl: 70,
            parts: [
                { min: 51, max: 60, start: 0,   end: 200 },   // Late Game Part 1: example timestamps
                { min: 61, max: 70, start: 201,  end: 333 }
            ]
        },
        {
            file: 'Event_Horizon.mp3', // <-- Put your level 21+ song filename here
            minLvl: 71,
            maxLvl: Infinity,
            parts: [
                { min: 71, max: Infinity, start: 0,   end: 343 }
            ]
        }
    ];

    // 2. Find which track matches the current level requirements
    const trackConfig = playlist.find(t => intermissionNum >= t.minLvl && intermissionNum <= t.maxLvl);
    if (!trackConfig) return;

    // 3. Find the exact timestamp loop segment for this specific level
    const currentPart = trackConfig.parts.find(p => intermissionNum >= p.min && intermissionNum <= p.max);
    if (!currentPart) return;

    // Stop gameplay synth loops if active
    if (typeof stopMusic === 'function') stopMusic();

    // 4. If the song file has changed (or hasn't been created yet), switch it out cleanly
    if (!intermissionAudio || currentTrackFile !== trackConfig.file) {
        if (intermissionAudio) {
            intermissionAudio.pause();
            intermissionAudio.ontimeupdate = null;
        }
        intermissionAudio = new Audio(trackConfig.file);
        currentTrackFile = trackConfig.file;
    }

    // 5. Jump to correct starting position and set up boundaries
    intermissionAudio.currentTime = currentPart.start;
    intermissionAudio.ontimeupdate = () => {
        if (intermissionAudio.currentTime >= currentPart.end) {
            intermissionAudio.currentTime = currentPart.start;
        }
    };

    intermissionAudio.play().catch(err => {
        console.warn("Audio playback waiting for user interaction:", err);
    });
};

window.stopIntermissionMusic = function() {
    if (intermissionAudio) {
        intermissionAudio.pause();
        intermissionAudio.ontimeupdate = null;
    }
};

// --- GAMEPLAY (IN-LEVEL) MUSIC ENGINE ---
// Add as many tracks as you want. minLvl/maxLvl define which levels a track can be picked for.
// When a new level starts, a random eligible track is chosen.
const gameplayPlaylist = [
    { file: 'Kenophobia.mp3', minLvl: 1,  maxLvl: 15 },
    { file: 'Domasp.mp3', minLvl: 1,  maxLvl: 60 },
    { file: 'Baby_Face.ogg', minLvl: 1,  maxLvl: 25 },
    { file: 'Conviction.ogg', minLvl: 20,  maxLvl: Infinity },
    { file: 'FearOfShadow.ogg', minLvl: 20,  maxLvl: 50 },
    { file: 'Line_of_Fire.ogg', minLvl: 20,  maxLvl: 50 },
    { file: 'Aerodynamics.mp3', minLvl: 35,  maxLvl: 80 },
    
    { file: 'DECAY-TRUE.mp3', minLvl: 45,  maxLvl: 80 },
    
    { file: 'cadence.mp3', minLvl: 50,  maxLvl: Infinity },
];

let gameplayAudio = null;
let currentGameplayTrackFile = "";

// Pick (and start) a random gameplay track eligible for the given level
window.playGameplayMusic = function(levelNum) {
    const eligible = gameplayPlaylist.filter(t => levelNum >= t.minLvl && levelNum <= t.maxLvl);
    if (eligible.length === 0) return;

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];

    if (gameplayAudio && currentGameplayTrackFile === chosen.file) {
        if (gameplayAudio.paused) gameplayAudio.play().catch(() => {});
        return;
    }

    if (gameplayAudio) {
        gameplayAudio.pause();
        gameplayAudio.currentTime = 0;
    }

    gameplayAudio = new Audio(chosen.file);
    gameplayAudio.loop = true;
    gameplayAudio.volume = 0.35;
    currentGameplayTrackFile = chosen.file;

    gameplayAudio.play().catch(err => {
        console.warn("Gameplay music waiting for user interaction:", err);
    });
};

window.resumeGameplayMusic = function() {
    if (gameplayAudio && gameplayAudio.paused) gameplayAudio.play().catch(() => {});
};

window.pauseGameplayMusic = function() {
    if (gameplayAudio && !gameplayAudio.paused) gameplayAudio.pause();
};

window.stopGameplayMusic = function() {
    if (gameplayAudio) {
        gameplayAudio.pause();
        gameplayAudio.currentTime = 0;
    }
};
// --- SYSTEM UTILITIES (Restored) ---
function safeAddEvent(element, type, handler) {
    if (element) element.addEventListener(type, handler);
}    
const AudioCtx = window.AudioContext || window.webkitAudioContext;
        let audioContext = null;
        let soundMuted = false;

        // Music Loop State Variables
        let musicTimer = null;
        let nextNoteTime = 0.0;
        let currentStep = 0;
        const scheduleAheadTime = 0.1; // Schedule notes 100ms in advance
        const lookahead = 25.0; // Run scheduling check every 25ms
        const bpm = 125.0;
        const stepDuration = 60.0 / bpm / 4; // 16th note step speed

        let masterMusicVolume = null;
        let distortionNode = null;

        // Smooth Camera tracking variables
        let smoothCamX = 0;
        let smoothCamY = 0;

        // Dynamic music generator helpers
        function makeDistortionCurve(amount) {
            let k = typeof amount === 'number' ? amount : 50,
                n_samples = 44100,
                curve = new Float32Array(n_samples),
                deg = Math.PI / 180,
                i = 0,
                x;
            for ( ; i < n_samples; ++i ) {
                x = ( i * 2 ) / n_samples - 1;
                curve[i] = ( ( 3 + k ) * x * 20 * deg ) / ( Math.PI + k * Math.abs(x) );
            }
            return curve;
        }

        function createNoiseNode() {
            if (!audioContext) return null;
            let bufferSize = audioContext.sampleRate * 0.4;
            let buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            let data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            let noiseNode = audioContext.createBufferSource();
            noiseNode.buffer = buffer;
            return noiseNode;
        }

        function startMusic() {
            try {
                if (!audioContext) {
                    audioContext = new AudioCtx();
                }
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }

                if (!masterMusicVolume) {
                    masterMusicVolume = audioContext.createGain();
                    masterMusicVolume.gain.value = soundMuted ? 0 : 0.05;

                    distortionNode = audioContext.createWaveShaper();
                    distortionNode.curve = makeDistortionCurve(120);
                    distortionNode.oversample = '4x';

                    // Connect master chain
                    distortionNode.connect(masterMusicVolume);
                    masterMusicVolume.connect(audioContext.destination);
                }

                if (!musicTimer) {
                    nextNoteTime = audioContext.currentTime;
                    musicTimer = setInterval(scheduler, lookahead);
                }
            } catch (err) {
                console.warn("Music initialization failed", err);
            }
        }

        function scheduler() {
            if (!audioContext) return;
            while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
                scheduleStep(currentStep, nextNoteTime);
                nextNoteTime += stepDuration;
                currentStep = (currentStep + 1) % 16;
            }
        }

        function routeToOutput(gainNode) {
            // Apply distortion if Level >= 25
            if (currentLevel >= 25 && distortionNode) {
                gainNode.connect(distortionNode);
            } else if (masterMusicVolume) {
                gainNode.connect(masterMusicVolume);
            }
        }

        function scheduleStep(step, time) {
            if (soundMuted || !audioContext) return;

            let isGlitch = (currentLevel >= 25 && Math.random() < 0.15);
            let lvl = currentLevel;

            if (isGlitch) {
                screenShake = Math.max(screenShake, 3);
            }

            // Chords Progression indexes (Am -> F -> C -> G)
            let chordIndex = Math.floor(step / 4);
            let roots = [55.00, 43.65, 65.41, 49.00]; // A1, F1, C2, G1 roots
            let root = roots[chordIndex];

            // 1. INSTRUMENT 1: Deep Bassline (Always Active - Level 1+)
            if (step % 2 === 0) { // Eighth notes pattern
                let bassOsc = audioContext.createOscillator();
                let bassGain = audioContext.createGain();
                bassOsc.connect(bassGain);
                routeToOutput(bassGain);

                bassOsc.type = isGlitch ? 'sawtooth' : 'triangle';
                let f = root;
                if (isGlitch) f *= 1.5; // Pitch-bend glitch effect
                
                bassOsc.frequency.setValueAtTime(f, time);
                bassGain.gain.setValueAtTime(0.18, time);
                bassGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.8);

                bassOsc.start(time);
                bassOsc.stop(time + stepDuration * 2);
            }

            // 2. INSTRUMENT 2: Fast Cyber Arpeggiator (Added Level 5+)
            if (lvl >= 5) {
                let arpOsc = audioContext.createOscillator();
                let arpGain = audioContext.createGain();
                arpOsc.connect(arpGain);
                routeToOutput(arpGain);

                arpOsc.type = 'sine';
                let chords = [
                    [110.00, 130.81, 164.81, 130.81], // Am: A2, C3, E3, C3
                    [87.31, 110.00, 130.81, 110.00],   // F:  F2, A2, C3, A2
                    [130.81, 164.81, 196.00, 164.81], // C:  C3, E3, G3, E3
                    [98.00, 123.47, 146.83, 123.47]   // G:  G2, B2, D3, B2
                ];
                let subStep = step % 4;
                let f = chords[chordIndex][subStep];
                if (isGlitch) f *= 0.5;

                arpOsc.frequency.setValueAtTime(f, time);
                arpGain.gain.setValueAtTime(0.05, time);
                arpGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.95);

                arpOsc.start(time);
                arpOsc.stop(time + stepDuration);
            }

            // 3. INSTRUMENT 3: Soaring Pentatonic Melodic Lead (Added Level 10+)
            if (lvl >= 10) {
                let melody = [
                    440.00, 0, 523.25, 659.25,
                    349.23, 0, 440.00, 523.25,
                    523.25, 0, 659.25, 783.99,
                    392.00, 0, 493.88, 587.33
                ];
                let f = melody[step];
                if (f > 0) {
                    let leadOsc = audioContext.createOscillator();
                    let leadGain = audioContext.createGain();
                    leadOsc.connect(leadGain);
                    routeToOutput(leadGain);

                    leadOsc.type = 'sawtooth';
                    if (isGlitch) {
                        leadOsc.type = 'square';
                        f *= 1.25;
                    }

                    leadOsc.frequency.setValueAtTime(f, time);
                    leadOsc.frequency.exponentialRampToValueAtTime(f * 0.98, time + stepDuration * 2.8);

                    leadGain.gain.setValueAtTime(0.03, time);
                    leadGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 2.6);

                    leadOsc.start(time);
                    leadOsc.stop(time + stepDuration * 3);
                }
            }

            // 4. INSTRUMENT 4: Offbeat Hi-Hats (Added Level 15+)
            if (lvl >= 15 && (step % 4 === 2)) {
                let noiseNode = createNoiseNode();
                if (noiseNode) {
                    let filter = audioContext.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(8000, time);

                    let hatGain = audioContext.createGain();
                    noiseNode.connect(filter);
                    filter.connect(hatGain);
                    routeToOutput(hatGain);

                    hatGain.gain.setValueAtTime(0.06, time);
                    hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

                    noiseNode.start(time);
                    noiseNode.stop(time + 0.06);
                }
            }

            // 5. INSTRUMENT 5: Digital Snare Snap (Added Level 20+)
            if (lvl >= 20 && (step % 8 === 4)) {
                let noiseNode = createNoiseNode();
                if (noiseNode) {
                    let filter = audioContext.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(1200, time);

                    let snareGain = audioContext.createGain();
                    noiseNode.connect(filter);
                    filter.connect(snareGain);
                    routeToOutput(snareGain);

                    snareGain.gain.setValueAtTime(0.08, time);
                    snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

                    noiseNode.start(time);
                    noiseNode.stop(time + 0.13);
                }

                // Quick transient kick click
                let clickOsc = audioContext.createOscillator();
                let clickGain = audioContext.createGain();
                clickOsc.connect(clickGain);
                routeToOutput(clickGain);
                clickOsc.type = 'triangle';
                clickOsc.frequency.setValueAtTime(150, time);
                clickOsc.frequency.exponentialRampToValueAtTime(60, time + 0.07);
                clickGain.gain.setValueAtTime(0.06, time);
                clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
                clickOsc.start(time);
                clickOsc.stop(time + 0.07);
            }

            // 6. INSTRUMENT 6: Heavy Kick Drums (Added Level 25+)
            if (lvl >= 25 && (step % 4 === 0)) {
                let kickOsc = audioContext.createOscillator();
                let kickGain = audioContext.createGain();
                kickOsc.connect(kickGain);
                routeToOutput(kickGain);

                kickOsc.type = 'sine';
                kickOsc.frequency.setValueAtTime(150, time);
                kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.11);

                kickGain.gain.setValueAtTime(0.35, time);
                kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

                kickOsc.start(time);
                kickOsc.stop(time + 0.12);
            }
        }

        function playSynthSound(type) {
            if (soundMuted) return;
            try {
                if (!audioContext) {
                    audioContext = new AudioCtx();
                }
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);

                const now = audioContext.currentTime;

                if (type === 'move') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                } else if (type === 'shoot') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'hit') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.linearRampToValueAtTime(60, now + 0.3);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                } else if (type === 'bomb_warn') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(900, now + 0.08);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'explode') {
                    const bufferSize = audioContext.sampleRate * 0.4;
                    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noiseNode = audioContext.createBufferSource();
                    noiseNode.buffer = buffer;
                    const noiseFilter = audioContext.createBiquadFilter();
                    noiseFilter.type = 'lowpass';
                    noiseFilter.frequency.setValueAtTime(800, now);
                    noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.4);

                    const noiseGain = audioContext.createGain();
                    noiseGain.gain.setValueAtTime(0.15, now);
                    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                    noiseNode.connect(noiseFilter);
                    noiseFilter.connect(noiseGain);
                    gain.connect(audioContext.destination);

                    noiseNode.start(now);
                    noiseNode.stop(now + 0.4);
                } else if (type === 'level_win') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(554, now + 0.1);
                    osc.frequency.setValueAtTime(659, now + 0.2);
                    osc.frequency.setValueAtTime(880, now + 0.3);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                    osc.start(now);
                    osc.stop(now + 0.45);
                } else if (type === 'green_light_alert') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(500, now);
                    osc.frequency.linearRampToValueAtTime(1000, now + 0.3);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                    osc.start(now);
                    osc.stop(now + 0.35);
                } else if (type === 'green_light_pass') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(700, now);
                    osc.frequency.setValueAtTime(1100, now + 0.08);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'tick_down') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.03, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                } else if (type === 'train_warn') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.linearRampToValueAtTime(300, now + 0.4);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                } else if (type === 'coin_pickup') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, now); // D5
                    osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'heal') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
                    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                    osc.start(now);
                    osc.stop(now + 0.55);
                } else if (type === 'screamer_scream') {
                    // Glitchy upward pitch vibrato scream
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.linearRampToValueAtTime(1600, now + 0.15);
                    osc.frequency.linearRampToValueAtTime(800, now + 0.3);
                    osc.frequency.linearRampToValueAtTime(1400, now + 0.5);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                }
            } catch (err) {
                console.warn("Sound play failure", err);
            }
        }

        // Toggle Audio Display UI
        const soundToggleBtn = document.getElementById('soundToggleBtn');
        const soundOnIcon = document.getElementById('soundOnIcon');
        const soundOffIcon = document.getElementById('soundOffIcon');
        soundToggleBtn.addEventListener('click', () => {
            soundMuted = !soundMuted;
            if (soundMuted) {
                soundOnIcon.classList.add('hidden');
                soundOffIcon.classList.remove('hidden');
                if (masterMusicVolume) {
                    masterMusicVolume.gain.setValueAtTime(0, audioContext.currentTime);
                }
            } else {
                soundOnIcon.classList.remove('hidden');
                soundOffIcon.classList.add('hidden');
                if (!audioContext) audioContext = new AudioCtx();
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                startMusic();
                if (masterMusicVolume) {
                    masterMusicVolume.gain.setValueAtTime(0.05, audioContext.currentTime);
                }
            }
        });

        // Toggle Instructions Display UI
        const infoBtn = document.getElementById('infoBtn');
        const infoModal = document.getElementById('infoModal');
        const closeInfoBtn = document.getElementById('closeInfoBtn');
        infoBtn.addEventListener('click', () => infoModal.classList.remove('hidden'));
        closeInfoBtn.addEventListener('click', () => infoModal.classList.add('hidden'));

        // Core Game Constants & Variable Configuration
        let GRID_SIZE = 10;
        let canvas = document.getElementById('gameCanvas');
        let ctx = canvas.getContext('2d');

        // Dynamic State Tracking Variables
        let currentLevel = 1;
        let playerHealth = 5;
        let maxHealth = 5;
        let levelsUntilHeal = 3; // Countdown matrix
        let grid = [];
        let playerPos = { r: 0, c: 0 };
        let winPos = { r: 9, c: 9 };
        let activeLevelRunning = false;

        // --- FREE 2D MOVEMENT STATE ---
        // playerVisualPos is the continuous (analog) position in tile units.
        // playerPos.r/c remains the "logical" tile the player currently occupies,
        // and is what all gameplay logic (coins, win, altars, etc.) checks against.
        let playerVisualPos = { x: 0.5, y: 0.5 };
        const PLAYER_RADIUS = 0.30;      // collision circle radius, in tile units
        const PLAYER_SPEED = 4.0;        // tiles per second at normal speed
        let keysHeld = { up: false, down: false, left: false, right: false };

        // Visual effects
        let screenShake = 0;
        let particles = [];
        let floatingTexts = []; // Array of {x, y, text, color, alpha, vy, scale, life} (x,y are GRID units)
        let damageFlashTime = 0; // Viewport screen tint timer (ms)
        let healFlashTime = 0; // Viewport green tint timer

        // Player Movement Control Limits
        let playerNextMoveAllowedTime = 0;

        // Hostile Choices tracking (no back-to-back draft)
        let lastChosenEnemyId = null;

        // Level Progression Triggers
        let level15ProgressionActive = false;
        let level20ProgressionActive = false;

        // Hazards and Selection Inventories
        let selectedEnemies = {
            shooter: 0,
            voidbound_shooter: 0,
            voidbound_screamer: 0,
            bomboclat: 0,
            voidbound_bomboclat: 0,
            feurougefeuvert: 0,
            train: 0,
            voidbound_train: 0, // Standalone heavy 8-directional train
            flesh: 0,
            chaser: 0, // Blue Chaser (Max 10)
            screamer: 0 // Screamer ghost (Max 4)
        };

        // Active Curses
        let activeCurses = {
            // Normal Curses
            shooter_faster: false,
            shooter_triple: false,
            shooter_line: false,
            bomb_faster: false,
            bomb_bigger: false,
            greenlight_harder: false,
            chaser_boost: 0, // Stacks up to 2 times
            train_both_ways: false, // Normal curse: strikes row and col crossing at index
            chaser_center_merge: false, // Normal curse: chasers target center before chasing you
            // Generic Fallback Normal Curses
            system_lag: false,
            ui_static: false,
            drift_sensors: false,
            // Greater Curses (Every 15 levels)
            chrono_decay: false,
            apocalypse_barrage: false,
            doomsday_charge: false,
            overload_protocol: false,
            train_8_directions: false, // Greater curse: train warning & strike in 8 directions
            greenlight_voidbound: false, // Greater curse: Voidbound Feurougefeuvert
            screamer_double_dash: false, // Greater curse: double dash back-to-back
            screamer_faster: 0, // stacks up to 2 (normal curse)
            // Medal Curse modifiers
            medal_goldrush: false,
            medal_barrage: false,
            medal_frenzy: false,
            medal_overcharge: false,
            medal_swift: false,
            medal_voidtide: false,
            medal_ironhide: false,
            medal_chaosweave: false,
            // Lap 2 persistent curse
            lap2: false,
            // Generic Fallback Greater Curses
            reversed_polarity: false,
            port_shift: false
        };

        // Debug Mode State
        let debugModeActive = false;
        let debugAccessCode = '';
        let debugVisibleCode = '';

        function generateDebugCode(length = 5) {
            return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
        }

        function initDebugMode() {
            debugAccessCode = generateDebugCode(5);
            debugVisibleCode = debugAccessCode.split('').reverse().join('');
            console.log(`DEBUG ACCESS CODE: ${debugVisibleCode}`);
            console.log('Reverse the access code and call activateDebugMode("<code>") in the console.');
        }

        function activateDebugMode(code) {
            if (code === debugAccessCode) {
                debugModeActive = true;
                console.log('Debug mode enabled. Use debugAddEnemy(), debugSetLevel(), debugAddCurse() or debugStatus() now.');
                return true;
            }
            console.warn('Invalid debug code.');
            return false;
        }

        function debugAddEnemy(type, count = 1) {
            if (!debugModeActive) {
                console.warn('Debug mode not enabled.');
                return;
            }
            if (typeof count !== 'number' || count <= 0) count = 1;
            selectedEnemies[type] = (selectedEnemies[type] || 0) + count;
            if (typeof updateEnemyList === 'function') updateEnemyList();
            console.log(`Debug: added ${count} ${type}(s). Total now ${selectedEnemies[type]}.`);
        }

        function debugSetLevel(level) {
            if (!debugModeActive) {
                console.warn('Debug mode not enabled.');
                return;
            }
            const parsed = Number(level);
            if (Number.isNaN(parsed) || parsed < 1) {
                console.warn('Invalid level.');
                return;
            }
            currentLevel = parsed;
            if (document.getElementById('levelDisplay')) {
                document.getElementById('levelDisplay').textContent = currentLevel;
            }
            console.log(`Debug: level set to ${currentLevel}.`);
        }

        function debugAddCurse(curseId, value = true) {
            if (!debugModeActive) {
                console.warn('Debug mode not enabled.');
                return;
            }
            if (typeof curseId !== 'string') {
                console.warn('Curse id must be a string.');
                return;
            }
            if (activeCurses.hasOwnProperty(curseId)) {
                const current = activeCurses[curseId];
                if (typeof current === 'number') {
                    activeCurses[curseId] = Number(value) || 0;
                } else {
                    activeCurses[curseId] = value === true || value === 'true' || value === 1 || value === '1';
                }
                console.log(`Debug: curse '${curseId}' set to`, activeCurses[curseId]);
                return;
            }
            activeCurses[curseId] = value === true || value === 'true' || value === 1 || value === '1' ? true : value;
            console.log(`Debug: new curse '${curseId}' created with value`, activeCurses[curseId]);
        }

        function debugStatus() {
            return {
                debugModeActive,
                currentLevel,
                selectedEnemies: { ...selectedEnemies },
                activeCurses: { ...activeCurses }
            };
        }

        window.activateDebugMode = activateDebugMode;
        window.debugAddEnemy = debugAddEnemy;
        window.debugSetLevel = debugSetLevel;
        window.debugAddCurse = debugAddCurse;
        window.debugStatus = debugStatus;

        initDebugMode();

        // Polarity State
        let polarityInverted = false;

        // Level Timer Logic (Chrono Decay Greater Curse)
        let chronoTimerSeconds = 0;
        let lastChronoTickTime = 0;
        let damageOvertimeAccumulator = 0;
        let lastPortShiftTime = 0;

        // Level 10 Coin Collection State
        let coinsList = [];
        let lap2Phase = 0;
        let lap2TotalCoins = 0;
        let lap2CollectedThisPhase = 0;
        let lap2CollapseActive = false;
        let lap2CollapseTimer = 0;
        let medalSpawned = false;
        let medalCollected = false;
        let medalPos = null;
        let medalConsumed = false;

        // Live Active Hostile Instances
        let shootersList = [];
        let bulletsList = [];
        let bombsList = [];
        let trainsList = [];
        let fleshList = [];
        let chasersList = []; // Active Blue Chaser nodes
        let screamersList = []; // Active Screamer nodes
        let infectedTiles = []; // list of {r, c, expiresAt}

        // Greenlight mechanics
        let greenLightActive = false;
        let greenLightTimer = 0; // reactions ticks
        let stillnessTimer = 0; // accumulated frozen time in ms
        let playerLastMovedTime = 0; // timestamp when player last moved

        // Voidbound Greenlight State Machine Tracker
        let voidboundGLStage = 0; // 0 to 3 stages
        let voidboundGLState = 'idle'; // 'idle', 'warning', 'pause'
        let voidboundTimerTarget = 0; // ms target time
        let voidboundMaxStillness = 0; // track max stillness within warning window

        // Spawners timers
        let bomboclatSpawnTimer = 0;
        let greenLightSpawnTimer = 0;
        let trainSpawnTimer = 0;
        // Voidbound train cooldown: timestamp of last voidbound train spawn
        let lastVoidboundTrainSpawnTime = 0;

        // Path Verification Algorithm (BFS) to guarantee accessibility (for PLAYER only)
        function isGridWinnable(gridStructure, start, end, currentSize) {
            const queue = [[start.r, start.c]];
            const visited = Array(currentSize).fill(null).map(() => Array(currentSize).fill(false));
            visited[start.r][start.c] = true;

            const dr = [-1, 1, 0, 0];
            const dc = [0, 0, -1, 1];

            while (queue.length > 0) {
                const [currR, currC] = queue.shift();
                if (currR === end.r && currC === end.c) {
                    return true;
                }

                for (let i = 0; i < 4; i++) {
                    const nextR = currR + dr[i];
                    const nextC = currC + dc[i];

                    if (nextR >= 0 && nextR < currentSize && nextC >= 0 && nextC < currentSize) {
                        if (!visited[nextR][nextC] && gridStructure[nextR][nextC] !== 1) {
                            visited[nextR][nextC] = true;
                            queue.push([nextR, nextC]);
                        }
                    }
                }
            }
            return false;
        }

        // BFS to locate all coordinates reachable from player spawn coordinates
        function getAllReachableTiles(gridStructure, start, currentSize) {
            const queue = [[start.r, start.c]];
            const visited = Array(currentSize).fill(null).map(() => Array(currentSize).fill(false));
            visited[start.r][start.c] = true;

            const reachable = [];
            const dr = [-1, 1, 0, 0];
            const dc = [0, 0, -1, 1];

            while (queue.length > 0) {
                const [currR, currC] = queue.shift();
                reachable.push({ r: currR, c: currC });

                for (let i = 0; i < 4; i++) {
                    const nextR = currR + dr[i];
                    const nextC = currC + dc[i];

                    if (nextR >= 0 && nextR < currentSize && nextC >= 0 && nextC < currentSize) {
                        if (!visited[nextR][nextC] && gridStructure[nextR][nextC] !== 1) {
                            visited[nextR][nextC] = true;
                            queue.push([nextR, nextC]);
                        }
                    }
                }
            }
            return reachable;
        }

        // Clean Grid Layout Spawner - Formats structured levels with rooms, corridors, and larger defensive barriers.
        function buildValidLevelLayout(currentSize) {
            const finalGrid = Array.from({ length: currentSize }, () => Array(currentSize).fill(0));
            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            const inBounds = (r, c) => r >= 0 && r < currentSize && c >= 0 && c < currentSize;

            const carveLine = (r1, c1, r2, c2) => {
                let r = r1;
                let c = c1;
                while (r !== r2) {
                    if (inBounds(r, c)) finalGrid[r][c] = 0;
                    r += r < r2 ? 1 : -1;
                }
                while (c !== c2) {
                    if (inBounds(r, c)) finalGrid[r][c] = 0;
                    c += c < c2 ? 1 : -1;
                }
                if (inBounds(r, c)) finalGrid[r][c] = 0;
            };

            const carveRoom = (r, c, h, w) => {
                for (let dr = 0; dr < h; dr++) {
                    for (let dc = 0; dc < w; dc++) {
                        const rr = r + dr;
                        const cc = c + dc;
                        if (inBounds(rr, cc)) finalGrid[rr][cc] = 0;
                    }
                }
            };

            const fillBorder = (r, c, h, w) => {
                for (let dr = -1; dr <= h; dr++) {
                    for (let dc = -1; dc <= w; dc++) {
                        const rr = r + dr;
                        const cc = c + dc;
                        if (!inBounds(rr, cc)) continue;
                        if (dr === -1 || dc === -1 || dr === h || dc === w) {
                            finalGrid[rr][cc] = 1;
                        }
                    }
                }
            };

            const createPlus = (r, c, size) => {
                for (let d = -size; d <= size; d++) {
                    if (inBounds(r + d, c)) finalGrid[r + d][c] = 1;
                    if (inBounds(r, c + d)) finalGrid[r][c + d] = 1;
                }
            };

            const createRing = (centerR, centerC, radius) => {
                for (let dr = -radius; dr <= radius; dr++) {
                    for (let dc = -radius; dc <= radius; dc++) {
                        if (Math.abs(dr) === radius || Math.abs(dc) === radius) {
                            const rr = centerR + dr;
                            const cc = centerC + dc;
                            if (inBounds(rr, cc)) finalGrid[rr][cc] = 1;
                        }
                    }
                }
            };

            if (currentSize < 14) {
                const step = 3;
                for (let r = 1; r < currentSize - 1; r += step) {
                    for (let c = 1; c < currentSize - 1; c += step) {
                        if (Math.random() < 0.5) {
                            finalGrid[r][c] = 1;
                            if (r + 1 < currentSize - 1) finalGrid[r + 1][c] = 1;
                        } else {
                            finalGrid[r][c] = 1;
                            if (c + 1 < currentSize - 1) finalGrid[r][c + 1] = 1;
                        }
                    }
                }
            } else {
                const rooms = [];
                const roomCount = Math.min(6, Math.max(3, Math.floor(currentSize / 8)));
                for (let i = 0; i < roomCount; i++) {
                    const roomW = rand(3, Math.min(7, currentSize - 8));
                    const roomH = rand(3, Math.min(6, currentSize - 8));
                    const roomR = rand(1, currentSize - roomH - 3);
                    const roomC = rand(1, currentSize - roomW - 3);
                    const room = { r: roomR, c: roomC, h: roomH, w: roomW, centerR: roomR + Math.floor(roomH / 2), centerC: roomC + Math.floor(roomW / 2) };

                    const overlaps = rooms.some(other => {
                        return !(room.r + room.h + 2 < other.r || other.r + other.h + 2 < room.r || room.c + room.w + 2 < other.c || other.c + other.w + 2 < room.c);
                    });
                    if (!overlaps) {
                        rooms.push(room);
                        carveRoom(room.r, room.c, room.h, room.w);
                        fillBorder(room.r, room.c, room.h, room.w);
                    }
                }

                if (rooms.length === 0) {
                    for (let r = 1; r < currentSize - 1; r += 4) {
                        for (let c = 1; c < currentSize - 1; c += 4) {
                            if (Math.random() < 0.75) {
                                finalGrid[r][c] = 1;
                            }
                        }
                    }
                } else {
                    for (let i = 1; i < rooms.length; i++) {
                        const prev = rooms[i - 1];
                        const room = rooms[i];
                        if (Math.random() < 0.5) {
                            carveLine(prev.centerR, prev.centerC, prev.centerR, room.centerC);
                            carveLine(prev.centerR, room.centerC, room.centerR, room.centerC);
                        } else {
                            carveLine(prev.centerR, prev.centerC, room.centerR, prev.centerC);
                            carveLine(room.centerR, prev.centerC, room.centerR, room.centerC);
                        }
                    }

                    const structureCount = Math.max(2, Math.floor(currentSize / 6));
                    for (let i = 0; i < structureCount; i++) {
                        const sr = rand(2, currentSize - 3);
                        const sc = rand(2, currentSize - 3);
                        if (Math.random() < 0.35) {
                            createPlus(sr, sc, rand(1, 3));
                        } else if (Math.random() < 0.6) {
                            const len = rand(3, 6);
                            if (Math.random() < 0.5) {
                                for (let rr = sr; rr < Math.min(currentSize - 1, sr + len); rr++) finalGrid[rr][sc] = 1;
                            } else {
                                for (let cc = sc; cc < Math.min(currentSize - 1, sc + len); cc++) finalGrid[sr][cc] = 1;
                            }
                        } else {
                            const radius = rand(2, 4);
                            createRing(sr, sc, radius);
                        }
                    }
                }

                if (currentSize >= 20) {
                    const center = Math.floor(currentSize / 2);
                    const ringCount = Math.floor(currentSize / 12) + 1;
                    for (let r = 0; r < ringCount; r++) {
                        const radius = 2 + r * 2;
                        const gap = rand(0, 3);
                        for (let dr = -radius; dr <= radius; dr++) {
                            for (let dc = -radius; dc <= radius; dc++) {
                                if (Math.abs(dr) === radius || Math.abs(dc) === radius) {
                                    if (Math.random() < 0.8 || (Math.abs(dr) === radius && Math.abs(dc) === radius && Math.random() < 0.25)) {
                                        const rr = center + dr;
                                        const cc = center + dc;
                                        if (inBounds(rr, cc)) finalGrid[rr][cc] = 1;
                                    }
                                }
                            }
                        }
                    }

                    if (level20ProgressionActive) {
                        const extraSpines = Math.max(2, Math.floor(currentSize / 7));
                        for (let s = 0; s < extraSpines; s++) {
                            const startR = rand(1, currentSize - 5);
                            const startC = rand(1, currentSize - 5);
                            const dir = Math.random() < 0.5 ? 'diag' : 'bar';
                            if (dir === 'diag') {
                                let length = rand(5, Math.min(10, currentSize - Math.max(startR, startC) - 2));
                                for (let step = 0; step < length; step++) {
                                    const rr = startR + step;
                                    const cc = startC + step;
                                    if (inBounds(rr, cc) && Math.random() < 0.75) finalGrid[rr][cc] = 1;
                                    if (inBounds(rr, cc + 1) && Math.random() < 0.45) finalGrid[rr][cc + 1] = 1;
                                }
                            } else {
                                const lineLen = rand(4, Math.min(10, currentSize - Math.max(startR, startC) - 2));
                                if (Math.random() < 0.5) {
                                    for (let cc = startC; cc < startC + lineLen; cc++) {
                                        if (inBounds(startR, cc) && Math.random() < 0.8) finalGrid[startR][cc] = 1;
                                    }
                                } else {
                                    for (let rr = startR; rr < startR + lineLen; rr++) {
                                        if (inBounds(rr, startC) && Math.random() < 0.8) finalGrid[rr][startC] = 1;
                                    }
                                }
                            }
                        }

                        for (let c = 0; c < Math.floor(currentSize / 4); c++) {
                            const baseR = rand(1, currentSize - 4);
                            const baseC = rand(1, currentSize - 4);
                            if (Math.random() < 0.65) {
                                finalGrid[baseR][baseC] = 1;
                                if (inBounds(baseR + 1, baseC)) finalGrid[baseR + 1][baseC] = 1;
                                if (inBounds(baseR, baseC + 1)) finalGrid[baseR][baseC + 1] = 1;
                                if (Math.random() < 0.5 && inBounds(baseR + 1, baseC + 1)) finalGrid[baseR + 1][baseC + 1] = 1;
                            }
                        }
                    }
                }

                // Add some random pillar clusters for detail and oblique shapes
                for (let i = 0; i < Math.floor(currentSize / 3); i++) {
                    const baseR = rand(1, currentSize - 3);
                    const baseC = rand(1, currentSize - 3);
                    if (Math.random() < 0.55) {
                        finalGrid[baseR][baseC] = 1;
                        if (Math.random() < 0.6) finalGrid[baseR + 1][baseC] = 1;
                        if (Math.random() < 0.6) finalGrid[baseR][baseC + 1] = 1;
                        if (Math.random() < 0.35) finalGrid[baseR + 1][baseC + 1] = 1;
                    } else {
                        const lineLen = rand(2, 5);
                        if (Math.random() < 0.5) {
                            for (let k = 0; k < lineLen; k++) {
                                if (inBounds(baseR, baseC + k)) finalGrid[baseR][baseC + k] = 1;
                            }
                        } else {
                            for (let k = 0; k < lineLen; k++) {
                                if (inBounds(baseR + k, baseC)) finalGrid[baseR + k][baseC] = 1;
                            }
                        }
                    }
                }
            }

            finalGrid[0][0] = 0;
            finalGrid[0][1] = 0;
            finalGrid[1][0] = 0;
            finalGrid[1][1] = 0;
            return finalGrid;
        }

        // Particle Generators - Pure Grid Coordinate Units
        function spawnImpactParticles(gridC, gridR, color, count = 10) {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: gridC, // Stored in pure grid float units
                    y: gridR,
                    vx: (Math.random() - 0.5) * 0.15, // Grid coordinate speed
                    vy: (Math.random() - 0.5) * 0.15,
                    radius: Math.random() * 3 + 1.8, 
                    color: color,
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.05 + 0.02
                });
            }
        }

        // Glowing floating text element thrower - Pure Grid Units
        function spawnFloatingText(gridR, gridC, text, color) {
            floatingTexts.push({
                x: gridC + 0.5,
                y: gridR + 0.5,
                text: text,
                color: color,
                alpha: 1.0,
                vy: -0.003, // Rising velocity in Grid coordinate units
                life: 1000 // ms duration
            });
        }

        function spawnGridWinParticles(row, col) {
            spawnImpactParticles(col + 0.5, row + 0.5, '#10b981', 30);
        }

        // Check level progression map triggers
        function isEnemyChoiceLevel(lvl) {
            if (lvl === 1) return true;
            if (lvl > 2 && lvl % 3 === 0) return true; // 4, 6, 8, 12, 14, 16, 18, 22...
            return false;
        }

        function isCurseChoiceLevel(lvl) {
             const isGreater = (lvl > 25 && lvl % 5 === 0) || lvl % 15 === 0 ;
            return  lvl % 2 === 0 || isGreater;
        }

        // Modal for Intermission Progression Notifications
        function showProgressionIntermissionModal(nextLvl, callback) {
            const modal = document.getElementById('progressionModal');
            const title = document.getElementById('progressionModalTitle');
            const sub = document.getElementById('progressionModalSub');
            const details = document.getElementById('progressionModalDetails');
            const btn = document.getElementById('closeProgressionModalBtn');

            playSynthSound('green_light_alert');
            screenShake = 20;

            let titleText = "SYSTEM EVOLUTION DETECTED";
            let subText = `Mainframe Level ${nextLvl} boundary exceeded. Hostile logic mutated!`;
            let detailsHtml = "";

            if (nextLvl === 15) {
                level15ProgressionActive = true;
                detailsHtml = `
                    <p class="text-rose-400 font-bold uppercase tracking-wider mb-2">🚥 TARGET REACHED LEVEL 15</p>
                    <p class="text-slate-300">• <strong class="text-red-400">Crimson Flesh Virus:</strong> Footprint expanded to a massive <strong class="text-red-400 font-bold">7x7</strong> zone.</p>
                    <p class="text-slate-300">• <strong class="text-amber-400">Bomboclat Explosive:</strong> Spawning and charging speed is now <strong class="text-amber-400 font-bold">doubled</strong>.</p>
                    <p class="text-slate-300">• <strong class="text-rose-400">Projectiles:</strong> Shooter energy bolts are highly unstable and <strong class="text-rose-400 font-bold">explode in a 3x3 zone</strong> after 5 seconds.</p>
                `;
            } else if (nextLvl === 20) {
                level20ProgressionActive = true;
                detailsHtml = `
                    <p class="text-emerald-400 font-bold uppercase tracking-wider mb-2">📐 LEVEL 20: MAP MUTATION</p>
                    <p class="text-slate-300">• <strong class="text-emerald-400">Ruined Grid Expansion:</strong> New structural generation now adds jagged choke corridors, diagonal spine barriers, and collapsed pillar clusters.</p>
                    <p class="text-slate-300">• <strong class="text-emerald-400">Terrain Mutation:</strong> Larger grids gain asymmetrical obstacle veins and ruin-like clusters, forcing tighter pathing.</p>
                `;
            } else if (nextLvl % 8 === 0) {
                const factor = Math.floor(nextLvl / 8);
                detailsHtml = `
                    <p class="text-sky-400 font-bold uppercase tracking-wider mb-2">🔵 CHASER RESONANCE WAVE (FACTOR ${factor})</p>
                    <p class="text-slate-300">• <strong class="text-sky-400">Blue Chaser:</strong> Core footprint permanently expands by <strong class="text-sky-400 font-bold">+7%</strong>.</p>
                    <p class="text-slate-300">• <strong class="text-sky-400">Blue Chaser Speed:</strong> Velocity rate permanently increased by <strong class="text-sky-400 font-bold">+10%</strong>.</p>
                `;
            }

            title.textContent = titleText;
            sub.textContent = subText;
            details.innerHTML = detailsHtml;

            // Clone to strip existing event listeners clean
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                callback(); // Seamlessly resume selection drafting or core level loading
            });

            modal.classList.remove('hidden');
        }

        // Handle game engine initiation flow
        function initNewLevel(nextLvl) {
            if (typeof window.stopIntermissionMusic === 'function') window.stopIntermissionMusic();
            if (typeof window.playGameplayMusic === 'function') window.playGameplayMusic(nextLvl);
            currentLevel = nextLvl;
            document.getElementById('levelDisplay').textContent = currentLevel;
            
            // Map gets 35% bigger every 5 levels (Levels 5, 10, 15, 20...) - NO size limits
            GRID_SIZE = Math.floor(10 * Math.pow(1.35, Math.floor((currentLevel - 1) / 5)));
            document.getElementById('gridDisplay').textContent = `${GRID_SIZE}x${GRID_SIZE} 🌐`;

            // Build validated grid matrix
            grid = buildValidLevelLayout(GRID_SIZE);

            // Establish guaranteed single player spawn
            playerPos = { r: 0, c: 0 };
            playerVisualPos = { x: 0.5, y: 0.5 };
            grid[0][0] = 0;

            // ABSOLUTE LOCK PREVENTION: BFS from player pos to locate ALL verified walkable coordinates
            const reachableTiles = getAllReachableTiles(grid, playerPos, GRID_SIZE);

            // Grab Exit Portal position from verified list
            let winSet = false;
            let minManhattan = Math.max(5, Math.floor(GRID_SIZE / 3));

            // Shuffle list to get beautiful random placements
            const shuffledTiles = reachableTiles.filter(t => t.r !== 0 || t.c !== 0).sort(() => 0.5 - Math.random());

            for (let i = 0; i < shuffledTiles.length; i++) {
                const candidate = shuffledTiles[i];
                const dist = Math.abs(candidate.r - playerPos.r) + Math.abs(candidate.c - playerPos.c);
                if (dist >= minManhattan) {
                    winPos = { r: candidate.r, c: candidate.c };
                    winSet = true;
                    // Remove winPos from available places to prevent coin/win spawn overlaps
                    shuffledTiles.splice(i, 1);
                    break;
                }
            }

            // Fallback backup exit position
            if (!winSet && shuffledTiles.length > 0) {
                winPos = { r: shuffledTiles[0].r, c: shuffledTiles[0].c };
                shuffledTiles.splice(0, 1);
            }

            // Setup camera starting point immediately to avoid instant snapping jumps
            smoothCamX = playerPos.c + 0.5;
            smoothCamY = playerPos.r + 0.5;

            // Clear frame hazard instances
            shootersList = [];
            bulletsList = [];
            bombsList = [];
            trainsList = [];
            fleshList = [];
            chasersList = [];
            screamersList = [];
            infectedTiles = [];
            greenLightActive = false;
            stillnessTimer = 0;
            playerNextMoveAllowedTime = 0;
            lastPortShiftTime = Date.now();

            voidboundGLStage = 0;
            voidboundGLState = 'idle';
            document.getElementById('greenLightOverlay').style.opacity = '0';
            document.getElementById('slowdownContainer').classList.add('hidden');
            document.getElementById('polarityContainer').classList.add('hidden');

            // Generate level 10+ coins scatter arrangement on walkable blocks
            coinsList = [];
            if (currentLevel >= 10) {
                const totalCoins = Math.min(8, 3 + Math.floor((GRID_SIZE - 10) / 3));
                let coinsPlaced = 0;
                while (coinsPlaced < totalCoins && shuffledTiles.length > 0) {
                    const candidate = shuffledTiles.shift();
                    coinsList.push({ r: candidate.r, c: candidate.c });
                    coinsPlaced++;
                }
            }

            // Lap 2 initialization for level 10 and above
            if (activeCurses.lap2) {
                lap2Phase = 1;
                lap2TotalCoins = coinsList.length;
                lap2CollectedThisPhase = 0;
                lap2CollapseActive = false;
                lap2CollapseTimer = Date.now() + 1200;
            } else {
                lap2Phase = 0;
                lap2TotalCoins = 0;
                lap2CollectedThisPhase = 0;
                lap2CollapseActive = false;
            }

            // Medal token spawns one round before the next curse intermission
            medalPos = null;
            medalSpawned = false;
            medalConsumed = false;
            if (isCurseChoiceLevel(currentLevel + 1)) {
                const medalCandidates = shuffledTiles.filter(tile => tile.r !== winPos.r || tile.c !== winPos.c);
                if (medalCandidates.length > 0) {
                    const choice = medalCandidates[Math.floor(Math.random() * medalCandidates.length)];
                    medalPos = { r: choice.r, c: choice.c };
                    medalSpawned = true;
                    const index = shuffledTiles.findIndex(tile => tile.r === choice.r && tile.c === choice.c);
                    if (index !== -1) shuffledTiles.splice(index, 1);
                }
            }

            // Reset timers
            bomboclatSpawnTimer = Date.now();
            greenLightSpawnTimer = Date.now() + Math.random() * 3000;
            trainSpawnTimer = Date.now() + 1000;

            // Handle Chrono Decay greater curse setup
            if (activeCurses.chrono_decay) {
                chronoTimerSeconds = Math.max(18, 18 + GRID_SIZE * 1.2);
                lastChronoTickTime = Date.now();
                damageOvertimeAccumulator = 0;
                document.getElementById('chronoTimerContainer').classList.remove('hidden');
                document.getElementById('chronoTimerText').textContent = `${chronoTimerSeconds.toFixed(1)}s`;
            } else {
                document.getElementById('chronoTimerContainer').classList.add('hidden');
            }

            // Spawn active enemies
            spawnLevelEntities();

            // Spawn altar(s) when level qualifies
            const altarTiles = shuffledTiles.filter(tile => (tile.r !== playerPos.r || tile.c !== playerPos.c) && (tile.r !== winPos.r || tile.c !== winPos.c));
            try { if (typeof spawnAltarForLevel === 'function') spawnAltarForLevel(currentLevel, altarTiles); } catch(e) { /* ignore if upgrades module missing */ }

            try { if (typeof updateAltarUI === 'function') updateAltarUI(); } catch(e) {}
            try { if (typeof updateEnemyList === 'function') updateEnemyList(); } catch(e) {}

            // Render stats updates
            updateHealthUI();
            updateCursesUI();

            activeLevelRunning = true;
            triggerLevelIntroAnimation();
        }

        function triggerLevelIntroAnimation() {
            spawnImpactParticles(GRID_SIZE / 2, GRID_SIZE / 2, '#6366f1', 25);
        }

        // Spawner helper
        function spawnLevelEntities() {
            // Shooters
            for (let i = 0; i < selectedEnemies.shooter; i++) {
                spawnEntityInstance('shooter', false);
            }

            // Voidbound Shooters
            for (let i = 0; i < selectedEnemies.voidbound_shooter; i++) {
                spawnEntityInstance('shooter', true);
            }

            // Flesh hostiles
            for (let i = 0; i < selectedEnemies.flesh; i++) {
                spawnEntityInstance('flesh');
            }

            // Blue Chasers
            for (let i = 0; i < selectedEnemies.chaser; i++) {
                spawnEntityInstance('chaser');
            }

            // Screamers
            for (let i = 0; i < selectedEnemies.screamer; i++) {
                spawnEntityInstance('screamer');
            }

            // Voidbound Screamers
            for (let i = 0; i < (selectedEnemies.voidbound_screamer || 0); i++) {
                spawnEntityInstance('screamer', true);
            }

            try { if (typeof updateEnemyList === 'function') updateEnemyList(); } catch(e) {}
        }

        function spawnEntityInstance(type, isVoid = false) {
            let placementFound = false;
            let tries = 0;
            let r = 0, c = 0;

            while (!placementFound && tries < 200) {
                r = Math.floor(Math.random() * GRID_SIZE);
                c = Math.floor(Math.random() * GRID_SIZE);
                const manhattanDist = Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c);
                
                // Spawners also verify with the global grid state layout
                if (grid[r][c] === 0 && manhattanDist >= 5 && !(r === winPos.r && c === winPos.c)) {
                    placementFound = true;
                }
                tries++;
            }

            if (type === 'shooter') {
                shootersList.push({
                    x: c + 0.5,
                    y: r + 0.5,
                    targetR: r,
                    targetC: c,
                    isVoidbound: isVoid,
                    lastShotTime: Date.now() + Math.random() * 1500,
                    moveTickAccumulator: 0
                });
            } else if (type === 'flesh') {
                fleshList.push({
                    x: c + 0.5,
                    y: r + 0.5,
                    targetR: r,
                    targetC: c,
                    moveTickAccumulator: 0
                });
            } else if (type === 'chaser') {
                chasersList.push({
                    x: c + 0.5,
                    y: r + 0.5,
                    sizeMultiplier: 1.0,
                    speedMultiplier: 1.0,
                    freezeUntil: 0 // ms timestamp
                });
            } else if (type === 'screamer') {
                screamersList.push({
                    x: c + 0.5,
                    y: r + 0.5,
                    state: 'cooldown', // 'chasing', 'warning', 'dashing', 'cooldown'
                    targetX: 0,
                    targetY: 0,
                    startX: 0,
                    startY: 0,
                    angle: 0,
                    timer: Date.now() + Math.random() * 1500,
                    isVoidbound: isVoid,
                    doubleDashDone: false,
                    hasDamagedThisCycle: false
                });

            try { if (typeof updateEnemyList === 'function') updateEnemyList(); } catch(e) {}
            }
        }

        // Runs all "stepped onto a new tile" gameplay logic. Called whenever the player's
        // logical tile (playerPos.r/c) changes due to continuous movement.
        function onPlayerEnterTile() {
            playSynthSound('move');

            // Particle trail trace
            spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#6366f1', 4);

            // Check if player stepped on infected tile
            const stepOnInfection = infectedTiles.some(t => t.r === playerPos.r && t.c === playerPos.c);
            if (stepOnInfection) {
                document.getElementById('slowdownContainer').classList.remove('hidden');
            } else {
                document.getElementById('slowdownContainer').classList.add('hidden');
            }

            // Collect coins if player moves over them (Level 10+)
            if (currentLevel >= 10) {
                const coinIndex = coinsList.findIndex(coin => coin.r === playerPos.r && coin.c === playerPos.c);
                if (coinIndex !== -1) {
                    coinsList.splice(coinIndex, 1);
                    addCoins(1);
                    let bonusCoins = 0;
                    if (activeCurses.medal_goldrush) bonusCoins += 1;
                    if (activeCurses.medal_swift) bonusCoins += 1;
                    if (activeCurses.medal_voidtide) bonusCoins += 2;
                    if (activeCurses.medal_ironhide) bonusCoins += 3;
                    if (activeCurses.medal_chaosweave) bonusCoins += 2;
                    if (bonusCoins > 0) {
                        addCoins(bonusCoins);
                        spawnFloatingText(playerPos.r, playerPos.c, `+${1 + bonusCoins} 🪙`, "#f59e0b");
                    } else {
                        spawnFloatingText(playerPos.r, playerPos.c, "+1 🪙", "#fbbf24");
                    }
                    if (activeCurses.medal_frenzy) {
                        spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#f97316', 18);
                    } else {
                        spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#fbbf24', 15);
                    }
                    playSynthSound('coin_pickup');

                    if (activeCurses.lap2) {
                        lap2CollectedThisPhase++;
                        if (lap2Phase === 1 && lap2CollectedThisPhase >= lap2TotalCoins) {
                            startLap2SecondPhase();
                        }
                        if (lap2Phase === 2 && lap2CollectedThisPhase >= lap2TotalCoins) {
                            lap2CollapseActive = false;
                        }
                    }
                }
            }

            if (activeAltar && activeAltar.pos && playerPos.r === activeAltar.pos.r && playerPos.c === activeAltar.pos.c) {
                interactWithAltar();
            }

            if (medalSpawned && medalPos && playerPos.r === medalPos.r && playerPos.c === medalPos.c) {
                medalCollected = true;
                medalSpawned = false;
                medalPos = null;
                playSynthSound('powerup');
                spawnFloatingText(playerPos.r, playerPos.c, "MEDAL SECURED", "#f59e0b");
                spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#f59e0b', 20);
            }

            // Win check
            if (playerPos.r === winPos.r && playerPos.c === winPos.c) {
                const isExitLocked = !canUseExit();
                if (!isExitLocked) {
                    handleWinLevel();
                } else {
                    screenShake = Math.max(screenShake, 3);
                    playSynthSound('tick_down');
                }
            }
        }

        // Checks whether a circle of PLAYER_RADIUS centered at (x, y) overlaps any wall tile
        function circleHitsWall(x, y) {
            const minC = Math.floor(x - PLAYER_RADIUS);
            const maxC = Math.floor(x + PLAYER_RADIUS);
            const minR = Math.floor(y - PLAYER_RADIUS);
            const maxR = Math.floor(y + PLAYER_RADIUS);

            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
                        return true; // outside map bounds counts as a wall
                    }
                    if (grid[r][c] !== 1) continue;

                    // Circle vs AABB (tile) overlap test
                    const closestX = Math.max(c, Math.min(x, c + 1));
                    const closestY = Math.max(r, Math.min(y, r + 1));
                    const dx = x - closestX;
                    const dy = y - closestY;
                    if (dx * dx + dy * dy < PLAYER_RADIUS * PLAYER_RADIUS) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Continuous free-movement update, called every frame from gameUpdateLoop
        function updatePlayerMovement(dt) {
            if (!activeLevelRunning) return;

            const now = Date.now();

            // Input delay curse effect (System Lag): briefly zero out movement input
            let inputBlocked = false;
            if (activeCurses.system_lag && Math.random() < 0.12) {
                inputBlocked = true;
            }

            let dx = 0;
            let dy = 0;
            if (!inputBlocked) {
                if (keysHeld.up) dy -= 1;
                if (keysHeld.down) dy += 1;
                if (keysHeld.left) dx -= 1;
                if (keysHeld.right) dx += 1;
            }

            if (dx === 0 && dy === 0) return;

            // Normalize diagonal movement
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            // Polarity inversion greater curse effect
            if (activeCurses.reversed_polarity && polarityInverted) {
                dx = -dx;
                dy = -dy;
            }

            // Slowdown from standing on infected tiles
            const onInfection = infectedTiles.some(t => t.r === playerPos.r && t.c === playerPos.c);
            const speedMultiplier = onInfection ? 0.45 : 1.0;

            const moveDist = (PLAYER_SPEED + (upgrades.more_speed || 0) * 0.6) * speedMultiplier * (dt / 1000);

            const prevX = playerVisualPos.x;
            const prevY = playerVisualPos.y;

            // Try moving on X and Y independently so the player can slide along walls
            const tryX = playerVisualPos.x + dx * moveDist;
            if (!circleHitsWall(tryX, playerVisualPos.y)) {
                playerVisualPos.x = tryX;
            }

            const tryY = playerVisualPos.y + dy * moveDist;
            if (!circleHitsWall(playerVisualPos.x, tryY)) {
                playerVisualPos.y = tryY;
            }

            const moved = (playerVisualPos.x !== prevX) || (playerVisualPos.y !== prevY);
            if (!moved) {
                screenShake = Math.max(screenShake, 1.5);
                return;
            }

            playerLastMovedTime = now;

            // Determine logical tile from continuous position and run tile-enter triggers if changed
            const newR = Math.floor(playerVisualPos.y);
            const newC = Math.floor(playerVisualPos.x);
            if (newR !== playerPos.r || newC !== playerPos.c) {
                playerPos.r = newR;
                playerPos.c = newC;
                onPlayerEnterTile();
            }
        }

        // Game State Transition Controllers
        function handleWinLevel() {
            activeLevelRunning = false;
            if (typeof window.stopGameplayMusic === 'function') window.stopGameplayMusic();
            playSynthSound('level_win');
            spawnGridWinParticles(winPos.r, winPos.c);

            try { if (typeof awardCoinsForWin === 'function') awardCoinsForWin(currentLevel); } catch(e) {}

            const nextLvl = currentLevel + 1;

            // Decerement restoration countdown and heal 1 health every 6 levels
            levelsUntilHeal--;
            if (levelsUntilHeal <= 0) {
                levelsUntilHeal = 2;
                if (playerHealth < maxHealth) {
                    playerHealth++;
                    healFlashTime = 300; // Trigger green healing screen tint
                    playSynthSound('heal');
                    spawnFloatingText(playerPos.r, playerPos.c, "+1 ❤️ CORE SYNCED", "#10b981");
                    spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#10b981', 25);
                }
            }

            // Check if there is an incoming progression mutation event
            const hasProgression = (nextLvl === 15 && !level15ProgressionActive) || (nextLvl === 20 && !level20ProgressionActive) || (nextLvl > 1 && nextLvl % 8 === 0);

            // Flow configuration to run selection intermissions or initialize level directly
            const proceedToIntermission = () => {
                if (typeof window.playIntermissionMusic === 'function') window.playIntermissionMusic(nextLvl);

                // Build the list of intermission steps that apply this round, in display order
                const queue = [];
                
                if (isEnemyChoiceLevel(nextLvl)) {
                    queue.push((lvl, next) => showEnemyChoiceModal(lvl, next));
                }
                if (isCurseChoiceLevel(nextLvl)) {
                    queue.push((lvl, next) => showCurseChoiceModal(lvl, false, next));
                }
                if (nextLvl % 5 === 0 && nextLvl > 1 && nextLvl < 1000 && typeof showUpgradeModal === 'function') {
                    queue.push((lvl, next) => showUpgradeModal(lvl, next));
                }

                const runQueue = (lvl, steps, i) => {
                    if (i >= steps.length) {
                        setTimeout(() => initNewLevel(lvl), 500);
                        return;
                    }
                    setTimeout(() => steps[i](lvl, () => runQueue(lvl, steps, i + 1)), 400);
                };

                if (queue.length === 0) {
                    setTimeout(() => initNewLevel(nextLvl), 500);
                } else {
                    runQueue(nextLvl, queue, 0);
                }
            };

            if (hasProgression) {
                // Halt loading flow, present evolution parameters, then proceed when dismissed
                setTimeout(() => showProgressionIntermissionModal(nextLvl, proceedToIntermission), 600);
            } else {
                proceedToIntermission();
            }
        }

        function canUseExit() {
            if (activeCurses.lap2) {
                if (lap2TotalCoins <= 0) return true;
                // Phase 1: must collect ALL original coins before lap2 phase 2 even begins
                if (lap2Phase === 1) return false;
                // Phase 2: must collect at least 40% of the recollected lap2 coins
                return lap2CollectedThisPhase >= Math.ceil(lap2TotalCoins * 0.4);
            }
            return coinsList.length === 0;
        }

        function startLap2SecondPhase() {
            lap2Phase = 2;
            lap2CollectedThisPhase = 0;
            lap2CollapseActive = true;
            lap2CollapseTimer = Date.now() + 1200;
            const coinPositions = [];
            const spawnable = getAllReachableTiles(grid, playerPos, GRID_SIZE)
                .filter(tile => tile.r !== playerPos.r || tile.c !== playerPos.c)
                .filter(tile => tile.r !== winPos.r || tile.c !== winPos.c)
                .filter(tile => !coinsList.some(c => c.r === tile.r && c.c === tile.c));
            while (coinPositions.length < lap2TotalCoins && spawnable.length > 0) {
                const idx = Math.floor(Math.random() * spawnable.length);
                coinPositions.push({ r: spawnable[idx].r, c: spawnable[idx].c });
                spawnable.splice(idx, 1);
            }
            coinsList = coinPositions;
            spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#8b5cf6', 30);
            spawnFloatingText(playerPos.r, playerPos.c, "LAP 2: RECOLLECT THE COINS", "#a855f7");
        }

        function updateLap2Collapse() {
            if (!lap2CollapseActive || !activeCurses.lap2) return;
            const now = Date.now();
            if (now < lap2CollapseTimer) return;
            lap2CollapseTimer = now + Math.max(1000, 1800 - currentLevel * 10);
            const openTiles = getAllReachableTiles(grid, playerPos, GRID_SIZE)
                .filter(tile => tile.r !== playerPos.r || tile.c !== playerPos.c)
                .filter(tile => tile.r !== winPos.r || tile.c !== winPos.c)
                .filter(tile => !coinsList.some(c => c.r === tile.r && c.c === tile.c));
            if (openTiles.length === 0) return;
            const choice = openTiles[Math.floor(Math.random() * openTiles.length)];
            grid[choice.r][choice.c] = 1;
            spawnImpactParticles(choice.c + 0.5, choice.r + 0.5, '#f43f5e', 20);
            spawnFloatingText(choice.r, choice.c, "MAP COLLAPSE", "#f87171");
        }

        function interactWithAltar() {
    if (!activeAltar || !activeAltar.pos || activeAltar.interacted) return;
    activeAltar.interacted = true;
    
    if (activeAltar.type === 'purification') {
        spawnFloatingText(playerPos.r, playerPos.c, "PURIFICATION SIGNAL", "#34d399");
        playSynthSound('heal');
    } else {
        spawnFloatingText(playerPos.r, playerPos.c, "PURGATORY AMBUSH!", "#ef4444");
        playSynthSound('hit');
        screenShake = 15; // Give it some impact

        // 1. Build a pool of enemies currently active in your run
        let eligiblePool = [];
        if (typeof selectedEnemies !== 'undefined') {
            for (let [enemyName, count] of Object.entries(selectedEnemies)) {
                if (count > 0) {
                    // Match your specific spawner types
                    if (enemyName.includes('shooter')) eligiblePool.push('shooter');
                    if (enemyName === 'flesh') eligiblePool.push('flesh');
                    if (enemyName === 'chaser') eligiblePool.push('chaser');
                    if (enemyName.includes('screamer')) eligiblePool.push('screamer');
                }
            }
        }
        
        // Fallback if they haven't drafted anything yet
        if (eligiblePool.length === 0) eligiblePool.push('chaser');

        // 2. Trigger the Purgatory Ambush (Spawns 7 to 10 enemies)
        let ambushCount = Math.floor(Math.random() * 4) + 7;
        for (let i = 0; i < ambushCount; i++) {
            let randomType = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
            // Let your engine handle finding safe coordinates and adding them to the right lists
            if (typeof spawnEntityInstance === 'function') {
                spawnEntityInstance(randomType);
            }
        }
    }
    
    try { if (typeof updateAltarUI === 'function') updateAltarUI(); } catch(e) {}
}

        // Action penalty for violating Red Light/Green Light Halt Checks
        function penalityFreezeCheck() {
            playSynthSound('hit');
            screenShake = 16;
            damagePlayer(1);
        }

        function damagePlayer(amt = 1) {
            if (!activeLevelRunning) return;
            if (activeCurses.medal_ironhide) amt += 1;
            playerHealth -= amt;
            screenShake = 15;
            damageFlashTime = 200; // Bright crimson glitch overlay
            playSynthSound('hit');
            updateHealthUI();

            spawnFloatingText(playerPos.r, playerPos.c, "CORE DAMAGE", "#ef4444");
            spawnImpactParticles(playerPos.c + 0.5, playerPos.r + 0.5, '#ef4444', 25);

            if (playerHealth <= 0) {
                handleGameOver();
            }
        }

        function handleGameOver() {
            activeLevelRunning = false;
            if (typeof window.stopGameplayMusic === 'function') window.stopGameplayMusic();
            try { playerMoney = 0; upgrades = { more_money: 0, shield: 0, coin_radar: 0 }; activeAltar = null; lastPurificationLevel = -999; } catch(e) {}
            try { if (typeof updateMoneyUI === 'function') updateMoneyUI(); } catch(e) {}
            try { if (typeof updateAltarUI === 'function') updateAltarUI(); } catch(e) {}
            document.getElementById('finalScoreDisplay').textContent = `REACHED SYSTEM LEVEL: ${currentLevel}`;
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }

        function restartFullGame() {
            currentLevel = 1;
            playerHealth = maxHealth;
            try { playerMoney = 0; upgrades = { more_money: 0, shield: 0, coin_radar: 0 }; activeAltar = null; lastPurificationLevel = -999; } catch(e) {}
            try { if (typeof updateMoneyUI === 'function') updateMoneyUI(); } catch(e) {}
            try { if (typeof updateAltarUI === 'function') updateAltarUI(); } catch(e) {}
            levelsUntilHeal = 6;
            GRID_SIZE = 10;
            lastChosenEnemyId = null;
            level15ProgressionActive = false;
            level20ProgressionActive = false;
            selectedEnemies = { shooter: 0, voidbound_shooter: 0, voidbound_screamer: 0, bomboclat: 0, voidbound_bomboclat: 0, feurougefeuvert: 0, train: 0, voidbound_train: 0, flesh: 0, chaser: 0, screamer: 0 };
            activeCurses = {
                shooter_faster: false,
                shooter_triple: false,
                shooter_line: false,
                bomb_faster: false,
                bomb_bigger: false,
                greenlight_harder: false,
                chaser_boost: 0,
                train_both_ways: false,
                chaser_center_merge: false,
                system_lag: false,
                ui_static: false,
                drift_sensors: false,
                chrono_decay: false,
                apocalypse_barrage: false,
                doomsday_charge: false,
                overload_protocol: false,
                train_8_directions: false,
                greenlight_voidbound: false,
                screamer_double_dash: false,
                screamer_faster: 0,
                medal_goldrush: false,
                medal_barrage: false,
                medal_frenzy: false,
                medal_overcharge: false,
                medal_swift: false,
                medal_voidtide: false,
                medal_ironhide: false,
                medal_chaosweave: false,
                lap2: false,
                reversed_polarity: false,
                port_shift: false
            };
            
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('victoryScreen').classList.add('hidden');
            document.getElementById('chronoTimerContainer').classList.add('hidden');
            document.getElementById('slowdownContainer').classList.add('hidden');
            document.getElementById('polarityContainer').classList.add('hidden');
            document.getElementById('progressionModal').classList.add('hidden');
            
            showEnemyChoiceModal(1);
        }

        // Selection Menu Generator Helpers
        function showEnemyChoiceModal(targetLvl, onComplete) {
            const modal = document.getElementById('choiceModal');
            const title = document.getElementById('modalTitle');
            const sub = document.getElementById('modalSub');
            const container = document.getElementById('choiceContainer');

            title.textContent = `LEVEL ${targetLvl}: ADD HOSTILE`;
            sub.textContent = "Your core memory has expanded. Choose a computer hostile to allocate in this branch.";
            container.innerHTML = '';

            const enemyOptions = [
                {
                    id: 'shooter',
                    name: 'CHIP SHOOTER',
                    desc: 'Spawns far away and moves smoothly. Fires regular energy bullets.',
                    icon: '🔴',
                    color: 'border-rose-500/50 hover:bg-rose-950/20 text-rose-300',
                    unlocked: true,
                    countDisplay: `COUNT: ${selectedEnemies.shooter} (Max: ∞)`
                },
                {
                    id: 'voidbound_shooter',
                    name: 'VOIDBOUND SHOOTER',
                    desc: 'Spawns at standalone capacity. Shoots 5x more bullets and fires 2x faster.',
                    icon: '🟣',
                    color: 'border-purple-500/70 hover:bg-purple-950/30 text-purple-300',
                    unlocked: (selectedEnemies.shooter >= 3 && selectedEnemies.voidbound_shooter < 1),
                    countDisplay: `COUNT: ${selectedEnemies.voidbound_shooter}/1 (Max: 1)`
                },
                {
                    id: 'bomboclat',
                    name: 'BOMBOCLAT EXPLOSIVE',
                    desc: 'Plants coordinate-tracked bombs. More copies drafted = spawns faster. Limit: 3 Max.',
                    icon: '💣',
                    color: 'border-amber-500/50 hover:bg-amber-950/20 text-amber-300',
                    unlocked: (selectedEnemies.bomboclat < 3),
                    countDisplay: `COUNT: ${selectedEnemies.bomboclat}/3 (Max: 3)`
                },
                {
                    id: 'voidbound_bomboclat',
                    name: 'VOIDBOUND BOMBOCLAT',
                    desc: 'A voidbound bomb: larger 13x13 blast and 5s fuse. Unlocks after 3 Bomboclat taken. Max: 1.',
                    icon: '💥',
                    color: 'border-amber-700/60 hover:bg-amber-950/30 text-amber-300',
                    unlocked: (selectedEnemies.bomboclat >= 3 && (selectedEnemies.voidbound_bomboclat || 0) < 1),
                    countDisplay: `COUNT: ${selectedEnemies.voidbound_bomboclat || 0}/1 (Max: 1)`
                },
                {
                    id: 'chaser',
                    name: 'MAGNETIC CHASER',
                    desc: 'Ultra-swift blue hostile (0.4 tiles/s). Fuses with close chasers to expand scale and velocity. Limit: 10 Max.',
                    icon: '🔵',
                    color: 'border-sky-500/50 hover:bg-sky-950/20 text-sky-300',
                    unlocked: (selectedEnemies.chaser < 10),
                    countDisplay: `COUNT: ${selectedEnemies.chaser}/10 (Max: 10)`
                },
                {
                    id: 'screamer',
                    name: 'SCREAMER GHOST',
                    desc: 'Spectre locked at Level 10+. Locks target vector, warns for 1.0s, then dashes 12 tiles in 0.5s. Limit: 4 Max.',
                    icon: '😱',
                    color: 'border-fuchsia-500/50 hover:bg-fuchsia-950/20 text-fuchsia-300',
                    unlocked: (targetLvl >= 10 && selectedEnemies.screamer < 4),
                    countDisplay: `COUNT: ${selectedEnemies.screamer}/4 (Max: 4)`
                },
                {
                    id: 'voidbound_screamer',
                    name: 'VOIDBOUND SCREAMER',
                    desc: 'A voidbound variant: 100% faster dash. Unlocks after 2 Screamers taken. Max: 2.',
                    icon: '🟣',
                    color: 'border-fuchsia-700/60 hover:bg-fuchsia-950/30 text-fuchsia-300',
                    unlocked: (selectedEnemies.screamer >= 2 && (selectedEnemies.voidbound_screamer || 0) < 2),
                    countDisplay: `COUNT: ${selectedEnemies.voidbound_screamer || 0}/2 (Max: 2)`
                },
                {
                    id: 'feurougefeuvert',
                    name: 'SYSTEM FREEZE CHECK',
                    desc: 'Triggers server sync checks. Limit of 1. Halt complete movement for only 0.25s.',
                    icon: '🚥',
                    color: 'border-emerald-500/50 hover:bg-emerald-950/20 text-emerald-300',
                    unlocked: (selectedEnemies.feurougefeuvert < 1), // Strictly capped to 1 select maximum
                    countDisplay: `COUNT: ${selectedEnemies.feurougefeuvert}/1 (Max: 1)`
                },
                {
                    id: 'train',
                    name: 'HYPERSONIC TRAIN',
                    desc: 'Targets a massive 3-tile wide column or row. Explodes after 2.5s. Limit: 2 Max.',
                    icon: '🚄',
                    color: 'border-cyan-500/50 hover:bg-cyan-950/20 text-cyan-300',
                    unlocked: (targetLvl >= 5 && selectedEnemies.train < 2),
                    countDisplay: `COUNT: ${selectedEnemies.train}/2 (Max: 2)`
                },
                {
                    id: 'voidbound_train',
                    name: 'VOIDBOUND TRAIN',
                    desc: 'Spawns at standalone capacity. Massive 5-tile thick rail strikes running in all 8 directions with 20% faster fuse.',
                    icon: '💜',
                    color: 'border-fuchsia-500/60 hover:bg-fuchsia-950/30 text-fuchsia-300',
                    unlocked: (targetLvl >= 10 && selectedEnemies.train >= 1 && selectedEnemies.voidbound_train < 1), // Unlocked starting at lvl 10 and after 1 train taken, max 1
                    countDisplay: `COUNT: ${selectedEnemies.voidbound_train}/1 (Max: 1)`
                },
                {
                    id: 'flesh',
                    name: 'CRIMSON FLESH MATRIX',
                    desc: 'Red virus node that crawls smoothly, spawning infection tracks. Limit: 3 Max.',
                    icon: '👾',
                    color: 'border-red-500/50 hover:bg-red-950/20 text-red-400',
                    unlocked: (targetLvl >= 5 && selectedEnemies.flesh < 3),
                    countDisplay: `COUNT: ${selectedEnemies.flesh}/3 (Max: 3)`
                }
            ];

            // 1. Filter out unlocked cards
            const unlockedOptions = enemyOptions.filter(opt => opt.unlocked);

            // 2. Filter out lastChosenEnemyId (Cannot draft the same hostile back-to-back)
            let finalOptions = unlockedOptions.filter(opt => opt.id !== lastChosenEnemyId);

            // 3. Fallback check: If locking out lastChosenEnemyId leaves less than 3 choices, we ignore the rule.
            if (finalOptions.length < 3) {
                finalOptions = unlockedOptions;
            }

            // Shuffle and select exactly 3
            const randomizedThree = finalOptions.sort(() => 0.5 - Math.random()).slice(0, 3);

            randomizedThree.forEach(opt => {
                const card = document.createElement('button');
                card.className = `w-full text-left p-3 rounded-lg border bg-slate-900 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-start gap-3 ${opt.color}`;
                const displayName = opt.id.replace(/_/g, ' ').toUpperCase();
                card.innerHTML = `
                    <span class="text-2xl mt-1">${opt.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-sm pixel-font flex justify-between items-center">
                            <span>${displayName}</span>
                            <span class="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">${opt.countDisplay}</span>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-1 leading-normal">${opt.desc}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    selectedEnemies[opt.id]++;
                    lastChosenEnemyId = opt.id;
                    modal.classList.add('hidden');
                    if (onComplete) onComplete(); else initNewLevel(targetLvl);
                });
                container.appendChild(card);
            });

            modal.classList.remove('hidden');
        }

        function showCurseCategoryModal(targetLvl, onComplete) {
            const modal = document.getElementById('choiceModal');
            const title = document.getElementById('modalTitle');
            const sub = document.getElementById('modalSub');
            const container = document.getElementById('choiceContainer');

            title.textContent = `LEVEL ${targetLvl}: THE MEDAL CHOICE`;
            sub.textContent = "You recovered a forbidden medal. Choose between an empowered curse or the standard curse path.";
            container.innerHTML = '';

            const options = [
                {
                    id: 'normal',
                    name: 'STANDARD CURSES',
                    desc: 'Proceed with the normal curse selection list. The medal waits no longer.',
                    icon: '⚙️',
                    color: 'border-slate-500 hover:bg-slate-950/30 text-slate-300 border-2'
                },
                {
                    id: 'medal',
                    name: 'MEDAL CURSES',
                    desc: 'Use the medal to activate a riskier curse with bonus coin rewards and increased hostility intensity.',
                    icon: '★',
                    color: 'border-amber-500 hover:bg-amber-950/30 text-amber-300 border-2'
                }
            ];

            options.forEach(choice => {
                const card = document.createElement('button');
                card.className = `w-full text-left p-3 rounded-lg border bg-slate-900 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-start gap-3 ${choice.color}`;
                card.innerHTML = `
                    <span class="text-2xl mt-1">${choice.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-sm pixel-font">${choice.name}</div>
                        <p class="text-[11px] text-slate-400 mt-1 leading-normal">${choice.desc}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    medalConsumed = true;
                    if (choice.id === 'normal') {
                        medalCollected = false;
                        modal.classList.add('hidden');
                        showCurseChoiceModal(targetLvl, true, onComplete);
                    } else {
                        modal.classList.add('hidden');
                        showMedalCurseChoiceModal(targetLvl, onComplete);
                    }
                });
                container.appendChild(card);
            });

            modal.classList.remove('hidden');
        }

        function showMedalCurseChoiceModal(targetLvl, onComplete) {
            const modal = document.getElementById('choiceModal');
            const title = document.getElementById('modalTitle');
            const sub = document.getElementById('modalSub');
            const container = document.getElementById('choiceContainer');

            title.textContent = `LEVEL ${targetLvl}: MEDAL CURSE`;
            sub.textContent = "Choose one medal-enhanced curse. Each offers extra reward but sharply raises battlefield danger.";
            container.innerHTML = '';

            const medalCurses = [
                {
                    id: 'medal_goldrush',
                    name: 'GOLDEN RUSH',
                    desc: 'Coins are worth more and picked-up coins yield additional credit. Trains and chasers become more aggressive.',
                    icon: '🪙',
                    color: 'border-amber-500 hover:bg-amber-950/30 text-amber-300 border-2'
                },
                {
                    id: 'medal_barrage',
                    name: 'BARRAGE CODE',
                    desc: 'Shooter fire speeds increase dramatically. Projectiles and trains spawn with greater intensity.',
                    icon: '🔥',
                    color: 'border-red-500 hover:bg-red-950/30 text-red-300 border-2'
                },
                {
                    id: 'medal_frenzy',
                    name: 'FRENZY MATRIX',
                    desc: 'Chasers sprint faster and alarm systems are accelerated. Coins grant bonus rewards to offset the mayhem.',
                    icon: '⚡',
                    color: 'border-fuchsia-500 hover:bg-fuchsia-950/30 text-fuchsia-300 border-2'
                },
                {
                    id: 'medal_overcharge',
                    name: 'OVERCHARGE CORE',
                    desc: 'Bomboclat explosions are bigger and detonate faster. Coins yield additional credit.',
                    icon: '💣',
                    color: 'border-orange-500 hover:bg-orange-950/30 text-orange-300 border-2'
                },
                {
                    id: 'medal_swift',
                    name: 'SWIFT PURSUIT',
                    desc: 'Chasers and Screamers move and dash noticeably faster. Coins grant bonus rewards.',
                    icon: '🏃',
                    color: 'border-sky-500 hover:bg-sky-950/30 text-sky-300 border-2'
                },
                {
                    id: 'medal_voidtide',
                    name: 'VOID TIDE',
                    desc: 'Red Light/Green Light events trigger more often and give less reaction time. Coins yield large bonus credit.',
                    icon: '🌊',
                    color: 'border-teal-500 hover:bg-teal-950/30 text-teal-300 border-2'
                },
                {
                    id: 'medal_ironhide',
                    name: 'IRONHIDE PROTOCOL',
                    desc: 'All damage taken is increased by +1. Coins yield substantial bonus credit to compensate.',
                    icon: '🩸',
                    color: 'border-rose-500 hover:bg-rose-950/30 text-rose-300 border-2'
                },
                {
                    id: 'medal_chaosweave',
                    name: 'CHAOS WEAVE',
                    desc: 'Shooters and trains fire/spawn more frequently and screen static intensifies. Coins yield bonus credit.',
                    icon: '🌀',
                    color: 'border-violet-500 hover:bg-violet-950/30 text-violet-300 border-2'
                }
            ];

            medalCurses.forEach(curse => {
                const card = document.createElement('button');
                card.className = `w-full text-left p-3 rounded-lg border bg-slate-900 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-start gap-3 ${curse.color}`;
                card.innerHTML = `
                    <span class="text-2xl mt-1">${curse.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-sm pixel-font">${curse.name}</div>
                        <p class="text-[11px] text-slate-400 mt-1 leading-normal">${curse.desc}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    activeCurses[curse.id] = true;
                    medalCollected = false;
                    medalConsumed = true;
                    modal.classList.add('hidden');
                    if (onComplete) onComplete(); else initNewLevel(targetLvl);
                });
                container.appendChild(card);
            });

            modal.classList.remove('hidden');
        }

        function showPurificationChoiceModal(targetLvl, onComplete) {
            const modal = document.getElementById('choiceModal');
            const title = document.getElementById('modalTitle');
            const sub = document.getElementById('modalSub');
            const container = document.getElementById('choiceContainer');

            const cost = Math.max(5, Math.floor(currentLevel * 1.2));
            title.textContent = `LEVEL ${targetLvl}: PURIFICATION RITE`;
            sub.textContent = `You are granted one chance to purify an active curse for ${cost} credits. You may go into debt.`;
            container.innerHTML = '';

            const cursesToPurge = Object.keys(activeCurses).filter(key => {
                return activeCurses[key] && key !== 'lap2' && !key.startsWith('medal_');
            });

            if (cursesToPurge.length === 0) {
                const card = document.createElement('button');
                card.className = 'w-full text-left p-3 rounded-lg border bg-slate-900 transition-all hover:bg-slate-950/30';
                card.innerHTML = `
                    <div class="font-bold text-sm pixel-font">NO CURSES TO PURIFY</div>
                    <p class="text-[11px] text-slate-400 mt-1">Your purification relic cannot act without an existing active curse.</p>
                `;
                card.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    showCurseChoiceModal(targetLvl, false, onComplete);
                });
                container.appendChild(card);
            } else {
                cursesToPurge.forEach(curseKey => {
                    const label = curseKey === 'chaser_boost'
                        ? `MAGNETIC SYNTHESIS STACK (${activeCurses.chaser_boost})`
                        : curseKey.replace(/_/g, ' ').toUpperCase();

                    const card = document.createElement('button');
                    card.className = 'w-full text-left p-3 rounded-lg border bg-slate-900 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-start gap-3 border-slate-500';
                    card.innerHTML = `
                        <div class="flex-1">
                            <div class="font-bold text-sm pixel-font">${label}</div>
                            <p class="text-[11px] text-slate-400 mt-1">Pay ${cost} credits to remove this curse.</p>
                        </div>
                    `;
                    card.addEventListener('click', () => {
                        playerMoney -= cost;
                        updateMoneyUI();
                        if (curseKey === 'chaser_boost') {
                            activeCurses.chaser_boost = Math.max(0, activeCurses.chaser_boost - 1);
                        } else {
                            activeCurses[curseKey] = false;
                        }
                        activeAltar.purified = true;
                        modal.classList.add('hidden');
                        showCurseChoiceModal(targetLvl, false, onComplete);
                    });
                    container.appendChild(card);
                });
            }

            modal.classList.remove('hidden');
        }

        function showCurseChoiceModal(targetLvl, forceNormal = false, onComplete) {
            if (activeAltar && activeAltar.type === 'purification' && activeAltar.interacted && !activeAltar.purified) {
                showPurificationChoiceModal(targetLvl, onComplete);
                return;
            }
            if (medalCollected && !medalConsumed && !forceNormal) {
                showCurseCategoryModal(targetLvl, onComplete);
                return;
            }

            medalConsumed = true;
            medalCollected = false;

            const modal = document.getElementById('choiceModal');
            const title = document.getElementById('modalTitle');
            const sub = document.getElementById('modalSub');
            const container = document.getElementById('choiceContainer');

            const isGreater = (targetLvl > 25 && targetLvl % 5 === 0) || targetLvl % 15 === 0 ;

            title.textContent = isGreater ? `LEVEL ${targetLvl}: GREATER CURSE` : `LEVEL ${targetLvl}: CHOOSE A CURSE`;
            sub.textContent = isGreater 
                ? "WARNING: Extreme mainframe collapse. You must choose a highly challenging Greater Curse." 
                : "Select one system curse modification to apply to the active hostiles.";
            container.innerHTML = '';

            let pool = [];

            if (isGreater) {
                // Greater Curse List:
                if (!activeCurses.chrono_decay) {
                    pool.push({
                        id: 'chrono_decay',
                        name: '⏳ CHRONO DECAY',
                        desc: 'GREATER CURSE: Imposes a strict level countdown timer. If it expires, health decays continuously.',
                        icon: '⏳',
                        color: 'border-red-500 hover:bg-red-950/30 text-red-300 border-2'
                    });
                }
                if ((selectedEnemies.shooter > 0 || selectedEnemies.voidbound_shooter > 0) && !activeCurses.apocalypse_barrage) {
                    pool.push({
                        id: 'apocalypse_barrage',
                        name: '🔥 APOCALYPSE BARRAGE',
                        desc: 'GREATER CURSE: Shooters and Voidbound variants fire continuous, high-speed 5-directional starlight waves.',
                        icon: '🔥',
                        color: 'border-purple-500 hover:bg-purple-950/30 text-purple-300 border-2'
                    });
                }
                if (selectedEnemies.bomboclat > 0 && !activeCurses.doomsday_charge) {
                    pool.push({
                        id: 'doomsday_charge',
                        name: '💣 DOOMSDAY CHARGE',
                        desc: 'GREATER CURSE: Bombs trigger with ultra-fast 0.75 second fuses and a massive 9x9 detonation zone.',
                        icon: '💣',
                        color: 'border-amber-500 hover:bg-amber-950/30 text-amber-300 border-2'
                    });
                }
                if (selectedEnemies.screamer > 0 && !activeCurses.screamer_double_dash) {
                    pool.push({
                        id: 'screamer_double_dash',
                        name: '😱 ECHO SCREAM',
                        desc: 'GREATER CURSE: Screamers double-dash back-to-back, leaving almost zero recovery window.',
                        icon: '😱',
                        color: 'border-fuchsia-600 hover:bg-fuchsia-950/30 text-fuchsia-400 border-2'
                    });
                }
                if (selectedEnemies.feurougefeuvert > 0 && !activeCurses.greenlight_voidbound) {
                    pool.push({
                        id: 'greenlight_voidbound',
                        name: '🚥 VOIDBOUND SYNC CHECK',
                        desc: 'GREATER CURSE: Feurougefeuvert goes Voidbound! Stand completely still for 0.35s within a 2s limit, three consecutive times.',
                        icon: '🚥',
                        color: 'border-purple-600 hover:bg-purple-950/30 text-purple-400 border-2'
                    });
                }
                if ((selectedEnemies.train > 0 || selectedEnemies.voidbound_train > 0) && !activeCurses.train_8_directions) {
                    pool.push({
                        id: 'train_8_directions',
                        name: '🚄 8-WAY RAILWAY',
                        desc: 'GREATER CURSE: Hypersonic Train laser warning and strikes can now spawn diagonally, running in 8 directions.',
                        icon: '🚄',
                        color: 'border-cyan-600 hover:bg-cyan-950/30 text-cyan-400 border-2'
                    });
                }
                if (selectedEnemies.feurougefeuvert > 0 && !activeCurses.overload_protocol) {
                    pool.push({
                        id: 'overload_protocol',
                        name: '🚥 OVERLOAD PROTOCOL',
                        desc: 'GREATER CURSE: Standard freeze checks trigger twice as often and demand 1.50 seconds of absolute stillness.',
                        icon: '🚥',
                        color: 'border-emerald-500 hover:bg-emerald-950/30 text-emerald-300 border-2'
                    });
                }

                // BACKFILL Generic Greater Curses to guarantee exactly 3 choices
                const genericGreaterCurses = [
                    {
                        id: 'reversed_polarity',
                        name: '🌀 POLARITY INVERSION',
                        desc: 'GREATER CURSE: Server protocols invert. Controls reverse direction periodically every 10 seconds.',
                        icon: '🌀',
                        color: 'border-indigo-500 hover:bg-indigo-950/30 text-indigo-300 border-2'
                    },
                    {
                        id: 'port_shift',
                        name: '🌐 EXIT PORT MIGRATION',
                        desc: 'GREATER CURSE: Port unstable. The green exit portal shifts coordinates to a new verified spot every 15s.',
                        icon: '🌐',
                        color: 'border-teal-500 hover:bg-teal-950/30 text-teal-300 border-2'
                    }
                ];

                genericGreaterCurses.forEach(gc => {
                    if (!activeCurses[gc.id]) {
                        pool.push(gc);
                    }
                });

            } else {
                // Normal Curses (Cannot stack except Chaser_Boost which is tracked up to 2)
                if (selectedEnemies.chaser > 0 && activeCurses.chaser_boost < 2) {
                    pool.push({
                        id: 'chaser_boost',
                        name: 'MAGNETIC SYNTHESIS',
                        desc: `Makes Chasers bigger (+15%) and faster (+20%). Stack count: ${activeCurses.chaser_boost}/2.`,
                        icon: '🔵',
                        color: 'border-sky-500/40 hover:bg-sky-950/20 text-sky-300'
                    });
                }
                if (selectedEnemies.chaser > 0 && !activeCurses.chaser_center_merge) {
                    pool.push({
                        id: 'chaser_center_merge',
                        name: '🌀 CENTRAL COALESCENCE',
                        desc: 'Chasers first path straight to the absolute center coordinate of the grid to synthesize together.',
                        icon: '🌀',
                        color: 'border-sky-500/40 hover:bg-sky-950/20 text-sky-300'
                    });
                }
                if ((selectedEnemies.train > 0 || selectedEnemies.voidbound_train > 0) && !activeCurses.train_both_ways) {
                    pool.push({
                        id: 'train_both_ways',
                        name: '🚄 DUAL CROSSING',
                        desc: 'Hypersonic Trains now strike in both row and column directions crossing at the warning index.',
                        icon: '🚄',
                        color: 'border-cyan-500/40 hover:bg-cyan-950/20 text-cyan-300'
                    });
                }

                if (selectedEnemies.shooter > 0 || selectedEnemies.voidbound_shooter > 0) {
                    if (!activeCurses.shooter_faster) {
                        pool.push({
                            id: 'shooter_faster',
                            name: 'RAPID CORRUPTION',
                            desc: 'Weapon fire rates doubled. Shooters release projectiles twice as fast.',
                            icon: '⚡',
                            color: 'border-rose-500/40 hover:bg-rose-950/20 text-rose-300'
                        });
                    }
                    if (!activeCurses.shooter_triple) {
                        pool.push({
                            id: 'shooter_triple',
                            name: 'TRIPLE VECTOR SPREAD',
                            desc: 'Fires 3 projectile spread lines on attack cycles.',
                            icon: '🔱',
                            color: 'border-rose-500/40 hover:bg-rose-950/20 text-rose-300'
                        });
                    }
                    if (!activeCurses.shooter_line) {
                        pool.push({
                            id: 'shooter_line',
                            name: 'LINE BARRAGE CURSE',
                            desc: 'Fires rapid vertical lines of bullets (Max 5 line bursts).',
                            icon: '🔥',
                            color: 'border-rose-500/40 hover:bg-rose-950/20 text-rose-300'
                        });
                    }
                }

                if (selectedEnemies.bomboclat > 0) {
                    if (!activeCurses.bomb_faster) {
                        pool.push({
                            id: 'bomb_faster',
                            name: 'SHORT COOLDOWN FUSE',
                            desc: 'Explosive warning reduced to 1.1s.',
                            icon: '⌛',
                            color: 'border-amber-500/40 hover:bg-amber-950/20 text-amber-300'
                        });
                    }
                    if (!activeCurses.bomb_bigger) {
                        pool.push({
                            id: 'bomb_bigger',
                            name: 'THERMAL EXTREME RANGE',
                            desc: 'Increases bomb blast radius to a wider 7x7 grid.',
                            icon: '💥',
                            color: 'border-orange-500/40 hover:bg-orange-950/20 text-orange-400'
                        });
                    }
                }

                if (targetLvl >= 10 && !activeCurses.lap2) {
                    pool.push({
                        id: 'lap2',
                        name: 'LAP 2 RECOLLECTION',
                        desc: 'Collect all coins once, then recollect them in a collapsing map. Exit unlocks after 40% collected.',
                        icon: '🌪️',
                        color: 'border-violet-500/40 hover:bg-violet-950/20 text-violet-300'
                    });
                }

                if (selectedEnemies.feurougefeuvert > 0) {
                    if (!activeCurses.greenlight_harder) {
                        pool.push({
                            id: 'greenlight_harder',
                            name: 'SHATTERED REFLEXES',
                            desc: 'Reduces reaction window time down to 2.2 seconds.',
                            icon: '⚠️',
                            color: 'border-emerald-500/40 hover:bg-emerald-950/20 text-emerald-300'
                        });
                    }
                }

                if (selectedEnemies.screamer > 0 && (activeCurses.screamer_faster || 0) < 2) {
                    pool.push({
                        id: 'screamer_faster',
                        name: '😈 FRENZIED SCREAM',
                        desc: `Screamers dash 75% faster per stack. Stack: ${(activeCurses.screamer_faster||0)}/2`,
                        icon: '😈',
                        color: 'border-fuchsia-500/40 hover:bg-fuchsia-950/20 text-fuchsia-300'
                    });
                }

                // BACKFILL Generic Normal Curses to guarantee exactly 3 choices
                const genericNormalCurses = [
                    {
                        id: 'system_lag',
                        name: 'SYSTEM DRIFT JITTER',
                        desc: 'Packet loss. Your engine has a 12% chance to induce minor input delay spikes.',
                        icon: '📡',
                        color: 'border-blue-500/40 hover:bg-blue-950/20 text-blue-300'
                    },
                    {
                        id: 'ui_static',
                        name: 'TERMINAL STATIC',
                        desc: 'Mainframe interference. Visual glitch lines scan across your navigation viewport.',
                        icon: '📺',
                        color: 'border-pink-500/40 hover:bg-pink-950/20 text-pink-300'
                    },
                    {
                        id: 'drift_sensors',
                        name: 'DRIFTING MATRIX',
                        desc: 'Matrix misalignment. Your viewport slightly drifts back and forth dynamically.',
                        icon: '🌀',
                        color: 'border-indigo-500/40 hover:bg-indigo-950/20 text-indigo-300'
                    }
                ];

                genericNormalCurses.forEach(nc => {
                    if (!activeCurses[nc.id] && nc.id !== 'chaser_boost') {
                        pool.push(nc);
                    }
                });
            }

            // Shuffle pool and select exactly 3
            const selectedThree = pool.sort(() => 0.5 - Math.random()).slice(0, 3);

                selectedThree.forEach(curse => {
                const card = document.createElement('button');
                card.className = `w-full text-left p-3 rounded-lg border bg-slate-900 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-start gap-3 ${curse.color}`;
                card.innerHTML = `
                    <span class="text-2xl mt-1">${curse.icon}</span>
                    <div class="flex-1">
                        <div class="font-bold text-sm pixel-font">${curse.name}</div>
                        <p class="text-[11px] text-slate-400 mt-1 leading-normal">${curse.desc}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    if (curse.id === 'chaser_boost') {
                        activeCurses.chaser_boost = Math.min(2, (activeCurses.chaser_boost||0) + 1);
                    } else if (curse.id === 'screamer_faster') {
                        activeCurses.screamer_faster = Math.min(2, (activeCurses.screamer_faster||0) + 1);
                    } else {
                        activeCurses[curse.id] = true;
                    }
                    modal.classList.add('hidden');
                    if (onComplete) onComplete(); else initNewLevel(targetLvl);
                });
                container.appendChild(card);
            });

            modal.classList.remove('hidden');
        }

        // Live HUD UI Updates
        function updateHealthUI() {
            const hContainer = document.getElementById('healthDisplay');
            hContainer.innerHTML = '';
            for (let i = 0; i < maxHealth; i++) {
                if (i < playerHealth) {
                    hContainer.innerHTML += '❤️ ';
                } else {
                    hContainer.innerHTML += '🖤 ';
                }
            }

            // Update heal countdown banner text
            document.getElementById('healCountdownDisplay').textContent = `RESTORE: ${levelsUntilHeal} LVLS`;
        }

        function updateCursesUI() {
            const container = document.getElementById('activeCursesContainer');
            container.innerHTML = '';
            let count = 0;

            const mapping = {
                // Normal Curses
                shooter_faster: { text: '⚡ FAST SHOOT', style: 'bg-rose-950/40 text-rose-400 border-rose-500/40' },
                shooter_triple: { text: '🔱 TRIPLE SHOT', style: 'bg-rose-950/40 text-rose-400 border-rose-500/40' },
                shooter_line: { text: '🔥 LINE BURST', style: 'bg-red-950/40 text-red-400 border-red-500/40' },
                bomb_faster: { text: '⌛ FAST FUSE', style: 'bg-amber-950/40 text-amber-400 border-amber-500/40' },
                bomb_bigger: { text: '💥 BIG BLAST', style: 'bg-orange-950/40 text-orange-400 border-orange-500/40' },
                greenlight_harder: { text: '⚠️ HARD FREEZE', style: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' },
                system_lag: { text: '📡 INPUT JITTER', style: 'bg-blue-950/40 text-blue-400 border-blue-500/40' },
                ui_static: { text: '📺 static glitch', style: 'bg-pink-950/40 text-pink-400 border-pink-500/40' },
                drift_sensors: { text: '🌀 VIEW DRIFT', style: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/40' },
                train_both_ways: { text: '🚄 CROSS STRIKE', style: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40' },
                chaser_center_merge: { text: '🌀 CENTRIPETAL', style: 'bg-sky-950/40 text-sky-400 border-sky-500/40' },
                // Greater Curses
                chrono_decay: { text: '⏳ CHRONO DECAY', style: 'bg-red-950/60 text-red-300 border-red-500 shadow-md' },
                apocalypse_barrage: { text: '🔥 APOCALYPSE FIRE', style: 'bg-purple-950/60 text-purple-300 border-purple-500 shadow-md' },
                doomsday_charge: { text: '💥 DOOM BLAST', style: 'bg-amber-950/60 text-amber-300 border-amber-500 shadow-md' },
                overload_protocol: { text: '🚥 HARD OVERLOAD', style: 'bg-emerald-950/60 text-emerald-300 border-emerald-500 shadow-md' },
                train_8_directions: { text: '🚄 8-WAY RAIL', style: 'bg-cyan-950/60 text-cyan-300 border-cyan-500 shadow-md' },
                greenlight_voidbound: { text: '🚥 VOIDBOUND SYNC', style: 'bg-purple-950/60 text-purple-300 border-purple-500 shadow-md' },
                screamer_double_dash: { text: '😱 ECHO DASH', style: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500 shadow-md' },
                screamer_faster: { text: '😈 SCREAMER SPEED', style: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500 shadow-md' },
                reversed_polarity: { text: '🔄 POLAR REVERSAL', style: 'bg-indigo-950/60 text-indigo-300 border-indigo-500 shadow-md' },
                port_shift: { text: '🌐 PORT SHIFT', style: 'bg-teal-950/60 text-teal-300 border-teal-500 shadow-md' },
                lap2: { text: '🌪️ LAP 2', style: 'bg-violet-950/40 text-violet-300 border-violet-500/40' },
                medal_goldrush: { text: '🪙 GOLDEN RUSH', style: 'bg-amber-950/40 text-amber-300 border-amber-500/40' },
                medal_barrage: { text: '🔥 MEDAL BARRAGE', style: 'bg-red-950/40 text-red-300 border-red-500/40' },
                medal_frenzy: { text: '⚡ FRANTIC FRENZY', style: 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-500/40' },
                medal_overcharge: { text: '💣 OVERCHARGE CORE', style: 'bg-orange-950/40 text-orange-300 border-orange-500/40' },
                medal_swift: { text: '🏃 SWIFT PURSUIT', style: 'bg-sky-950/40 text-sky-300 border-sky-500/40' },
                medal_voidtide: { text: '🌊 VOID TIDE', style: 'bg-teal-950/40 text-teal-300 border-teal-500/40' },
                medal_ironhide: { text: '🩸 IRONHIDE', style: 'bg-rose-950/40 text-rose-300 border-rose-500/40' },
                medal_chaosweave: { text: '🌀 CHAOS WEAVE', style: 'bg-violet-950/40 text-violet-300 border-violet-500/40' }
            };

            for (let [key, val] of Object.entries(activeCurses)) {
                if (key === 'chaser_boost' && val > 0) {
                    count++;
                    const badge = document.createElement('span');
                    badge.className = `text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-950/40 text-sky-400 border-sky-500/40 tracking-wider uppercase pixel-font m-0.5`;
                    badge.textContent = `🔵 CHASER STACK x${val}`;
                    container.appendChild(badge);
                } else if (val && mapping[key]) {
                    count++;
                    const badge = document.createElement('span');
                    badge.className = `text-[10px] font-bold px-2 py-0.5 rounded border ${mapping[key].style} tracking-wider uppercase pixel-font m-0.5`;
                    badge.textContent = mapping[key].text;
                    container.appendChild(badge);
                }
            }

            if (count === 0) {
                container.innerHTML = '<span class="text-xs text-slate-500 italic">None Active</span>';
            }
        }

        // Hostile & Game Loops mechanics execution
        let lastFrameTime = Date.now();

        function gameUpdateLoop() {
            requestAnimationFrame(gameUpdateLoop);

            const now = Date.now();
            const deltaTime = now - lastFrameTime;
            lastFrameTime = now;

            if (!activeLevelRunning) {
                drawPlaceholderEngine();
                return;
            }

            // Screen shake dampening
            if (screenShake > 0) screenShake *= 0.85;
            if (screenShake < 0.2) screenShake = 0;

            // Damage and Heal overlay decay
            if (damageFlashTime > 0) damageFlashTime = Math.max(0, damageFlashTime - deltaTime);
            if (healFlashTime > 0) healFlashTime = Math.max(0, healFlashTime - deltaTime);

            // Polarity inversion greater curse countdown
            if (activeCurses.reversed_polarity) {
                polarityInverted = Math.floor(now / 10000) % 2 === 1; // reverses controls for 10s cycles
                if (polarityInverted) {
                    document.getElementById('polarityContainer').classList.remove('hidden');
                } else {
                    document.getElementById('polarityContainer').classList.add('hidden');
                }
            }

            // Port shift greater curse countdown
            if (activeCurses.port_shift && now - lastPortShiftTime >= 15000) {
                lastPortShiftTime = now;
                let placementFound = false;
                let tries = 0;
                while (!placementFound && tries < 500) {
                    const r = Math.floor(Math.random() * GRID_SIZE);
                    const c = Math.floor(Math.random() * GRID_SIZE);
                    const manhattanDist = Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c);
                    if (grid[r][c] === 0 && manhattanDist >= 4) {
                        if (isGridWinnable(grid, playerPos, { r: r, c: c }, GRID_SIZE)) {
                            winPos = { r: r, c: c };
                            placementFound = true;
                            spawnImpactParticles(c + 0.5, r + 0.5, '#10b981', 12);
                        }
                    }
                    tries++;
                }
            }

            // Chrono Decay countdown processing
            if (activeCurses.chrono_decay) {
                const clockDiff = (now - lastChronoTickTime) / 1000;
                lastChronoTickTime = now;
                
                const oldInteger = Math.floor(chronoTimerSeconds);
                chronoTimerSeconds = Math.max(0, chronoTimerSeconds - clockDiff);
                
                if (Math.floor(chronoTimerSeconds) !== oldInteger && chronoTimerSeconds <= 5 && chronoTimerSeconds > 0) {
                    playSynthSound('tick_down');
                }

                document.getElementById('chronoTimerText').textContent = `${chronoTimerSeconds.toFixed(1)}s`;

                if (chronoTimerSeconds <= 0) {
                    damageOvertimeAccumulator += clockDiff;
                    if (damageOvertimeAccumulator >= 2.5) {
                        damageOvertimeAccumulator = 0;
                        damagePlayer(1);
                    }
                }
            }

            // Live Updates
            updatePlayerMovement(deltaTime);
            updateShooters(deltaTime);
            updateBullets(deltaTime);
            updateBombs(deltaTime);
            updateTrains(deltaTime);
            updateFlesh(deltaTime);
            updateChasers(deltaTime);
            updateScreamers(deltaTime);
            updateInfectedTiles(deltaTime);
            updateGreenLight(deltaTime);
            updateLap2Collapse();
            updateParticles();
            updateFloatingTexts(deltaTime);

            // Render Framework
            renderFrame();
        }

        // Hostile Component Calculations
        function updateShooters(dt) {
            const now = Date.now();
            let shootInterval = activeCurses.shooter_faster ? 1500 : 3000;
            if (activeCurses.medal_barrage) shootInterval *= 0.65;
            if (activeCurses.medal_chaosweave) shootInterval *= 0.8;

            shootersList.forEach(s => {
                const targetX = playerPos.c + 0.5;
                const targetY = playerPos.r + 0.5;

                const dx = targetX - s.x;
                const dy = targetY - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // GLIDE SMOOTHLY: Move continuously every single frame instead of discrete teleporting steps
                const speed = (0.25 / 1200) * dt;
                if (dist > 0.05) {
                    s.x += (dx / dist) * Math.min(speed, dist);
                    s.y += (dy / dist) * Math.min(speed, dist);
                }

                // Weapon Firing Mechanism
                const speedScale = s.isVoidbound ? 2.0 : 1.0;
                const activeCooldown = shootInterval / speedScale;

                if (now - s.lastShotTime >= activeCooldown) {
                    s.lastShotTime = now;
                    executeShooterAttack(s);
                }
            });
        }

        function executeShooterAttack(s) {
            playSynthSound('shoot');

            const angleToPlayer = Math.atan2(playerPos.r + 0.5 - s.y, playerPos.c + 0.5 - s.x);
            const isVoid = s.isVoidbound;

            if (activeCurses.apocalypse_barrage) {
                for (let angleOff = 0; angleOff < Math.PI * 2; angleOff += (Math.PI * 2 / 5)) {
                    createBullet(s.x, s.y, angleToPlayer + angleOff, isVoid, 0.009); // Extremely fast velocity
                }
            } else if (activeCurses.shooter_line) {
                let burstCount = 0;
                const burstInterval = setInterval(() => {
                    if (!activeLevelRunning || burstCount >= 5) {
                        clearInterval(burstInterval);
                        return;
                    }
                    createBullet(s.x, s.y, angleToPlayer, isVoid);
                    burstCount++;
                }, 100);
            } else if (activeCurses.shooter_triple) {
                createBullet(s.x, s.y, angleToPlayer - 0.25, isVoid);
                createBullet(s.x, s.y, angleToPlayer, isVoid);
                createBullet(s.x, s.y, angleToPlayer + 0.25, isVoid);
            } else if (isVoid) {
                let burstCount = 0;
                const burstInterval = setInterval(() => {
                    if (!activeLevelRunning || burstCount >= 5) {
                        clearInterval(burstInterval);
                        return;
                    }
                    const spread = (Math.random() - 0.5) * 0.3;
                    createBullet(s.x, s.y, angleToPlayer + spread, isVoid);
                    burstCount++;
                }, 80);
            } else {
                createBullet(s.x, s.y, angleToPlayer, isVoid);
            }
        }

        function createBullet(x, y, angle, isVoid = false, speedOverride = null) {
            const baseVelocity = speedOverride || (isVoid ? 0.007 : 0.004);
            bulletsList.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * baseVelocity,
                vy: Math.sin(angle) * baseVelocity,
                isVoid: isVoid,
                spawnTime: Date.now() // Track spawn time for explosive charges
            });
        }

        function updateBullets(dt) {
            const now = Date.now();

            for (let i = bulletsList.length - 1; i >= 0; i--) {
                const b = bulletsList[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;

                // Level 15 Progression: Shooter's projectiles explode after 5 seconds in a 3x3 range
                if (level15ProgressionActive && (now - b.spawnTime >= 5000)) {
                    playSynthSound('explode');
                    
                    spawnImpactParticles(b.x, b.y, '#ef4444', 18);
                    screenShake = Math.max(screenShake, 6);

                    // Check if player is caught in the 3x3 tiles surrounding the bullet block
                    const bulletR = Math.floor(b.y);
                    const bulletC = Math.floor(b.x);
                    if (Math.abs(playerPos.r - bulletR) <= 1 && Math.abs(playerPos.c - bulletC) <= 1) {
                        damagePlayer(1);
                    }

                    bulletsList.splice(i, 1);
                    continue;
                }

                if (b.x < 0 || b.x > GRID_SIZE || b.y < 0 || b.y > GRID_SIZE) {
                    bulletsList.splice(i, 1);
                    continue;
                }

                const dx = b.x - (playerPos.c + 0.5);
                const dy = b.y - (playerPos.r + 0.5);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 0.4) {
                    damagePlayer(1);
                    bulletsList.splice(i, 1);
                }
            }
        }

        // Bomboclat explosive routines
        function updateBombs(dt) {
            const now = Date.now();

            if (selectedEnemies.bomboclat > 0 && bombsList.length < 2) {
                let baseSpawnCooldown = 3500 / selectedEnemies.bomboclat;
                if (level15ProgressionActive) {
                    baseSpawnCooldown /= 2;
                }

                if (now - bomboclatSpawnTimer >= baseSpawnCooldown) {
                    bomboclatSpawnTimer = now;
                    // decide whether to spawn voidbound bomb or normal
                    const totalBombOpts = (selectedEnemies.bomboclat || 0) + (selectedEnemies.voidbound_bomboclat || 0);
                    let spawnVoid = false;
                    if ((selectedEnemies.voidbound_bomboclat || 0) > 0 && totalBombOpts > 0) {
                        spawnVoid = Math.random() < ((selectedEnemies.voidbound_bomboclat || 0) / totalBombOpts);
                    }

                    if (spawnVoid) {
                        // voidbound bomb: long fuse, huge radius
                        bombsList.push({
                            r: playerPos.r,
                            c: playerPos.c,
                            spawnTime: now,
                            fuseDuration: 5000,
                            radius: 6,
                            isVoidbound: true
                        });
                    } else {
                        let warnDuration = activeCurses.bomb_faster ? 1100 : 2000;
                        if (activeCurses.doomsday_charge) {
                            warnDuration = 750;
                        }
                        if (activeCurses.medal_overcharge) {
                            warnDuration *= 0.7;
                        }

                        let radius = activeCurses.bomb_bigger ? 3 : 2; 
                        if (activeCurses.doomsday_charge) {
                            radius = 4; // massive 9x9 zone
                        }
                        if (activeCurses.medal_overcharge) {
                            radius += 1;
                        }

                        bombsList.push({
                            r: playerPos.r,
                            c: playerPos.c,
                            spawnTime: now,
                            fuseDuration: warnDuration,
                            radius: radius
                        });
                    }

                    playSynthSound('bomb_warn');
                }
            }

            // Fuse logic
            for (let i = bombsList.length - 1; i >= 0; i--) {
                const b = bombsList[i];
                if (now - b.spawnTime >= b.fuseDuration) {
                    playSynthSound('explode');
                    screenShake = activeCurses.doomsday_charge ? 20 : 12;

                    const minR = Math.max(0, b.r - b.radius);
                    const maxR = Math.min(GRID_SIZE - 1, b.r + b.radius);
                    const minC = Math.max(0, b.c - b.radius);
                    const maxC = Math.min(GRID_SIZE - 1, b.c + b.radius);

                    spawnImpactParticles(b.c + 0.5, b.r + 0.5, '#f97316', 30);

                    if (playerPos.r >= minR && playerPos.r <= maxR && playerPos.c >= minC && playerPos.c <= maxC) {
                        damagePlayer(1);
                    }

                    // If voidbound, spawn radial projectiles (9 directions)
                    if (b.isVoidbound) {
                        const centerX = b.c + 0.5;
                        const centerY = b.r + 0.5;
                        const pieces = 9;
                        for (let k = 0; k < pieces; k++) {
                            const ang = (k / pieces) * Math.PI * 2;
                            createBullet(centerX, centerY, ang, true, 0.009);
                        }
                        playSynthSound('explode');
                    }

                    bombsList.splice(i, 1);
                }
            }
        }

        // Hypersonic Train and Voidbound Train update logic
        function updateTrains(dt) {
            const now = Date.now();

            const trainCount = selectedEnemies.train;
            const voidboundCount = selectedEnemies.voidbound_train;
            const totalTrains = trainCount + voidboundCount;

            if (totalTrains > 0) {
                let interval = 6000 / totalTrains;
                if (currentLevel >= 25) interval *= 0.5; // 50% faster spawn rate after level 25
                if (activeCurses.medal_barrage) interval *= 0.75;
                if (activeCurses.medal_frenzy) interval *= 0.85;
                if (activeCurses.medal_chaosweave) interval *= 0.8;
                if (now - trainSpawnTimer >= interval) {
                    trainSpawnTimer = now;

                    let isVoidbound = Math.random() < (voidboundCount / totalTrains);
                    // enforce voidbound train cooldown (15s) — if too soon, downgrade to normal train
                    if (isVoidbound && (now - lastVoidboundTrainSpawnTime < 15000)) {
                        isVoidbound = false;
                    }

                    // Voidbound Train triggers all directions. Standard Train picks horizontal/vertical.
                    let directionMode = 'row';
                    if (isVoidbound) {
                        directionMode = 'all8'; // Fixed to strike in ALL 8 directions at once!
                    } else if (activeCurses.train_8_directions) {
                        const r = Math.random();
                        if (r < 0.25) directionMode = 'row';
                        else if (r < 0.50) directionMode = 'col';
                        else if (r < 0.75) directionMode = 'diag1';
                        else directionMode = 'diag2';
                    } else {
                        directionMode = Math.random() < 0.5 ? 'row' : 'col';
                    }

                    // Voidbound train has 5-tile thickness, offset slightly to fit cleanly within boundaries
                    const indexMargin = isVoidbound ? 2 : 1;
                    const index = Math.floor(Math.random() * (GRID_SIZE - (indexMargin * 2))) + indexMargin;

                    // Centering for Voidbound all8 strike
                    let targetR = playerPos.r;
                    let targetC = playerPos.c;

                    trainsList.push({
                        directionMode: directionMode,
                        index: index,
                        spawnTime: now,
                        warnDuration: isVoidbound ? 5000 : (activeCurses.medal_barrage ? 2100 : 2500),
                        strikeDuration: 400, // actual train gliding strike takes 400ms
                        hasStruck: false,
                        damaged: false, // Ensures damage applies exactly once per passing train
                        isVoidbound: isVoidbound,
                        c: targetC,
                        r: targetR
                    });

                    // record voidbound spawn timestamp so next voidbound waits 15s minimum
                    if (isVoidbound) lastVoidboundTrainSpawnTime = now;

                    playSynthSound('train_warn');
                }
            }

            // Train strike logic - Moving Physical Intersections
            for (let i = trainsList.length - 1; i >= 0; i--) {
                const t = trainsList[i];
                const elapsed = now - t.spawnTime;

                if (elapsed >= t.warnDuration) {
                    if (!t.hasStruck) {
                        t.hasStruck = true; // Signals transition from Warning to Striking
                        playSynthSound('explode');
                        screenShake = t.isVoidbound ? 22 : 18;
                        t.damaged = false;
                    }

                    const strikeElapsed = elapsed - t.warnDuration;
                    const strikeProgress = strikeElapsed / t.strikeDuration;

                    if (strikeProgress <= 1.0) {
                        const radius = t.isVoidbound ? 1.35 : 0.9; // Tighter hit radius for trains
                        const trainLen = 6;
                        const headDist = strikeProgress * (GRID_SIZE + trainLen) - (trainLen / 2);

                        if (!t.damaged) {
                            let hit = false;
                            
                            // Rect helper matching drawn train coordinates
                            const checkHit = (cx, cy, w, h) => {
                                return Math.abs(playerPos.c + 0.5 - cx) < w/2 && Math.abs(playerPos.r + 0.5 - cy) < h/2;
                            };

                            if (t.directionMode === 'row' || (activeCurses.train_both_ways && t.directionMode !== 'all8')) {
                                if (checkHit(headDist, t.index + 0.5, trainLen, radius * 2)) hit = true;
                            }
                            if (t.directionMode === 'col' || (activeCurses.train_both_ways && t.directionMode !== 'all8')) {
                                if (checkHit(t.index + 0.5, headDist, radius * 2, trainLen)) hit = true;
                            }
                            if (t.directionMode === 'diag1') {
                                const cx = headDist;
                                const cy = headDist + (t.index - Math.floor(GRID_SIZE / 2));
                                if (Math.hypot(playerPos.c + 0.5 - cx, playerPos.r + 0.5 - cy) < radius + 0.25) hit = true;
                            }
                            if (t.directionMode === 'diag2') {
                                const cx = headDist;
                                const cy = (t.index + Math.floor(GRID_SIZE / 4)) - headDist;
                                if (Math.hypot(playerPos.c + 0.5 - cx, playerPos.r + 0.5 - cy) < radius + 0.25) hit = true;
                            }
                            if (t.directionMode === 'all8') {
                                const angles = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];
                                angles.forEach(ang => {
                                    const cx = t.c + 0.5 + Math.cos(ang) * headDist;
                                    const cy = t.r + 0.5 + Math.sin(ang) * headDist;
                                    if (Math.hypot(playerPos.c + 0.5 - cx, playerPos.r + 0.5 - cy) < radius + 0.25) hit = true;
                                });
                            }

                            if (hit) {
                                damagePlayer(1);
                                t.damaged = true; // Lockout further damage from this particular sweep
                            }
                        }
                    } else {
                        // Train finished passing
                        trainsList.splice(i, 1);
                    }
                }
            }
        }

        // Crimson Flesh Virulent Slime movement
        function updateFlesh(dt) {
            const now = Date.now();

            fleshList.forEach(f => {
                const dx = playerPos.c + 0.5 - f.x;
                const dy = playerPos.r + 0.5 - f.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // GLIDE SMOOTHLY: Moves continuously every frame instead of teleports
                const speed = (0.25 / 1600) * dt;
                if (dist > 0.05) {
                    f.x += (dx / dist) * Math.min(speed, dist);
                    f.y += (dy / dist) * Math.min(speed, dist);
                }

                // Infect tiles around its current center coordinate periodically
                f.moveTickAccumulator += dt;
                if (f.moveTickAccumulator >= 1600) { 
                    f.moveTickAccumulator = 0;

                    const currentR = Math.floor(f.y);
                    const currentC = Math.floor(f.x);

                    // Level 15 Mutation Event: Flesh now spreads further (7x7 area instead of 3x3)
                    const spreadRadius = level15ProgressionActive ? 3 : 1; 

                    for (let r = currentR - spreadRadius; r <= currentR + spreadRadius; r++) {
                        for (let c = currentC - spreadRadius; c <= currentC + spreadRadius; c++) {
                            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                                // Add/refresh infection expiring in 4 seconds
                                const existingIndex = infectedTiles.findIndex(t => t.r === r && t.c === c);
                                if (existingIndex > -1) {
                                    infectedTiles[existingIndex].expiresAt = now + 4000;
                                } else {
                                    infectedTiles.push({
                                        r: r,
                                        c: c,
                                        expiresAt: now + 4000
                                    });
                                }
                            }
                        }
                    }
                }
            });
        }

        // Blue Chaser continuous tracking, merging, and movement calculations
        function updateChasers(dt) {
            const now = Date.now();

            // 1. Chaser Magnetic Merge (Combination) Logic
            for (let i = 0; i < chasersList.length; i++) {
                for (let j = i + 1; j < chasersList.length; j++) {
                    const c1 = chasersList[i];
                    const c2 = chasersList[j];

                    const dx = c1.x - c2.x;
                    const dy = c1.y - c2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Merge if they are close enough (under 0.6 tiles range)
                    if (dist < 0.6) {
                        playSynthSound('green_light_alert');
                        spawnImpactParticles(c1.x, c1.y, '#0ea5e9', 12);

                        // Merge c2 into c1
                        c1.sizeMultiplier *= 1.07;
                        c1.speedMultiplier *= 1.10;
                        
                        // Freeze both for 1 full second (coalescing)
                        c1.freezeUntil = now + 1000;

                        // Delete c2 and break loop to avoid indexing shift conflicts
                        chasersList.splice(j, 1);
                        return; // calculate remaining on next loop refresh frame safely
                    }
                }
            }

            // 2. Chaser Movement Execution
            chasersList.forEach(c => {
                if (now < c.freezeUntil) return; // Frozen in coalescence!

                // Determine target coord:
                // "if chaser_center_merge is active and we have multiple chasers, they path to center of the grid first"
                let targetX = playerPos.c + 0.5;
                let targetY = playerPos.r + 0.5;

                if (activeCurses.chaser_center_merge && chasersList.length > 1) {
                    targetX = GRID_SIZE / 2;
                    targetY = GRID_SIZE / 2;
                }

                const dx = targetX - c.x;
                const dy = targetY - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Base speed is 0.4 tiles/second
                // Applies progression boosts (10% per 8 levels) and curse boost stacks (20% per stack)
                const baseSpeed = 0.4 / 1000; // units/ms
                const chaserBoostInterval = currentLevel >= 25 ? 3 : 8;
                const lvlBoost = Math.pow(1.10, Math.floor(currentLevel / chaserBoostInterval));
                const curseBoost = Math.pow(1.20, activeCurses.chaser_boost);
                const medalSwiftBoost = activeCurses.medal_swift ? 1.25 : 1;

                const finalSpeed = baseSpeed * c.speedMultiplier * lvlBoost * curseBoost * medalSwiftBoost * dt;

                if (dist > 0.05) {
                    c.x += (dx / dist) * Math.min(finalSpeed, dist);
                    c.y += (dy / dist) * Math.min(finalSpeed, dist);
                }

                // Check direct collision with player
                const playerDist = Math.sqrt(Math.pow(playerPos.c + 0.5 - c.x, 2) + Math.pow(playerPos.r + 0.5 - c.y, 2));
                if (playerDist < 0.4) {
                    damagePlayer(1);
                    // Bounce chaser back slightly on impact
                    const bounceX = playerPos.c + 0.5 - c.x;
                    const bounceY = playerPos.r + 0.5 - c.y;
                    const bounceLen = Math.sqrt(bounceX * bounceX + bounceY * bounceY) || 1;
                    c.x -= (bounceX / bounceLen) * 0.8;
                    c.y -= (bounceY / bounceLen) * 0.8;
                    c.freezeUntil = now + 500;
                }
            });
        }

        // Screamer Ghost continuous chasing, targeting, and linear warp dash logic
        function updateScreamers(dt) {
            const now = Date.now();

            screamersList.forEach(s => {
                // Screamer cycle: warning -> dashing -> cooldown (no slow chasing movement)
                if (s.state === 'warning') {
                    if (now >= s.timer) {
                        s.state = 'dashing';
                        // use the angle/target locked when entering 'warning' — do not recompute here
                        s.timer = now + 500; // placeholder; actual progress uses baseDash and multipliers
                        playSynthSound('shoot');
                    }
                } else if (s.state === 'dashing') {
                        const elapsed = now - (s.timer - 500);
                        const stacks = Math.min(2, activeCurses.screamer_faster || 0);
                        let speedMultiplier = 1 + 0.75 * stacks; // curse-based speed
                        if (s.isVoidbound) speedMultiplier *= 2; // voidbound 100% faster
                        if (activeCurses.medal_swift) speedMultiplier *= 1.25;
                        const baseDash = 500;
                        const progress = Math.min(1.0, elapsed / (baseDash / speedMultiplier));

                        s.x = s.startX + (s.targetX - s.startX) * progress;
                        s.y = s.startY + (s.targetY - s.startY) * progress;

                        if (Math.random() < 0.4) spawnImpactParticles(s.x, s.y, '#d946ef', 1);

                        const playerDist = Math.sqrt(Math.pow(playerPos.c + 0.5 - s.x, 2) + Math.pow(playerPos.r + 0.5 - s.y, 2));
                        if (playerDist < 0.5 && !s.hasDamagedThisCycle) {
                            s.hasDamagedThisCycle = true;
                            damagePlayer(1);
                        }

                        if (progress >= 1.0) {
                            if (activeCurses.screamer_double_dash && !s.doubleDashDone) {
                                s.doubleDashDone = true;
                                s.state = 'warning';
                                s.timer = now + 1000;
                                s.startX = s.x;
                                s.startY = s.y;
                                s.angle = Math.atan2(playerPos.r + 0.5 - s.y, playerPos.c + 0.5 - s.x);
                                s.targetX = s.x + Math.cos(s.angle) * 12;
                                s.targetY = s.y + Math.sin(s.angle) * 12;
                                s.hasDamagedThisCycle = false;
                                playSynthSound('screamer_scream');
                            } else {
                                s.state = 'cooldown';
                                const cooldownDuration = s.isVoidbound ? 400 : (s.doubleDashDone ? 750 : 1500); // voidbound has 0.4s cooldown
                                s.timer = now + cooldownDuration;
                                s.doubleDashDone = false;
                            }
                        }
                    } else if (s.state === 'cooldown') {
                        if (now >= s.timer) {
                            // Begin warning immediately when cooldown ends
                            s.state = 'warning';
                            s.timer = now + 1000; // 1 second warning
                            s.startX = s.x;
                            s.startY = s.y;
                            s.angle = Math.atan2(playerPos.r + 0.5 - s.y, playerPos.c + 0.5 - s.x);
                            s.targetX = s.x + Math.cos(s.angle) * 12;
                            s.targetY = s.y + Math.sin(s.angle) * 12;
                            s.hasDamagedThisCycle = false;
                            playSynthSound('screamer_scream');
                        }
                    }
            });
        }

        // Remove expired infected tiles
        function updateInfectedTiles(dt) {
            const now = Date.now();
            infectedTiles = infectedTiles.filter(t => t.expiresAt > now);

            const stepOnInfection = infectedTiles.some(t => t.r === playerPos.r && t.c === playerPos.c);
            if (!stepOnInfection || !activeLevelRunning) {
                document.getElementById('slowdownContainer').classList.add('hidden');
            }
        }

        // Red Light Green Light Core Calculation
        function updateGreenLight(dt) {
            const now = Date.now();

            if (selectedEnemies.feurougefeuvert === 0) return;

            // VOIDBOUND FEUROUGEFEUVERT GREATER CURSE STATE MACHINE
            if (activeCurses.greenlight_voidbound) {
                if (voidboundGLState === 'idle') {
                    if (now >= greenLightSpawnTimer) {
                        voidboundGLStage = 1;
                        voidboundGLState = 'warning';
                            voidboundTimerTarget = now + 2000; // 2 seconds cooldown window (movement allowed)
                            stillnessTimer = 0;
                        playSynthSound('green_light_alert');
                        document.getElementById('greenLightOverlay').style.opacity = '1';
                        document.getElementById('glTitle').innerHTML = `<span class="text-purple-400">VOIDBOUND SYNCHRONIZING Stage 1/3</span>`;
                    }
                } else if (voidboundGLState === 'warning') {
                        // VOIDBOUND: This warning is a movement-allowed cooldown window. Just show countdown; stage auto-advances.
                        const remaining = Math.max(0, (voidboundTimerTarget - now) / 1000);
                        document.getElementById('greenLightTimer').textContent = `Cooldown: ${remaining.toFixed(2)}s`;
                        const pct = Math.min(100, (1 - (voidboundTimerTarget - now) / 2000) * 100);
                        document.getElementById('freezeProgressBar').style.width = `${pct}%`;

                        if (now >= voidboundTimerTarget) {
                            // Clear stage without enforcing stillness; movement allowed during warning
                            if (voidboundGLStage === 3) {
                                voidboundGLState = 'idle';
                                document.getElementById('greenLightOverlay').style.opacity = '0';
                                playSynthSound('green_light_pass');
                                greenLightSpawnTimer = now + 5000 + Math.random() * 5000;
                            } else {
                                voidboundGLStage++;
                                voidboundGLState = 'pause';
                                const randPause = 500 + Math.random() * 1000;
                                voidboundTimerTarget = now + randPause;
                                document.getElementById('freezeProgressBar').style.width = `0%`;
                                document.getElementById('glTitle').innerHTML = `<span class="text-yellow-400">HOLD POSITION...</span>`;
                            }
                        }
                } else if (voidboundGLState === 'pause') {
                    // Waiting in random pause interval
                    const timeSinceLastMovement = now - playerLastMovedTime;
                    // If player moves during wait interval: reset stage process
                    if (timeSinceLastMovement < 100) { 
                        voidboundGLState = 'idle';
                        document.getElementById('greenLightOverlay').style.opacity = '0';
                        penalityFreezeCheck();
                        greenLightSpawnTimer = now + 5000 + Math.random() * 5000;
                        return;
                    }

                    if (now >= voidboundTimerTarget) {
                        // Re-trigger next stage warning
                        voidboundGLState = 'warning';
                        voidboundTimerTarget = now + 2000;
                        stillnessTimer = 0;
                        playSynthSound('green_light_alert');
                        document.getElementById('glTitle').innerHTML = `<span class="text-purple-400">VOIDBOUND SYNCHRONIZING Stage ${voidboundGLStage}/3</span>`;
                    }
                }
                return;
            }

            // STANDARD FEUROUGEFEUVERT LOGIC
            if (!greenLightActive) {
                if (now >= greenLightSpawnTimer) {
                    greenLightActive = true;
                    greenLightTimer = now;
                    stillnessTimer = 0;
                    playSynthSound('green_light_alert');
                    document.getElementById('greenLightOverlay').style.opacity = '1';
                    document.getElementById('glTitle').textContent = `GREEN LIGHT! FREEZE!`;
                }
            } else {
                let limitTime = activeCurses.greenlight_harder ? 2200 : 4000;
                if (activeCurses.overload_protocol) {
                    limitTime = 1800;
                }
                if (activeCurses.medal_voidtide) {
                    limitTime *= 0.75;
                }

                const progress = now - greenLightTimer;
                document.getElementById('greenLightTimer').textContent = `Reaction Time: ${( (limitTime - progress) / 1000 ).toFixed(1)}s`;
                
                // Stillness check (Standard stop required is now only 0.25 seconds)
                const timeSinceLastMovement = now - playerLastMovedTime;
                const requiredFreezeTime = activeCurses.overload_protocol ? 500 : 250;

                if (timeSinceLastMovement >= requiredFreezeTime) {
                    stillnessTimer = requiredFreezeTime;
                } else {
                    stillnessTimer = timeSinceLastMovement;
                }

                // Update freeze UI bar
                const progressPct = Math.min(100, (stillnessTimer / requiredFreezeTime) * 100);
                document.getElementById('freezeProgressBar').style.width = `${progressPct}%`;

                if (stillnessTimer >= requiredFreezeTime) {
                    greenLightActive = false;
                    document.getElementById('greenLightOverlay').style.opacity = '0';
                    playSynthSound('green_light_pass');
                    
                    const baseInterval = activeCurses.overload_protocol ? 3000 : 6000;
                    const voidtideMult = activeCurses.medal_voidtide ? 0.7 : 1;
                    greenLightSpawnTimer = now + (baseInterval + Math.random() * baseInterval) * voidtideMult;
                } else if (progress >= limitTime) {
                    greenLightActive = false;
                    document.getElementById('greenLightOverlay').style.opacity = '0';
                    penalityFreezeCheck();
                    
                    const baseInterval = activeCurses.overload_protocol ? 3000 : 6000;
                    const voidtideMult = activeCurses.medal_voidtide ? 0.7 : 1;
                    greenLightSpawnTimer = now + (baseInterval + Math.random() * baseInterval) * voidtideMult;
                }
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        // Floating holographic text array updater
        function updateFloatingTexts(dt) {
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i];
                ft.y += ft.vy * dt; // Float upwards
                ft.life -= dt;
                ft.alpha = Math.max(0, ft.life / 1000);
                if (ft.life <= 0) {
                    floatingTexts.splice(i, 1);
                }
            }
        }

        // Graphics Rendering Engine (Canvas)
        function renderFrame() {
            const size = canvas.width;
            ctx.save();

            // Clear frame
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, size, size);

            // 1. Camera system initialization
            // Centering logic activates starting from 24x24 grid scale
            const useCamera = (GRID_SIZE >= 24);
            const VIEW_TILES = 16;
            const cellSize = size / (useCamera ? VIEW_TILES : GRID_SIZE);

            if (useCamera) {
                // Smooth camera interpolation tracking the player's core
                smoothCamX += (playerVisualPos.x - smoothCamX) * 0.1;
                smoothCamY += (playerVisualPos.y - smoothCamY) * 0.1;

                // Clamp smooth camera view frame within grid absolute limits
                const minCam = VIEW_TILES / 2;
                const maxCam = GRID_SIZE - VIEW_TILES / 2;
                smoothCamX = Math.max(minCam, Math.min(maxCam, smoothCamX));
                smoothCamY = Math.max(minCam, Math.min(maxCam, smoothCamY));

                // Translate entire context render coordinates relative to top-left camera tile
                leftTile = smoothCamX - VIEW_TILES / 2;
                topTile = smoothCamY - VIEW_TILES / 2;
                ctx.translate(-leftTile * cellSize, -topTile * cellSize);
            } else {
                leftTile = 0;
                topTile = 0;
            }

            // Matrix sensors drift curse effect
            if (activeCurses.drift_sensors) {
                const driftOffset = Math.sin(Date.now() * 0.003) * 4;
                ctx.translate(driftOffset, 0);
            }

            // Screen shake translation
            if (screenShake > 0) {
                const dx = (Math.random() - 0.5) * screenShake;
                const dy = (Math.random() - 0.5) * screenShake;
                ctx.translate(dx, dy);
            }

            // 2. Draw Grid Lines
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, GRID_SIZE * cellSize);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(GRID_SIZE * cellSize, i * cellSize);
                ctx.stroke();
            }

            // 3. Draw Infected Spore cells (Flesh infection zone)
            const now = Date.now();
            infectedTiles.forEach(tile => {
                const remaining = tile.expiresAt - now;
                const opacity = Math.max(0, Math.min(0.4, remaining / 4000 * 0.4));
                
                ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`;
                ctx.fillRect(tile.c * cellSize + 1, tile.r * cellSize + 1, cellSize - 2, cellSize - 2);

                ctx.strokeStyle = `rgba(248, 113, 113, ${opacity * 1.5})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(tile.c * cellSize + 4, tile.r * cellSize + 4, cellSize - 8, cellSize - 8);
            });

            // 4. Draw Tiles (Void & Normal blocks)
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const blockType = grid[r][c];
                    if (blockType === 1) {
                        ctx.fillStyle = '#090d16';
                        ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
                        
                        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4);
                    } else if (grid[r][c] === 0 && !infectedTiles.some(t => t.r === r && t.c === c)) {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }

            // 5. Draw Gold Coins scattered on the grid (Level 10+)
            if (currentLevel >= 10) {
                coinsList.forEach(coin => {
                    const cx = (coin.c + 0.5) * cellSize;
                    // Add smooth hovering bobbing to coins using sine wave
                    const bobY = Math.sin(Date.now() * 0.007 + coin.c * 15) * (cellSize * 0.08);
                    const cy = (coin.r + 0.5) * cellSize + bobY;
                    
                    ctx.save();
                    ctx.translate(cx, cy);
                    
                    // Spinning scale animation
                    const spinScale = Math.abs(Math.sin(Date.now() * 0.005));
                    ctx.scale(spinScale, 1.0);
                    
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = '#f59e0b';
                    ctx.fillStyle = '#fbbf24';
                    ctx.strokeStyle = '#d97706';
                    ctx.lineWidth = 2;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, cellSize * 0.24, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    ctx.fillStyle = '#fef08a';
                    ctx.beginPath();
                    ctx.arc(0, 0, cellSize * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.restore();

                    // Periodically spawn tiny gold sparkles attached to Grid unit space
                    if (Math.random() < 0.008) {
                        particles.push({
                            x: coin.c + 0.5,
                            y: coin.r + 0.5 + (bobY/cellSize),
                            vx: (Math.random() - 0.5) * 0.03,
                            vy: (Math.random() - 0.5) * 0.03,
                            radius: Math.random() * 1.5 + 1,
                            color: '#fbbf24',
                            alpha: 0.8,
                            life: 0.6,
                            decay: 0.02
                        });
                    }
                });
            }

            // Draw Medal token if present
            if (medalSpawned && medalPos) {
                const mx = (medalPos.c + 0.5) * cellSize;
                const my = (medalPos.r + 0.5) * cellSize;
                ctx.save();
                ctx.translate(mx, my);
                ctx.shadowBlur = 14;
                ctx.shadowColor = '#f97316';
                ctx.fillStyle = '#fb923c';
                ctx.beginPath();
                ctx.arc(0, 0, cellSize * 0.26, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fde68a';
                ctx.font = `${cellSize * 0.3}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('★', 0, 0);
                ctx.restore();
            }

            // Draw Altar object if present
            if (activeAltar && activeAltar.pos) {
                const ax = (activeAltar.pos.c + 0.5) * cellSize;
                const ay = (activeAltar.pos.r + 0.5) * cellSize;
                ctx.save();
                ctx.translate(ax, ay);
                ctx.shadowBlur = 14;
                ctx.shadowColor = activeAltar.type === 'purification' ? '#34d399' : '#818cf8';
                ctx.fillStyle = activeAltar.type === 'purification' ? '#22c55e' : '#6366f1';
                ctx.beginPath();
                ctx.moveTo(-cellSize * 0.2, cellSize * 0.15);
                ctx.lineTo(0, -cellSize * 0.25);
                ctx.lineTo(cellSize * 0.2, cellSize * 0.15);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(-cellSize * 0.08, -cellSize * 0.1, cellSize * 0.16, cellSize * 0.22);
                ctx.restore();
            }

            // 6. Draw Goal Exit Portal
            const wx = winPos.c * cellSize;
            const wy = winPos.r * cellSize;
            
            const isExitLocked = !canUseExit();
            
            if (isExitLocked) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
                ctx.fillRect(wx + 2, wy + 2, cellSize - 4, cellSize - 4);
                
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2.0;
                ctx.strokeRect(wx + 4, wy + 4, cellSize - 8, cellSize - 8);
                
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
                ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + pulse * 0.3})`;
                ctx.beginPath();
                ctx.arc(wx + cellSize / 2, wy + cellSize / 2, cellSize * 0.20, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(wx + cellSize / 2 - 3, wy + cellSize / 2);
                ctx.lineTo(wx + cellSize / 2 + 3, wy + cellSize / 2);
                ctx.moveTo(wx + cellSize / 2, wy + cellSize / 2 - 3);
                ctx.lineTo(wx + cellSize / 2, wy + cellSize / 2 + 3);
                ctx.stroke();
            } else {
                // Render Unlocked state with a radiant swirling green vortex particles
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                ctx.fillRect(wx + 2, wy + 2, cellSize - 4, cellSize - 4);
                
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(wx + 4, wy + 4, cellSize - 8, cellSize - 8);

                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.007);
                ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + pulse * 0.4})`;
                ctx.beginPath();
                ctx.arc(wx + cellSize / 2, wy + cellSize / 2, cellSize * 0.22, 0, Math.PI * 2);
                ctx.fill();

                // Dynamic Swirling Vortex green stardust particles on Grid space
                if (Math.random() < 0.15) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 0.4 + Math.random() * 0.5;
                    particles.push({
                        x: winPos.c + 0.5 + Math.cos(angle) * r,
                        y: winPos.r + 0.5 + Math.sin(angle) * r,
                        vx: -Math.cos(angle) * 0.04,
                        vy: -Math.sin(angle) * 0.04,
                        radius: Math.random() * 2 + 1,
                        color: '#34d399',
                        alpha: 1.0,
                        life: 0.8,
                        decay: 0.03
                    });
                }
            }

            // 7. Draw Hypersonic Train warning tracks, countdowns & physical trains
            trainsList.forEach(t => {
                const elapsed = now - t.spawnTime;
                const progress = elapsed / t.warnDuration;
                const remaining = Math.max(0, (t.warnDuration - elapsed) / 1000);

                // Flashing bar frequency increases exponentially as remaining warning limit approaches 0
                const flashFreq = progress < 0.7 ? 4 : 12;
                const blink = Math.floor(elapsed / (1000 / flashFreq)) % 2 === 0;

                const radius = t.isVoidbound ? 2 : 1;
                const targetLow = t.index - radius;
                const targetHigh = t.index + radius;

                // Color mapping: Purple for Voidbound Train, Cyan for Standard Train
                const trackColor = t.isVoidbound ? 'rgba(168, 85, 247, 0.15)' : 'rgba(34, 211, 238, 0.15)';
                const strokeColor = t.isVoidbound ? `rgba(168, 85, 247, ${blink ? 0.8 : 0.2})` : `rgba(34, 211, 238, ${blink ? 0.8 : 0.2})`;

                ctx.fillStyle = trackColor;
                
                const isNormalStrike = (t.directionMode === 'row' || t.directionMode === 'col');

                // A. Render Warning tracks (Lasers & countdown text tags)
                if (!t.hasStruck) {
                    if (t.directionMode === 'row' || (isNormalStrike && activeCurses.train_both_ways)) {
                        ctx.fillRect(0, targetLow * cellSize, GRID_SIZE * cellSize, (targetHigh - targetLow + 1) * cellSize);
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = 3;
                        ctx.strokeRect(0, targetLow * cellSize, GRID_SIZE * cellSize, (targetHigh - targetLow + 1) * cellSize);

                        ctx.save();
                        ctx.fillStyle = t.isVoidbound ? '#f5f3ff' : '#ecfeff';
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = strokeColor;
                        ctx.font = 'bold 8px "Press Start 2P"';
                        ctx.textAlign = 'center';
                        ctx.fillText(t.isVoidbound ? `⚠️ VOIDRAIL: ${remaining.toFixed(1)}s` : `⚠️ RAILWAY: ${remaining.toFixed(1)}s`, (GRID_SIZE / 2) * cellSize, (t.index + 0.25) * cellSize);
                        ctx.restore();
                    } 
                    if (t.directionMode === 'col' || (isNormalStrike && activeCurses.train_both_ways)) {
                        ctx.fillRect(targetLow * cellSize, 0, (targetHigh - targetLow + 1) * cellSize, GRID_SIZE * cellSize);
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = 3;
                        ctx.strokeRect(targetLow * cellSize, 0, (targetHigh - targetLow + 1) * cellSize, GRID_SIZE * cellSize);

                        ctx.save();
                        ctx.fillStyle = t.isVoidbound ? '#f5f3ff' : '#ecfeff';
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = strokeColor;
                        ctx.font = 'bold 8px "Press Start 2P"';
                        ctx.textAlign = 'center';
                        
                        ctx.fillText(t.isVoidbound ? `⚠️ VOID: ${remaining.toFixed(1)}s` : `⚠️ RAIL: ${remaining.toFixed(1)}s`, (t.index + 0.25) * cellSize, (GRID_SIZE / 2) * cellSize);
                        ctx.restore();
                    }
                    if (t.directionMode === 'diag1') {
                        const offset = t.index - Math.floor(GRID_SIZE / 2);
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = cellSize * (radius * 2 + 1);
                        ctx.beginPath();
                        ctx.moveTo(0, offset * cellSize);
                        ctx.lineTo(GRID_SIZE * cellSize, (GRID_SIZE + offset) * cellSize);
                        ctx.stroke();

                        ctx.save();
                        ctx.fillStyle = t.isVoidbound ? '#f5f3ff' : '#ecfeff';
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = strokeColor;
                        ctx.font = 'bold 8px "Press Start 2P"';
                        ctx.fillText(`⚠️ DIAGONAL: ${remaining.toFixed(1)}s`, (GRID_SIZE / 2) * cellSize, (GRID_SIZE / 2 + offset - 1.5) * cellSize);
                        ctx.restore();
                    }
                    if (t.directionMode === 'diag2') {
                        const offset = t.index + Math.floor(GRID_SIZE / 4);
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = cellSize * (radius * 2 + 1);
                        ctx.beginPath();
                        ctx.moveTo(0, offset * cellSize);
                        ctx.lineTo(GRID_SIZE * cellSize, (offset - GRID_SIZE) * cellSize);
                        ctx.stroke();

                        ctx.save();
                        ctx.fillStyle = t.isVoidbound ? '#f5f3ff' : '#ecfeff';
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = strokeColor;
                        ctx.font = 'bold 8px "Press Start 2P"';
                        ctx.fillText(`⚠️ DIAGONAL: ${remaining.toFixed(1)}s`, (GRID_SIZE / 2) * cellSize, (offset - GRID_SIZE / 2 - 1.5) * cellSize);
                        ctx.restore();
                    }
                    if (t.directionMode === 'all8') {
                        // Voidbound Train: draw 8-directional warning crosshair radiating from target coordinates
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = cellSize * 5; // 5 tiles thick

                        // Horizontal
                        ctx.beginPath(); ctx.moveTo(0, t.r * cellSize + cellSize/2); ctx.lineTo(GRID_SIZE * cellSize, t.r * cellSize + cellSize/2); ctx.stroke();
                        // Vertical
                        ctx.beginPath(); ctx.moveTo(t.c * cellSize + cellSize/2, 0); ctx.lineTo(t.c * cellSize + cellSize/2, GRID_SIZE * cellSize); ctx.stroke();
                        // Diagonals
                        const dOffset1 = t.r - t.c;
                        ctx.beginPath(); ctx.moveTo(0, dOffset1 * cellSize); ctx.lineTo(GRID_SIZE * cellSize, (GRID_SIZE + dOffset1) * cellSize); ctx.stroke();

                        const dOffset2 = t.r + t.c;
                        ctx.beginPath(); ctx.moveTo(0, dOffset2 * cellSize); ctx.lineTo(GRID_SIZE * cellSize, (dOffset2 - GRID_SIZE) * cellSize); ctx.stroke();

                        ctx.save();
                        ctx.fillStyle = '#f5f3ff';
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = '#d946ef';
                        ctx.font = 'bold 8px "Press Start 2P"';
                        ctx.textAlign = 'center';
                        ctx.fillText(`⚠️ VOID VOID VOID: ${remaining.toFixed(1)}s`, (GRID_SIZE / 2) * cellSize, (t.r + 0.35) * cellSize);
                        ctx.restore();
                    }
                } else {
                    // B. RENDER ACTUAL GLIDING CYBER TRAIN (Physical carriage boxes)
                    const strikeElapsed = now - (t.spawnTime + t.warnDuration);
                    const strikeProgress = Math.min(1.0, strikeElapsed / t.strikeDuration);

                    ctx.save();
                    ctx.fillStyle = t.isVoidbound ? '#e9d5ff' : '#cffafe';
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = t.isVoidbound ? '#d946ef' : '#22d3ee';

                    const trainLen = 6;
                    const headDist = strikeProgress * (GRID_SIZE + trainLen) - (trainLen / 2);

                    if (t.directionMode === 'row' || (isNormalStrike && activeCurses.train_both_ways)) {
                        ctx.fillRect((headDist - trainLen/2) * cellSize, targetLow * cellSize, cellSize * trainLen, (targetHigh - targetLow + 1) * cellSize);
                    }
                    if (t.directionMode === 'col' || (isNormalStrike && activeCurses.train_both_ways)) {
                        ctx.fillRect(targetLow * cellSize, (headDist - trainLen/2) * cellSize, (targetHigh - targetLow + 1) * cellSize, cellSize * trainLen);
                    }
                    if (t.directionMode === 'diag1') {
                        const offset = t.index - Math.floor(GRID_SIZE / 2);
                        const trainRow = headDist + offset;
                        ctx.fillRect((headDist - 1) * cellSize, (trainRow - 1) * cellSize, cellSize * 2, cellSize * 2);
                    }
                    if (t.directionMode === 'diag2') {
                        const offset = t.index + Math.floor(GRID_SIZE / 4);
                        const trainRow = offset - headDist;
                        ctx.fillRect((headDist - 1) * cellSize, (trainRow - 1) * cellSize, cellSize * 2, cellSize * 2);
                    }
                    if (t.directionMode === 'all8') {
                        // Voidbound Train: draw 8 heavy cyber engines gliding outwards radially in all 8 directions!
                        const angles = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];
                        const dist = strikeProgress * GRID_SIZE * 1.5;
                        
                        angles.forEach(ang => {
                            const tcX = t.c + 0.5 + Math.cos(ang) * dist;
                            const tcY = t.r + 0.5 + Math.sin(ang) * dist;
                            ctx.beginPath();
                            ctx.arc(tcX * cellSize, tcY * cellSize, cellSize * 2.5, 0, Math.PI * 2); // 5 tiles thick (radius 2.5)
                            ctx.fill();
                        });
                    }

                    ctx.restore();
                }
            });

            // 8. Draw Active Bomb warning grids
            bombsList.forEach(b => {
                const warnPct = (now - b.spawnTime) / b.fuseDuration;
                
                ctx.fillStyle = `rgba(239, 68, 68, ${0.12 + warnPct * 0.28})`;
                const minR = Math.max(0, b.r - b.radius);
                const maxR = Math.min(GRID_SIZE - 1, b.r + b.radius);
                const minC = Math.max(0, b.c - b.radius);
                const maxC = Math.min(GRID_SIZE - 1, b.c + b.radius);

                for (let row = minR; row <= maxR; row++) {
                    for (let col = minC; col <= maxC; col++) {
                        ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
                    }
                }

                const cx = (b.c + 0.5) * cellSize;
                const cy = (b.r + 0.5) * cellSize;
                
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, cellSize * 0.35, 0, Math.PI * 2);
                ctx.stroke();

                const blink = Math.floor(Date.now() / 150) % 2 === 0;
                ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
                ctx.beginPath();
                ctx.arc(cx, cy, cellSize * 0.18, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(minC * cellSize, minR * cellSize, (maxC - minC + 1) * cellSize, (maxR - minR + 1) * cellSize);
            });

            // 9. Draw Bullets
            bulletsList.forEach(b => {
                const bx = b.x * cellSize;
                const by = b.y * cellSize;

                ctx.shadowBlur = 8;
                ctx.shadowColor = b.isVoid ? '#a855f7' : '#f43f5e';

                ctx.fillStyle = b.isVoid ? '#c084fc' : '#fda4af';
                ctx.beginPath();
                ctx.arc(bx, by, b.isVoid ? 5 : 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            });

            // 10. Draw Shooters & Voidbound units (Floating coordinates)
            shootersList.forEach(s => {
                const sx = s.x * cellSize;
                const sy = s.y * cellSize;

                if (s.isVoidbound) {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = '#8b5cf6';
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
                    ctx.beginPath();
                    ctx.arc(sx, sy, cellSize * 0.45, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = s.isVoidbound ? '#6b21a8' : '#9f1239';
                ctx.strokeStyle = s.isVoidbound ? '#c084fc' : '#f43f5e';
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                const angle = Math.atan2(playerPos.r + 0.5 - s.y, playerPos.c + 0.5 - s.x);
                const r = cellSize * 0.32;
                
                ctx.moveTo(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r);
                ctx.lineTo(sx + Math.cos(angle + 2.5) * r, sy + Math.sin(angle + 2.5) * r);
                ctx.lineTo(sx + Math.cos(angle - 2.5) * r, sy + Math.sin(angle - 2.5) * r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = s.isVoidbound ? '#e9d5ff' : '#fecdd3';
                ctx.beginPath();
                ctx.arc(sx, sy, cellSize * 0.08, 0, Math.PI * 2);
                ctx.fill();
            });

            // 11. Draw Blue Chasers (Smooth floating coordinates)
            chasersList.forEach(c => {
                const cx = c.x * cellSize;
                const cy = c.y * cellSize;

                const chaserBoostIntervalVis = currentLevel >= 25 ? 3 : 8;
                const lvlBoost = Math.pow(1.07, Math.floor(currentLevel / chaserBoostIntervalVis));
                const curseBoost = Math.pow(1.15, activeCurses.chaser_boost);
                const visualRadius = cellSize * 0.28 * c.sizeMultiplier * lvlBoost * curseBoost;

                ctx.shadowBlur = 10;
                ctx.shadowColor = '#0ea5e9';
                ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
                ctx.beginPath();
                ctx.arc(cx, cy, visualRadius * 1.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0369a1';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, visualRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = 0;

                const blink = Math.floor(Date.now() / 180) % 2 === 0;
                ctx.fillStyle = blink ? '#e0f2fe' : '#0284c7';
                ctx.beginPath();
                ctx.arc(cx, cy, visualRadius * 0.35, 0, Math.PI * 2);
                ctx.fill();
            });

            // 12. Draw Screamer Ghosts (Smooth floating coordinates & target lines)
            screamersList.forEach(s => {
                const scX = s.x * cellSize;
                const scY = s.y * cellSize;

                // A. Draw prediction laser when in warning state
                if (s.state === 'warning') {
                    const elapsed = now - (s.timer - 1000);
                    const blink = Math.floor(elapsed / 100) % 2 === 0;

                    ctx.save();
                    ctx.strokeStyle = `rgba(217, 70, 239, ${blink ? 0.7 : 0.2})`;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(scX, scY);
                    ctx.lineTo(s.targetX * cellSize, s.targetY * cellSize);
                    ctx.stroke();
                    ctx.restore();
                }

                // B. Draw Spectral outline
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#d946ef';

                ctx.fillStyle = s.state === 'cooldown' ? '#701a75' : '#a21caf';
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 2;

                const radius = cellSize * 0.3;
                ctx.beginPath();
                ctx.arc(scX, scY, radius, Math.PI, 0, false); // spectral head top
                ctx.lineTo(scX + radius, scY + radius); // right side body
                
                // Draw cute ghost waves bottom
                const wCount = 3;
                const wStep = (radius * 2) / wCount;
                for (let i = 0; i < wCount; i++) {
                    const wavePhase = Math.sin(Date.now() * 0.015 + i * 2) * (cellSize * 0.05);
                    ctx.lineTo(scX + radius - (i * wStep) - wStep/2, scY + radius + wavePhase);
                }
                ctx.lineTo(scX - radius, scY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // C. Glowing yellow screaming eyes inside mask
                const blink = Math.floor(now / 150) % 2 === 0;
                ctx.fillStyle = blink ? '#eab308' : '#7f1d1d';
                ctx.fillRect(scX - radius * 0.4, scY - radius * 0.2, cellSize * 0.08, cellSize * 0.08);
                ctx.fillRect(scX + radius * 0.1, scY - radius * 0.2, cellSize * 0.08, cellSize * 0.08);

                ctx.restore();
            });

            // 13. Draw Flesh Monsters (Floating coordinates)
            fleshList.forEach(f => {
                const fx = f.x * cellSize;
                const fy = f.y * cellSize;

                ctx.fillStyle = '#ef4444'; 
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 2;

                const blockRadius = cellSize * 0.32;
                ctx.fillRect(fx - blockRadius, fy - blockRadius, blockRadius * 2, blockRadius * 2);
                ctx.strokeRect(fx - blockRadius, fy - blockRadius, blockRadius * 2, blockRadius * 2);

                const blink = Math.floor(now / 200) % 2 === 0;
                ctx.fillStyle = blink ? '#ffffff' : '#7f1d1d';
                ctx.beginPath();
                ctx.arc(fx, fy, cellSize * 0.1, 0, Math.PI * 2);
                ctx.fill();
            });

            // 14. Draw Player Node (centered on continuous visual position)
            const pcx = playerVisualPos.x * cellSize;
            const pcy = playerVisualPos.y * cellSize;
            const pSize = cellSize * 0.7;
            const px = pcx - pSize / 2;
            const py = pcy - pSize / 2;

            ctx.shadowBlur = 10;
            ctx.shadowColor = '#6366f1';
            
            ctx.fillStyle = '#818cf8';
            ctx.fillRect(px, py, pSize, pSize);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, pSize, pSize);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#020617';
            ctx.fillRect(px + pSize * 0.21, py + pSize * 0.21, pSize * 0.57, pSize * 0.21);

            // 15. Draw Graphics Particles (Rendered dynamically inside the translated context)
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x * cellSize, p.y * cellSize, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 16. Draw Holographic Floating Texts (Rendered dynamically inside the translated context)
            floatingTexts.forEach(ft => {
                ctx.save();
                ctx.globalAlpha = ft.alpha;
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 10px "Press Start 2P"';
                ctx.shadowBlur = 8;
                ctx.shadowColor = ft.color;
                ctx.textAlign = 'center';
                ctx.fillText(ft.text, ft.x * cellSize, ft.y * cellSize);
                ctx.restore();
            });

            ctx.restore(); // Restore camera translation state

            // 17. Draw UI Static terminal overlay curse
            if ((activeCurses.ui_static || activeCurses.medal_chaosweave) && Math.random() < (activeCurses.medal_chaosweave ? 0.35 : 0.2)) {
                ctx.save();
                ctx.fillStyle = 'rgba(236, 72, 153, 0.04)';
                ctx.fillRect(0, Math.random() * size, size, Math.random() * 10 + 2);
                ctx.restore();
            }

            // 18. Draw Chrono Decay visual indicator on the canvas margin
            if (activeCurses.chrono_decay && chronoTimerSeconds <= 5) {
                ctx.save();
                ctx.fillStyle = `rgba(239, 68, 68, ${0.15 * (1 + Math.sin(Date.now() * 0.01))})`;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            // 19. Draw bright Damage Glitch Screen Tint overlay
            if (damageFlashTime > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * (damageFlashTime / 200)})`;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            // 20. Draw Green Heal Screen Tint overlay
            if (healFlashTime > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(16, 185, 129, ${0.45 * (healFlashTime / 300)})`;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            // 21. Draw Off-Screen Exit Indicator Arrow (Pin onto Viewport Margins)
            if (useCamera) {
                const winScreenX = (winPos.c + 0.5 - leftTile) * cellSize;
                const winScreenY = (winPos.r + 0.5 - topTile) * cellSize;

                if (winScreenX < 0 || winScreenX > size || winScreenY < 0 || winScreenY > size) {
                    const dx = winScreenX - size / 2;
                    const dy = winScreenY - size / 2;
                    const angle = Math.atan2(dy, dx);

                    const padding = 24;
                    const boundX = size / 2 - padding;
                    const boundY = size / 2 - padding;
                    
                    let arrowX, arrowY;

                    if (Math.abs(dx) * boundY > Math.abs(dy) * boundX) {
                        if (dx > 0) {
                            arrowX = size / 2 + boundX;
                            arrowY = size / 2 + boundX * (dy / dx);
                        } else {
                            arrowX = size / 2 - boundX;
                            arrowY = size / 2 - boundX * (dy / dx);
                        }
                    } else {
                        if (dy > 0) {
                            arrowY = size / 2 + boundY;
                            arrowX = size / 2 + boundY * (dx / dy);
                        } else {
                            arrowY = size / 2 - boundY;
                            arrowX = size / 2 - boundY * (dx / dy);
                        }
                    }

                    ctx.save();
                    ctx.translate(arrowX, arrowY);
                    ctx.rotate(angle);

                    ctx.shadowBlur = 10;
                    ctx.shadowColor = isExitLocked ? '#fbbf24' : '#10b981';
                    ctx.fillStyle = isExitLocked ? '#fbbf24' : '#10b981';

                    ctx.restore();
                }
            }

            // 21b. Coin Radar Upgrade: Off-Screen Indicator Arrow towards nearest coin
            if (useCamera && upgrades.coin_radar > 0 && coinsList.length > 0) {
                let nearest = null;
                let nearestDist = Infinity;
                coinsList.forEach(coin => {
                    const d = Math.hypot(coin.c - playerVisualPos.x, coin.r - playerVisualPos.y);
                    if (d < nearestDist) { nearestDist = d; nearest = coin; }
                });

                if (nearest) {
                    const coinScreenX = (nearest.c + 0.5 - leftTile) * cellSize;
                    const coinScreenY = (nearest.r + 0.5 - topTile) * cellSize;

                    if (coinScreenX < 0 || coinScreenX > size || coinScreenY < 0 || coinScreenY > size) {
                        const dx = coinScreenX - size / 2;
                        const dy = coinScreenY - size / 2;
                        const angle = Math.atan2(dy, dx);

                        const padding = 40;
                        const boundX = size / 2 - padding;
                        const boundY = size / 2 - padding;

                        let arrowX, arrowY;

                        if (Math.abs(dx) * boundY > Math.abs(dy) * boundX) {
                            if (dx > 0) {
                                arrowX = size / 2 + boundX;
                                arrowY = size / 2 + boundX * (dy / dx);
                            } else {
                                arrowX = size / 2 - boundX;
                                arrowY = size / 2 - boundX * (dy / dx);
                            }
                        } else {
                            if (dy > 0) {
                                arrowY = size / 2 + boundY;
                                arrowX = size / 2 + boundY * (dx / dy);
                            } else {
                                arrowY = size / 2 - boundY;
                                arrowX = size / 2 - boundY * (dx / dy);
                            }
                        }

                        ctx.save();
                        ctx.translate(arrowX, arrowY);
                        ctx.rotate(angle);
                        ctx.globalAlpha = 0.85;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = '#fbbf24';
                        ctx.fillStyle = '#fbbf24';
                        ctx.beginPath();
                        ctx.moveTo(7, 0);
                        ctx.lineTo(-4, -4);
                        ctx.lineTo(-2, 0);
                        ctx.lineTo(-4, 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }

            // 22. Draw Coin count overlay on Canvas screen space
            if (currentLevel >= 10 && coinsList.length > 0) {
                ctx.save();
                ctx.fillStyle = '#fbbf24';
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#eab308';
                ctx.font = '8px "Press Start 2P"';
                ctx.textAlign = 'left';
                ctx.fillText(`COINS: ${coinsList.length} REMAINING`, 16, 26);
                ctx.restore();
            } else if (currentLevel >= 10 && coinsList.length === 0) {
                ctx.save();
                ctx.fillStyle = '#10b981';
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#059669';
                ctx.font = '8px "Press Start 2P"';
                ctx.textAlign = 'left';
                ctx.fillText(`EXIT PORT: COMPILING UNLOCKED`, 16, 26);
                ctx.restore();
            }

            if (debugModeActive) {
                ctx.save();
                ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
                ctx.fillRect(10, 40, 220, 18);
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px "Press Start 2P"';
                ctx.textAlign = 'left';
                ctx.fillText('DEBUG MODE ACTIVE', 14, 54);
                ctx.restore();
            }
        }

        // Frame rendering placeholder fallback when inactive
        function drawPlaceholderEngine() {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const center = canvas.width / 2;
            const radius = canvas.width * 0.3;
            const angle = Date.now() * 0.0005;
            
            ctx.arc(center, center, radius, angle, angle + Math.PI * 1.5);
            ctx.stroke();
        }

        // Resize Canvas dynamically to match CSS Container layouts
        function resizeGameWindow() {
            const container = canvas.parentElement;
            const size = Math.min(container.clientWidth, container.clientHeight, 512);
            canvas.width = size;
            canvas.height = size;
            if (!activeLevelRunning) drawPlaceholderEngine();
        }

        window.addEventListener('resize', resizeGameWindow);
        window.addEventListener('load', () => {
            resizeGameWindow();
            lastFrameTime = Date.now();
            requestAnimationFrame(gameUpdateLoop);
        });

        // Touch Control & Keyboard Core Events (continuous / held-key movement)
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') keysHeld.up = true;
            if (key === 's' || key === 'arrowdown') keysHeld.down = true;
            if (key === 'a' || key === 'arrowleft') keysHeld.left = true;
            if (key === 'd' || key === 'arrowright') keysHeld.right = true;
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') keysHeld.up = false;
            if (key === 's' || key === 'arrowdown') keysHeld.down = false;
            if (key === 'a' || key === 'arrowleft') keysHeld.left = false;
            if (key === 'd' || key === 'arrowright') keysHeld.right = false;
        });

        // Virtual Joystick Bindings (press and hold)
        function bindHoldButton(elementId, dirKey) {
            const el = document.getElementById(elementId);
            if (!el) return;
            const press = (e) => { e.preventDefault(); keysHeld[dirKey] = true; };
            const release = (e) => { e.preventDefault(); keysHeld[dirKey] = false; };
            el.addEventListener('pointerdown', press);
            el.addEventListener('pointerup', release);
            el.addEventListener('pointerleave', release);
            el.addEventListener('pointercancel', release);
        }
        bindHoldButton('btnUp', 'up');
        bindHoldButton('btnDown', 'down');
        bindHoldButton('btnLeft', 'left');
        bindHoldButton('btnRight', 'right');

        // Screen Touch Drag-to-Move: hold finger in a direction relative to start point
        let touchStartX = 0;
        let touchStartY = 0;
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (!touchStartX && !touchStartY) return;
            const diffX = e.touches[0].clientX - touchStartX;
            const diffY = e.touches[0].clientY - touchStartY;
            const threshold = 15;

            keysHeld.right = diffX > threshold;
            keysHeld.left = diffX < -threshold;
            keysHeld.down = diffY > threshold;
            keysHeld.up = diffY < -threshold;
        }, { passive: true });

        canvas.addEventListener('touchend', (e) => {
            keysHeld.up = false;
            keysHeld.down = false;
            keysHeld.left = false;
            keysHeld.right = false;
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });

    
    safeAddEvent(document.getElementById('startGameBtn'), 'click', () => {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) startScreen.classList.add('hidden');
        
        // Starts the intermission music section right away
        if (typeof window.playIntermissionMusic === 'function') {
            window.playIntermissionMusic(1);
        }
        if (typeof showEnemyChoiceModal === 'function') showEnemyChoiceModal(1);
    });
        document.getElementById('restartGameBtn').addEventListener('click', () => {
            if (typeof window.stopIntermissionMusic === 'function') window.stopIntermissionMusic();
            if (typeof window.stopGameplayMusic === 'function') window.stopGameplayMusic();
        if (typeof restartFullGame === 'function') restartFullGame();
        });

        document.getElementById('victoryResetBtn').addEventListener('click', () => {
            if (typeof window.stopIntermissionMusic === 'function') window.stopIntermissionMusic();
            if (typeof window.stopGameplayMusic === 'function') window.stopGameplayMusic();
        if (typeof restartFullGame === 'function') restartFullGame();
        });