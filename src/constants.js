// ===== Image imports (Vite handles these from src/) =====
import limah1 from './Images/limah1-removebg.png'
import limah2 from './Images/limah2-removebg.png'
import limah3 from './Images/limah3-removebg.png'
import limah4 from './Images/limah4-removebg.png'
import husin1 from './Images/husin1-removebg.png'
import husin2 from './Images/husin2-removebg.png'
import husin3 from './Images/husin3-removebg.png'
import husin4 from './Images/husin4-removebg.png'
import cendolImg from './Images/cendol-removebg.png'
import karipapImg from './Images/karipap-removebg.png'
import serimukaImg from './Images/kuihserimuka.png'
import tempatSelamatImg from './Images/tempatselamat.png'
import usopWilchaImg from './Images/usopwilcha.png'
import usopWilchaNangisImg from './Images/usopwilchanangis.png'
import limahBackgroundImg from './Images/limahbackground.png'
import pokokImg from './Images/pokok.png'
import flagTolongImg from './Images/flagtolong.png'
import bomohFullbodyImg from './Images/bomohfullbody.png'
import bomohPengsanImg from './Images/bomohpengsan.png'
import bomohSofijikanImg from './Images/bomohsofijikan.png'
import husinnnSfx from './soundeffect/husinnn.mp3'
import dukunJawaSfx from './soundeffect/dukunjawa.mp3'
import usopDukunSfx from './soundeffect/usopdukun.mp3'
import bukuPanduanImg from './Images/bukupanduan.png'

// Board dimensions
export const BOARD_SIZE = 8;

// Directions
export const DIR = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

// Power-up types
export const POWERUP = {
  CENDOL: 'cendol',
  SERI_MUKA: 'seri_muka',
  KARIPAP: 'karipap',
};

// Game states
export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
  WIN: 'win',
};

// Sprite mappings - directional
export const HUSIN_SPRITES = {
  [DIR.DOWN]: husin1,
  [DIR.LEFT]: husin2,
  [DIR.RIGHT]: husin3,
  [DIR.UP]: husin4,
};

export const LIMAH_SPRITES = {
  [DIR.DOWN]: limah1,
  [DIR.LEFT]: limah2,
  [DIR.RIGHT]: limah3,
  [DIR.UP]: limah4,
};

// Power-up sprites
export const POWERUP_SPRITES = {
  [POWERUP.CENDOL]: cendolImg,
  [POWERUP.SERI_MUKA]: serimukaImg,
  [POWERUP.KARIPAP]: karipapImg,
};

// Tile & building images
export const TEMPAT_SELAMAT_IMG = tempatSelamatImg;
export const POKOK_IMG = pokokImg;

// Character & entity images
export const USOP_WILCHA_IMG = usopWilchaImg;
export const USOP_WILCHA_NANGIS_IMG = usopWilchaNangisImg;
export const FLAG_TOLONG_IMG = flagTolongImg;
export const BOMOH_FULLBODY_IMG = bomohFullbodyImg;
export const BOMOH_PENGSAN_IMG = bomohPengsanImg;
export const BOMOH_SOFIJIKAN_IMG = bomohSofijikanImg;

// Background & sounds
export const LIMAH_BACKGROUND_IMG = limahBackgroundImg;
export const HUSINNN_SFX = husinnnSfx;
export const DUKUN_JAWA_SFX = dukunJawaSfx;
export const USOP_DUKUN_SFX = usopDukunSfx;
export const BUKU_PANDUAN_IMG = bukuPanduanImg;

// Game settings
export const INITIAL_HP = 3;
export const FREEZE_DURATION = 4;
export const CONFUSE_DURATION = 2;
export const SERI_MUKA_BONUS_MOVES = 2;
export const MAX_POWERUPS_ON_BOARD = 3;
export const WIN_SCORE = 10;
export const FLAG_SPAWN_TURN = 5;       // flag first spawns at turn 5
export const FLAG_RESPAWN_INTERVAL = 8;  // new flag every 8 turns after bomoh dies

// ===== HARD GHOST AI SETTINGS =====
export const GHOST_DOUBLE_MOVE_CHANCE = 0.35;
export const GHOST_SPEED_UP_AFTER_TURN = 8;
export const GHOST_AGGRO_RANGE = 4;

// Board layout - horror chess board with trees as obstacles
// 0=grass, 1=mud, 2=moss, 3=dark, 4=home(tempat selamat), 5=tree, 6=grave
// Trees block BOTH player AND ghost. Layout ensures all areas are connected.
export const BOARD_LAYOUT = [
  [0, 0, 2, 1, 0, 0, 2, 0],
  [0, 3, 0, 6, 0, 3, 0, 1],
  [2, 0, 5, 0, 2, 0, 0, 0],
  [0, 6, 0, 0, 0, 1, 5, 2],
  [1, 0, 2, 0, 4, 0, 6, 0],
  [0, 3, 5, 0, 0, 3, 0, 1],
  [2, 0, 6, 0, 2, 0, 1, 0],
  [0, 1, 0, 2, 5, 0, 0, 0],
];

// Special tile positions
export const HOME_POS = { row: 4, col: 4 };

// Starting positions
export const HUSIN_START = { row: 7, col: 1 };
export const LIMAH_START = { row: 0, col: 4 };
export const USOP_START = { row: 1, col: 5 };
