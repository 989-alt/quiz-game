import Phaser from 'phaser';

export interface MonsterConfig {
  hp: number;
  damage: number;
  speed: number;
  xpValue: number;
  spriteKey: string;
  scale?: number;
}

export class Monster extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public maxHp: number;
  public damage: number;
  public speed: number;
  public xpValue: number;
  private target: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MonsterConfig) {
    super(scene, x, y, config.spriteKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp = config.hp;
    this.hp = config.hp;
    this.damage = config.damage;
    this.speed = config.speed;
    this.xpValue = config.xpValue;

    if (config.scale) {
      this.setScale(config.scale);
    }

    this.setDepth(5);
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target;
  }

  update(): void {
    if (!this.target || !this.active) return;

    // Move towards target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
    velocity.scale(this.speed);

    this.setVelocity(velocity.x, velocity.y);

    // Flip sprite based on direction
    if (velocity.x < 0) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) {
        this.clearTint();
      }
    });

    // Knockback
    if (this.target) {
      const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
      const knockback = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
      knockback.scale(100);
      this.setVelocity(knockback.x, knockback.y);
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }

    return false;
  }

  private die(): void {
    // Death effect - simple fade
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}

// Monster types
export const MonsterTypes: Record<string, MonsterConfig> = {
  basic: {
    hp: 10,
    damage: 5,
    speed: 60,
    xpValue: 1,
    spriteKey: 'monster_basic',
  },
  fast: {
    hp: 5,
    damage: 3,
    speed: 100,
    xpValue: 1,
    spriteKey: 'monster_fast',
    scale: 0.8,
  },
  tank: {
    hp: 30,
    damage: 10,
    speed: 40,
    xpValue: 3,
    spriteKey: 'monster_tank',
    scale: 1.2,
  },
  boss: {
    hp: 200,
    damage: 20,
    speed: 50,
    xpValue: 20,
    spriteKey: 'monster_boss',
    scale: 1.5,
  },
};
