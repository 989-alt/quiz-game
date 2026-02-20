import { WeaponBase } from '../WeaponBase';
import type { GameScene } from '../../scenes/GameScene';
import type { Player } from '../../entities/Player';

export class Ruler extends WeaponBase {
  id = 'ruler';
  name = 'Ruler';
  nameKo = '자';
  description = 'Horizontal swing attack';
  descriptionKo = '수평으로 휘두르는 자';
  maxLevel = 8;

  constructor(scene: GameScene, player: Player) {
    super(scene, player);
    this.baseStats = {
      damage: 20,
      cooldown: 1100,
      area: 1,
      speed: 0,
      duration: 300,
      amount: 1,
      pierce: 999,
      knockback: 0,
    };
    this.levelUpgrades = [
      { damage: 5 },
      { area: 0.1 },
      { damage: 5 },
      { amount: 1 },
      { damage: 5 },
      { area: 0.1 },
      { damage: 10 },
    ];
  }

  attack(): void {
    const amount = this.getAmount();
    const damage = this.getDamage();
    const area = this.getArea();
    const duration = this.getDuration();

    for (let i = 0; i < amount; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      const offsetY = (i - Math.floor(amount / 2)) * 30;

      this.createRulerAttack(direction, offsetY, damage, area, duration);
    }
  }

  private createRulerAttack(direction: number, offsetY: number, damage: number, area: number, duration: number): void {
    // Use actual sprite
    const ruler = this.scene.add.sprite(
      this.player.x + direction * 50 * area,
      this.player.y + offsetY,
      'weapon_ruler'
    );
    ruler.setScale(0.08 * area);
    ruler.setDepth(9);
    ruler.setRotation(direction > 0 ? 0 : Math.PI);

    this.scene.physics.add.existing(ruler);
    const body = ruler.body as Phaser.Physics.Arcade.Body;
    body.setSize(ruler.displayWidth * 0.9, ruler.displayHeight * 0.9);

    (ruler as any).damage = damage;
    (ruler as any).pierce = 999;

    this.scene.addProjectile(ruler as any);

    // Swing animation with physics body update
    let elapsed = 0;
    const startX = this.player.x;
    const startAngle = direction > 0 ? -0.5 : Math.PI + 0.5;
    const endAngle = direction > 0 ? 0.5 : Math.PI - 0.5;

    const updateSwing = () => {
      if (!ruler.active) return;

      elapsed += this.scene.game.loop.delta;
      const t = elapsed / duration;

      if (t >= 1) {
        ruler.destroy();
        return;
      }

      // Swing motion
      const swingT = Math.sin(t * Math.PI); // Peak at middle
      ruler.x = this.player.x + direction * (40 + swingT * 20) * area;
      ruler.y = this.player.y + offsetY;
      ruler.rotation = startAngle + (endAngle - startAngle) * t;
      ruler.alpha = 1 - t * 0.5;

      // Update physics body
      body.updateFromGameObject();

      this.scene.time.delayedCall(16, updateSwing);
    };

    updateSwing();
  }
}
