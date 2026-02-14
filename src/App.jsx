import React, { useState, useCallback, useEffect, useRef } from 'react'
import GameBoard from './components/GameBoard'
import MainMenu from './components/MainMenu'
import HUD from './components/HUD'
import GameOverScreen from './components/GameOverScreen'
import {
  GAME_STATE, HUSIN_START, LIMAH_START, DIR,
  LIMAH_BACKGROUND_IMG, USOP_WILCHA_NANGIS_IMG, HUSINNN_SFX,
  BOMOH_SOFIJIKAN_IMG, DUKUN_JAWA_SFX, USOP_DUKUN_SFX,
  BUKU_PANDUAN_IMG,
} from './constants'
import { createInitialState, processMove } from './gameLogic'
import './App.css'

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [state, setState] = useState(null);
  const [showNangisPopup, setShowNangisPopup] = useState(false);
  const [showBomohPopup, setShowBomohPopup] = useState(false);
  const [showBomohDeathPopup, setShowBomohDeathPopup] = useState(false);
  const [boardScale, setBoardScale] = useState(1);
  const audioRef = useRef(null);
  const bomohTimerRef = useRef(null);
  const deathTimerRef = useRef(null);

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

  // Responsive board scaling
  useEffect(() => {
    const calcScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Board is ~580px wide (512 grid + 56 padding + borders), ~680px tall with HUD
      const scaleX = (vw - 20) / 590;
      const scaleY = (vh - 80) / 680;
      setBoardScale(Math.min(scaleX, scaleY, 1));
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  const startGame = useCallback(() => {
    setState(createInitialState(HUSIN_START, LIMAH_START));
    setGameState(GAME_STATE.PLAYING);
    setShowNangisPopup(true);
    playAudio(HUSINNN_SFX);
    setTimeout(() => {
      setShowNangisPopup(false);
      cleanupAudio();
    }, 5000);
  }, [playAudio, cleanupAudio]);

  const handleMove = useCallback((dir) => {
    setState(prev => {
      if (!prev) return prev;
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
  useEffect(() => {
    if (state?.bomohJustDied) {
      setShowBomohDeathPopup(true);
      playAudio(USOP_DUKUN_SFX, 0.8);
      if (deathTimerRef.current) clearTimeout(deathTimerRef.current);
      deathTimerRef.current = setTimeout(() => {
        setShowBomohDeathPopup(false);
        cleanupAudio();
        deathTimerRef.current = null;
      }, 4000);
      setState(prev => prev ? { ...prev, bomohJustDied: false } : prev);
    }
  }, [state?.bomohJustDied, playAudio, cleanupAudio]);

  const handleKeyDown = useCallback((e) => {
    if (gameState !== GAME_STATE.PLAYING) return;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        handleMove(DIR.UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handleMove(DIR.DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        handleMove(DIR.LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        handleMove(DIR.RIGHT);
        break;
    }
  }, [gameState, handleMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (bomohTimerRef.current) clearTimeout(bomohTimerRef.current);
      if (deathTimerRef.current) clearTimeout(deathTimerRef.current);
    };
  }, [cleanupAudio]);

  return (
    <div className="app">
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
        <MainMenu onStart={startGame} />
      )}

      {gameState === GAME_STATE.PLAYING && state && (
        <>
          <HUD state={state} />
          <div
            className="game-container"
            style={boardScale < 1 ? { transform: `scale(${boardScale})`, transformOrigin: 'center center' } : undefined}
          >
            <GameBoard state={state} onMove={handleMove} />
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
                    <span className="dialog-typing bomoh-typing">Aku ini orang Indonesia, kalau enggak penuh ilmu didada enggak sampe ke gunung Everest</span>
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

          {/* Buku Panduan floating button */}
          <button className="buku-panduan-btn" title="Buku Panduan">
            <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="buku-panduan-img" />
          </button>

          {state.message && (
            <div className={`game-message ${state.gameOver ? 'danger' : state.win ? 'victory' : ''}`}>
              {state.message}
            </div>
          )}
        </>
      )}

      {(gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) && state && (
        <GameOverScreen
          win={gameState === GAME_STATE.WIN}
          score={state.score}
          turns={state.turn}
          onRestart={startGame}
          onMenu={() => setGameState(GAME_STATE.MENU)}
        />
      )}
    </div>
  );
}

export default App
