import {
  BOARD_SIZE, DIR, BOARD_LAYOUT, POWERUP, FREEZE_DURATION,
  CONFUSE_DURATION, SERI_MUKA_BONUS_MOVES, MAX_POWERUPS_ON_BOARD,
  HOME_POS, INITIAL_HP,
  GHOST_DOUBLE_MOVE_CHANCE, GHOST_SPEED_UP_AFTER_TURN, GHOST_AGGRO_RANGE,
  USOP_START, FLAG_SPAWN_TURN, FLAG_RESPAWN_INTERVAL,
} from './constants';

export function isValidMove(row, col) {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  const tile = BOARD_LAYOUT[row][col];
  return tile !== 5;
}

export function isValidPlayerMove(row, col) {
  return isValidMove(row, col);
}

export function getNewPos(pos, dir) {
  switch (dir) {
    case DIR.UP: return { row: pos.row - 1, col: pos.col };
    case DIR.DOWN: return { row: pos.row + 1, col: pos.col };
    case DIR.LEFT: return { row: pos.row, col: pos.col - 1 };
    case DIR.RIGHT: return { row: pos.row, col: pos.col + 1 };
    default: return pos;
  }
}

export function isHome(pos) {
  return pos.row === HOME_POS.row && pos.col === HOME_POS.col;
}

export function samePos(a, b) {
  return a.row === b.row && a.col === b.col;
}

export function distance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// ===== BFS PATHFINDING =====
function bfsPath(from, to) {
  const key = (r, c) => `${r},${c}`;
  const queue = [{ row: from.row, col: from.col, firstDir: null }];
  const visited = new Set();
  visited.add(key(from.row, from.col));

  const dirs = [
    { dir: DIR.UP, dr: -1, dc: 0 },
    { dir: DIR.DOWN, dr: 1, dc: 0 },
    { dir: DIR.LEFT, dr: 0, dc: -1 },
    { dir: DIR.RIGHT, dr: 0, dc: 1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.row === to.row && curr.col === to.col) return curr.firstDir;

    for (const { dir, dr, dc } of dirs) {
      const nr = curr.row + dr;
      const nc = curr.col + dc;
      const k = key(nr, nc);
      if (!visited.has(k) && isValidMove(nr, nc)) {
        visited.add(k);
        queue.push({ row: nr, col: nc, firstDir: curr.firstDir || dir });
      }
    }
  }
  return null;
}

// ===== GHOST AI - move toward a target =====
function getGhostMoveToward(ghostPos, targetPos, isConfused) {
  if (isConfused) {
    if (Math.random() < 0.3) {
      return getSmartMoveToward(ghostPos, targetPos);
    }
    const dirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
    const validDirs = dirs.filter(d => {
      const np = getNewPos(ghostPos, d);
      return isValidMove(np.row, np.col);
    });
    if (validDirs.length === 0) return { pos: ghostPos, dir: DIR.DOWN };
    const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
    return { pos: getNewPos(ghostPos, chosen), dir: chosen };
  }
  return getSmartMoveToward(ghostPos, targetPos);
}

function getSmartMoveToward(ghostPos, targetPos) {
  const dist = distance(ghostPos, targetPos);
  if (dist <= GHOST_AGGRO_RANGE || Math.random() < 0.7) {
    const bestDir = bfsPath(ghostPos, targetPos);
    if (bestDir) {
      const np = getNewPos(ghostPos, bestDir);
      return { pos: np, dir: bestDir };
    }
  }

  const dirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
  let bestDir = DIR.DOWN;
  let bestDist = Infinity;
  for (const d of dirs) {
    const np = getNewPos(ghostPos, d);
    if (isValidMove(np.row, np.col)) {
      const dd = distance(np, targetPos);
      if (dd < bestDist) { bestDist = dd; bestDir = d; }
    }
  }
  const newPos = getNewPos(ghostPos, bestDir);
  if (isValidMove(newPos.row, newPos.col)) return { pos: newPos, dir: bestDir };
  return { pos: ghostPos, dir: bestDir };
}

function shouldGhostDoubleMove(turn) {
  if (turn >= GHOST_SPEED_UP_AFTER_TURN) return true;
  return Math.random() < GHOST_DOUBLE_MOVE_CHANCE;
}

// Find a random valid empty position
function findRandomPos(occupied) {
  let attempts = 0;
  while (attempts < 80) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!isValidMove(row, col)) { attempts++; continue; }
    if (isHome({ row, col })) { attempts++; continue; }
    if (occupied.some(p => p && samePos(p, { row, col }))) { attempts++; continue; }
    return { row, col };
  }
  return null;
}

// Spawn powerup
export function spawnPowerup(playerPos, ghostPos, existingPowerups, extraOccupied) {
  const types = [POWERUP.CENDOL, POWERUP.SERI_MUKA, POWERUP.KARIPAP];
  const weights = [1, 2, 2];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  let type = types[0];
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = types[i]; break; }
  }

  const occupied = [playerPos, ghostPos, ...extraOccupied.filter(Boolean)];
  let attempts = 0;
  while (attempts < 50) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!isValidMove(row, col)) { attempts++; continue; }
    if (isHome({ row, col })) { attempts++; continue; }
    if (occupied.some(p => samePos(p, { row, col }))) { attempts++; continue; }
    if (existingPowerups.some(p => samePos(p, { row, col }))) { attempts++; continue; }
    return { row, col, type };
  }
  return null;
}

// Create initial game state
export function createInitialState(playerStart, ghostStart) {
  const extra = [USOP_START];
  return {
    player: { ...playerStart, dir: DIR.UP, hp: INITIAL_HP },
    ghost: { ...ghostStart, dir: DIR.DOWN },
    usop: { ...USOP_START },
    carryingUsop: false,
    powerups: [
      spawnPowerup(playerStart, ghostStart, [], extra),
      spawnPowerup(playerStart, ghostStart, [], extra),
    ].filter(Boolean),
    score: 0,
    turn: 0,
    movesLeft: 1,
    ghostFrozen: 0,
    ghostConfused: 0,
    playerAtHome: false,
    message: null,
    messageTimer: 0,
    gameOver: false,
    win: false,
    // Flag & Bomoh state
    flag: null,              // { row, col } or null
    bomoh: null,             // { row, col } alive bomoh position
    bomohDead: null,         // { row, col } dead bomoh stays on board
    limahTargetBomoh: false, // limah chasing bomoh instead of player
    bomohJustSpawned: false, // trigger for App popup
    bomohJustDied: false,    // trigger for App popup
    showSmoke: null,         // { row, col } for smoke effect
    lastBomohDeathTurn: -99, // track when bomoh last died for respawn
  };
}

// Process a player move
export function processMove(state, dir) {
  if (state.gameOver || state.win) return state;
  if (state.movesLeft <= 0) return state;

  const newPos = getNewPos(state.player, dir);
  if (!isValidPlayerMove(newPos.row, newPos.col)) return state;

  let newState = {
    ...state,
    player: { ...state.player, row: newPos.row, col: newPos.col, dir },
    movesLeft: state.movesLeft - 1,
    bomohJustSpawned: false,
    bomohJustDied: false,
    showSmoke: null,
  };

  // Check if player picks up Usop
  if (!newState.carryingUsop && newState.usop && samePos(newPos, newState.usop)) {
    newState.carryingUsop = true;
    newState.message = 'Usop! Jom kita pergi tempat selamat!';
    newState.messageTimer = 3;
  }

  // Check if player carrying Usop reaches home = WIN
  const atHome = isHome(newPos);
  if (atHome && newState.carryingUsop) {
    newState.win = true;
    newState.playerAtHome = true;
    newState.message = 'MENANG! Usop selamat!';
    return newState;
  }

  if (atHome && !state.playerAtHome) {
    newState.playerAtHome = true;
    newState.ghostConfused = CONFUSE_DURATION;
    if (!newState.carryingUsop) {
      newState.message = 'Selamat! Tapi kena cari Usop dulu!';
    } else {
      newState.message = 'Selamat! Hantu keliru...';
    }
    newState.messageTimer = 3;
  } else if (!atHome && state.playerAtHome) {
    newState.playerAtHome = false;
    newState.message = 'Hantu nampak kau balik!';
    newState.messageTimer = 3;
  }

  // Check if player picks up flag tolong
  if (newState.flag && samePos(newPos, newState.flag)) {
    newState.flag = null;
    // Spawn bomoh at random position with smoke
    const occupied = [
      newState.player, newState.ghost, newState.usop,
      newState.bomohDead,
    ].filter(Boolean);
    const bomohPos = findRandomPos(occupied);
    if (bomohPos) {
      newState.bomoh = bomohPos;
      newState.showSmoke = bomohPos;
      newState.limahTargetBomoh = true;
      newState.bomohJustSpawned = true;
      newState.message = 'Bomoh muncul! Hantu tertarik...';
      newState.messageTimer = 3;
      // Unfreeze ghost so it can chase bomoh
      newState.ghostFrozen = 0;
    }
  }

  // Check powerup collection
  const pickedUp = newState.powerups.find(p => samePos(p, newPos));
  if (pickedUp) {
    newState.powerups = newState.powerups.filter(p => p !== pickedUp);
    newState.score = newState.score + 1;

    switch (pickedUp.type) {
      case POWERUP.CENDOL:
        // Cendol only freezes ghost if ghost is chasing player, not bomoh
        if (!newState.limahTargetBomoh) {
          newState.ghostFrozen = FREEZE_DURATION;
        }
        newState.message = 'Cendol! Hantu beku!';
        newState.messageTimer = 3;
        break;
      case POWERUP.SERI_MUKA:
        newState.movesLeft += SERI_MUKA_BONUS_MOVES;
        newState.message = 'Seri Muka! +2 langkah!';
        newState.messageTimer = 3;
        break;
      case POWERUP.KARIPAP:
        newState.player = { ...newState.player, hp: newState.player.hp + 1 };
        newState.message = 'Karipap! +1 HP!';
        newState.messageTimer = 3;
        break;
    }
  }

  // If no more moves left, end turn
  if (newState.movesLeft <= 0) {
    newState = endTurn(newState);
  }

  return newState;
}

// End the player's turn
function endTurn(state) {
  let newState = { ...state };
  newState.turn += 1;
  newState.movesLeft = 1;

  if (newState.messageTimer > 0) {
    newState.messageTimer -= 1;
    if (newState.messageTimer <= 0) newState.message = null;
  }

  // Ghost movement
  if (newState.ghostFrozen > 0) {
    newState.ghostFrozen -= 1;
    if (newState.ghostFrozen <= 0) {
      newState.message = 'Hantu dah cair!';
      newState.messageTimer = 2;
    }
  } else {
    // Determine ghost target
    let target;
    if (newState.limahTargetBomoh && newState.bomoh) {
      // Ghost chases bomoh - always smart, 1 move per player move
      target = newState.bomoh;
      const move = getSmartMoveToward(
        { row: newState.ghost.row, col: newState.ghost.col },
        target
      );
      newState.ghost = { ...newState.ghost, row: move.pos.row, col: move.pos.col, dir: move.dir };

      // Check if ghost reached bomoh -> bomoh dies
      if (samePos(newState.ghost, newState.bomoh)) {
        newState.bomohDead = { ...newState.bomoh };
        newState.bomoh = null;
        newState.limahTargetBomoh = false;
        newState.bomohJustDied = true;
        newState.lastBomohDeathTurn = newState.turn;
        newState.message = 'Bomoh pengsan! Hantu kembali...';
        newState.messageTimer = 3;
      }
    } else {
      // Normal behavior - chase player
      target = { row: newState.player.row, col: newState.player.col };
      const isConfused = newState.ghostConfused > 0 || newState.playerAtHome;

      const move1 = getGhostMoveToward(
        { row: newState.ghost.row, col: newState.ghost.col },
        target,
        isConfused
      );
      newState.ghost = { ...newState.ghost, row: move1.pos.row, col: move1.pos.col, dir: move1.dir };

      // Check collision
      if (samePos(newState.player, newState.ghost) && !newState.playerAtHome) {
        newState.player = { ...newState.player, hp: newState.player.hp - 1 };
        newState.message = 'Hantu kena kau! -1 HP';
        newState.messageTimer = 3;
        if (newState.player.hp <= 0) {
          newState.gameOver = true;
          newState.message = 'GAME OVER - Husin kena tangkap!';
          return newState;
        }
      }

      // Double move
      if (!isConfused && shouldGhostDoubleMove(newState.turn)) {
        const move2 = getSmartMoveToward(
          { row: newState.ghost.row, col: newState.ghost.col },
          target
        );
        newState.ghost = { ...newState.ghost, row: move2.pos.row, col: move2.pos.col, dir: move2.dir };
      }

      if (newState.ghostConfused > 0 && !newState.playerAtHome) {
        newState.ghostConfused -= 1;
      }
    }
  }

  // Check collision after all ghost moves (only when chasing player)
  if (!newState.limahTargetBomoh && samePos(newState.player, newState.ghost) && !newState.playerAtHome) {
    newState.player = { ...newState.player, hp: newState.player.hp - 1 };
    newState.message = 'Hantu kena kau! -1 HP';
    newState.messageTimer = 3;
    if (newState.player.hp <= 0) {
      newState.gameOver = true;
      newState.message = 'GAME OVER - Husin kena tangkap!';
      return newState;
    }
  }

  // Spawn flag tolong periodically
  if (!newState.flag && !newState.bomoh && !newState.limahTargetBomoh) {
    const canSpawnFlag = newState.turn >= FLAG_SPAWN_TURN &&
      (newState.turn - newState.lastBomohDeathTurn) >= FLAG_RESPAWN_INTERVAL;
    // Also random chance each qualifying turn
    if (canSpawnFlag && (newState.turn === FLAG_SPAWN_TURN || Math.random() < 0.3)) {
      const occupied = [
        newState.player, newState.ghost, newState.usop,
        newState.bomohDead,
      ].filter(Boolean);
      const flagPos = findRandomPos(occupied);
      if (flagPos) {
        newState.flag = flagPos;
      }
    }
  }

  // Spawn powerups periodically
  if (newState.turn % 3 === 0 && newState.powerups.length < MAX_POWERUPS_ON_BOARD) {
    const extra = [
      !newState.carryingUsop ? newState.usop : null,
      newState.flag, newState.bomoh, newState.bomohDead,
    ];
    const newPowerup = spawnPowerup(newState.player, newState.ghost, newState.powerups, extra);
    if (newPowerup) {
      newState.powerups = [...newState.powerups, newPowerup];
    }
  }

  return newState;
}
