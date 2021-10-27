import Phaser from 'phaser';
// import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000',
  scale: {
    width: 1024,
    height: 768,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
};

export default config;
