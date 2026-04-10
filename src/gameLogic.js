import {
  BOARD_SIZE, DIR, POWERUP, FREEZE_DURATION,
  CONFUSE_DURATION, SERI_MUKA_BONUS_MOVES, MAX_POWERUPS_ON_BOARD,
  INITIAL_HP,
  GHOST_DOUBLE_MOVE_CHANCE, GHOST_SPEED_UP_AFTER_TURN, GHOST_AGGRO_RANGE,
  FLAG_SPAWN_TURN, FLAG_RESPAWN_INTERVAL,
  SELIPAR_STUN_DURATION, SELIPAR_BONUS_MOVES, SELIPAR_SPAWN_INTERVAL,
} from './constants';

// Fixed tree positions — kept the same every game so the board stays navigable
// These 4 spots are hardcoded walls, everything else is randomised per game
const FIXED_TREES = [[2,2],[3,6],[5,2],[7,4]];

// Generate a random 8x8 board layout each new game.
// Tile codes: 0=rumput, 1=spike duri(-1HP), 2=lumut, 3=gelap, 5=pokok(wall), 6=kubur portal
function generateBoardLayout() {
  const layout = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

  // Place fixed trees
  FIXED_TREES.forEach(([r, c]) => { layout[r][c] = 5; });

  // Collect all non-tree positions and shuffle them
  const free = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (layout[r][c] === 0) free.push([r, c]);

  // Fisher-Yates shuffle
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }

  // Place kubur portals (type 6) with min distance 3 between each other — no clustering
  const graveCount = 4;
  const gravePlaced = [];
  for (const [r, c] of free) {
    if (gravePlaced.length >= graveCount) break;
    const tooClose = gravePlaced.some(([gr, gc]) => Math.abs(gr - r) + Math.abs(gc - c) < 3);
    if (!tooClose) {
      layout[r][c] = 6;
      gravePlaced.push([r, c]);
    }
  }

  // Assign remaining special tiles from the shuffled free list (skip already-assigned grave spots)
  const remaining = free.filter(([r, c]) => layout[r][c] === 0);
  const otherTypes = [
    ...Array(6).fill(1),   // tanah berlumpur
    ...Array(6).fill(2),   // lantai lumut
    ...Array(4).fill(3),   // kawasan gelap
  ];
  otherTypes.forEach((type, i) => {
    if (remaining[i]) layout[remaining[i][0]][remaining[i][1]] = type;
  });

  return layout;
}

// Collect all kubur-portal (type 6) positions from a given layout
function getAllGravePositions(layout) {
  const graves = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (layout[r][c] === 6) graves.push({ row: r, col: c });
  return graves;
}

export function isValidMove(row, col, layout) {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  return layout[row][col] !== 5;
}

function isExtraTree(row, col, extraTrees) {
  if (!extraTrees) return false;
  return extraTrees.some(t => t.row === row && t.col === col);
}

export function isValidMoveWithTrees(row, col, extraTrees, layout) {
  if (!isValidMove(row, col, layout)) return false;
  return !isExtraTree(row, col, extraTrees);
}

export function isValidGhostMove(row, col, extraTrees, homePos, layout) {
  if (!isValidMoveWithTrees(row, col, extraTrees, layout)) return false;
  if (homePos && row === homePos.row && col === homePos.col) return false;
  return true;
}

export function getNewPos(pos, dir) {
  switch (dir) {
    case DIR.UP:    return { row: pos.row - 1, col: pos.col };
    case DIR.DOWN:  return { row: pos.row + 1, col: pos.col };
    case DIR.LEFT:  return { row: pos.row, col: pos.col - 1 };
    case DIR.RIGHT: return { row: pos.row, col: pos.col + 1 };
    default: return pos;
  }
}

export function isHome(pos, homePos) {
  return pos.row === homePos.row && pos.col === homePos.col;
}

export function samePos(a, b) {
  return a.row === b.row && a.col === b.col;
}

export function distance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// ===== BFS PATHFINDING =====
function bfsPath(from, to, moveCheck) {
  const key = (r, c) => `${r},${c}`;
  const queue = [{ row: from.row, col: from.col, firstDir: null }];
  const visited = new Set([key(from.row, from.col)]);

  const dirs = [
    { dir: DIR.UP,    dr: -1, dc:  0 },
    { dir: DIR.DOWN,  dr:  1, dc:  0 },
    { dir: DIR.LEFT,  dr:  0, dc: -1 },
    { dir: DIR.RIGHT, dr:  0, dc:  1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.row === to.row && curr.col === to.col) return curr.firstDir;
    for (const { dir, dr, dc } of dirs) {
      const nr = curr.row + dr;
      const nc = curr.col + dc;
      const k = key(nr, nc);
      if (!visited.has(k) && moveCheck(nr, nc)) {
        visited.add(k);
        queue.push({ row: nr, col: nc, firstDir: curr.firstDir || dir });
      }
    }
  }
  return null;
}

// ===== GHOST AI =====
function getGhostMoveToward(ghostPos, targetPos, isConfused, extraTrees, homePos, layout) {
  const ghostCheck = (r, c) => isValidGhostMove(r, c, extraTrees, homePos, layout);
  if (isConfused) {
    if (Math.random() < 0.3) {
      return getSmartMoveToward(ghostPos, targetPos, extraTrees, homePos, layout);
    }
    const dirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
    const validDirs = dirs.filter(d => {
      const np = getNewPos(ghostPos, d);
      return ghostCheck(np.row, np.col);
    });
    if (validDirs.length === 0) return { pos: ghostPos, dir: DIR.DOWN };
    const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
    return { pos: getNewPos(ghostPos, chosen), dir: chosen };
  }
  return getSmartMoveToward(ghostPos, targetPos, extraTrees, homePos, layout);
}

function getSmartMoveToward(ghostPos, targetPos, extraTrees, homePos, layout) {
  const ghostCheck = (r, c) => isValidGhostMove(r, c, extraTrees, homePos, layout);
  const dist = distance(ghostPos, targetPos);
  if (dist <= GHOST_AGGRO_RANGE || Math.random() < 0.7) {
    const bestDir = bfsPath(ghostPos, targetPos, ghostCheck);
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
    if (ghostCheck(np.row, np.col)) {
      const dd = distance(np, targetPos);
      if (dd < bestDist) { bestDist = dd; bestDir = d; }
    }
  }
  const newPos = getNewPos(ghostPos, bestDir);
  if (ghostCheck(newPos.row, newPos.col)) return { pos: newPos, dir: bestDir };
  return { pos: ghostPos, dir: bestDir };
}

function shouldGhostDoubleMove(turn) {
  if (turn >= GHOST_SPEED_UP_AFTER_TURN) return true;
  return Math.random() < GHOST_DOUBLE_MOVE_CHANCE;
}

// Find a random valid empty position
// grassOnly=true: flag/selipar only spawn on rumput (type 0) tiles
function findRandomPos(occupied, extraTrees, homePos, layout, grassOnly = false) {
  let attempts = 0;
  while (attempts < 120) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!isValidMove(row, col, layout)) { attempts++; continue; }
    if (homePos && isHome({ row, col }, homePos)) { attempts++; continue; }
    if (isExtraTree(row, col, extraTrees)) { attempts++; continue; }
    if (grassOnly && layout[row][col] !== 0) { attempts++; continue; }
    if (occupied.some(p => p && samePos(p, { row, col }))) { attempts++; continue; }
    return { row, col };
  }
  return null;
}

// Spawn powerup (avoids trees + extraTrees + kubur-portal tiles)
export function spawnPowerup(playerPos, ghostPos, existingPowerups, extraOccupied, extraTrees, homePos, layout) {
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
    if (!isValidMove(row, col, layout)) { attempts++; continue; }
    if (homePos && isHome({ row, col }, homePos)) { attempts++; continue; }
    if (isExtraTree(row, col, extraTrees)) { attempts++; continue; }
    if (layout[row][col] !== 0) { attempts++; continue; }  // kuih only on rumput (grass)
    if (occupied.some(p => samePos(p, { row, col }))) { attempts++; continue; }
    if (existingPowerups.some(p => samePos(p, { row, col }))) { attempts++; continue; }
    return { row, col, type };
  }
  return null;
}

// Generate extra random trees — only on rumput (type 0) tiles
function generateRandomTrees(occupied, layout) {
  const count = 2 + Math.floor(Math.random() * 2);
  const trees = [];
  let attempts = 0;
  while (trees.length < count && attempts < 100) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (layout[row][col] !== 0) { attempts++; continue; }
    if (occupied.some(p => p && samePos(p, { row, col }))) { attempts++; continue; }
    if (trees.some(t => samePos(t, { row, col }))) { attempts++; continue; }
    trees.push({ row, col });
    attempts++;
  }
  return trees;
}

// Pick a random walkable start position (not tree, not mud, not grave, not occupied)
function pickRandomStart(occupied, layout, minDist = 3) {
  let attempts = 0;
  while (attempts < 200) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!isValidMove(row, col, layout)) { attempts++; continue; }
    if (layout[row][col] === 1) { attempts++; continue; }  // skip spike
    if (layout[row][col] === 2) { attempts++; continue; }  // skip lumut
    if (layout[row][col] === 6) { attempts++; continue; }  // skip grave portal
    if (occupied.some(p => p && samePos(p, { row, col }))) { attempts++; continue; }
    if (minDist > 0 && occupied.some(p => p && distance(p, { row, col }) < minDist)) { attempts++; continue; }
    return { row, col };
  }
  // Fallback: relax distance constraint
  attempts = 0;
  while (attempts < 100) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!isValidMove(row, col, layout)) { attempts++; continue; }
    if (occupied.some(p => p && samePos(p, { row, col }))) { attempts++; continue; }
    return { row, col };
  }
  return { row: 0, col: 0 };
}

// Create initial game state — generates a fresh random board each new game
export function createInitialState() {
  const boardLayout = generateBoardLayout();

  const homePos      = pickRandomStart([], boardLayout, 0);
  // Clear any special tile under the home so the house never sits on a portal/mud/etc.
  boardLayout[homePos.row][homePos.col] = 0;
  const playerStart  = pickRandomStart([homePos], boardLayout, 3);
  const ghostStart   = pickRandomStart([homePos, playerStart], boardLayout, 4);
  const usopPos      = pickRandomStart([homePos, playerStart, ghostStart], boardLayout, 2);
  const trees        = generateRandomTrees([playerStart, ghostStart, usopPos, homePos], boardLayout);

  return {
    boardLayout,
    homePos,
    extraTrees: trees,
    player: { ...playerStart, dir: DIR.UP, hp: INITIAL_HP },
    ghost:  { ...ghostStart,  dir: DIR.DOWN },
    usop:   { ...usopPos },
    carryingUsop: false,
    powerups: (() => {
      const p1 = spawnPowerup(playerStart, ghostStart, [], [usopPos], trees, homePos, boardLayout);
      const p2 = spawnPowerup(playerStart, ghostStart, p1 ? [p1] : [], [usopPos], trees, homePos, boardLayout);
      return [p1, p2].filter(Boolean);
    })(),
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
    flag: null,
    bomoh: null,
    bomohDead: null,
    limahTargetBomoh: false,
    bomohJustSpawned: false,
    bomohJustDied: false,
    showSmoke: null,
    lastBomohDeathTurn: -99,
    selipar: null,
    hasSelipar: false,
    seliparChoice: null,
    graveJumpChoices: null,
    limahBonusMove: false,
    lumutSlideAnim: null,   // { from, to } set when lumut slide happens — drives animation
    duel: null,             // null | { active: true } | { active: true, resolved: true, ... }
    usedWinMoves: [],       // moves that won a previous duel — locked in next duel
  };
}

// Apply selipar choice (called from App.jsx)
export function applySeliparChoice(state, choice) {
  if (!state.hasSelipar) return state;
  let newState = { ...state, hasSelipar: false, seliparChoice: choice };

  if (choice === 'campak') {
    newState.ghostFrozen = SELIPAR_STUN_DURATION;
    newState.message = 'KENA! Selipar terbang kena muka Limah!';
    newState.messageTimer = 4;
    newState.seliparThrow = { from: { ...state.player }, to: { ...state.ghost } };
    newState = endTurn(newState);
  } else {
    newState.movesLeft = 1 + SELIPAR_BONUS_MOVES;
    newState.message = 'Husin cabut lari! +3 langkah!';
    newState.messageTimer = 3;
  }

  return newState;
}

// Process a player move
export function processMove(state, dir) {
  if (state.gameOver || state.win) return state;
  if (state.movesLeft <= 0) return state;
  if (state.hasSelipar) return state;
  if (state.graveJumpChoices) return state;

  const layout = state.boardLayout;
  const firstPos = getNewPos(state.player, dir);
  if (!isValidMoveWithTrees(firstPos.row, firstPos.col, state.extraTrees, layout)) return state;

  // ===== TILE EFFECT: LUMUT (2) — terpeleset ke arah Kak Limah! =====
  // Husin slides 1 random step CLOSER to the ghost (punishes bad positioning)
  let finalPos = { ...firstPos };
  let slideMoveCost = 0;
  if (layout[firstPos.row][firstPos.col] === 2) {
    const ghostPos = { row: state.ghost.row, col: state.ghost.col };
    const currentDist = distance(firstPos, ghostPos);
    const allDirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
    const adjacent = allDirs
      .map(d => getNewPos(firstPos, d))
      .filter(np => isValidMoveWithTrees(np.row, np.col, state.extraTrees, layout));
    // Prefer tiles that bring Husin closer to the ghost
    const closer = adjacent.filter(np => distance(np, ghostPos) < currentDist);
    const candidates = closer.length > 0 ? closer : adjacent;
    if (candidates.length > 0) {
      finalPos = candidates[Math.floor(Math.random() * candidates.length)];
      slideMoveCost = 1;
    }
  }

  // ===== TILE EFFECT: SPIKE DURI (1) — -1 HP! =====
  const onSpike = layout[finalPos.row][finalPos.col] === 1;
  const totalCost = 1 + slideMoveCost;

  let newState = {
    ...state,
    player: { ...state.player, row: finalPos.row, col: finalPos.col, dir },
    movesLeft: Math.max(0, state.movesLeft - totalCost),
    bomohJustSpawned: false,
    bomohJustDied: false,
    showSmoke: null,
    spikeHit: false,
  };

  if (slideMoveCost > 0) {
    newState.limahBonusMove = true;
    newState.lumutSlideAnim = { from: firstPos, to: finalPos };
    newState.message = 'Terpeleset ke arah Kak Limah! Tolong!!!';
    newState.messageTimer = 3;
  }
  if (onSpike) {
    newState.player = { ...newState.player, hp: newState.player.hp - 1 };
    newState.spikeHit = true;
    newState.message = 'Aduh! Pijak duri! -1 HP!';
    newState.messageTimer = 2;
    if (newState.player.hp <= 0) {
      newState.gameOver = true;
      return newState;
    }
  }

  const hp = state.homePos;

  // ===== TILE EFFECT: KUBUR PORTAL (6) — teleport! =====
  if (layout[finalPos.row][finalPos.col] === 6) {
    const otherGraves = getAllGravePositions(layout).filter(
      g => !(g.row === finalPos.row && g.col === finalPos.col)
    );
    if (otherGraves.length > 0) {
      newState.graveJumpChoices = otherGraves;
      newState.message = 'Kubur portal! Nak teleport ke mana?';
      newState.messageTimer = 99;
      return newState;
    }
  }

  // Check if player picks up Usop
  if (!newState.carryingUsop && newState.usop && samePos(finalPos, newState.usop)) {
    newState.carryingUsop = true;
    newState.message = 'Usop! Jom kita pergi tempat selamat!';
    newState.messageTimer = 3;
  }

  // Check win: carrying Usop at home
  const atHome = isHome(finalPos, hp);
  if (atHome && newState.carryingUsop) {
    newState.win = true;
    newState.playerAtHome = true;
    newState.message = 'MENANG! Usop selamat!';
    return newState;
  }

  if (atHome && !state.playerAtHome) {
    newState.playerAtHome = true;
    newState.ghostConfused = CONFUSE_DURATION;
    newState.message = !newState.carryingUsop
      ? 'Selamat! Tapi kena cari Usop dulu!'
      : 'Selamat! Hantu keliru...';
    newState.messageTimer = 3;
  } else if (!atHome && state.playerAtHome) {
    newState.playerAtHome = false;
    newState.message = 'Hantu nampak kau balik!';
    newState.messageTimer = 3;
  }

  // Flag pickup
  if (newState.flag && samePos(finalPos, newState.flag)) {
    newState.flag = null;
    const occupied = [newState.player, newState.ghost, newState.usop, newState.bomohDead].filter(Boolean);
    const bomohPos = findRandomPos(occupied, newState.extraTrees, hp, layout);
    if (bomohPos) {
      newState.bomoh = bomohPos;
      newState.showSmoke = bomohPos;
      newState.limahTargetBomoh = true;
      newState.bomohJustSpawned = true;
      newState.message = 'Bomoh muncul! Hantu tertarik...';
      newState.messageTimer = 3;
      newState.ghostFrozen = 0;
    }
  }

  // Powerup collection
  const pickedUp = newState.powerups.find(p => samePos(p, finalPos));
  if (pickedUp) {
    newState.powerups = newState.powerups.filter(p => p !== pickedUp);
    newState.score += 1;
    switch (pickedUp.type) {
      case POWERUP.CENDOL:
        if (!newState.limahTargetBomoh) newState.ghostFrozen = FREEZE_DURATION;
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

  // Selipar pickup
  if (newState.selipar && samePos(finalPos, newState.selipar)) {
    newState.selipar = null;
    newState.hasSelipar = true;
    newState.message = 'Selipar Jepun! Campak atau lari?';
    newState.messageTimer = 99;
    return newState;
  }

  if (newState.movesLeft <= 0) {
    newState = endTurn(newState);
  }

  return newState;
}

// Apply grave portal jump (called from App.jsx)
export function applyGraveJump(state, targetPos) {
  if (!state.graveJumpChoices) return state;
  const hp = state.homePos;
  const layout = state.boardLayout;

  let newState = {
    ...state,
    player: { ...state.player, row: targetPos.row, col: targetPos.col },
    graveJumpChoices: null,
    message: 'Whoosh! Husin muncul dari kubur lain!',
    messageTimer: 2,
  };

  if (!newState.carryingUsop && newState.usop && samePos(targetPos, newState.usop)) {
    newState.carryingUsop = true;
    newState.message = 'Usop! Jom kita pergi tempat selamat!';
    newState.messageTimer = 3;
  }

  const atHome = isHome(targetPos, hp);
  if (atHome && newState.carryingUsop) {
    newState.win = true;
    newState.playerAtHome = true;
    newState.message = 'MENANG! Usop selamat!';
    return newState;
  }
  if (atHome && !state.playerAtHome) {
    newState.playerAtHome = true;
    newState.ghostConfused = CONFUSE_DURATION;
    newState.message = 'Selamat! Tapi kena cari Usop dulu!';
    newState.messageTimer = 3;
  } else if (!atHome && state.playerAtHome) {
    newState.playerAtHome = false;
  }

  if (newState.flag && samePos(targetPos, newState.flag)) {
    newState.flag = null;
    const occupied = [newState.player, newState.ghost, newState.usop, newState.bomohDead].filter(Boolean);
    const bomohPos = findRandomPos(occupied, newState.extraTrees, hp, layout);
    if (bomohPos) {
      newState.bomoh = bomohPos;
      newState.showSmoke = bomohPos;
      newState.limahTargetBomoh = true;
      newState.bomohJustSpawned = true;
      newState.message = 'Bomoh muncul! Hantu tertarik...';
      newState.messageTimer = 3;
      newState.ghostFrozen = 0;
    }
  }

  const pickedUp = newState.powerups.find(p => samePos(p, targetPos));
  if (pickedUp) {
    newState.powerups = newState.powerups.filter(p => p !== pickedUp);
    newState.score += 1;
    switch (pickedUp.type) {
      case POWERUP.CENDOL:
        if (!newState.limahTargetBomoh) newState.ghostFrozen = FREEZE_DURATION;
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

  if (newState.selipar && samePos(targetPos, newState.selipar)) {
    newState.selipar = null;
    newState.hasSelipar = true;
    newState.message = 'Selipar Jepun! Campak atau lari?';
    newState.messageTimer = 99;
    return newState;
  }

  if (newState.movesLeft <= 0) {
    newState = endTurn(newState);
  }

  return newState;
}

// Cancel grave portal — stay put, continue turn
export function cancelGraveJump(state) {
  if (!state.graveJumpChoices) return state;
  let newState = { ...state, graveJumpChoices: null, message: null };
  if (newState.movesLeft <= 0) newState = endTurn(newState);
  return newState;
}

// End the player's turn — ghost moves, powerups spawn, etc.
function endTurn(state) {
  let newState = { ...state };
  newState.turn += 1;
  newState.movesLeft = 1;
  const hp = newState.homePos;
  const layout = newState.boardLayout;

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
    if (newState.limahTargetBomoh && newState.bomoh) {
      // Ghost chases bomoh
      const move = getSmartMoveToward(
        { row: newState.ghost.row, col: newState.ghost.col },
        newState.bomoh,
        newState.extraTrees,
        hp,
        layout
      );
      newState.ghost = { ...newState.ghost, row: move.pos.row, col: move.pos.col, dir: move.dir };

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
      // Ghost chases player
      const target = { row: newState.player.row, col: newState.player.col };

      // ===== TILE EFFECT: KAWASAN GELAP (3) — Husin sorok, hantu jadi blur =====
      const playerOnDark = layout[newState.player.row][newState.player.col] === 3;
      if (playerOnDark) {
        newState.message = 'Husin sorok dalam gelap! Kak Limah jadi lembu!';
        newState.messageTimer = 2;
      }
      const isConfused = newState.ghostConfused > 0 || newState.playerAtHome || playerOnDark;

      const move1 = getGhostMoveToward(
        { row: newState.ghost.row, col: newState.ghost.col },
        target,
        isConfused,
        newState.extraTrees,
        hp,
        layout
      );
      newState.ghost = { ...newState.ghost, row: move1.pos.row, col: move1.pos.col, dir: move1.dir };

      if (samePos(newState.player, newState.ghost) && !newState.playerAtHome) {
        newState.duel = { active: true, resolved: false };
        return newState;
      }

      if (!isConfused && shouldGhostDoubleMove(newState.turn)) {
        const move2 = getSmartMoveToward(
          { row: newState.ghost.row, col: newState.ghost.col },
          target,
          newState.extraTrees,
          hp,
          layout
        );
        newState.ghost = { ...newState.ghost, row: move2.pos.row, col: move2.pos.col, dir: move2.dir };
      }

      if (newState.ghostConfused > 0 && !newState.playerAtHome) {
        newState.ghostConfused -= 1;
      }
    }
  }

  // Collision check after all ghost moves
  if (!newState.limahTargetBomoh && samePos(newState.player, newState.ghost) && !newState.playerAtHome) {
    newState.duel = { active: true, resolved: false };
    return newState;
  }

  // Spawn flag tolong periodically
  if (!newState.flag && !newState.bomoh && !newState.limahTargetBomoh) {
    const canSpawnFlag = newState.turn >= FLAG_SPAWN_TURN &&
      (newState.turn - newState.lastBomohDeathTurn) >= FLAG_RESPAWN_INTERVAL;
    if (canSpawnFlag && (newState.turn === FLAG_SPAWN_TURN || Math.random() < 0.3)) {
      const occupied = [newState.player, newState.ghost, newState.usop, newState.bomohDead].filter(Boolean);
      const flagPos = findRandomPos(occupied, newState.extraTrees, hp, layout, true); // grass only
      if (flagPos) newState.flag = flagPos;
    }
  }

  // Spawn powerups periodically
  if (newState.turn % 3 === 0 && newState.powerups.length < MAX_POWERUPS_ON_BOARD) {
    const extra = [
      !newState.carryingUsop ? newState.usop : null,
      newState.flag, newState.bomoh, newState.bomohDead,
    ];
    const newPowerup = spawnPowerup(newState.player, newState.ghost, newState.powerups, extra, newState.extraTrees, hp, layout);
    if (newPowerup) newState.powerups = [...newState.powerups, newPowerup];
  }

  // Spawn selipar jepun periodically
  if (!newState.selipar && newState.turn > 0 && newState.turn % SELIPAR_SPAWN_INTERVAL === 0) {
    const occupied = [
      newState.player, newState.ghost, newState.usop,
      newState.flag, newState.bomoh, newState.bomohDead,
      ...newState.powerups,
    ].filter(Boolean);
    const seliparPos = findRandomPos(occupied, newState.extraTrees, hp, layout, true); // grass only
    if (seliparPos) newState.selipar = seliparPos;
  }

  // ===== TILE EFFECT: LUMUT BONUS MOVE — Kak Limah dapat 1 langkah extra =====
  if (newState.limahBonusMove && !newState.gameOver) {
    newState.limahBonusMove = false;
    if (newState.ghostFrozen <= 0 && !newState.limahTargetBomoh) {
      const bonusTarget = { row: newState.player.row, col: newState.player.col };
      const bonusMove = getSmartMoveToward(
        { row: newState.ghost.row, col: newState.ghost.col },
        bonusTarget,
        newState.extraTrees,
        hp,
        layout
      );
      newState.ghost = { ...newState.ghost, row: bonusMove.pos.row, col: bonusMove.pos.col, dir: bonusMove.dir };

      // Collision check after bonus move
      if (samePos(newState.player, newState.ghost) && !newState.playerAtHome) {
        newState.duel = { active: true, resolved: false };
        return newState;
      }
    }
  }

  return newState;
}

// ===== DUEL: RESOLUSI DUEL DENGAN KAK LIMAH =====
const LIMAH_COUNTERS = ['CAMPAK_SELIPAR', 'JERIT_BALIK', 'ANGKAT_PERIUK', 'DIAM'];

export function resolveDuel(state, husinMove) {
  const limahCounter = LIMAH_COUNTERS[Math.floor(Math.random() * LIMAH_COUNTERS.length)];
  const layout = state.boardLayout;

  let newState = { ...state };
  let result; // 'husin' | 'limah' | 'draw'
  let effects = {};

  if (husinMove === 'PANGGIL_MAMAT') {
    if (limahCounter === 'DIAM') {
      // Limah terlalu takut — tembakan kena terus
      result = 'husin';
      effects.frozen = 4;
      effects.showPakjabit = true;
      effects.msg = 'Diam je dia! Anak si Mamat tembak tanpa bagi amaran! Kak Limah beku 4 giliran!';
    } else if (limahCounter === 'CAMPAK_SELIPAR') {
      // Selipar kena tangan — pistol jatuh
      result = 'limah';
      effects.hp = -1;
      effects.msg = 'Selipar campak kena tangan! Pistol jatuh! Kak Limah tampar Husin! -1 HP!';
    } else {
      // Tembakan berjaya
      result = 'husin';
      effects.frozen = 4;
      effects.showPakjabit = true;
      effects.msg = 'BEDAMMM! Anak si Mamat tembak! Kak Limah terkejut beku 4 giliran!';
    }
  } else if (husinMove === 'CABUT_LARI') {
    if (limahCounter === 'CAMPAK_SELIPAR') {
      result = 'limah';
      effects.hp = -1;
      effects.msg = 'Selipar terbang! Kena belakang kepala masa lari! -1 HP!';
    } else {
      result = 'husin';
      effects.teleport = true;
      effects.msg = 'Husin cabut laju gila! Teleport jauh dari Kak Limah!';
    }
  } else if (husinMove === 'SUAP_NASI') {
    if (limahCounter === 'ANGKAT_PERIUK') {
      result = 'limah';
      effects.hp = -1;
      effects.msg = 'Limah angkat periuk, nasi tumpah! Kena periuk pulak! -1 HP!';
    } else {
      result = 'husin';
      effects.confused = 3;
      effects.msg = 'Limah terharu dapat nasi! Jadi keliru 3 giliran! Comel la dia!';
    }
  } else { // JERIT_MAK
    if (limahCounter === 'DIAM') {
      result = 'limah';
      effects.hp = -1;
      effects.msg = 'Kak Limah diam je. Pastu penampar kuat. -1 HP! Mak pun takut dia!';
    } else if (limahCounter === 'JERIT_BALIK') {
      result = 'draw';
      effects.confused = 1;
      effects.msg = 'Dua-dua jerit sama kuat! Semua pun pening! Kak Limah keliru 1 giliran!';
    } else {
      if (Math.random() < 0.5) {
        result = 'husin';
        effects.frozen = 1;
        effects.msg = 'Kak Limah terkejut dgn MAK! Beku 1 giliran! Nasib baik dia ada trauma!';
      } else {
        result = 'limah';
        effects.hp = -1;
        effects.msg = 'Kak Limah gelak besar. "MAK? Haha!" Pastu tampar. -1 HP!';
      }
    }
  }

  // Apply HP change
  if (effects.hp) {
    newState.player = { ...newState.player, hp: newState.player.hp + effects.hp };
  }
  // Apply ghost frozen
  if (effects.frozen) {
    newState.ghostFrozen = (newState.ghostFrozen || 0) + effects.frozen;
  }
  // Apply ghost confused
  if (effects.confused) {
    newState.ghostConfused = (newState.ghostConfused || 0) + effects.confused;
  }
  // Apply teleport (Cabut Lari win — find tile >= 3 away from ghost)
  if (effects.teleport) {
    const ghostPos = newState.ghost;
    const occupied = [newState.ghost, newState.usop, newState.bomoh, newState.bomohDead, ...newState.powerups, newState.flag].filter(Boolean);
    let teleportPos = null;
    let attempts = 0;
    while (attempts < 120) {
      const r = Math.floor(Math.random() * BOARD_SIZE);
      const c = Math.floor(Math.random() * BOARD_SIZE);
      if (!isValidMoveWithTrees(r, c, newState.extraTrees, layout)) { attempts++; continue; }
      if (layout[r][c] === 1) { attempts++; continue; }
      if (layout[r][c] === 6) { attempts++; continue; }
      const d = Math.abs(r - ghostPos.row) + Math.abs(c - ghostPos.col);
      if (d < 3) { attempts++; continue; }
      if (occupied.some(p => p && p.row === r && p.col === c)) { attempts++; continue; }
      teleportPos = { row: r, col: c };
      break;
    }
    if (teleportPos) {
      newState.player = { ...newState.player, row: teleportPos.row, col: teleportPos.col };
    }
  }

  // Lock the winning move so it can't be reused next duel
  const ALL_MOVES = ['PANGGIL_MAMAT', 'CABUT_LARI', 'SUAP_NASI', 'JERIT_MAK'];
  if (result === 'husin' && !newState.usedWinMoves.includes(husinMove)) {
    newState.usedWinMoves = [...newState.usedWinMoves, husinMove];
  }
  // If all 4 moves are now locked — auto lose (Kak Limah slap!)
  const allLocked = ALL_MOVES.every(m => newState.usedWinMoves.includes(m));
  if (allLocked) {
    result = 'limah';
    newState.player = { ...newState.player, hp: 0 };
    effects.msg = 'Semua cara dah habis pakai! Kak Limah gelak pastu tampar Husin kuat gila!';
    effects.allButtonsLocked = true;
  }

  // Store resolved duel for animation in overlay
  newState.duel = {
    active: true,
    resolved: true,
    result,
    limahCounter,
    husinMove,
    message: effects.msg,
    showPakjabit: effects.showPakjabit || false,
    allButtonsLocked: effects.allButtonsLocked || false,
    causedGameOver: newState.player.hp <= 0,
  };

  if (newState.player.hp <= 0) {
    newState.gameOver = true;
    newState.message = 'GAME OVER - Husin kalah duel dengan Kak Limah!';
  } else {
    newState.message = effects.msg;
    newState.messageTimer = 3;
  }

  return newState;
}
