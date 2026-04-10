import React from 'react'
import { HUSIN_SPRITES, DIR, KAK_LIMAH_MENANG_IMG } from '../constants'
import './GameOverScreen.css'

const LOSE_TEXTS = [
  { title: 'KAK LIMAH MENANG!', sub: 'Husin dah kena tampar. Cuba lagi, mana tau kali ni laju sikit.' },
  { title: 'ADUH, KANTOI!', sub: 'Kak Limah kata: "Nak lari? Mana boleh lari dari takdir!"' },
  { title: 'HUSIN PENGSAN!', sub: 'Selipar Kak Limah lagi laju dari Husin.' },
  { title: 'GAME OVER, BRO!', sub: 'Usop tunggu lama sangat sampai dia dah tidur dalam kerusi roda.' },
  { title: 'KAK LIMAH GELAK!', sub: '"Dah habis ke idea nak lari tu?" — Kak Limah, sambil tepuk tangan.' },
  { title: 'TERLAMBAT DAH!', sub: 'Husin lari macam kura-kura. Cuba lagi, kali ni laju sikit!' },
];

export default function GameOverScreen({ win, winImg, score, turns, onRestart, onMenu, playClick }) {
  const loseText = LOSE_TEXTS[turns % LOSE_TEXTS.length];

  return (
    <div className="gameover-overlay">
      <div className="gameover-vignette" />

      <div className="gameover-content">
        {win ? (
          <>
            <h1 className="gameover-title win-title">SELAMAT!</h1>
            <div className="gameover-subtitle">Husin berjaya melarikan diri bersama Usop beban!</div>
            <img src={winImg || HUSIN_SPRITES[DIR.DOWN]} alt="Husin Menang" className="gameover-char" />
          </>
        ) : (
          <>
            <h1 className="gameover-title lose-title">{loseText.title}</h1>
            <div className="gameover-subtitle">{loseText.sub}</div>
            <img src={KAK_LIMAH_MENANG_IMG} alt="Kak Limah Menang" className="gameover-char ghost-char" />
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
