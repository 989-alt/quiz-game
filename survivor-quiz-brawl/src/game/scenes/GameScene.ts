import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Monster, MonsterTypes, getMonsterConfigForWave, getBossConfigForWave, isBossWave } from '../entities/Monster';
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
  private pendingLevelUp: boolean = false; // Track if level up is waiting for quiz

  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Remove world bounds constraints
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

    // Create infinite background
    this.createBackground();

    // Create groups
    this.monsters = this.physics.add.group({ classType: Monster });
    this.xpGems = this.physics.add.group({ classType: XPGem });
    this.projectiles = this.physics.add.group();

    // Check for textures and create fallbacks if needed
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x00ff00);
      g.fillRect(0, 0, 32, 32);
      g.generateTexture('player', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('monster_basic')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xff0000);
      g.fillRect(0, 0, 32, 32);
      g.generateTexture('monster_basic', 32, 32);
      g.destroy();
    }

    // Create player at startup center
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.player = new Player(this, centerX, centerY);

    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Create weapon manager and give starting weapon
    this.weaponManager = new WeaponManager(this, this.player);
    this.weaponManager.addWeapon('ruler'); // Start with ruler (자)

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
    // Create a texture for the grid tile if it doesn't exist
    if (!this.textures.exists('grid-tile')) {
      const gridSize = 64;
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);

      // New clean dot-based background
      graphics.fillStyle(0x0a0a0f, 1);
      graphics.fillRect(0, 0, gridSize, gridSize);

      // Subtle grid line
      graphics.lineStyle(1, 0x1a1a24, 0.4);
      graphics.strokeRect(0, 0, gridSize, gridSize);

      // Add dots for texture (matching the dot-grid aesthetic)
      graphics.fillStyle(0x6366f1, 0.08);
      graphics.fillCircle(32, 32, 2);

      graphics.generateTexture('grid-tile', gridSize, gridSize);
    }

    // Create tile sprite that covers the screen
    this.background = this.add.tileSprite(
      0, 0,
      this.scale.width,
      this.scale.height,
      'grid-tile'
    );
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0); // Fix to camera
    this.background.setDepth(-1);

    // Resize background on window resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.background.setSize(gameSize.width, gameSize.height);
    });
  }

  // ... (setupCollisions, handlePlayerMonsterCollision, etc. remain the same) ...
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

    // No damage on touch - player only takes damage from other sources
    // Just emit state update for any potential UI changes
    this.emitPlayerState();
  }

  private handlePlayerGemCollision(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    gem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const g = gem as XPGem;
    if (!g.active) return;

    const xp = g.collect();
    this.addXp(xp);
    // Immediately emit state update so HUD reflects XP gain
    this.emitPlayerState();
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
    EventBus.on(GameEvents.GAME_OVER, this.handleGameOver, this);
  }

  private handleGameOver(): void {
    // Transition to GameOverScene with stats
    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.playerLevel,
      survivalTime: this.survivalTime,
      monstersKilled: this.monstersKilled,
    });
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
      // Quiz correct: confirm the level up
      this.score += 100;
      this.pendingLevelUp = false;
    } else {
      // Quiz wrong: cancel the level up, lose some XP
      if (this.pendingLevelUp) {
        this.playerLevel--; // Revert the level increment
        // First recalculate XP requirement for current (lower) level
        this.xpToNextLevel = Math.floor(
          GAME_CONFIG.xp.baseToLevel * Math.pow(GAME_CONFIG.xp.multiplier, this.playerLevel - 1)
        );
        // Then set XP to 50% of the CURRENT level's requirement
        this.playerXp = Math.floor(this.xpToNextLevel * 0.5);
        this.pendingLevelUp = false;
        this.emitPlayerState();
      }
    }
  }

  update(time: number, delta: number): void {
    if (this.isPaused || !this.player.active) return;

    // Update survival time
    this.survivalTime += delta / 1000;

    // Update background scroll position based on camera
    this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);

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

    // Cleanup distant entities
    this.cleanupEntities();

    // Update wave
    this.updateWave(delta);

    // Emit state updates periodically
    this.stateUpdateTimer += delta;
    if (this.stateUpdateTimer >= 500) {
      this.emitPlayerState();
      this.stateUpdateTimer = 0;
    }
  }

  // ... (updateXpGemAttraction remains the same) ...
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
    // Spawn just outside camera view
    const camera = this.cameras.main;
    const padding = 100; // Extra padding outside camera

    // Random angle and distance from player
    // This creates a circle around the player for spawning, ensuring monsters come from all directions
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    // Distance should be at least half the diagonal of screen + padding
    const minDistance = Math.sqrt(Math.pow(camera.width, 2) + Math.pow(camera.height, 2)) / 2 + padding;
    const distance = minDistance + Phaser.Math.Between(0, 100);

    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    // Get monster config based on current wave
    const config = getMonsterConfigForWave(this.currentWave);

    const monster = new Monster(this, x, y, config);
    monster.setTarget(this.player);
    this.monsters.add(monster);
  }

  private cleanupEntities(): void {
    const cleanupDistance = 2000; // Entities further than this from player are removed
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);

    // Cleanup monsters
    this.monsters.getChildren().forEach((monster) => {
      const m = monster as Monster;
      if (m.active && Phaser.Math.Distance.BetweenPoints(playerPos, new Phaser.Math.Vector2(m.x, m.y)) > cleanupDistance) {
        m.destroy();
      }
    });

    // Cleanup gems
    this.xpGems.getChildren().forEach((gem) => {
      const g = gem as XPGem;
      if (g.active && Phaser.Math.Distance.BetweenPoints(playerPos, new Phaser.Math.Vector2(g.x, g.y)) > cleanupDistance) {
        g.destroy();
      }
    });

    // Cleanup projectiles (usually handle own destruction, but safety check)
    this.projectiles.getChildren().forEach((proj) => {
      const p = proj as Phaser.Physics.Arcade.Sprite;
      if (p.active && Phaser.Math.Distance.BetweenPoints(playerPos, new Phaser.Math.Vector2(p.x, p.y)) > cleanupDistance) {
        p.destroy();
      }
    });
  }

  private updateWave(delta: number): void {
    this.waveTimer += delta;

    const waveDuration = GAME_CONFIG.waves.baseDuration * 1000;

    if (this.waveTimer >= waveDuration) {
      this.currentWave++;
      this.waveTimer = 0;

      // Spawn boss every 3 waves
      if (isBossWave(this.currentWave)) {
        this.spawnBossWave();
      }
    }
  }

  private spawnBossWave(): void {
    // Boss wave spawning around player
    // Number of bosses increases with wave (1 boss per 3 waves)
    const bossCount = Math.max(1, Math.floor(this.currentWave / 6));

    for (let i = 0; i < bossCount; i++) {
      this.time.delayedCall(i * 800, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 500;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        // Get boss config based on current wave
        const config = getBossConfigForWave(this.currentWave);

        const monster = new Monster(this, x, y, config);
        monster.setTarget(this.player);
        this.monsters.add(monster);

        // Boss spawn announcement effect
        this.cameras.main.shake(300, 0.01);
      });
    }
  }

  // ... (addXp, levelUp, getUpgradeInfo, emitPlayerState, public methods, shutdown remain the same) ...
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
    this.pendingLevelUp = true; // Mark level up as pending until quiz is answered
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
    EventBus.off(GameEvents.GAME_OVER, this.handleGameOver, this);
  }
}
