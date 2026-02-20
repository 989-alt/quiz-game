import Phaser from 'phaser';
import { WeaponBase } from '../WeaponBase';
import type { GameScene } from '../../scenes/GameScene';
import type { Player } from '../../entities/Player';

export class Ruler extends WeaponBase {
  id = 'ruler';
  name = 'Banana Shooter';
  nameKo = '바나나 발사기';
  description = 'Shoots bananas in random directions';
  descriptionKo = '랜덤한 방향으로 바나나를 발사합니다';
  maxLevel = 8;

  constructor(scene: GameScene, player: Player) {
    super(scene, player);
    this.baseStats = {
      damage: 20,
      cooldown: 800,
      area: 1,
      speed: 400,
      duration: 2000,
      amount: 1,
      pierce: 3,
      knockback: 0,
    };
    this.levelUpgrades = [
      { damage: 5 },
      { amount: 1 },
      { damage: 5 },
      { speed: 50 },
      { damage: 5 },
      { amount: 1 },
      { damage: 10 },
    ];
  }

  attack(): void {
    const amount = this.getAmount();
    const damage = this.getDamage();
    const speed = this.getSpeed();
    const area = this.getArea();

    // Find nearby enemies and shoot towards them
    const enemies = this.findNearestEnemies(amount, 500);

    for (let i = 0; i < amount; i++) {
      let angle: number;

      if (enemies[i]) {
        // Shoot towards enemy with slight random spread
        angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          enemies[i].x, enemies[i].y
        ) + (Math.random() - 0.5) * 0.3; // Small spread
      } else {
        // No enemy found, shoot in random direction
        angle = Math.random() * Math.PI * 2;
      }

      this.createBananaProjectile(angle, damage, speed, area);
    }
  }

  private findNearestEnemies(count: number, range: number): Phaser.Physics.Arcade.Sprite[] {
    const monsters = this.scene.getMonsters().getChildren() as Phaser.Physics.Arcade.Sprite[];
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Filter and sort by distance
    const nearby = monsters
      .filter(m => m.active)
      .map(m => ({
        monster: m,
        dist: Phaser.Math.Distance.Between(playerX, playerY, m.x, m.y)
      }))
      .filter(m => m.dist <= range)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count)
      .map(m => m.monster);

    return nearby;
  }

  private createBananaProjectile(angle: number, damage: number, speed: number, area: number): void {
    // Use banana sprite
    const banana = this.scene.add.sprite(
      this.player.x,
      this.player.y,
      'weapon_banana'
    );
    banana.setScale(0.08 * area); // Larger banana
    banana.setDepth(9);
    banana.setRotation(angle);

    this.scene.physics.add.existing(banana);
    const body = banana.body as Phaser.Physics.Arcade.Body;
    // Use full sprite size for hitbox
    body.setSize(banana.width, banana.height);
    body.setOffset(0, 0);

    (banana as any).damage = damage;
    (banana as any).pierce = this.getPierce();

    this.scene.addProjectile(banana as any);

    // Set velocity for straight line movement
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    body.setVelocity(velocityX, velocityY);

    // Rotate while flying
    const rotationSpeed = 0.15;
    const updateRotation = () => {
      if (!banana.active) return;
      banana.rotation += rotationSpeed;
      this.scene.time.delayedCall(16, updateRotation);
    };
    updateRotation();

    // Destroy after duration
    this.scene.time.delayedCall(this.getDuration(), () => {
      if (banana.active) {
        banana.destroy();
      }
    });
  }
}
