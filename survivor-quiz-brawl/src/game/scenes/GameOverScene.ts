import Phaser from 'phaser';
import { EventBus, GameEvents } from '../utils/EventBus';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; level: number; survivalTime: number; monstersKilled: number }): void {
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setScrollFactor(0);

    // Game Over text with animation
    const gameOverText = this.add.text(width / 2, height * 0.2, '게임 오버', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // Animate game over text
    this.tweens.add({
      targets: gameOverText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Stats panel background
    const panelWidth = 300;
    const panelHeight = 200;
    const panel = this.add.rectangle(width / 2, height * 0.48, panelWidth, panelHeight, 0x1a1a2e, 0.9);
    panel.setStrokeStyle(3, 0x4ade80);
    panel.setScrollFactor(0);

    // Stats title
    const statsTitle = this.add.text(width / 2, height * 0.35, '📊 결과', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#4ade80',
      fontStyle: 'bold',
    });
    statsTitle.setOrigin(0.5);
    statsTitle.setScrollFactor(0);

    // Stats with icons
    const stats = [
      { icon: '🏆', label: '점수', value: data.score || 0 },
      { icon: '⭐', label: '레벨', value: data.level || 1 },
      { icon: '⏱️', label: '생존 시간', value: `${Math.floor(data.survivalTime || 0)}초` },
      { icon: '💀', label: '처치 수', value: data.monstersKilled || 0 },
    ];

    stats.forEach((stat, index) => {
      const y = height * 0.42 + index * 35;

      const statText = this.add.text(width / 2 - 100, y, `${stat.icon} ${stat.label}:`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
      });
      statText.setScrollFactor(0);

      const valueText = this.add.text(width / 2 + 100, y, `${stat.value}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold',
      });
      valueText.setOrigin(1, 0);
      valueText.setScrollFactor(0);
    });

    // Button styles
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonY = height * 0.72;
    const buttonSpacing = 100;

    // Restart button (Play Again)
    const restartBtn = this.add.rectangle(width / 2 - buttonSpacing, buttonY, buttonWidth, buttonHeight, 0x4ade80);
    restartBtn.setStrokeStyle(2, 0x22c55e);
    restartBtn.setScrollFactor(0);
    restartBtn.setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2 - buttonSpacing, buttonY, '🔄 다시 하기', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold',
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);

    restartBtn.on('pointerover', () => {
      restartBtn.setFillStyle(0x22c55e);
      restartBtn.setScale(1.05);
      restartText.setScale(1.05);
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setFillStyle(0x4ade80);
      restartBtn.setScale(1);
      restartText.setScale(1);
    });

    restartBtn.on('pointerdown', () => {
      // Emit restart event
      EventBus.emit(GameEvents.GAME_START);
      this.scene.start('GameScene');
    });

    // Quit button
    const quitBtn = this.add.rectangle(width / 2 + buttonSpacing, buttonY, buttonWidth, buttonHeight, 0xef4444);
    quitBtn.setStrokeStyle(2, 0xdc2626);
    quitBtn.setScrollFactor(0);
    quitBtn.setInteractive({ useHandCursor: true });

    const quitText = this.add.text(width / 2 + buttonSpacing, buttonY, '🚪 나가기', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    quitText.setOrigin(0.5);
    quitText.setScrollFactor(0);

    quitBtn.on('pointerover', () => {
      quitBtn.setFillStyle(0xdc2626);
      quitBtn.setScale(1.05);
      quitText.setScale(1.05);
    });

    quitBtn.on('pointerout', () => {
      quitBtn.setFillStyle(0xef4444);
      quitBtn.setScale(1);
      quitText.setScale(1);
    });

    quitBtn.on('pointerdown', () => {
      // Emit quit event to React
      EventBus.emit(GameEvents.GAME_QUIT, {
        score: data.score,
        level: data.level,
        survivalTime: data.survivalTime,
        monstersKilled: data.monstersKilled,
      });
    });

    // Animate buttons appearing
    [restartBtn, restartText, quitBtn, quitText].forEach((obj, i) => {
      obj.setAlpha(0);
      this.tweens.add({
        targets: obj,
        alpha: 1,
        y: obj.y,
        duration: 300,
        delay: 500 + i * 50,
        ease: 'Power2',
      });
    });
  }
}
