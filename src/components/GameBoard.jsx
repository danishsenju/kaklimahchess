import React from 'react'
import {
  BOARD_SIZE, BOARD_LAYOUT, HOME_POS,
  HUSIN_SPRITES, LIMAH_SPRITES, POWERUP_SPRITES,
  TEMPAT_SELAMAT_IMG, USOP_WILCHA_IMG, POKOK_IMG,
  FLAG_TOLONG_IMG, BOMOH_FULLBODY_IMG, BOMOH_PENGSAN_IMG,
  DIR,
} from '../constants'
import './GameBoard.css'

const TILE_CLASSES = ['grass', 'mud', 'moss', 'dark', 'home', 'tree', 'grave'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function GameBoard({ state, onMove }) {
  const {
    player, ghost, usop, carryingUsop, powerups,
    ghostFrozen, ghostConfused, playerAtHome,
    flag, bomoh, bomohDead, limahTargetBomoh, showSmoke,
  } = state;

  const renderTile = (row, col) => {
    const tileType = BOARD_LAYOUT[row][col];
    const tileClass = TILE_CLASSES[tileType] || 'grass';
    const isHomeTile = row === HOME_POS.row && col === HOME_POS.col;
    const isObstacle = tileType === 5;
    const isEven = (row + col) % 2 === 0;

    return (
      <div
        key={`${row}-${col}`}
        className={`tile tile-${tileClass} ${isEven ? 'tile-even' : 'tile-odd'}`}
      >
        <div className="tile-texture" />

        {/* Tree obstacle - use pokok.png */}
        {isObstacle && (
          <div className="tree-obstacle">
            <img src={POKOK_IMG} alt="Pokok" className="pokok-img" />
          </div>
        )}

        {/* Grave decoration */}
        {tileType === 6 && <div className="grave-marker">✝</div>}

        {/* Tempat Selamat */}
        {isHomeTile && (
          <div className="special-building tempat-selamat-building">
            <img src={TEMPAT_SELAMAT_IMG} alt="Tempat Selamat" className="building-img" />
          </div>
        )}
      </div>
    );
  };

  const tileSize = 64;

  const renderEntity = (pos, type, children) => {
    const style = {
      left: `${pos.col * (tileSize + 1) + 1}px`,
      top: `${pos.row * (tileSize + 1) + 1}px`,
      width: `${tileSize}px`,
      height: `${tileSize}px`,
    };
    return (
      <div key={type} className={`entity entity-${type}`} style={style}>
        {children}
      </div>
    );
  };

  return (
    <div className="board-outer">
      {/* Wooden frame */}
      <div className="wood-frame-top" />
      <div className="wood-frame-bottom" />
      <div className="wood-frame-left" />
      <div className="wood-frame-right" />
      <div className="wood-corner wood-corner-tl" />
      <div className="wood-corner wood-corner-tr" />
      <div className="wood-corner wood-corner-bl" />
      <div className="wood-corner wood-corner-br" />

      {/* Coordinate labels */}
      <div className="coord-row coord-top">
        {COL_LABELS.map(l => <span key={l} className="coord-label">{l}</span>)}
      </div>
      <div className="coord-row coord-bottom">
        {COL_LABELS.map(l => <span key={l} className="coord-label">{l}</span>)}
      </div>
      <div className="coord-col coord-left">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className="coord-label">{8 - i}</span>)}
      </div>
      <div className="coord-col coord-right">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className="coord-label">{8 - i}</span>)}
      </div>

      <div className="board-wrapper">
        <div className="board-grid">
          {Array.from({ length: BOARD_SIZE }).map((_, row) =>
            Array.from({ length: BOARD_SIZE }).map((_, col) =>
              renderTile(row, col)
            )
          )}
        </div>

        {/* Entity layer */}
        <div className="entity-layer">
          {/* Dead bomoh (stays on board permanently) */}
          {bomohDead && renderEntity(bomohDead, 'bomoh-dead', (
            <div className="bomoh-dead-wrapper">
              <img src={BOMOH_PENGSAN_IMG} alt="Bomoh Pengsan" className="bomoh-dead-sprite" />
              <div className="entity-shadow bomoh-dead-shadow" />
            </div>
          ))}

          {/* Smoke effect */}
          {showSmoke && renderEntity(showSmoke, 'smoke', (
            <div className="smoke-effect">
              <div className="smoke-puff smoke-1" />
              <div className="smoke-puff smoke-2" />
              <div className="smoke-puff smoke-3" />
            </div>
          ))}

          {/* Flag tolong */}
          {flag && renderEntity(flag, 'flag', (
            <div className="flag-wrapper">
              <img src={FLAG_TOLONG_IMG} alt="Flag Tolong" className="flag-sprite" />
              <div className="entity-shadow flag-shadow" />
              <div className="flag-glow" />
            </div>
          ))}

          {/* Alive Bomoh */}
          {bomoh && renderEntity(bomoh, 'bomoh', (
            <div className="bomoh-wrapper">
              <img src={BOMOH_FULLBODY_IMG} alt="Bomoh" className="bomoh-sprite" />
              <div className="entity-shadow bomoh-shadow" />
              <div className="bomoh-aura" />
            </div>
          ))}

          {/* Powerups (kuih) */}
          {powerups.map((p, i) =>
            renderEntity(p, `powerup-${i}`, (
              <div className="powerup-wrapper">
                <img src={POWERUP_SPRITES[p.type]} alt={p.type} className="powerup-sprite" />
                <div className="entity-shadow" />
                <div className="powerup-glow" />
              </div>
            ))
          )}

          {/* Usop Wilcha */}
          {!carryingUsop && usop && renderEntity(usop, 'usop', (
            <div className="usop-wrapper">
              <img src={USOP_WILCHA_IMG} alt="Usop Wilcha" className="usop-sprite" />
              <div className="entity-shadow usop-shadow" />
              <div className="usop-help-icon">❗</div>
            </div>
          ))}

          {/* Ghost (Hantu Kak Limah) */}
          {renderEntity(ghost, 'ghost', (
            <div className={`ghost-wrapper ${ghostFrozen > 0 ? 'frozen' : ''} ${ghostConfused > 0 ? 'confused' : ''} ${limahTargetBomoh ? 'hunting-bomoh' : ''}`}>
              <img src={LIMAH_SPRITES[ghost.dir]} alt="Hantu Kak Limah" className="ghost-sprite" />
              <div className="entity-shadow ghost-shadow" />
              {ghostFrozen > 0 && <div className="status-icon freeze-icon">❄️</div>}
              {ghostConfused > 0 && <div className="status-icon confuse-icon">❓</div>}
              {limahTargetBomoh && <div className="status-icon target-icon">💀</div>}
            </div>
          ))}

          {/* Player (Husin) */}
          {renderEntity(player, 'player', (
            <div className={`player-wrapper ${playerAtHome ? 'at-home' : ''} ${carryingUsop ? 'carrying' : ''}`}>
              <img src={HUSIN_SPRITES[player.dir]} alt="Husin" className="player-sprite" />
              <div className="entity-shadow player-shadow" />
              {playerAtHome && <div className="shield-effect" />}
              {carryingUsop && (
                <div className="carrying-indicator">
                  <img src={USOP_WILCHA_IMG} alt="Carrying Usop" className="carrying-usop-mini" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile D-Pad */}
      <div className="dpad">
        <button className="dpad-btn dpad-up" onClick={() => onMove(DIR.UP)}>▲</button>
        <button className="dpad-btn dpad-left" onClick={() => onMove(DIR.LEFT)}>◀</button>
        <button className="dpad-btn dpad-right" onClick={() => onMove(DIR.RIGHT)}>▶</button>
        <button className="dpad-btn dpad-down" onClick={() => onMove(DIR.DOWN)}>▼</button>
      </div>
    </div>
  );
}
