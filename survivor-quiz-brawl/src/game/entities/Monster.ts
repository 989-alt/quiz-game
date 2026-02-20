import Phaser from 'phaser';

export interface MonsterConfig {
  hp: number;
  damage: number;
  speed: number;
  xpValue: number;
  spriteKey: string;
  scale?: number;
  isBoss?: boolean;
}

export class Monster extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public maxHp: number;
  public damage: number;
  public speed: number;
  public xpValue: number;
  public isBoss: boolean;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private hpBar: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MonsterConfig) {
    super(scene, x, y, config.spriteKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp = config.hp;
    this.hp = config.hp;
    this.damage = config.damage;
    this.speed = config.speed;
    this.xpValue = config.xpValue;
    this.isBoss = config.isBoss || false;

    if (config.scale) {
      this.setScale(config.scale);
    }

    // Set physics body size to match full sprite size with proper centering
    const body = this.body as Phaser.Physics.Arcade.Body;
    const bodyWidth = this.width;
    const bodyHeight = this.height;
    body.setSize(bodyWidth, bodyHeight);
    // Center the physics body on the sprite
    body.setOffset(0, 0);

    this.setDepth(5);

    // Create HP bar for bosses
    if (this.isBoss) {
      this.createHpBar();
    }
  }

  private createHpBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(6);
    this.updateHpBar();
  }

  private updateHpBar(): void {
    if (!this.hpBar || !this.active) return;

    this.hpBar.clear();
    const barWidth = 60;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - this.displayHeight / 2 - 10;

    // Background
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(x, y, barWidth, barHeight);

    // HP fill
    const hpPercent = this.hp / this.maxHp;
    const fillColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRect(x + 1, y + 1, (barWidth - 2) * hpPercent, barHeight - 2);
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

    // Update HP bar position for bosses
    if (this.isBoss && this.hpBar) {
      this.updateHpBar();
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

    // Knockback (less for bosses)
    if (this.target) {
      const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
      const knockback = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
      knockback.scale(this.isBoss ? 30 : 100);
      this.setVelocity(knockback.x, knockback.y);
    }

    // Update HP bar
    if (this.isBoss && this.hpBar) {
      this.updateHpBar();
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }

    return false;
  }

  private die(): void {
    // Destroy HP bar
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }

    // Death effect - simple fade
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: this.isBoss ? this.scale * 0.8 : 0.5,
      duration: this.isBoss ? 500 : 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }
    super.destroy(fromScene);
  }
}

// Get monster config based on wave number
export function getMonsterConfigForWave(wave: number): MonsterConfig {
  // Select monster sprite based on wave (cycles through 15 monsters)
  const monsterIndex = ((wave - 1) % 15) + 1;
  const spriteKey = `monster_${monsterIndex}`;

  // Base stats that scale with wave
  const baseHp = 10 + wave * 3;
  const baseDamage = 5 + Math.floor(wave / 2);
  const baseSpeed = 60 + Math.min(wave * 2, 40);
  const baseXp = 1 + Math.floor(wave / 3);

  // Monster variants based on wave phase
  const wavePhase = wave % 3;

  if (wavePhase === 0) {
    // Every 3rd wave before boss: tank monsters
    return {
      hp: baseHp * 2,
      damage: baseDamage * 1.5,
      speed: baseSpeed * 0.7,
      xpValue: baseXp * 2,
      spriteKey,
      scale: 0.12,
    };
  } else if (wavePhase === 2) {
    // Wave before boss wave: fast monsters
    return {
      hp: baseHp * 0.6,
      damage: baseDamage * 0.8,
      speed: baseSpeed * 1.4,
      xpValue: baseXp,
      spriteKey,
      scale: 0.08,
    };
  } else {
    // Normal wave: balanced monsters
    return {
      hp: baseHp,
      damage: baseDamage,
      speed: baseSpeed,
      xpValue: baseXp,
      spriteKey,
      scale: 0.1,
    };
  }
}

// Get boss config based on wave number
export function getBossConfigForWave(wave: number): MonsterConfig {
  // Boss appears every 3 waves, select boss sprite (cycles through 5 bosses)
  const bossIndex = (Math.floor(wave / 3) % 5) + 1;
  const spriteKey = `boss_${bossIndex}`;

  // Boss stats scale with wave
  const bossLevel = Math.floor(wave / 3);
  const baseHp = 200 + bossLevel * 100;
  const baseDamage = 20 + bossLevel * 5;
  const baseSpeed = 40 + Math.min(bossLevel * 3, 30);
  const baseXp = 20 + bossLevel * 10;

  return {
    hp: baseHp,
    damage: baseDamage,
    speed: baseSpeed,
    xpValue: baseXp,
    spriteKey,
    scale: 0.2, // Bosses are larger
    isBoss: true,
  };
}

// Check if current wave is a boss wave
export function isBossWave(wave: number): boolean {
  return wave > 0 && wave % 3 === 0;
}

// Legacy monster types (kept for compatibility)
export const MonsterTypes: Record<string, MonsterConfig> = {
  basic: {
    hp: 10,
    damage: 5,
    speed: 60,
    xpValue: 1,
    spriteKey: 'monster_1',
    scale: 0.1,
  },
  fast: {
    hp: 5,
    damage: 3,
    speed: 100,
    xpValue: 1,
    spriteKey: 'monster_2',
    scale: 0.08,
  },
  tank: {
    hp: 30,
    damage: 10,
    speed: 40,
    xpValue: 3,
    spriteKey: 'monster_3',
    scale: 0.12,
  },
  boss: {
    hp: 200,
    damage: 20,
    speed: 50,
    xpValue: 20,
    spriteKey: 'boss_1',
    scale: 0.2,
    isBoss: true,
  },
};
