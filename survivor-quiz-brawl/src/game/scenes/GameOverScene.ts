import Phaser from 'phaser';
import { EventBus, GameEvents } from '../utils/EventBus';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; level: number; survivalTime: number; monstersKilled: number }): void {
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setScrollFactor(0);

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // Stats
    const stats = [
      `Score: ${data.score || 0}`,
      `Level: ${data.level || 1}`,
      `Time: ${Math.floor(data.survivalTime || 0)}s`,
      `Kills: ${data.monstersKilled || 0}`,
    ];

    stats.forEach((stat, index) => {
      const statText = this.add.text(width / 2, height / 2 + index * 40, stat, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      });
      statText.setOrigin(0.5);
      statText.setScrollFactor(0);
    });

    // Restart button
    const restartBtn = this.add.rectangle(width / 2, height * 0.75, 200, 50, 0x4ade80);
    restartBtn.setScrollFactor(0);
    restartBtn.setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2, height * 0.75, 'Play Again', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000',
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);

    restartBtn.on('pointerover', () => {
      restartBtn.setFillStyle(0x22c55e);
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setFillStyle(0x4ade80);
    });

    restartBtn.on('pointerdown', () => {
      EventBus.emit(GameEvents.GAME_START);
      this.scene.start('GameScene');
    });
  }
}
