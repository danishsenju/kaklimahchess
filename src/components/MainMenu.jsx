import React, { useState, useEffect } from 'react'
import {
  LIMAH_SPRITES, HUSIN_SPRITES, POWERUP_SPRITES,
  TEMPAT_SELAMAT_IMG, USOP_WILCHA_IMG, BUKU_PANDUAN_IMG,
  FLAG_TOLONG_IMG, BOMOH_FULLBODY_IMG, SELIPAR_JEPUN_IMG,
  DIR, POWERUP, FRONT_PAGE_IMG, SPIKE_TILES_IMG,
  LIMAH_BACKGROUND_IMG, BLACK_HOLE_IMG,
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

export default function MainMenu({ onStart, playClick }) {
  const [showGuide, setShowGuide] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(() => Math.floor(Math.random() * TAGLINES.length));
  const [titleReady, setTitleReady] = useState(false);
  const [showPress, setShowPress] = useState(false);
  const [menuScale, setMenuScale] = useState(1);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  const tagline = TAGLINES[taglineIdx];

  // Rotate taglines
  useEffect(() => {
    const t = setInterval(() => {
      setTaglineIdx(i => (i + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Scale menu content to fit viewport height only (width handled by responsive CSS)
  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight;
      // Only scale down when viewport height is too short to fit content
      const scaleY = vh / 700;
      setMenuScale(Math.min(scaleY, 1));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Title entrance animation
  useEffect(() => {
    const t1 = setTimeout(() => setTitleReady(true), 400);
    const t2 = setTimeout(() => setShowPress(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setShowInstall(false); setDeferredPrompt(null); }
  };

  return (
    <div className="main-menu">
      {/* Atmospheric background layers */}
      <div className="menu-bg-img" style={{ backgroundImage: `url(${LIMAH_BACKGROUND_IMG})` }} />
      <div className="menu-bg-gradient" />
      <div className="menu-fog fog-1" />
      <div className="menu-fog fog-2" />
      <div className="menu-vignette" />
      <div className="menu-scanlines" />
      <div className="menu-noise" />

      {/* Blood drip decoration at top */}
      <div className="blood-drips">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="blood-drip" style={{
            left: `${3 + i * 7}%`,
            height: `${20 + Math.random() * 50}px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }} />
        ))}
      </div>

      {/* Floating ghost particles */}
      <div className="menu-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="menu-particle" style={{
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Moon with halo */}
      <div className="menu-moon">
        <div className="moon-halo" />
        <div className="moon-core" />
      </div>

      {/* Pixel border frame */}
      <div className="pixel-frame">
        <div className="pixel-frame-corner pf-tl" />
        <div className="pixel-frame-corner pf-tr" />
        <div className="pixel-frame-corner pf-bl" />
        <div className="pixel-frame-corner pf-br" />
      </div>

      <div className="menu-content-scaler" style={menuScale < 1 ? { transform: `scale(${menuScale})` } : undefined}>
      <div className={`menu-content ${titleReady ? 'menu-content-ready' : ''}`}>
        {/* Title Section */}
        <div className="menu-title-wrapper">
          <div className="title-badge">
            <span className="badge-star">★</span>
            MALAY HORROR ADVENTURE
            <span className="badge-star">★</span>
          </div>
          <h1 className="menu-title">
            <span className="title-line title-hantu">HANTU</span>
            <span className="title-line title-kaklimah">KAK LIMAH</span>
          </h1>
          <div className="menu-subtitle">
            <span className="subtitle-dash" />
            <span className="subtitle-text">Kejar-Kejar</span>
            <span className="subtitle-dash" />
          </div>
        </div>

        {/* Character Showcase - Nintendo style */}
        <div className="menu-showcase" style={{ backgroundImage: `url(${FRONT_PAGE_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* Husin side */}
          <div className="showcase-char showcase-husin">
            <div className="char-platform" />
            <div className="char-glow husin-glow" />
            <img src={HUSIN_SPRITES[DIR.RIGHT]} alt="Husin" className="showcase-img" />
            <div className="char-nameplate">
              <span className="char-name">HUSIN</span>
              <span className="char-title">Pelari Kampung</span>
            </div>
          </div>

          {/* VS emblem */}
          <div className="showcase-vs">
            <div className="vs-burst" />
            <div className="vs-circle">
              <span>VS</span>
            </div>
            <div className="vs-spark vs-spark-1" />
            <div className="vs-spark vs-spark-2" />
            <div className="vs-spark vs-spark-3" />
            <div className="vs-spark vs-spark-4" />
          </div>

          {/* Kak Limah side */}
          <div className="showcase-char showcase-limah">
            <div className="char-platform limah-platform" />
            <div className="char-glow limah-glow" />
            <img src={LIMAH_SPRITES[DIR.LEFT]} alt="Kak Limah" className="showcase-img limah-img" />
            <div className="char-nameplate limah-nameplate">
              <span className="char-name limah-name">KAK LIMAH</span>
              <span className="char-title">Hantu Kampung</span>
            </div>
          </div>
        </div>

        {/* Rotating tagline */}
        <div className="menu-tagline-wrapper">
          <div className="tagline-border" />
          <div className="menu-tagline" key={taglineIdx}>
            <span className="tagline-quote">"</span>
            {tagline}
            <span className="tagline-quote">"</span>
          </div>
          <div className="tagline-border" />
        </div>

        {/* Action Buttons */}
        <div className={`menu-buttons ${showPress ? 'buttons-ready' : ''}`}>
          <button className="menu-btn menu-btn-start" onClick={() => { if (playClick) playClick(); onStart(); }}>
            <div className="btn-pixel-border" />
            <span className="btn-icon">▶</span>
            <span className="btn-text">MULA MAIN</span>
            <div className="btn-shine" />
          </button>
          <button className="menu-btn menu-btn-guide" onClick={() => { if (playClick) playClick(); setShowGuide(true); }}>
            <div className="btn-pixel-border" />
            <img src={BUKU_PANDUAN_IMG} alt="Buku Panduan" className="guide-btn-icon" />
            <span className="btn-text">BUKU PANDUAN</span>
          </button>
        </div>

        {/* PWA Install Banner */}
        {showInstall && (
          <div className="pwa-install-banner">
            <span className="pwa-install-text">📲 Pasang app di telefon!</span>
            <button className="pwa-install-btn" onClick={handleInstall}>PASANG</button>
            <button className="pwa-install-close" onClick={() => setShowInstall(false)}>✕</button>
          </div>
        )}

        <div className="menu-footer">
          <span className="footer-keys">
            <span className="key-cap">W</span>
            <span className="key-cap">A</span>
            <span className="key-cap">S</span>
            <span className="key-cap">D</span>
            / Arrow Keys
          </span>
          <span className="footer-sep">|</span>
          <span className="footer-ver">v2.0</span>
        </div>
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
                  <div className="guide-item">
                    <img src={SELIPAR_JEPUN_IMG} alt="Selipar Jepun" className="guide-icon" />
                    <div className="guide-item-text">
                      <strong>Selipar Jepun</strong>
                      <span>Campak kat muka Limah (stun 3 turn) atau lari (+3 langkah)!</span>
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

              {/* Tiles Section */}
              <div className="guide-section">
                <h4 className="guide-section-title">⚠️ JENIS LANTAI</h4>
                <div className="guide-grid">
                  <div className="guide-item">
                    <img src={SPIKE_TILES_IMG} alt="Duri" className="guide-icon" style={{borderRadius:'4px'}} />
                    <div className="guide-item-text">
                      <strong>🩸 Kawasan Berduri</strong>
                      <span>Pijak = terus -1 HP! Kak Limah senyum je tengok kau terseksa.</span>
                    </div>
                  </div>
                  <div className="guide-item">
                    <img src={BLACK_HOLE_IMG} alt="Kawasan Gelap" className="guide-icon" style={{borderRadius:'4px'}} />
                    <div className="guide-item-text">
                      <strong>🌑 Kawasan Gelap</strong>
                      <span>Berdiri sini = Kak Limah terpinga-pinga keliru 1 giliran. Dia jadi lembu kejap!</span>
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

            <button className="menu-btn guide-close-btn" onClick={() => { if (playClick) playClick(); setShowGuide(false); }}>
              <div className="btn-pixel-border" />
              TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
