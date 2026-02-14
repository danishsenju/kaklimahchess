import React, { useState, useMemo } from 'react'
import {
  LIMAH_SPRITES, HUSIN_SPRITES, POWERUP_SPRITES,
  TEMPAT_SELAMAT_IMG, USOP_WILCHA_IMG, BUKU_PANDUAN_IMG,
  FLAG_TOLONG_IMG, BOMOH_FULLBODY_IMG,
  DIR, POWERUP,
} from '../constants'
import './MainMenu.css'

const TAGLINES = [
  "Lari je kerja kau, Husin!",
  "Kuih power, hantu takut!",
  "Bomoh datang, bomoh pengsan.",
  "Usop pun tak guna sebenarnya...",
  "Jangan pandang belakang!",
  "Bukan chess pun sebenarnya...",
  "Hantu pun suka kuih raya.",
  "Kalau tak lari, memang confirm kena.",
  "Cendol beku hantu, karipap tambah HP.",
  "Main sorang-sorang pun takut jugak.",
];

export default function MainMenu({ onStart }) {
  const [showGuide, setShowGuide] = useState(false);
  const tagline = useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);

  return (
    <div className="main-menu">
      <div className="menu-vignette" />
      <div className="menu-moon" />

      {/* Floating particles */}
      <div className="menu-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="menu-particle" style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <div className="menu-content">
        {/* Title Section */}
        <div className="menu-title-wrapper">
          <h1 className="menu-title">HANTU</h1>
          <h1 className="menu-title title-sub">KAK LIMAH</h1>
          <div className="menu-subtitle">~ Kejar-Kejar ~</div>
        </div>

        {/* Character VS Preview */}
        <div className="menu-versus">
          <div className="menu-char-preview menu-husin">
            <img src={HUSIN_SPRITES[DIR.RIGHT]} alt="Husin" className="menu-char-img" />
            <span className="menu-char-name">HUSIN</span>
          </div>
          <div className="menu-vs-badge">VS</div>
          <div className="menu-char-preview menu-limah">
            <img src={LIMAH_SPRITES[DIR.LEFT]} alt="Kak Limah" className="menu-char-img menu-limah-img" />
            <span className="menu-char-name limah-name">KAK LIMAH</span>
          </div>
        </div>

        {/* Funny Tagline */}
        <div className="menu-tagline">"{tagline}"</div>

        {/* Buttons */}
        <div className="menu-buttons">
          <button className="menu-btn menu-btn-start" onClick={onStart}>
            MULA MAIN
          </button>
          <button className="menu-btn menu-btn-guide" onClick={() => setShowGuide(true)}>
            <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="guide-btn-icon" />
            BUKU PANDUAN
          </button>
        </div>

        <div className="menu-footer">
          WASD / Arrow Keys untuk bergerak
        </div>
      </div>

      {/* Guide Overlay */}
      {showGuide && (
        <div className="menu-guide-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}>
          <div className="menu-guide">
            <div className="guide-header">
              <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="guide-book-img" />
              <h3>BUKU PANDUAN</h3>
              <div className="guide-subtitle">Cara nak selamat dari Kak Limah</div>
            </div>

            <div className="guide-scroll">
              {/* Characters Section */}
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

              {/* Items Section */}
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
                </div>
              </div>

              {/* Mechanics Section */}
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

              {/* How Ghost Moves */}
              <div className="guide-section">
                <h4 className="guide-section-title">CARA HANTU BERGERAK</h4>
                <div className="guide-tips">
                  <p>Hantu guna jalan terpendek untuk kejar kau.</p>
                  <p>Lepas pusingan ke-8, ada 35% peluang hantu bergerak 2 langkah!</p>
                  <p>Kalau ada bomoh, hantu pergi bunuh bomoh dulu baru kejar kau.</p>
                  <p>Pokok menghalang hantu jugak - guna sebagai strategi!</p>
                </div>
              </div>

              {/* Funny Tips */}
              <div className="guide-section guide-section-tips">
                <h4 className="guide-section-title">TIPS PRO</h4>
                <div className="guide-tips guide-funny">
                  <p>Jangan lari lurus - hantu pandai potong jalan.</p>
                  <p>Simpan cendol untuk kecemasan. Jangan tamak!</p>
                  <p>Bomoh memang tak boleh harap, tapi dia beli masa.</p>
                  <p>Kalau nampak karipap, ambil. HP tu penting bro.</p>
                  <p>Usop berat, tapi kena bawa jugak. Kawan kan.</p>
                </div>
              </div>
            </div>

            <button className="menu-btn guide-close-btn" onClick={() => setShowGuide(false)}>
              TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
