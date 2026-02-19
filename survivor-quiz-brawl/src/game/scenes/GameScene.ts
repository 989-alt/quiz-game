import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Monster, MonsterTypes } from '../entities/Monster';
import { XPGem } from '../entities/XPGem';
import { WeaponManager, WeaponInfoList } from '../weapons/WeaponManager';
import { PassiveInfoList } from '../weapons/PassiveManager';
import { EventBus, GameEvents } from '../utils/EventBus';
import { GAME_CONFIG } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private monsters!: Phaser.Physics.Arcade.Group;
  private xpGems!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private weaponManager!: WeaponManager;

  private survivalTime: number = 0;
  private currentWave: number = 1;
  private monstersKilled: number = 0;
  private playerLevel: number = 1;
  private playerXp: number = 0;
  private xpToNextLevel: number = 10;
  private score: number = 0;

  private isPaused: boolean = false;
  private spawnTimer: number = 0;
  private waveTimer: number = 0;
  private stateUpdateTimer: number = 0;

  private worldBounds = { width: 2000, height: 2000 };

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);

    // Create background grid
    this.createBackground();

    // Create groups
    this.monsters = this.physics.add.group({ classType: Monster });
    this.xpGems = this.physics.add.group({ classType: XPGem });
    this.projectiles = this.physics.add.group();

    // Create player at center
    this.player = new Player(
      this,
      this.worldBounds.width / 2,
      this.worldBounds.height / 2
    );

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);

    // Create weapon manager and give starting weapon
    this.weaponManager = new WeaponManager(this, this.player);
    this.weaponManager.addWeapon('whip');

    // Setup collisions
    this.setupCollisions();

    // Setup event listeners
    this.setupEventListeners();

    // Emit game ready
    EventBus.emit(GameEvents.GAME_READY);

    // Initial state update
    this.emitPlayerState();
  }

  private createBackground(): void {
    const gridSize = 64;
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x333344, 0.5);

    for (let x = 0; x <= this.worldBounds.width; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.worldBounds.height);
    }

    for (let y = 0; y <= this.worldBounds.height; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.worldBounds.width, y);
    }

    graphics.strokePath();
    graphics.setDepth(0);
  }

  private setupCollisions(): void {
    // Player vs Monsters
    this.physics.add.overlap(
      this.player,
      this.monsters,
      this.handlePlayerMonsterCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player vs XP Gems
    this.physics.add.overlap(
      this.player,
      this.xpGems,
      this.handlePlayerGemCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Projectiles vs Monsters
    this.physics.add.overlap(
      this.projectiles,
      this.monsters,
      this.handleProjectileMonsterCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private handlePlayerMonsterCollision(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    monster: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const m = monster as Monster;
    if (!m.active) return;

    this.player.takeDamage(m.damage);
  }

  private handlePlayerGemCollision(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    gem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const g = gem as XPGem;
    if (!g.active) return;

    const xp = g.collect();
    this.addXp(xp);
  }

  private handleProjectileMonsterCollision(
    projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    monster: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const p = projectile as Phaser.Physics.Arcade.Sprite;
    const m = monster as Monster;

    if (!p.active || !m.active) return;

    const damage = (p as any).damage || 10;
    const pierce = (p as any).pierce || 1;

    const killed = m.takeDamage(damage);

    if (killed) {
      this.onMonsterKilled(m);
    }

    // Handle pierce
    const newPierce = pierce - 1;
    if (newPierce <= 0) {
      p.destroy();
    } else {
      (p as any).pierce = newPierce;
    }
  }

  private onMonsterKilled(monster: Monster): void {
    this.monstersKilled++;
    this.score += monster.xpValue * 10;

    // Spawn XP gem
    const gem = new XPGem(this, monster.x, monster.y, monster.xpValue);
    this.xpGems.add(gem);

    EventBus.emit(GameEvents.MONSTER_KILLED, { total: this.monstersKilled });
  }

  private setupEventListeners(): void {
    EventBus.on(GameEvents.PAUSE_GAME, this.pauseGame, this);
    EventBus.on(GameEvents.RESUME_GAME, this.resumeGame, this);
    EventBus.on(GameEvents.UPGRADE_SELECTED, this.handleUpgradeSelected, this);
    EventBus.on(GameEvents.QUIZ_RESULT, this.handleQuizResult, this);
  }

  private pauseGame(): void {
    this.isPaused = true;
    this.physics.pause();
  }

  private resumeGame(): void {
    this.isPaused = false;
    this.physics.resume();
  }

  private handleUpgradeSelected(data: { type: string; id: string }): void {
    if (data.type === 'weapon') {
      this.weaponManager.addWeapon(data.id as any);
    } else {
      this.weaponManager.addPassive(data.id as any);
    }
    this.resumeGame();
  }

  private handleQuizResult(data: { correct: boolean }): void {
    if (data.correct) {
      this.score += 100;
    }
  }

  update(time: number, delta: number): void {
    if (this.isPaused || !this.player.active) return;

    // Update survival time
    this.survivalTime += delta / 1000;

    // Update player
    this.player.update();

    // Update monsters
    this.monsters.getChildren().forEach((monster) => {
      (monster as Monster).update();
    });

    // Update weapons
    this.weaponManager.update(delta);

    // Update XP gems attraction
    this.updateXpGemAttraction();

    // Spawn monsters
    this.updateMonsterSpawning(delta);

    // Update wave
    this.updateWave(delta);

    // Emit state updates periodically
    this.stateUpdateTimer += delta;
    if (this.stateUpdateTimer >= 500) {
      this.emitPlayerState();
      this.stateUpdateTimer = 0;
    }
  }

  private updateXpGemAttraction(): void {
    const attractRange = this.player.getPickupRange() * 2;

    this.xpGems.getChildren().forEach((gem) => {
      const g = gem as XPGem;
      if (!g.active) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        g.x,
        g.y
      );

      if (dist < attractRange && !g.isCollecting()) {
        g.startCollection(this.player);
      }

      g.update();
    });
  }

  private updateMonsterSpawning(delta: number): void {
    this.spawnTimer += delta;

    const spawnInterval = Math.max(200, 1000 - this.currentWave * 50);

    if (this.spawnTimer >= spawnInterval) {
      this.spawnMonster();
      this.spawnTimer = 0;
    }
  }

  private spawnMonster(): void {
    // Spawn outside camera view
    const camera = this.cameras.main;
    const margin = 100;

    let x: number, y: number;
    const side = Phaser.Math.Between(0, 3);

    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(camera.scrollX - margin, camera.scrollX + camera.width + margin);
        y = camera.scrollY - margin;
        break;
      case 1: // Right
        x = camera.scrollX + camera.width + margin;
        y = Phaser.Math.Between(camera.scrollY - margin, camera.scrollY + camera.height + margin);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(camera.scrollX - margin, camera.scrollX + camera.width + margin);
        y = camera.scrollY + camera.height + margin;
        break;
      default: // Left
        x = camera.scrollX - margin;
        y = Phaser.Math.Between(camera.scrollY - margin, camera.scrollY + camera.height + margin);
    }

    // Clamp to world bounds
    x = Phaser.Math.Clamp(x, 50, this.worldBounds.width - 50);
    y = Phaser.Math.Clamp(y, 50, this.worldBounds.height - 50);

    // Choose monster type based on wave
    let monsterType = 'basic';
    const roll = Math.random();

    if (this.currentWave >= 10 && roll < 0.05) {
      monsterType = 'boss';
    } else if (this.currentWave >= 5 && roll < 0.2) {
      monsterType = 'tank';
    } else if (this.currentWave >= 3 && roll < 0.3) {
      monsterType = 'fast';
    }

    const config = { ...MonsterTypes[monsterType] };

    // Scale stats with wave
    config.hp = Math.floor(config.hp * (1 + this.currentWave * 0.1));
    config.damage = Math.floor(config.damage * (1 + this.currentWave * 0.05));

    const monster = new Monster(this, x, y, config);
    monster.setTarget(this.player);
    this.monsters.add(monster);
  }

  private updateWave(delta: number): void {
    this.waveTimer += delta;

    const waveDuration = GAME_CONFIG.waves.baseDuration * 1000;

    if (this.waveTimer >= waveDuration) {
      this.currentWave++;
      this.waveTimer = 0;

      // Spawn boss on certain waves
      if (this.currentWave % 5 === 0) {
        this.spawnBossWave();
      }
    }
  }

  private spawnBossWave(): void {
    for (let i = 0; i < this.currentWave / 5; i++) {
      this.time.delayedCall(i * 500, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 400;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const config = { ...MonsterTypes.boss };
        config.hp = Math.floor(config.hp * (1 + this.currentWave * 0.2));

        const monster = new Monster(
          this,
          Phaser.Math.Clamp(x, 50, this.worldBounds.width - 50),
          Phaser.Math.Clamp(y, 50, this.worldBounds.height - 50),
          config
        );
        monster.setTarget(this.player);
        this.monsters.add(monster);
      });
    }
  }

  private addXp(amount: number): void {
    const growthBonus = 1 + this.player.growth;
    this.playerXp += Math.floor(amount * growthBonus);

    while (this.playerXp >= this.xpToNextLevel) {
      this.playerXp -= this.xpToNextLevel;
      this.levelUp();
    }

    EventBus.emit(GameEvents.XP_GAINED, {
      xp: this.playerXp,
      xpToNext: this.xpToNextLevel,
      level: this.playerLevel,
    });
  }

  private levelUp(): void {
    this.playerLevel++;
    this.xpToNextLevel = Math.floor(
      GAME_CONFIG.xp.baseToLevel * Math.pow(GAME_CONFIG.xp.multiplier, this.playerLevel - 1)
    );

    // Get available upgrades
    const upgrades = this.weaponManager.getAvailableUpgrades(3);

    // Pause and show level up UI
    this.pauseGame();

    EventBus.emit(GameEvents.LEVEL_UP, {
      level: this.playerLevel,
      upgrades: upgrades.map((u) => ({
        ...u,
        ...this.getUpgradeInfo(u.type, u.id),
      })),
    });
  }

  private getUpgradeInfo(type: string, id: string): { name: string; nameKo: string; description: string; descriptionKo: string; currentLevel: number; maxLevel: number } {
    if (type === 'weapon') {
      const weapon = this.weaponManager.getWeapon(id as any);
      if (weapon) {
        const info = weapon.getInfo();
        return {
          name: info.name,
          nameKo: info.nameKo,
          description: info.description,
          descriptionKo: info.descriptionKo,
          currentLevel: info.level,
          maxLevel: info.maxLevel,
        };
      }
      // New weapon
      // WeaponInfoList imported at top of file
      const weaponInfo = WeaponInfoList.find((w: any) => w.id === id);
      return {
        name: weaponInfo?.name || id,
        nameKo: weaponInfo?.nameKo || id,
        description: weaponInfo?.description || '',
        descriptionKo: weaponInfo?.descriptionKo || '',
        currentLevel: 0,
        maxLevel: weaponInfo?.maxLevel || 8,
      };
    } else {
      // PassiveInfoList imported at top of file
      const passiveInfo = PassiveInfoList.find((p: any) => p.id === id);
      return {
        name: passiveInfo?.name || id,
        nameKo: passiveInfo?.nameKo || id,
        description: passiveInfo?.description || '',
        descriptionKo: passiveInfo?.descriptionKo || '',
        currentLevel: this.weaponManager.hasPassive(id as any) ? 1 : 0,
        maxLevel: passiveInfo?.maxLevel || 5,
      };
    }
  }

  private emitPlayerState(): void {
    EventBus.emit(GameEvents.PLAYER_STATE_UPDATE, {
      hp: this.player.currentHp,
      maxHp: this.player.maxHp,
      level: this.playerLevel,
      xp: this.playerXp,
      xpToNext: this.xpToNextLevel,
      score: this.score,
      survivalTime: this.survivalTime,
      wave: this.currentWave,
      monstersKilled: this.monstersKilled,
    });
  }

  // Public methods for weapons to use
  addProjectile(projectile: Phaser.GameObjects.GameObject): void {
    this.projectiles.add(projectile);
  }

  getMonsters(): Phaser.Physics.Arcade.Group {
    return this.monsters;
  }

  getPlayer(): Player {
    return this.player;
  }

  shutdown(): void {
    EventBus.off(GameEvents.PAUSE_GAME, this.pauseGame, this);
    EventBus.off(GameEvents.RESUME_GAME, this.resumeGame, this);
    EventBus.off(GameEvents.UPGRADE_SELECTED, this.handleUpgradeSelected, this);
    EventBus.off(GameEvents.QUIZ_RESULT, this.handleQuizResult, this);
  }
}
