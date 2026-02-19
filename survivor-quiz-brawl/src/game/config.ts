import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export const GAME_CONFIG = {
  // Player settings
  player: {
    speed: 200,
    maxHp: 100,
    invincibilityDuration: 1000,
    pickupRange: 50,
  },

  // XP settings
  xp: {
    baseToLevel: 10,
    multiplier: 1.2,
    gemAttractionRange: 100,
    gemAttractionSpeed: 400,
  },

  // Wave settings
  waves: {
    baseDuration: 30,
    spawnRateMultiplier: 1.1,
  },

  // Game settings
  game: {
    maxLevel: 50,
    maxWeapons: 6,
    maxPassives: 6,
    upgradeChoices: 3,
  },
};

export const createPhaserConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, GameOverScene],
  render: {
    pixelArt: true,
    antialias: false,
  },
  input: {
    activePointers: 2,
  },
});
