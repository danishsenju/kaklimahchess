import React, { useEffect, useState, useCallback } from 'react'
import {
  KAKLIMAH_BATTLE_IMG, HUSIN_BATTLE_IMG, DUEL_BACKGROUND_IMG,
  HUSIN_SPRITES, LIMAH_SPRITES, DIR,
  PAKJABIT_IMG, BUNYI_TEMBAKAN_SFX, SUARA_PAKJABIT_SFX,
  DUEL_BUTTON_IMG, DUEL_BUTTON_MOBILE_IMG,
  HUSIN_KALAH_LOCK_IMG, SELIPAR_KEMUKA_SFX,
} from '../constants'
import './DuelOverlay.css'

const HUSIN_MOVES = [
  { key: 'PANGGIL_MAMAT', emoji: '🔫', label: 'PANGGIL ANAK\nSI MAMAT' },
  { key: 'CABUT_LARI',    emoji: '🏃', label: 'CABUT LARI'  },
  { key: 'SUAP_NASI',     emoji: '🍛', label: 'SUAP NASI'   },
  { key: 'JERIT_MAK',     emoji: '😱', label: 'JERIT "MAK!"'},
];

const MOVE_DESC = {
  PANGGIL_MAMAT: 'Beku 4 giliran (atau kena tampar)',
  CABUT_LARI:    'Teleport jauh (atau kena selipar)',
  SUAP_NASI:     'Keliru 3 giliran (atau kena periuk)',
  JERIT_MAK:     '50/50 beku 1 giliran atau -1 HP',
};

const LIMAH_COUNTER_LABELS = {
  CAMPAK_SELIPAR: '👟 Campak Selipar!',
  JERIT_BALIK:    '🔊 Jerit Balik!',
  ANGKAT_PERIUK:  '🍳 Angkat Periuk!',
  DIAM:           '😤 DIAM!',
};

const RESULT_TEXT = {
  husin: 'HUSIN MENANG!',
  limah: 'KAK LIMAH MENANG!',
  draw:  'SERI!',
};

const PAKJABIT_DIALOG = 'haih anak si mamat ni, asyik menembak je keje nya. ni yang buat aku tension ni';

function playSfxOnce(src, volume = 0.8) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
  } catch (e) { /* */ }
}

export default function DuelOverlay({ state, onChoice, onClose }) {
  const { duel, player, usedWinMoves = [] } = state;
  const [phase, setPhase]                     = useState('entering');
  const [showPakjabitPopup, setShowPakjabitPopup] = useState(false);
  const [showKalahLockPopup, setShowKalahLockPopup] = useState(false);
  const [selectedMove, setSelectedMove]       = useState(null);

  // ── Phase transitions ──
  useEffect(() => {
    if (!duel?.active) return;
    const t = setTimeout(() => setPhase('choosing'), 350);
    return () => clearTimeout(t);
  }, [duel?.active]);

  useEffect(() => {
    if (!duel?.resolved) return;
    setPhase('resolving');

    // All buttons locked — show kalah popup + selipar sfx, then game over
    if (duel.allButtonsLocked) {
      playSfxOnce(SELIPAR_KEMUKA_SFX, 0.9);
      const t1 = setTimeout(() => setShowKalahLockPopup(true), 300);
      const t2 = setTimeout(() => {
        setShowKalahLockPopup(false);
        setPhase('closing');
        setTimeout(() => onClose(), 450);
      }, 4500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    // Pak Jabit popup if PANGGIL_MAMAT won
    if (duel.showPakjabit) {
      const t1 = setTimeout(() => {
        setShowPakjabitPopup(true);
        playSfxOnce(SUARA_PAKJABIT_SFX, 0.85);
      }, 400);
      const t2 = setTimeout(() => setShowPakjabitPopup(false), 5000);
      const t3 = setTimeout(() => {
        setPhase('closing');
        setTimeout(() => onClose(), 450);
      }, 5200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    const t = setTimeout(() => {
      setPhase('closing');
      setTimeout(() => onClose(), 450);
    }, 2600);
    return () => clearTimeout(t);
  }, [duel?.resolved, duel?.showPakjabit, duel?.allButtonsLocked, onClose]);

  const handleChoice = useCallback((key) => {
    if (key === 'PANGGIL_MAMAT') {
      playSfxOnce(BUNYI_TEMBAKAN_SFX, 0.9);
    }
    onChoice(key);
  }, [onChoice]);

  if (!duel?.active) return null;

  const maxHp  = 3;
  const hpPct  = Math.max(0, Math.min(1, player.hp / maxHp));
  const hpColor = hpPct > 0.5 ? '#58c840' : hpPct > 0.25 ? '#f0c030' : '#e83020';
  const limahHpAfter = duel.resolved && duel.result === 'husin' ? '40%'
                     : duel.resolved && duel.result === 'draw'  ? '75%' : '100%';

  const dialogText = duel.resolved ? duel.message : 'Apa yang HUSIN nak buat?!';

  return (
    <div className={`duel-root duel-phase-${phase}`}>

      {/* ── HUSIN KALAH ALL BUTTONS LOCKED POPUP ── */}
      {showKalahLockPopup && (
        <div className="kalah-lock-popup">
          <img src={HUSIN_KALAH_LOCK_IMG} alt="Husin Kena Tampar" className="kalah-lock-img" />
          <div className="kalah-lock-dialog">
            <p className="kalah-lock-text">Semua cara dah habis pakai! Kak Limah gelak pastu tampar Husin kuat gila! GAME OVER!</p>
            <span className="pakjabit-blink">▼</span>
          </div>
        </div>
      )}

      {/* ── PAK JABIT POPUP ── */}
      {showPakjabitPopup && (
        <div className="pakjabit-popup">
          <img src={PAKJABIT_IMG} alt="Pak Jabit" className="pakjabit-img" />
          <div className="pakjabit-dialog-wrap">
            <div className="pakjabit-dialog">
              <p className="pakjabit-text">{PAKJABIT_DIALOG}</p>
              <span className="pakjabit-blink">▼</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          BATTLEFIELD  (top half)
         ══════════════════════════════ */}
      <div className="duel-field">
        <div className="duel-field-bg" style={{ backgroundImage: `url(${DUEL_BACKGROUND_IMG})` }} />

        {/* Ground platforms */}
        <div className="duel-platform duel-platform-enemy" />
        <div className="duel-platform duel-platform-player" />

        {/* Enemy info box — top left */}
        <div className="duel-info-box duel-enemy-box">
          <div className="duel-box-name-row">
            <span className="duel-box-name">KAK LIMAH</span>
            <span className="duel-box-lv">Lv??</span>
          </div>
          <div className="duel-box-hp-row">
            <span className="duel-hp-label">HP</span>
            <div className="duel-hp-track">
              <div className="duel-hp-fill limah-hp-fill" style={{ width: limahHpAfter }} />
            </div>
          </div>
          {duel.resolved && duel.limahCounter && (
            <div className="duel-counter-text">{LIMAH_COUNTER_LABELS[duel.limahCounter]}</div>
          )}
        </div>

        {/* Enemy sprite — top right */}
        <div className="duel-sprite-enemy">
          <img
            src={KAKLIMAH_BATTLE_IMG}
            alt="Kak Limah"
            className={`duel-enemy-img${duel.resolved && duel.result === 'limah' ? ' sprite-win' : ''}${duel.resolved && duel.result === 'husin' ? ' sprite-faint' : ''}`}
            onError={e => { e.target.src = LIMAH_SPRITES[DIR.DOWN]; }}
          />
        </div>

        {/* Player sprite — bottom left */}
        <div className="duel-sprite-player">
          <img
            src={HUSIN_BATTLE_IMG}
            alt="Husin"
            className={`duel-player-img${duel.resolved && duel.result === 'husin' ? ' sprite-win' : ''}${duel.resolved && duel.result === 'limah' ? ' sprite-faint' : ''}`}
            onError={e => { e.target.src = HUSIN_SPRITES[DIR.RIGHT]; }}
          />
        </div>

        {/* Player info box — bottom right */}
        <div className="duel-info-box duel-player-box">
          <div className="duel-box-name-row">
            <span className="duel-box-name">HUSIN</span>
            <span className="duel-box-lv">Lv1</span>
          </div>
          <div className="duel-box-hp-row">
            <span className="duel-hp-label">HP</span>
            <div className="duel-hp-track">
              <div className="duel-hp-fill" style={{ width: `${hpPct * 100}%`, background: hpColor }} />
            </div>
          </div>
          <div className="duel-box-hp-num-row">
            <span className="duel-hp-num">{Math.max(0, player.hp)}/{maxHp}</span>
          </div>
        </div>

        {/* Result banner */}
        {duel.resolved && (
          <div className={`duel-result-banner result-${duel.result}`}>
            {RESULT_TEXT[duel.result]}
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          BOTTOM PANEL
          Desktop: dialog left | moves right
          Mobile:  dialog top  | moves bottom (half screen + dpad hidden via CSS)
         ══════════════════════════════ */}
      <div className="duel-bottom">

        {/* Dialog box */}
        <div className="duel-dialog">
          <p className="duel-dialog-text">{dialogText}</p>
          {phase === 'closing' && <p className="duel-dialog-sub">Balik ke game...</p>}
        </div>

        {/* Action box */}
        <div className="duel-action-box">
          {!duel.resolved ? (
            <div className="duel-move-grid">
              {HUSIN_MOVES.map((move) => {
                const locked = usedWinMoves.includes(move.key);
                return (
                  <button
                    key={move.key}
                    className={`duel-move-btn${selectedMove === move.key && !locked ? ' duel-move-selected' : ''}${locked ? ' duel-move-locked' : ''}`}
                    onClick={() => !locked && handleChoice(move.key)}
                    onMouseEnter={() => !locked && setSelectedMove(move.key)}
                    onMouseLeave={() => setSelectedMove(null)}
                    disabled={locked}
                    style={{ backgroundImage: `url(${DUEL_BUTTON_IMG})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                  >
                    {locked ? (
                      <>
                        <span className="duel-lock-icon">🔒</span>
                        <span className="duel-move-label duel-locked-label">{move.label}</span>
                      </>
                    ) : (
                      <>
                        <span className="duel-cursor">▶</span>
                        <span className="duel-move-emoji">{move.emoji}</span>
                        <span className="duel-move-label">{move.label}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="duel-result-box">
              <div className={`duel-result-label result-${duel.result}`}>
                {RESULT_TEXT[duel.result]}
              </div>
              <div className="duel-result-icon">
                {duel.result === 'husin' && '🏆'}
                {duel.result === 'limah' && '💀'}
                {duel.result === 'draw'  && '🤝'}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════
          MOBILE ONLY: dpad + guide button strip
          (shown below the duel bottom panel on small screens)
         ══════════════════════════════ */}
      {!duel.resolved && (
        <div className="duel-mobile-controls">
          {/* Move buttons as dpad-style large buttons */}
          <div className="duel-mobile-moves">
            {HUSIN_MOVES.map((move) => {
              const locked = usedWinMoves.includes(move.key);
              return (
                <button
                  key={move.key}
                  className={`duel-mobile-btn${locked ? ' duel-move-locked' : ''}`}
                  onClick={() => !locked && handleChoice(move.key)}
                  disabled={locked}
                  style={{ backgroundImage: `url(${DUEL_BUTTON_MOBILE_IMG})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                >
                  {locked ? (
                    <>
                      <span className="duel-mobile-emoji">🔒</span>
                      <span className="duel-mobile-label">{move.label.replace('\n', ' ')}</span>
                    </>
                  ) : (
                    <>
                      <span className="duel-mobile-emoji">{move.emoji}</span>
                      <span className="duel-mobile-label">{move.label.replace('\n', ' ')}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side: guide panel */}
          <div className="duel-mobile-guide">
            <div className="duel-guide-title">📖 CARA DUEL</div>
            {HUSIN_MOVES.map((move) => (
              <div key={move.key} className="duel-guide-row">
                <span>{move.emoji}</span>
                <span className="duel-guide-desc">{MOVE_DESC[move.key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
