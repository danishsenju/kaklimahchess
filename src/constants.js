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
import husinSeliparImg from './Images/husinselipar1.png'
import seliparJepunImg from './Images/selipurjepun.png'
import seliparCampakBtnImg from './Images/seliparcampakbutton.png'
import husinLariBtnImg from './Images/husinlaributton.png'
import kuburImg from './Images/kubur.png'
import lumutImg from './Images/lumut_image.png'
import rumputImg from './Images/rumput_image.png'
import tanahImg from './Images/tanah_image.png'
import kaklimahBattleImg from './Images/kaklimah_battle.png'
import husinBattleImg from './Images/husin_battle.png'
import duelBackgroundImg from './Images/duel_background.png'
import pakjabitImg from './Images/pakjabit.png'
import husinKalahLockImg from './Images/husin-kalahsemuabuttonlock.png'
import duelButtonImg from './Images/duel-button.png'
import duelButtonMobileImg from './Images/duel-buttonmobile.png'
import bunyiTembakanSfx from './soundeffect/bunyi-tembakan.mp3'
import suaraPakjabitSfx from './soundeffect/suara-pakjabit.mp3'
import ingameSoundSrc from './soundeffect/ingamesound.mp3'
import gameoverSfx from './soundeffect/gameover.mp3'
import kaklimahBekuSfx from './soundeffect/kaklimahbeku.mp3'
import kuihSfx from './soundeffect/kuihsoundeffect.mp3'
import seliparKemukaSfx from './soundeffect/seliparkemuka.mp3'
import clickSoundSfx from './soundeffect/clicksound.mp3'
import soleySoleySfx from './soundeffect/soleysoley.mp3'
import tergelincirsoundSfx from './soundeffect/tergelincirsound.mp3'
import nyawaTolakSfx from './soundeffect/nyawa-tolak.mp3'
import duelSoundtrackSrc from './soundeffect/duel-soundtrack.mp3'
import spikeTilesImg from './Images/spike-tiles.png'
import husinWingameImg from './Images/husin-wingame.png'
import kakLimahMenangImg from './Images/kak-kimahmenang.png'
import frontPageImg from './Images/front-page.png'
import blackHoleImg from './Images/black-hole.png'

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
export const HUSIN_SELIPAR_IMG = husinSeliparImg;
export const SELIPAR_JEPUN_IMG = seliparJepunImg;
export const SELIPAR_CAMPAK_BTN_IMG = seliparCampakBtnImg;
export const HUSIN_LARI_BTN_IMG = husinLariBtnImg;
export const KUBUR_IMG = kuburImg;
export const LUMUT_IMG = lumutImg;
export const RUMPUT_IMG = rumputImg;
export const TANAH_IMG = tanahImg;
export const KAKLIMAH_BATTLE_IMG = kaklimahBattleImg;
export const HUSIN_BATTLE_IMG = husinBattleImg;
export const DUEL_BACKGROUND_IMG = duelBackgroundImg;
export const PAKJABIT_IMG = pakjabitImg;
export const DUEL_BUTTON_IMG = duelButtonImg;
export const HUSIN_KALAH_LOCK_IMG = husinKalahLockImg;
export const DUEL_BUTTON_MOBILE_IMG = duelButtonMobileImg;
export const BUNYI_TEMBAKAN_SFX = bunyiTembakanSfx;
export const SUARA_PAKJABIT_SFX = suaraPakjabitSfx;
export const INGAME_SOUND_SRC = ingameSoundSrc;
export const GAMEOVER_SFX = gameoverSfx;
export const KAKLIMAH_BEKU_SFX = kaklimahBekuSfx;
export const KUIH_SFX = kuihSfx;
export const SELIPAR_KEMUKA_SFX = seliparKemukaSfx;
export const CLICK_SOUND_SFX = clickSoundSfx;
export const SOLEY_SOLEY_SFX = soleySoleySfx;
export const TERGELINCIR_SFX = tergelincirsoundSfx;
export const NYAWA_TOLAK_SFX = nyawaTolakSfx;
export const DUEL_SOUNDTRACK_SRC = duelSoundtrackSrc;
export const SPIKE_TILES_IMG = spikeTilesImg;
export const HUSIN_WINGAME_IMG = husinWingameImg;
export const KAK_LIMAH_MENANG_IMG = kakLimahMenangImg;
export const FRONT_PAGE_IMG = frontPageImg;
export const BLACK_HOLE_IMG = blackHoleImg;

// Game settings
export const INITIAL_HP = 3;
export const FREEZE_DURATION = 4;
export const CONFUSE_DURATION = 2;
export const SERI_MUKA_BONUS_MOVES = 2;
export const SELIPAR_STUN_DURATION = 3;
export const SELIPAR_BONUS_MOVES = 3;
export const SELIPAR_SPAWN_INTERVAL = 10;  // selipar spawns every 10 turns
export const MAX_POWERUPS_ON_BOARD = 3;
export const WIN_SCORE = 10;
export const FLAG_SPAWN_TURN = 5;       // flag first spawns at turn 5
export const FLAG_RESPAWN_INTERVAL = 8;  // new flag every 8 turns after bomoh dies

// Tile effect rules (for UI legend + logic reference)
export const TILE_EFFECTS = {
  0: { name: 'Rumput', effect: 'Normal — gerak 1 langkah mana-mana arah' },
  1: { name: 'Tiles Berduri', effect: 'Bahaya — pijak sini -1 HP!' },
  2: { name: 'Lumut', effect: 'Licin — auto-gelincir 1 langkah lagi arah sama' },
  3: { name: 'Kawasan Gelap', effect: '50/50 — nasib baik selamat, nasib malang kena kejar!' },
  6: { name: 'Kubur', effect: 'Portal — boleh teleport ke mana-mana kubur lain' },
};

// ===== HARD GHOST AI SETTINGS =====
export const GHOST_DOUBLE_MOVE_CHANCE = 0.35;
export const GHOST_SPEED_UP_AFTER_TURN = 8;
export const GHOST_AGGRO_RANGE = 4;

// Board layout - horror chess board with trees as obstacles
// 0=grass, 1=spike(duri), 2=moss, 3=dark, 5=tree, 6=grave
// Trees block BOTH player AND ghost. Layout ensures all areas are connected.
// Home (tempat selamat) position is randomized each game.
export const BOARD_LAYOUT = [
  [0, 0, 2, 1, 0, 0, 2, 0],
  [0, 3, 0, 6, 0, 3, 0, 1],
  [2, 0, 5, 0, 2, 0, 0, 0],
  [0, 6, 0, 0, 0, 1, 5, 2],
  [1, 0, 2, 0, 0, 0, 6, 0],
  [0, 3, 5, 0, 0, 3, 0, 1],
  [2, 0, 6, 0, 2, 0, 1, 0],
  [0, 1, 0, 2, 5, 0, 0, 0],
];
