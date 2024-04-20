import { GameScene } from './scenes/game-scene';

// TODO: have 2 different configs for mobile and desktop?
export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Orcball',
  url: 'https://github.com/rmdocherty/orcball_ts',
  version: '0.0.1',
  backgroundColor: 0x3a404d,
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT, // maybe use RESIZE mode?
    autoCenter: Phaser.Scale.CENTER_BOTH, // CENTER_HORIZONTALLY
    parent: 'game',
    // was both '100% - below are iphone SE dims times 2
    width: 375 * 2,
    height: 667 * 2
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: -100 }
    }
  },
  scene: [GameScene] // entrypoint
};
