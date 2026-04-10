import React from 'react'
import {
  BOARD_SIZE,
  HUSIN_SPRITES, LIMAH_SPRITES, POWERUP_SPRITES,
  TEMPAT_SELAMAT_IMG, USOP_WILCHA_IMG, POKOK_IMG,
  FLAG_TOLONG_IMG, BOMOH_FULLBODY_IMG, BOMOH_PENGSAN_IMG,
  SELIPAR_JEPUN_IMG, HUSIN_SELIPAR_IMG, KUBUR_IMG, LUMUT_IMG, RUMPUT_IMG, TANAH_IMG, SPIKE_TILES_IMG, BLACK_HOLE_IMG,
} from '../constants'
import './GameBoard.css'

const TILE_CLASSES = ['grass', 'mud', 'moss', 'dark', 'home', 'tree', 'grave'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function GameBoard({ state, lumutSlideOverride }) {
  const {
    player, ghost, usop, carryingUsop, powerups,
    ghostFrozen, ghostConfused, playerAtHome,
    flag, bomoh, bomohDead, limahTargetBomoh, showSmoke,
    selipar, hasSelipar, extraTrees, homePos,
    graveJumpChoices, movesLeft, boardLayout,
  } = state;

  // During lumut slide: override where Husin is rendered
  const displayPlayer = lumutSlideOverride
    ? { ...player, row: lumutSlideOverride.pos.row, col: lumutSlideOverride.pos.col }
    : player;
  const isSliding = lumutSlideOverride?.phase === 'sliding';
  const isOnLumut = lumutSlideOverride?.phase === 'on-lumut';

  // Compute valid move tiles (chess-style highlights)
  const validMoveTiles = new Set();
  const graveTargetTiles = new Set();

  if (graveJumpChoices) {
    graveJumpChoices.forEach(g => graveTargetTiles.add(`${g.row}-${g.col}`));
  } else if (!hasSelipar && movesLeft > 0 && !state.gameOver && !state.win) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dirs.forEach(([dr, dc]) => {
      const nr = player.row + dr;
      const nc = player.col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        const tileType = boardLayout[nr][nc];
        if (tileType !== 5) {
          const blocked = extraTrees && extraTrees.some(t => t.row === nr && t.col === nc);
          if (!blocked) validMoveTiles.add(`${nr}-${nc}`);
        }
      }
    });
  }

  const renderTile = (row, col) => {
    const tileType = boardLayout[row][col];
    const tileClass = TILE_CLASSES[tileType] || 'grass';
    const isHomeTile = homePos && row === homePos.row && col === homePos.col;
    const isObstacle = tileType === 5;
    const isEven = (row + col) % 2 === 0;
    const key = `${row}-${col}`;
    const isValidMove = validMoveTiles.has(key);
    const isGraveTarget = graveTargetTiles.has(key);

    return (
      <div
        key={key}
        className={`tile tile-${tileClass} ${isEven ? 'tile-even' : 'tile-odd'}`}
      >
        <div className="tile-texture" />

        {/* Rumput (grass type-0) base image */}
        {tileType === 0 && (
          <div className="rumput-decoration">
            <img src={RUMPUT_IMG} alt="" className="rumput-img" />
          </div>
        )}

        {/* Spike duri (type-1) — -1 HP on step */}
        {tileType === 1 && (
          <div className="spike-decoration">
            <img src={SPIKE_TILES_IMG} alt="Duri" className="spike-img" />
          </div>
        )}

        {/* Tanah base for kubur portal (type-6) — glow kubur rendered below on top */}
        {tileType === 6 && (
          <div className="tanah-decoration">
            <img src={TANAH_IMG} alt="" className="tanah-img" />
          </div>
        )}

        {/* Valid move highlight */}
        {isValidMove && <div className="tile-highlight-valid" />}

        {/* Grave portal target highlight */}
        {isGraveTarget && <div className="tile-highlight-grave" />}

        {/* Tree obstacle - use pokok.png */}
        {isObstacle && (
          <div className="tree-obstacle">
            <img src={POKOK_IMG} alt="Pokok" className="pokok-img" />
          </div>
        )}

        {/* Kawasan Gelap (dark type-3) — black hole image */}
        {tileType === 3 && (
          <div className="blackhole-decoration">
            <img src={BLACK_HOLE_IMG} alt="Kawasan Gelap" className="blackhole-img" />
          </div>
        )}

        {/* Lantai lumut (moss) — lumut image */}
        {tileType === 2 && (
          <div className="lumut-decoration">
            <img src={LUMUT_IMG} alt="Lumut" className="lumut-img" />
          </div>
        )}

        {/* Kubur portal (grave type-6) — glowing tombstone = PORTAL */}
        {tileType === 6 && (
          <div className="grave-portal-decoration">
            <img src={KUBUR_IMG} alt="Kubur Portal" className="grave-portal-img" />
            <div className="grave-portal-glow" />
          </div>
        )}


        {/* Extra random tree on this green tile */}
        {extraTrees && extraTrees.some(t => t.row === row && t.col === col) && (
          <div className="tree-obstacle extra-tree">
            <img src={POKOK_IMG} alt="Pokok" className="pokok-img" />
          </div>
        )}

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

          {/* Selipar Jepun on board */}
          {selipar && renderEntity(selipar, 'selipar', (
            <div className="selipar-wrapper">
              <img src={SELIPAR_JEPUN_IMG} alt="Selipar Jepun" className="selipar-sprite" />
              <div className="entity-shadow" />
              <div className="selipar-glow" />
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
          {renderEntity(displayPlayer, 'player', (
            <div className={`player-wrapper ${playerAtHome ? 'at-home' : ''} ${carryingUsop ? 'carrying' : ''} ${hasSelipar ? 'holding-selipar' : ''} ${isOnLumut ? 'on-lumut' : ''} ${isSliding ? 'sliding' : ''}`}>
              <img src={hasSelipar ? HUSIN_SELIPAR_IMG : HUSIN_SPRITES[player.dir]} alt="Husin" className="player-sprite" />
              <div className="entity-shadow player-shadow" />
              {playerAtHome && <div className="shield-effect" />}
              {carryingUsop && (
                <div className="carrying-indicator">
                  <img src={USOP_WILCHA_IMG} alt="Carrying Usop" className="carrying-usop-mini" />
                </div>
              )}
              {(isOnLumut || isSliding) && (
                <div className="tergelincir-label">💨 TERGELINCIR!</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
