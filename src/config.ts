import { GameScene } from './scenes/game-scene';
import { MenuScene } from './scenes/menu-scene';
import { GAME_H, GAME_W } from './interfaces/shared';

// TODO: have 2 different configs for mobile and desktop?
export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Orcball',
  url: 'https://github.com/rmdocherty/orcball_ts',
  version: '0.0.1',
  backgroundColor: 0x8b9150,
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT, // maybe use RESIZE mode?
    autoCenter: Phaser.Scale.CENTER_BOTH, // CENTER_HORIZONTALLY
    parent: 'game',
    // was both '100%
    width: GAME_W,
    height: GAME_H
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: -100 }
    }
  },
  antialias: false,
  scene: [MenuScene, GameScene] // entrypoint
};
