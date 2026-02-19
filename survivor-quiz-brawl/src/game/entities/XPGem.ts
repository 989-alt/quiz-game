import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  public xpValue: number;
  private isBeingCollected: boolean = false;
  private collectTarget: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, xpValue: number = 1) {
    super(scene, x, y, 'xp_gem');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.xpValue = xpValue;
    this.setDepth(2);

    // Color based on value
    if (xpValue >= 10) {
      this.setTint(0xffd700); // Gold
      this.setScale(1.5);
    } else if (xpValue >= 5) {
      this.setTint(0x00ff00); // Green
      this.setScale(1.2);
    }

    // Spawn animation
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scale: xpValue >= 10 ? 1.5 : xpValue >= 5 ? 1.2 : 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(): void {
    if (this.isBeingCollected && this.collectTarget && this.collectTarget.active) {
      // Move towards target
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.collectTarget.x, this.collectTarget.y);
      const speed = 400;
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }

  startCollection(target: Phaser.Physics.Arcade.Sprite): void {
    if (this.isBeingCollected) return;

    this.isBeingCollected = true;
    this.collectTarget = target;

    // Speed up animation when being collected
    this.scene.tweens.killTweensOf(this);
  }

  collect(): number {
    if (!this.active) return 0;

    const value = this.xpValue;

    // Collection effect
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.destroy();
      }
    });

    return value;
  }

  isCollecting(): boolean {
    return this.isBeingCollected;
  }
}
