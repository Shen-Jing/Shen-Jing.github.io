import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './metronome.module.css';

// -----------------------------------------------------------
// 核心引擎 (Core Engine) - 直接移植您的 Class 邏輯
// -----------------------------------------------------------
class MetronomeEngine {
  constructor(onBeatCallback) {
    this.audioContext = null;
    this.isPlaying = false;
    this.current16thNote = 0;
    this.nextNoteTime = 0.0;
    this.timerID = null;
    this.lookahead = 25.0;
    this.scheduleAheadTime = 0.1;

    // Settings
    this.bpm = 100;
    this.patternLength = 4;
    this.stepsPerBeat = 4;
    this.pattern = [true, false, false, false];
    this.accentFirstBeat = true;

    // UI Callbacks
    this.onBeatCallback = onBeatCallback;
  }

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerStep = secondsPerBeat / this.stepsPerBeat;
    this.nextNoteTime += secondsPerStep;
    this.current16thNote++;
    if (this.current16thNote >= this.patternLength) {
      this.current16thNote = 0;
    }
  }

  scheduleNote(beatNumber, time) {
    if (this.pattern[beatNumber]) {
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      if (this.accentFirstBeat && beatNumber === 0) {
        osc.frequency.value = 880.0;
      } else {
        osc.frequency.value = 440.0;
      }

      gainNode.gain.setValueAtTime(1, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.start(time);
      osc.stop(time + 0.1);
    }
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      
      // Visual Sync
      if (this.onBeatCallback) {
        const delay = (this.nextNoteTime - this.audioContext.currentTime) * 1000;
        const noteIndex = this.current16thNote;
        setTimeout(() => {
          this.onBeatCallback(noteIndex);
        }, Math.max(0, delay));
      }

      this.nextNote();
    }
    if (this.isPlaying) {
      this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
    }
  }

  start() {
    if (this.isPlaying) return;
    if (!this.audioContext) this.init();
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    this.isPlaying = true;
    this.current16thNote = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.1;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    window.clearTimeout(this.timerID);
  }
}

// -----------------------------------------------------------
// React Component (UI & State Management)
// -----------------------------------------------------------
function MetronomeApp() {
  // --- State ---
  const [bpm, setBpm] = useState(100);
  const [patternLength, setPatternLength] = useState(4);
  const [stepsPerBeat, setStepsPerBeat] = useState(4);
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  const [pattern, setPattern] = useState([true, false, false, false]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState(-1);
  
  // Presets System
  const [presets, setPresets] = useState({});
  const [presetNameInput, setPresetNameInput] = useState('');

  // Engine Ref
  const engineRef = useRef(null);
  const PRESETS_KEY = 'metronomePresetsMap';
  const SETTINGS_KEY = 'metronomeSettings';

  // --- Initialization & Lifecycle ---
  useEffect(() => {
    // 1. Instantiate Engine
    engineRef.current = new MetronomeEngine((index) => {
      setActiveBeatIndex(index);
    });

    // 2. Load Settings from LocalStorage
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        if (s.bpm) setBpm(s.bpm);
        if (s.patternLength) setPatternLength(s.patternLength);
        if (s.stepsPerBeat) setStepsPerBeat(s.stepsPerBeat);
        if (s.accent !== undefined) setAccentFirstBeat(s.accent);
        
        // Restore pattern only if length matches (otherwise let logic resize it)
        if (s.pattern && Array.isArray(s.pattern) && s.pattern.length === s.patternLength) {
          setPattern(s.pattern);
        } else if (s.patternLength) {
          // Resize default if needed based on loaded length
          resizePattern(s.patternLength, s.pattern || []);
        }
      } catch (e) { console.error(e); }
    }

    // 3. Load Presets
    const savedPresets = localStorage.getItem(PRESETS_KEY);
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (e) {}
    }

    // Cleanup
    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, []);

  // --- Sync State to Engine & Storage ---
  useEffect(() => {
    if (!engineRef.current) return;

    // Update Engine
    engineRef.current.bpm = bpm;
    engineRef.current.patternLength = patternLength;
    engineRef.current.stepsPerBeat = stepsPerBeat;
    engineRef.current.pattern = pattern;
    engineRef.current.accentFirstBeat = accentFirstBeat;

    // Save Settings
    const settings = {
      bpm,
      patternLength,
      stepsPerBeat,
      pattern,
      accent: accentFirstBeat
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  }, [bpm, patternLength, stepsPerBeat, pattern, accentFirstBeat]);


  // --- Logic Helpers ---

  // Resize pattern array maintaining existing beats
  const resizePattern = (newLen, currentPat = pattern) => {
    const newP = [];
    for (let i = 0; i < newLen; i++) {
      if (i < currentPat.length) newP.push(currentPat[i]);
      else newP.push(false);
    }
    setPattern(newP);
  };

  const togglePlay = () => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
      setActiveBeatIndex(-1);
    } else {
      engineRef.current.start();
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (val) => {
    let b = parseFloat(val);
    if (isNaN(b)) return; 
    setBpm(Math.min(300, Math.max(1, b)));
  };

  const handleSubBpmChange = (val) => {
    // subBpm = bpm * stepsPerBeat
    // -> bpm = subBpm / stepsPerBeat
    const sub = parseFloat(val);
    if (isNaN(sub)) return;
    const newBpm = sub / stepsPerBeat;
    setBpm(Math.min(300, Math.max(1, newBpm)));
  };

  const updatePatternLength = (delta, exactVal = null) => {
    let newVal = exactVal !== null ? parseInt(exactVal) : patternLength + delta;
    if (isNaN(newVal)) newVal = 4;
    newVal = Math.min(128, Math.max(1, newVal));
    
    setPatternLength(newVal);
    resizePattern(newVal);
  };

  const updateStepsPerBeat = (delta, exactVal = null) => {
    let newVal = exactVal !== null ? parseInt(exactVal) : stepsPerBeat + delta;
    if (isNaN(newVal)) newVal = 4;
    newVal = Math.min(32, Math.max(1, newVal));
    setStepsPerBeat(newVal);
  };

  const toggleBeat = (idx) => {
    const newP = [...pattern];
    newP[idx] = !newP[idx];
    setPattern(newP);
  };

  // --- Presets Logic ---
  const savePreset = () => {
    const name = presetNameInput.trim();
    if (!name) return;
    
    const newPresets = {
      ...presets,
      [name]: {
        bpm,
        patternLength,
        stepsPerBeat,
        pattern,
        accent: accentFirstBeat
      }
    };
    setPresets(newPresets);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
    setPresetNameInput('');
  };

  const loadPreset = (name) => {
    const p = presets[name];
    if (!p) return;
    
    if (p.bpm) setBpm(p.bpm);
    if (p.patternLength) {
        setPatternLength(p.patternLength);
        // Force resize immediate to match loading pattern
        if (p.pattern && p.pattern.length === p.patternLength) {
             setPattern(p.pattern);
        } else {
             resizePattern(p.patternLength, p.pattern || []);
        }
    }
    if (p.stepsPerBeat) setStepsPerBeat(p.stepsPerBeat);
    if (p.accent !== undefined) setAccentFirstBeat(p.accent);
  };

  const deletePreset = (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete preset "${name}"?`)) return;
    
    const newPresets = { ...presets };
    delete newPresets[name];
    setPresets(newPresets);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
  };

  // Derived Display Values
  const subBpmDisplay = Math.round(bpm * stepsPerBeat);

  return (
    <div className={styles.container}>
      <div className={styles.appContainer}>
        <header className={styles.header}>
          <h1>節拍器 Metronome</h1>
        </header>

        {/* Controls */}
        <div className={styles.controlsTop}>
          
          {/* BPM */}
          <div className={styles.card}>
            <label className={styles.label}>速度 BPM</label>
            <div className={styles.inputWrapper}>
              <button className={styles.iconBtn} onClick={() => handleBpmChange(bpm - 1)}>-</button>
              <input 
                type="number" 
                className={styles.numberInput}
                value={Number.isInteger(bpm) ? bpm : bpm.toFixed(1)} 
                onChange={(e) => handleBpmChange(e.target.value)}
              />
              <button className={styles.iconBtn} onClick={() => handleBpmChange(bpm + 1)}>+</button>
            </div>
            <input 
              type="range" 
              className={styles.slider}
              min="1" max="300" 
              value={bpm} 
              onChange={(e) => handleBpmChange(e.target.value)}
            />
            
            <div className={styles.subBpmRow}>
              <label className={styles.label}>細分拍速度 Subdivision BPM</label>
              <input 
                type="number" 
                className={styles.subBpmInput} 
                value={subBpmDisplay} 
                onChange={(e) => handleSubBpmChange(e.target.value)}
              />
            </div>
          </div>

          {/* Subdivision & Length */}
          <div className={styles.card}>
            {/* Pattern Length */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>樣式長度 (步數)<br/>Pattern Length</label>
              <div className={styles.inputWrapper}>
                <button className={styles.iconBtn} onClick={() => updatePatternLength(-1)}>-</button>
                <input 
                  type="number" 
                  className={styles.numberInput} 
                  style={{fontSize: '1.5rem', width: '80px'}}
                  value={patternLength}
                  onChange={(e) => updatePatternLength(0, e.target.value)}
                />
                <button className={styles.iconBtn} onClick={() => updatePatternLength(1)}>+</button>
              </div>
            </div>

            {/* Steps Per Beat */}
            <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
              <label className={styles.label}>每拍步數<br/>Steps / Beat</label>
              <div className={styles.inputWrapper}>
                <button className={styles.iconBtn} onClick={() => updateStepsPerBeat(-1)}>-</button>
                <input 
                  type="number" 
                  className={styles.numberInput} 
                  style={{fontSize: '1.5rem', width: '80px'}}
                  value={stepsPerBeat}
                  onChange={(e) => updateStepsPerBeat(0, e.target.value)}
                />
                <button className={styles.iconBtn} onClick={() => updateStepsPerBeat(1)}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Grid Editor */}
        <div className={styles.patternEditor}>
          <p>點擊切換節拍 Toggle beats to play</p>
          <div className={styles.patternGrid}>
            {pattern.map((isActive, idx) => (
              <div 
                key={idx}
                onClick={() => toggleBeat(idx)}
                className={`
                  ${styles.gridCell} 
                  ${isActive ? styles.gridCellActive : ''} 
                  ${activeBeatIndex === idx ? styles.gridCellPlaying : ''}
                `}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <div className={styles.toggleContainer}>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={accentFirstBeat} 
                onChange={(e) => setAccentFirstBeat(e.target.checked)}
              />
              <span className={styles.sliderSwitch}></span>
            </label>
            <span className={styles.label} style={{textTransform:'none', marginLeft:'8px'}}>強調首拍 Accent First Beat</span>
          </div>
        </div>

        {/* Play Button */}
        <div className={styles.actionArea}>
          <button 
            className={`${styles.playBtn} ${isPlaying ? styles.playBtnPlaying : ''}`}
            onClick={togglePlay}
          >
            {isPlaying ? '■' : '▶'}
          </button>
        </div>

        {/* Presets */}
        <div className={styles.presetsContainer}>
          <h3>預設組 Presets</h3>
          <div className={styles.presetControls}>
             <input 
               type="text" 
               className={styles.presetNameInput}
               placeholder="名稱 Name (e.g. Rock 120)"
               value={presetNameInput}
               onChange={(e) => setPresetNameInput(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && savePreset()}
             />
             <button className={styles.btnSecondary} onClick={savePreset}>儲存 Save</button>
          </div>
          
          <ul className={styles.presetList}>
            {Object.keys(presets).sort().map(name => (
              <li key={name} className={styles.presetItem}>
                <span className={styles.presetName} onClick={() => loadPreset(name)}>
                  {name}
                </span>
                <button className={styles.btnDelete} onClick={(e) => deletePreset(name, e)}>
                  ×
                </button>
              </li>
            ))}
            {Object.keys(presets).length === 0 && (
               <li style={{color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>
                  無預設組 No presets
               </li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

// -----------------------------------------------------------
// Docusaurus Page Wrapper
// -----------------------------------------------------------
export default function MetronomePage() {
  return (
    <Layout title="Metronome" description="Custom Web Metronome">
      <BrowserOnly fallback={<div style={{padding:'2rem', color:'white'}}>Loading Metronome...</div>}>
        {() => <MetronomeApp />}
      </BrowserOnly>
    </Layout>
  );
}