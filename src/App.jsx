import React, { useState, useCallback, useEffect, useRef } from 'react'
import GameBoard from './components/GameBoard'
import MainMenu from './components/MainMenu'
import DuelOverlay from './components/DuelOverlay'

import HUD from './components/HUD'
import GameOverScreen from './components/GameOverScreen'
import {
  GAME_STATE, DIR, POWERUP,
  LIMAH_BACKGROUND_IMG, USOP_WILCHA_NANGIS_IMG, HUSINNN_SFX,
  BOMOH_SOFIJIKAN_IMG, DUKUN_JAWA_SFX, USOP_DUKUN_SFX,
  GAMEOVER_SFX, KAKLIMAH_BEKU_SFX, KUIH_SFX, SELIPAR_KEMUKA_SFX, CLICK_SOUND_SFX, SOLEY_SOLEY_SFX,
  TERGELINCIR_SFX, DUEL_SOUNDTRACK_SRC, HUSIN_WINGAME_IMG, NYAWA_TOLAK_SFX,
  BUKU_PANDUAN_IMG, SELIPAR_JEPUN_IMG,
  SELIPAR_CAMPAK_BTN_IMG, HUSIN_LARI_BTN_IMG,
  HUSIN_SPRITES, LIMAH_SPRITES, USOP_WILCHA_IMG, POWERUP_SPRITES,
  TEMPAT_SELAMAT_IMG, FLAG_TOLONG_IMG, BOMOH_FULLBODY_IMG,
  INGAME_SOUND_SRC,
  LUMUT_IMG, RUMPUT_IMG, TANAH_IMG, KUBUR_IMG, SPIKE_TILES_IMG, BLACK_HOLE_IMG,
} from './constants'
import { createInitialState, processMove, applySeliparChoice, applyGraveJump, cancelGraveJump, resolveDuel } from './gameLogic'
import './App.css'

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [state, setState] = useState(null);
  const [showNangisPopup, setShowNangisPopup] = useState(false);
  const [showBomohPopup, setShowBomohPopup] = useState(false);
  const [showBomohDeathPopup, setShowBomohDeathPopup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSeliparThrow, setShowSeliparThrow] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [boardScale, setBoardScale] = useState(1);
  // Lumut slide animation state — overrides player display position briefly
  const [lumutSlideOverride, setLumutSlideOverride] = useState(null); // { pos, to }
  const lumutTimerRef = useRef(null);
  const audioRef = useRef(null);
  const bgmRef = useRef(null);
  const sfxListRef = useRef([]);
  const bomohTimerRef = useRef(null);
  const deathTimerRef = useRef(null);
  const duelBgmRef = useRef(null);

  // SFX player - tracked so we can stop them on restart
  const stopAllSfx = useCallback(() => {
    sfxListRef.current.forEach(a => { try { a.pause(); } catch (e) { /* */ } });
    sfxListRef.current = [];
  }, []);

  const playSfx = useCallback((src, volume = 0.7) => {
    if (!soundOn) return;
    try {
      const sfx = new Audio(src);
      sfx.volume = volume;
      sfx.addEventListener('ended', () => {
        sfxListRef.current = sfxListRef.current.filter(a => a !== sfx);
      });
      sfxListRef.current.push(sfx);
      sfx.play().catch(() => {});
    } catch (e) { /* */ }
  }, [soundOn]);

  // Click sound for all buttons and keys
  const playClick = useCallback(() => {
    playSfx(CLICK_SOUND_SFX, 0.5);
  }, [playSfx]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const playAudio = useCallback((src, volume = 0.7) => {
    cleanupAudio();
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch (e) {
      // audio might fail silently
    }
  }, [cleanupAudio]);

  // Responsive board scaling - fit board in viewport without scrolling
  useEffect(() => {
    const calcScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Board outer is ~580px wide, ~580px tall. HUD ~45px top, message ~60px bottom
      const availW = vw - 20;
      const availH = vh - 55; // 45px HUD + 10px margin
      const scaleX = availW / 590;
      const scaleY = availH / 600;
      setBoardScale(Math.min(scaleX, scaleY, 1));
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  // BGM management - endless loop
  const startBgm = useCallback(() => {
    if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
    try {
      const bgm = new Audio(INGAME_SOUND_SRC);
      bgm.loop = true;
      bgm.addEventListener('ended', () => { bgm.currentTime = 0; bgm.play().catch(() => {}); });
      bgm.volume = 0.4;
      bgm.play().catch(() => {});
      bgmRef.current = bgm;
    } catch (e) { /* */ }
  }, []);

  const stopBgm = useCallback(() => {
    if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      if (bgmRef.current) {
        if (next) { bgmRef.current.play().catch(() => {}); }
        else { bgmRef.current.pause(); }
      }
      return next;
    });
  }, []);

  const goToMenu = useCallback(() => {
    stopBgm();
    if (duelBgmRef.current) { duelBgmRef.current.pause(); duelBgmRef.current = null; }
    cleanupAudio();
    stopAllSfx();
    setGameState(GAME_STATE.MENU);
    setState(null);
    setShowNangisPopup(false);
    setShowBomohPopup(false);
    setShowBomohDeathPopup(false);
    setShowGuide(false);
  }, [stopBgm, cleanupAudio, stopAllSfx]);

  const startGame = useCallback(() => {
    stopAllSfx();
    cleanupAudio();
    setState(createInitialState());
    setGameState(GAME_STATE.PLAYING);
    setShowNangisPopup(true);
    playAudio(HUSINNN_SFX);
    startBgm();
    setTimeout(() => {
      setShowNangisPopup(false);
      cleanupAudio();
    }, 5000);
  }, [playAudio, cleanupAudio, startBgm, stopAllSfx]);

  const handleMove = useCallback((dir) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.duel?.active) return prev; // block moves during duel
      const newState = processMove(prev, dir);
      if (newState.gameOver) {
        setTimeout(() => setGameState(GAME_STATE.GAME_OVER), 500);
      }
      if (newState.win) {
        setTimeout(() => setGameState(GAME_STATE.WIN), 500);
      }
      return newState;
    });
  }, []);

  // Watch for bomoh spawn trigger
  useEffect(() => {
    if (state?.bomohJustSpawned) {
      setShowBomohPopup(true);
      playAudio(DUKUN_JAWA_SFX, 0.8);
      if (bomohTimerRef.current) clearTimeout(bomohTimerRef.current);
      bomohTimerRef.current = setTimeout(() => {
        setShowBomohPopup(false);
        cleanupAudio();
        bomohTimerRef.current = null;
      }, 8000);
      setState(prev => prev ? { ...prev, bomohJustSpawned: false } : prev);
    }
  }, [state?.bomohJustSpawned, playAudio, cleanupAudio]);

  // Watch for bomoh death trigger
  // Sequence: sofijikan popup disappears → bomohpengsan shows on board → usop nangis popup + usopdukun sfx
  useEffect(() => {
    if (state?.bomohJustDied) {
      // 1. Immediately dismiss bomoh sofijikan popup
      setShowBomohPopup(false);
      if (bomohTimerRef.current) { clearTimeout(bomohTimerRef.current); bomohTimerRef.current = null; }
      cleanupAudio();

      // 2. Short delay then show usop nangis + play usopdukun
      setTimeout(() => {
        setShowBomohDeathPopup(true);
        playAudio(USOP_DUKUN_SFX, 0.8);
      }, 600);

      if (deathTimerRef.current) clearTimeout(deathTimerRef.current);
      deathTimerRef.current = setTimeout(() => {
        setShowBomohDeathPopup(false);
        cleanupAudio();
        deathTimerRef.current = null;
      }, 5000);
      setState(prev => prev ? { ...prev, bomohJustDied: false } : prev);
    }
  }, [state?.bomohJustDied, playAudio, cleanupAudio]);

  // Grave portal jump handler
  const handleGraveJump = useCallback((targetPos) => {
    setState(prev => {
      if (!prev || !prev.graveJumpChoices) return prev;
      const newState = targetPos
        ? applyGraveJump(prev, targetPos)
        : cancelGraveJump(prev);
      if (newState.gameOver) setTimeout(() => setGameState(GAME_STATE.GAME_OVER), 500);
      if (newState.win) setTimeout(() => setGameState(GAME_STATE.WIN), 500);
      return newState;
    });
  }, []);

  // Lumut slide animation: phase 1 = show Husin ON the lumut tile, phase 2 = slide to finalPos
  useEffect(() => {
    if (!state?.lumutSlideAnim) return;
    const { from, to } = state.lumutSlideAnim;
    // Phase 1: freeze display at the lumut tile (from) for 200ms so player sees it
    setLumutSlideOverride({ phase: 'on-lumut', pos: from, to });
    // Clear the anim flag from state immediately so it doesn't re-trigger
    setState(prev => prev ? { ...prev, lumutSlideAnim: null } : prev);
    if (lumutTimerRef.current) clearTimeout(lumutTimerRef.current);
    // Phase 2: after 200ms trigger the slide CSS (move to `to` position)
    lumutTimerRef.current = setTimeout(() => {
      setLumutSlideOverride({ phase: 'sliding', pos: to, to });
      // Phase 3: after slide finishes (400ms), clear override
      lumutTimerRef.current = setTimeout(() => {
        setLumutSlideOverride(null);
      }, 400);
    }, 200);
  }, [state?.lumutSlideAnim]);

  // Selipar choice handler
  const handleSeliparChoice = useCallback((choice) => {
    setState(prev => {
      if (!prev || !prev.hasSelipar) return prev;
      const newState = applySeliparChoice(prev, choice);
      if (choice === 'campak') {
        setShowSeliparThrow(true);
        playSfx(SELIPAR_KEMUKA_SFX, 0.8);
        setTimeout(() => setShowSeliparThrow(false), 1200);
      }
      return newState;
    });
  }, [playSfx]);

  // Duel choice handler — picks a move, resolveDuel returns resolved state
  const handleDuelChoice = useCallback((move) => {
    setState(prev => {
      if (!prev || !prev.duel?.active) return prev;
      return resolveDuel(prev, move);
    });
  }, []);

  // Called by DuelOverlay after result animation completes
  const handleDuelClose = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const wasGameOver = prev.duel?.causedGameOver || prev.gameOver;
      const wasWin = prev.win;
      const newState = { ...prev, duel: null };
      if (wasGameOver) setTimeout(() => setGameState(GAME_STATE.GAME_OVER), 300);
      if (wasWin) setTimeout(() => setGameState(GAME_STATE.WIN), 300);
      return newState;
    });
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (gameState !== GAME_STATE.PLAYING) return;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        playClick();
        handleMove(DIR.UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        playClick();
        handleMove(DIR.DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        playClick();
        handleMove(DIR.LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        playClick();
        handleMove(DIR.RIGHT);
        break;
    }
  }, [gameState, handleMove, playClick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // SFX: Game over - Husin dies
  useEffect(() => {
    if (state?.gameOver) {
      playSfx(GAMEOVER_SFX, 0.8);
    }
  }, [state?.gameOver, playSfx]);

  // SFX: Win - Husin selamat
  useEffect(() => {
    if (state?.win) {
      stopBgm();
      playSfx(SOLEY_SOLEY_SFX, 0.8);
    }
  }, [state?.win, playSfx, stopBgm]);

  // SFX: Kak Limah frozen or stunned
  const prevFrozenRef = useRef(0);
  useEffect(() => {
    const frozen = state?.ghostFrozen || 0;
    if (frozen > 0 && prevFrozenRef.current === 0) {
      playSfx(KAKLIMAH_BEKU_SFX, 0.8);
    }
    prevFrozenRef.current = frozen;
  }, [state?.ghostFrozen, playSfx]);

  // SFX: Kuih pickup (score increases)
  const prevScoreRef = useRef(0);
  useEffect(() => {
    const score = state?.score || 0;
    if (score > prevScoreRef.current && prevScoreRef.current >= 0) {
      playSfx(KUIH_SFX, 0.7);
    }
    prevScoreRef.current = score;
  }, [state?.score, playSfx]);

  // SFX: Duel triggered — pause BGM, play duel soundtrack; resume BGM when duel ends
  const prevDuelRef = useRef(false);
  useEffect(() => {
    const duelActive = !!(state?.duel?.active && !state?.duel?.resolved);
    if (duelActive && !prevDuelRef.current) {
      // Pause BGM
      if (bgmRef.current) bgmRef.current.pause();
      // Play duel soundtrack on loop
      try {
        const ds = new Audio(DUEL_SOUNDTRACK_SRC);
        ds.loop = true;
        ds.volume = 0.7;
        ds.play().catch(() => {});
        duelBgmRef.current = ds;
      } catch (e) { /* */ }
    } else if (!duelActive && prevDuelRef.current) {
      // Duel ended — stop duel soundtrack, resume BGM
      if (duelBgmRef.current) {
        duelBgmRef.current.pause();
        duelBgmRef.current = null;
      }
      if (bgmRef.current) bgmRef.current.play().catch(() => {});
    }
    prevDuelRef.current = duelActive;
  }, [state?.duel?.active, state?.duel?.resolved]);

  // SFX: Spike duri hit
  const prevSpikeRef = useRef(false);
  useEffect(() => {
    const hit = !!(state?.spikeHit);
    if (hit && !prevSpikeRef.current) {
      playSfx(TERGELINCIR_SFX, 0.8);
    }
    prevSpikeRef.current = hit;
  }, [state?.spikeHit, playSfx]);

  // SFX: HP drops (-1 nyawa)
  const prevHpRef = useRef(null);
  useEffect(() => {
    const hp = state?.player?.hp ?? null;
    if (prevHpRef.current !== null && hp !== null && hp < prevHpRef.current) {
      playSfx(NYAWA_TOLAK_SFX, 0.9);
    }
    prevHpRef.current = hp;
  }, [state?.player?.hp, playSfx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      stopBgm();
      if (bomohTimerRef.current) clearTimeout(bomohTimerRef.current);
      if (deathTimerRef.current) clearTimeout(deathTimerRef.current);
    };
  }, [cleanupAudio, stopBgm]);

  return (
    <div className="app">
      {/* Crosshair removed */}

      {/* Background image */}
      <div className="bg-image" style={{ backgroundImage: `url(${LIMAH_BACKGROUND_IMG})` }} />
      <div className="bg-overlay" />

      {/* Fog / mist particles */}
      <div className="fog-layer" />

      {/* Fireflies */}
      <div className="fireflies">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="firefly" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {gameState === GAME_STATE.MENU && (
        <MainMenu onStart={startGame} playClick={playClick} />
      )}

      {gameState === GAME_STATE.PLAYING && state && (
        <>
          <HUD state={state} />
          <div
            className="game-container"
            style={boardScale < 1 ? { transform: `scale(${boardScale})`, transformOrigin: 'center center' } : undefined}
          >
            <GameBoard state={state} lumutSlideOverride={lumutSlideOverride} />
          </div>

          {/* Top-left: buku panduan */}
          <div className="top-left-btns">
            <button className="buku-panduan-btn" title="Buku Panduan" onClick={() => { playClick(); setShowGuide(true); }}>
                <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="buku-panduan-img" />
            </button>
          </div>

          {/* Top-right buttons: sound + back */}
          <div className="top-right-btns">
            <button className="float-btn sound-btn" title={soundOn ? 'Bunyi: ON' : 'Bunyi: OFF'} onClick={() => { playClick(); toggleSound(); }}>
              {soundOn ? '🔊' : '🔇'}
            </button>
            <button className="float-btn back-btn" title="Balik Menu" onClick={() => { playClick(); goToMenu(); }}>
              ↩
            </button>
          </div>

          {/* Bottom-right: D-pad */}
          <div className="bottom-right-controls">
            <div className="dpad">
              <button className="dpad-btn dpad-up" onClick={() => { playClick(); handleMove(DIR.UP); }}>▲</button>
              <button className="dpad-btn dpad-left" onClick={() => { playClick(); handleMove(DIR.LEFT); }}>◀</button>
              <button className="dpad-btn dpad-right" onClick={() => { playClick(); handleMove(DIR.RIGHT); }}>▶</button>
              <button className="dpad-btn dpad-down" onClick={() => { playClick(); handleMove(DIR.DOWN); }}>▼</button>
            </div>
          </div>

          {/* Usop Wilcha Nangis Popup */}
          {showNangisPopup && (
            <div className="nangis-popup">
              <div className="nangis-portrait">
                <img src={USOP_WILCHA_NANGIS_IMG} alt="Usop Wilcha Nangis" className="nangis-img" />
              </div>
              <div className="nangis-dialog">
                <div className="dialog-box">
                  <div className="dialog-text">
                    <span className="dialog-typing">HUSINNN!! HANTU KAK LIMAH!!</span>
                  </div>
                  <div className="dialog-blink">▼</div>
                </div>
              </div>
            </div>
          )}

          {/* Bomoh Spawn Popup - 8 seconds */}
          {showBomohPopup && (
            <div className="nangis-popup bomoh-popup">
              <div className="nangis-portrait bomoh-portrait">
                <img src={BOMOH_SOFIJIKAN_IMG} alt="Bomoh Sofijikan" className="nangis-img bomoh-popup-img" />
              </div>
              <div className="nangis-dialog">
                <div className="dialog-box bomoh-dialog-box">
                  <div className="dialog-text">
                    <span className="dialog-typing bomoh-typing">Aku ini orang Indonesia, kalau enggak penuh ilmu didada enggak sampe ke puncak Everest</span>
                  </div>
                  <div className="dialog-blink">▼</div>
                </div>
              </div>
            </div>
          )}

          {/* Bomoh Death Popup - 4 seconds */}
          {showBomohDeathPopup && (
            <div className="nangis-popup bomoh-death-popup">
              <div className="nangis-portrait">
                <img src={USOP_WILCHA_NANGIS_IMG} alt="Usop Wilcha Nangis" className="nangis-img" />
              </div>
              <div className="nangis-dialog">
                <div className="dialog-box">
                  <div className="dialog-text">
                    <span className="dialog-typing death-typing">Nampak benor menipu</span>
                  </div>
                  <div className="dialog-blink">▼</div>
                </div>
              </div>
            </div>
          )}

          {/* Grave Portal Jump Overlay */}
          {state.graveJumpChoices && (
            <div className="selipar-choice-overlay">
              <div className="selipar-choice-box grave-jump-box">
                <div className="selipar-choice-title">⚰️ KUBUR PORTAL!</div>
                <div className="selipar-choice-subtitle">Husin nak teleport ke mana?</div>
                <div className="grave-jump-buttons">
                  {state.graveJumpChoices.map((g, i) => {
                    const col = ['A','B','C','D','E','F','G','H'][g.col];
                    const row = 8 - g.row;
                    return (
                      <button
                        key={i}
                        className="grave-jump-btn"
                        onClick={() => { playClick(); handleGraveJump(g); }}
                      >
                        <span className="grave-jump-coord">{col}{row}</span>
                        <span className="grave-jump-label">Kubur {col}{row}</span>
                      </button>
                    );
                  })}
                  <button
                    className="grave-jump-btn grave-jump-cancel"
                    onClick={() => { playClick(); handleGraveJump(null); }}
                  >
                    <span className="grave-jump-label">Jangan (Duduk Sini)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selipar Jepun Choice Buttons */}
          {state.hasSelipar && (
            <div className="selipar-choice-overlay">
              <div className="selipar-choice-box">
                <div className="selipar-choice-title">SELIPAR JEPUN!</div>
                <div className="selipar-choice-subtitle">Husin jumpa selipar jepun! Nak buat apa?</div>
                <div className="selipar-choice-buttons">
                  <button className="selipar-btn selipar-btn-campak" onClick={() => { playClick(); handleSeliparChoice('campak'); }}>
                    <img src={SELIPAR_CAMPAK_BTN_IMG} alt="Campak" className="selipar-btn-img" />
                    <span className="selipar-btn-label">CAMPAK KAT MUKA LIMAH!</span>
                    <span className="selipar-btn-desc">Limah kena stun 3 turn</span>
                  </button>
                  <button className="selipar-btn selipar-btn-lari" onClick={() => { playClick(); handleSeliparChoice('lari'); }}>
                    <img src={HUSIN_LARI_BTN_IMG} alt="Lari" className="selipar-btn-img" />
                    <span className="selipar-btn-label">HUSIN CABUT LARI!</span>
                    <span className="selipar-btn-desc">+3 langkah bonus</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selipar throw animation */}
          {showSeliparThrow && (
            <div className="selipar-throw-anim">
              <img src={SELIPAR_JEPUN_IMG} alt="Selipar Terbang" className="selipar-flying" />
            </div>
          )}


          {/* Buku Panduan Guide Modal - matches MainMenu style */}
          {showGuide && (
            <div className="menu-guide-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}>
              <div className="menu-guide">
                <div className="guide-header">
                  <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="guide-book-img" />
                  <h3>BUKU PANDUAN</h3>
                  <div className="guide-subtitle">Cara nak selamat dari Kak Limah</div>
                </div>

                <div className="guide-scroll">
                  <div className="guide-section">
                    <h4 className="guide-section-title">WATAK</h4>
                    <div className="guide-grid">
                      <div className="guide-item">
                        <img src={HUSIN_SPRITES[DIR.DOWN]} alt="Husin" className="guide-icon-char" />
                        <div className="guide-item-text">
                          <strong>Husin</strong>
                          <span>Kau mainkan Husin. Lari dari hantu, kumpul kuih, selamatkan Usop!</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={LIMAH_SPRITES[DIR.DOWN]} alt="Kak Limah" className="guide-icon-char" />
                        <div className="guide-item-text">
                          <strong>Hantu Kak Limah</strong>
                          <span>Dia kejar kau. Makin laju lepas pusingan ke-8. Jangan dekat!</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={USOP_WILCHA_IMG} alt="Usop" className="guide-icon-char" />
                        <div className="guide-item-text">
                          <strong>Usop Wilcha</strong>
                          <span>Kesian dia. Bawa dia ke Tempat Selamat untuk menang!</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-section">
                    <h4 className="guide-section-title">KUIH & ITEM</h4>
                    <div className="guide-grid">
                      <div className="guide-item">
                        <img src={POWERUP_SPRITES[POWERUP.CENDOL]} alt="Cendol" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Cendol</strong>
                          <span>Bekukan hantu 4 pusingan. Selamat kejap!</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={POWERUP_SPRITES[POWERUP.SERI_MUKA]} alt="Seri Muka" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Seri Muka</strong>
                          <span>+2 langkah bonus. Lari laju sikit!</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={POWERUP_SPRITES[POWERUP.KARIPAP]} alt="Karipap" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Karipap</strong>
                          <span>+1 HP. Nyawa tambahan, sedap pulak tu.</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={SELIPAR_JEPUN_IMG} alt="Selipar" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Selipar Jepun</strong>
                          <span>Campak kena muka Limah (stun 3 turn) ATAU lari +3 langkah!</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-section">
                    <h4 className="guide-section-title">MEKANIK KHAS</h4>
                    <div className="guide-grid">
                      <div className="guide-item">
                        <img src={TEMPAT_SELAMAT_IMG} alt="Tempat Selamat" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Tempat Selamat</strong>
                          <span>Hantu keliru bila kau kat sini. Bawa Usop sini untuk menang!</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={FLAG_TOLONG_IMG} alt="Flag Tolong" className="guide-icon" />
                        <div className="guide-item-text">
                          <strong>Bendera Tolong</strong>
                          <span>Ambil bendera = panggil bomoh. Tapi bomoh tu... hmm.</span>
                        </div>
                      </div>
                      <div className="guide-item">
                        <img src={BOMOH_FULLBODY_IMG} alt="Bomoh" className="guide-icon-char" />
                        <div className="guide-item-text">
                          <strong>Bomoh</strong>
                          <span>Hantu pergi bunuh bomoh dulu. Kau boleh lari masa tu!</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-section">
                    <h4 className="guide-section-title">⚠️ JENIS LANTAI (PENTING NI!)</h4>
                    <div className="guide-grid">
                      <div className="guide-item guide-item-tile">
                        <div className="guide-tile-swatch guide-tile-grass">
                          <img src={RUMPUT_IMG} alt="Rumput" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'3px'}} />
                        </div>
                        <div className="guide-item-text">
                          <strong>🌿 Rumput Biasa</strong>
                          <span>Normal je. Gerak 1 langkah mana-mana arah. Takde hal. Takde drama. Duduk sini paling selamat.</span>
                        </div>
                      </div>
                      <div className="guide-item guide-item-tile">
                        <div className="guide-tile-swatch" style={{overflow:'hidden'}}>
                          <img src={SPIKE_TILES_IMG} alt="Duri" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'3px'}} />
                        </div>
                        <div className="guide-item-text">
                          <strong>🩸 Kawasan Berduri (BAHAYA!)</strong>
                          <span>Pijak sini terus -1 HP! Kak Limah suka tengok kau terseksa.</span>
                        </div>
                      </div>
                      <div className="guide-item guide-item-tile">
                        <div className="guide-tile-swatch guide-tile-moss">
                          <img src={LUMUT_IMG} alt="Lumut" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.9,borderRadius:'3px'}} />
                        </div>
                        <div className="guide-item-text">
                          <strong>🍀 Lantai Berlumut (DOUBLE BAHAYA!)</strong>
                          <span>Terpijak lumut = Husin terpeleset rawak ke arah Kak Limah + Kak Limah dapat 1 langkah extra! Elak!!!</span>
                        </div>
                      </div>
                      <div className="guide-item guide-item-tile">
                        <div className="guide-tile-swatch" style={{overflow:'hidden'}}>
                          <img src={BLACK_HOLE_IMG} alt="Kawasan Gelap" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'3px'}} />
                        </div>
                        <div className="guide-item-text">
                          <strong>🌑 Kawasan Gelap (BIUS HANTU!)</strong>
                          <span>Berdiri sini = Kak Limah terpinga-pinga macam orang baru kena tenyeh minyak angin. Dia keliru 1 giliran — pusing sana sini tak tahu nak ke mana!</span>
                        </div>
                      </div>
                      <div className="guide-item guide-item-tile">
                        <div className="guide-tile-swatch guide-tile-grave" style={{position:'relative',overflow:'hidden',background:'transparent'}}>
                          <img src={TANAH_IMG} alt="Tanah" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                          <img src={KUBUR_IMG} alt="Kubur" style={{position:'absolute',bottom:'2px',left:'50%',transform:'translateX(-50%)',width:'70%',height:'auto',filter:'drop-shadow(0 0 5px rgba(160,60,220,1))'}} />
                        </div>
                        <div className="guide-item-text">
                          <strong>⚰️ Kubur Ungu (PORTAL TELEPORT!)</strong>
                          <span>Pijak kubur bercahaya ungu = pilih kubur lain untuk teleport PERCUMA! Guna untuk lari dari Kak Limah dengan gaya.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duel Guide */}
                  <div className="guide-section guide-section-duel">
                    <h4 className="guide-section-title">⚔️ SISTEM DUEL</h4>
                    <p className="guide-duel-intro">Bila Kak Limah tangkap Husin — DUEL! Pilih serangan. Menang = selamat. Kalah = -1 HP!</p>
                    <div className="guide-duel-grid">
                      <div className="guide-duel-card">
                        <div className="guide-duel-emoji">🔫</div>
                        <div className="guide-duel-name">PANGGIL ANAK SI MAMAT</div>
                        <div className="guide-duel-effect win">✅ Menang → Beku 4 giliran</div>
                        <div className="guide-duel-effect lose">❌ Kalah → -1 HP</div>
                      </div>
                      <div className="guide-duel-card">
                        <div className="guide-duel-emoji">🏃</div>
                        <div className="guide-duel-name">CABUT LARI</div>
                        <div className="guide-duel-effect win">✅ Menang → Teleport jauh</div>
                        <div className="guide-duel-effect lose">❌ Kalah → Kena selipar</div>
                      </div>
                      <div className="guide-duel-card">
                        <div className="guide-duel-emoji">🍛</div>
                        <div className="guide-duel-name">SUAP NASI</div>
                        <div className="guide-duel-effect win">✅ Menang → Keliru 3 giliran</div>
                        <div className="guide-duel-effect lose">❌ Kalah → Kena periuk</div>
                      </div>
                      <div className="guide-duel-card">
                        <div className="guide-duel-emoji">😱</div>
                        <div className="guide-duel-name">JERIT "MAK!"</div>
                        <div className="guide-duel-effect win">✅ 50/50 → Beku 1 giliran</div>
                        <div className="guide-duel-effect lose">❌ 50/50 → -1 HP</div>
                      </div>
                    </div>
                    <div className="guide-duel-warning">⚠️ Setiap serangan yang menang akan TERKUNCI — tak boleh guna lagi! Kalau semua 4 kena lock, AUTO KALAH!</div>
                  </div>

                  <div className="guide-section guide-section-tips">
                    <h4 className="guide-section-title">TIPS PRO</h4>
                    <div className="guide-tips guide-funny">
                      <p>Jangan lari lurus - hantu pandai potong jalan.</p>
                      <p>Simpan cendol untuk kecemasan. Jangan tamak!</p>
                      <p>Bomoh memang tak boleh harap, tapi dia beli masa.</p>
                      <p>Kalau nampak karipap, ambil. HP tu penting bro.</p>
                      <p>Usop berat, tapi kena bawa jugak. Kawan kan.</p>
                      <p>Lantai gelap = sorok! Kak Limah jadi lembu kejap.</p>
                      <p>Lumut = lari! Jangan pijak kalau Kak Limah dah dekat.</p>
                      <p>Kubur ungu = portal percuma! Guna untuk escape ajaib.</p>
                    </div>
                  </div>
                </div>

                <button className="menu-btn guide-close-btn" onClick={() => { playClick(); setShowGuide(false); }}>
                  TUTUP
                </button>
              </div>
            </div>
          )}

          {/* Duel Overlay — Pokemon-style battle when Kak Limah catches Husin */}
          {state.duel?.active && (
            <DuelOverlay
              state={state}
              onChoice={handleDuelChoice}
              onClose={handleDuelClose}
            />
          )}

          {state.message && !state.duel?.active && (
            <div className={`game-message ${state.gameOver ? 'danger' : state.win ? 'victory' : ''}`}>
              {state.message}
            </div>
          )}
        </>
      )}

      {(gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) && state && (
        <GameOverScreen
          win={gameState === GAME_STATE.WIN}
          winImg={HUSIN_WINGAME_IMG}
          score={state.score}
          turns={state.turn}
          onRestart={startGame}
          onMenu={goToMenu}
          playClick={playClick}
        />
      )}
    </div>
  );
}

export default App
