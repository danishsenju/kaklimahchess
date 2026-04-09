import React from 'react'
import { HUSIN_SPRITES, LIMAH_SPRITES, DIR } from '../constants'
import './GameOverScreen.css'

export default function GameOverScreen({ win, score, turns, onRestart, onMenu, playClick }) {
  return (
    <div className="gameover-overlay">
      <div className="gameover-vignette" />

      <div className="gameover-content">
        {win ? (
          <>
            <h1 className="gameover-title win-title">SELAMAT!</h1>
            <div className="gameover-subtitle">Husin berjaya melarikan diri bersama Usop beban!</div>
            <img src={HUSIN_SPRITES[DIR.DOWN]} alt="Husin" className="gameover-char" />
          </>
        ) : (
          <>
            <h1 className="gameover-title lose-title">GAME OVER</h1>
            <div className="gameover-subtitle">Hantu Kak Limah menang...</div>
            <img src={LIMAH_SPRITES[DIR.DOWN]} alt="Hantu" className="gameover-char ghost-char" />
          </>
        )}

        <div className="gameover-stats">
          <div className="stat-item">
            <span className="stat-label">KUIH DIKUMPUL</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">PUSINGAN</span>
            <span className="stat-value">{turns}</span>
          </div>
        </div>

        <div className="gameover-buttons">
          <button className="menu-btn menu-btn-start" onClick={() => { if (playClick) playClick(); onRestart(); }}>
            MAIN LAGI
          </button>
          <button className="menu-btn" onClick={() => { if (playClick) playClick(); onMenu(); }}>
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
