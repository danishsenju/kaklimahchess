import React from 'react'
import { WIN_SCORE } from '../constants'
import './HUD.css'

export default function HUD({ state }) {
  const { player, score, turn, movesLeft, ghostFrozen, ghostConfused, playerAtHome, carryingUsop } = state;

  return (
    <div className="hud">
      <div className="hud-section hud-left">
        {/* HP */}
        <div className="hud-item">
          <span className="hud-label">HP</span>
          <div className="hp-hearts">
            {Array.from({ length: player.hp }).map((_, i) => (
              <span key={i} className="heart">♥</span>
            ))}
            {Array.from({ length: Math.max(0, 5 - player.hp) }).map((_, i) => (
              <span key={`e-${i}`} className="heart-empty">♡</span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="hud-item">
          <span className="hud-label">KUIH</span>
          <span className="hud-value">{score}</span>
        </div>
      </div>

      <div className="hud-section hud-center">
        {/* Mission objective */}
        {!carryingUsop && (
          <div className="hud-status status-mission">
            🎯 CARI USOP
          </div>
        )}
        {carryingUsop && (
          <div className="hud-status status-carry">
            🧑‍🦽 BAWA USOP KE SELAMAT
          </div>
        )}

        {/* Status effects */}
        {ghostFrozen > 0 && (
          <div className="hud-status status-freeze">
            ❄️ BEKU ({ghostFrozen})
          </div>
        )}
        {ghostConfused > 0 && (
          <div className="hud-status status-confuse">
            ❓ KELIRU ({ghostConfused})
          </div>
        )}
        {playerAtHome && (
          <div className="hud-status status-safe">
            🏠 SELAMAT
          </div>
        )}
        {movesLeft > 1 && (
          <div className="hud-status status-moves">
            ⚡ LANGKAH: {movesLeft}
          </div>
        )}
      </div>

      <div className="hud-section hud-right">
        <div className="hud-item">
          <span className="hud-label">TURN</span>
          <span className="hud-value">{turn}</span>
        </div>
      </div>
    </div>
  );
}
