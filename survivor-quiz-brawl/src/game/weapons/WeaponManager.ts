import type { GameScene } from '../scenes/GameScene';
import type { Player } from '../entities/Player';
import { WeaponBase } from './WeaponBase';

// Import all weapons
import { Whip } from './weapons/Whip';
import { MagicWand } from './weapons/MagicWand';
import { Knife } from './weapons/Knife';
import { Axe } from './weapons/Axe';
import { Cross } from './weapons/Cross';
import { KingBible } from './weapons/KingBible';
import { FireWand } from './weapons/FireWand';
import { Garlic } from './weapons/Garlic';
import { SantaWater } from './weapons/SantaWater';
import { Runetracer } from './weapons/Runetracer';
import { Lightning } from './weapons/Lightning';
import { Pentagram } from './weapons/Pentagram';
import { Peachone } from './weapons/Peachone';
import { EbonyWings } from './weapons/EbonyWings';
import { Phiera } from './weapons/Phiera';
import { Gatti } from './weapons/Gatti';
import { Song } from './weapons/Song';
import { Arrow } from './weapons/Arrow';
import { Bone } from './weapons/Bone';
import { Cherry } from './weapons/Cherry';

// Import passives
import { PassiveManager, PassiveId } from './PassiveManager';

export type WeaponId =
  | 'whip' | 'magic_wand' | 'knife' | 'axe' | 'cross'
  | 'king_bible' | 'fire_wand' | 'garlic' | 'santa_water' | 'runetracer'
  | 'lightning' | 'pentagram' | 'peachone' | 'ebony_wings' | 'phiera'
  | 'gatti' | 'song' | 'arrow' | 'bone' | 'cherry';

export interface WeaponInfo {
  id: WeaponId;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  maxLevel: number;
  evolutionPair?: string;
  evolvedForm?: string;
}

const WeaponRegistry: Record<WeaponId, new (scene: GameScene, player: Player) => WeaponBase> = {
  whip: Whip,
  magic_wand: MagicWand,
  knife: Knife,
  axe: Axe,
  cross: Cross,
  king_bible: KingBible,
  fire_wand: FireWand,
  garlic: Garlic,
  santa_water: SantaWater,
  runetracer: Runetracer,
  lightning: Lightning,
  pentagram: Pentagram,
  peachone: Peachone,
  ebony_wings: EbonyWings,
  phiera: Phiera,
  gatti: Gatti,
  song: Song,
  arrow: Arrow,
  bone: Bone,
  cherry: Cherry,
};

export const WeaponInfoList: WeaponInfo[] = [
  { id: 'whip', name: 'Whip', nameKo: '채찍', description: 'Attacks horizontally', descriptionKo: '수평으로 공격합니다', maxLevel: 8, evolutionPair: 'hollow_heart', evolvedForm: 'bloody_tear' },
  { id: 'magic_wand', name: 'Magic Wand', nameKo: '마법봉', description: 'Fires at the nearest enemy', descriptionKo: '가장 가까운 적을 공격합니다', maxLevel: 8, evolutionPair: 'empty_tome', evolvedForm: 'holy_wand' },
  { id: 'knife', name: 'Knife', nameKo: '칼', description: 'Fires quickly in faced direction', descriptionKo: '바라보는 방향으로 빠르게 발사합니다', maxLevel: 8, evolutionPair: 'bracer', evolvedForm: 'thousand_edge' },
  { id: 'axe', name: 'Axe', nameKo: '도끼', description: 'High damage, thrown in arc', descriptionKo: '높은 데미지, 곡선으로 던집니다', maxLevel: 8, evolutionPair: 'candelabrador', evolvedForm: 'death_spiral' },
  { id: 'cross', name: 'Cross', nameKo: '십자가', description: 'Boomerang that returns', descriptionKo: '돌아오는 부메랑입니다', maxLevel: 8, evolutionPair: 'clover', evolvedForm: 'heaven_sword' },
  { id: 'king_bible', name: 'King Bible', nameKo: '성경', description: 'Orbits around you', descriptionKo: '주위를 회전합니다', maxLevel: 8, evolutionPair: 'spellbinder', evolvedForm: 'unholy_vespers' },
  { id: 'fire_wand', name: 'Fire Wand', nameKo: '불 지팡이', description: 'Random explosions on enemies', descriptionKo: '적에게 무작위 폭발을 일으킵니다', maxLevel: 8, evolutionPair: 'spinach', evolvedForm: 'hellfire' },
  { id: 'garlic', name: 'Garlic', nameKo: '마늘', description: 'Damages nearby enemies', descriptionKo: '근처의 적에게 데미지를 줍니다', maxLevel: 8, evolutionPair: 'pummarola', evolvedForm: 'soul_eater' },
  { id: 'santa_water', name: 'Santa Water', nameKo: '성수', description: 'Creates damaging zone', descriptionKo: '데미지 구역을 생성합니다', maxLevel: 8 },
  { id: 'runetracer', name: 'Runetracer', nameKo: '룬트레이서', description: 'Bounces off walls', descriptionKo: '벽에 반사됩니다', maxLevel: 8 },
  { id: 'lightning', name: 'Lightning Ring', nameKo: '번개 반지', description: 'Strikes random enemies', descriptionKo: '무작위 적을 타격합니다', maxLevel: 8 },
  { id: 'pentagram', name: 'Pentagram', nameKo: '펜타그램', description: 'Erases everything on screen', descriptionKo: '화면의 모든 것을 지웁니다', maxLevel: 8 },
  { id: 'peachone', name: 'Peachone', nameKo: '피치원', description: 'Orbiting bird companion', descriptionKo: '회전하는 새 동료', maxLevel: 8 },
  { id: 'ebony_wings', name: 'Ebony Wings', nameKo: '에보니 윙', description: 'Orbiting bird companion', descriptionKo: '회전하는 새 동료', maxLevel: 8 },
  { id: 'phiera', name: 'Phiera Der Tuphello', nameKo: '피에라', description: 'Fires crossing beams', descriptionKo: '교차하는 광선을 발사합니다', maxLevel: 8 },
  { id: 'gatti', name: 'Gatti Amari', nameKo: '가티 아마리', description: 'Summons cat companions', descriptionKo: '고양이 동료를 소환합니다', maxLevel: 8 },
  { id: 'song', name: 'Song of Mana', nameKo: '마나의 노래', description: 'Creates damaging waves', descriptionKo: '데미지를 주는 파동을 생성합니다', maxLevel: 8 },
  { id: 'arrow', name: 'Arrow', nameKo: '화살', description: 'Rapid fire arrows', descriptionKo: '빠르게 화살을 발사합니다', maxLevel: 8 },
  { id: 'bone', name: 'Bone', nameKo: '뼈', description: 'Bouncing projectile', descriptionKo: '바운스하는 투사체', maxLevel: 8 },
  { id: 'cherry', name: 'Cherry Bomb', nameKo: '체리 폭탄', description: 'Explosive AOE damage', descriptionKo: '폭발 범위 데미지', maxLevel: 8 },
];

export class WeaponManager {
  private scene: GameScene;
  private player: Player;
  private weapons: Map<WeaponId, WeaponBase> = new Map();
  private passiveManager: PassiveManager;
  private maxWeapons: number = 6;

  constructor(scene: GameScene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.passiveManager = new PassiveManager(player);
  }

  update(delta: number): void {
    this.weapons.forEach((weapon) => {
      weapon.update(delta);
    });
  }

  addWeapon(id: WeaponId): boolean {
    if (this.weapons.has(id)) {
      return this.upgradeWeapon(id);
    }

    if (this.weapons.size >= this.maxWeapons) {
      return false;
    }

    const WeaponClass = WeaponRegistry[id];
    if (!WeaponClass) {
      console.warn(`Weapon ${id} not found in registry`);
      return false;
    }

    const weapon = new WeaponClass(this.scene, this.player);
    this.weapons.set(id, weapon);
    return true;
  }

  upgradeWeapon(id: WeaponId): boolean {
    const weapon = this.weapons.get(id);
    if (!weapon) return false;

    if (weapon.isMaxLevel()) return false;

    weapon.upgrade();
    return true;
  }

  hasWeapon(id: WeaponId): boolean {
    return this.weapons.has(id);
  }

  getWeapon(id: WeaponId): WeaponBase | undefined {
    return this.weapons.get(id);
  }

  getWeaponCount(): number {
    return this.weapons.size;
  }

  getActiveWeapons(): WeaponBase[] {
    return Array.from(this.weapons.values());
  }

  // Passive management
  addPassive(id: PassiveId): boolean {
    return this.passiveManager.addPassive(id);
  }

  upgradePassive(id: PassiveId): boolean {
    return this.passiveManager.upgradePassive(id);
  }

  hasPassive(id: PassiveId): boolean {
    return this.passiveManager.hasPassive(id);
  }

  getPassiveCount(): number {
    return this.passiveManager.getPassiveCount();
  }

  // Evolution check
  checkEvolutions(): { weaponId: WeaponId; passiveId: PassiveId; resultId: string }[] {
    const available: { weaponId: WeaponId; passiveId: PassiveId; resultId: string }[] = [];

    this.weapons.forEach((weapon, id) => {
      if (weapon.canEvolve()) {
        const passiveId = weapon.getInfo().evolutionPair as PassiveId;
        if (this.passiveManager.hasPassive(passiveId) && this.passiveManager.isMaxLevel(passiveId)) {
          const info = WeaponInfoList.find(w => w.id === id);
          if (info?.evolvedForm) {
            available.push({
              weaponId: id,
              passiveId,
              resultId: info.evolvedForm,
            });
          }
        }
      }
    });

    return available;
  }

  evolveWeapon(weaponId: WeaponId): boolean {
    const weapon = this.weapons.get(weaponId);
    if (!weapon || !weapon.canEvolve()) return false;

    weapon.evolve();
    return true;
  }

  // Get available upgrades for level up
  getAvailableUpgrades(count: number = 3): Array<{ type: 'weapon' | 'passive'; id: string; isNew: boolean; isEvolution?: boolean }> {
    const upgrades: Array<{ type: 'weapon' | 'passive'; id: string; isNew: boolean; isEvolution?: boolean; priority: number }> = [];

    // Check evolutions first (highest priority)
    const evolutions = this.checkEvolutions();
    evolutions.forEach((evo) => {
      upgrades.push({
        type: 'weapon',
        id: evo.weaponId,
        isNew: false,
        isEvolution: true,
        priority: 3,
      });
    });

    // Existing weapon upgrades
    this.weapons.forEach((weapon, id) => {
      if (!weapon.isMaxLevel() && !evolutions.find(e => e.weaponId === id)) {
        upgrades.push({
          type: 'weapon',
          id,
          isNew: false,
          priority: 2,
        });
      }
    });

    // Existing passive upgrades
    this.passiveManager.getActivePassives().forEach(({ id, level, maxLevel }) => {
      if (level < maxLevel) {
        upgrades.push({
          type: 'passive',
          id,
          isNew: false,
          priority: 1,
        });
      }
    });

    // New weapons (if slot available)
    if (this.weapons.size < this.maxWeapons) {
      const availableWeapons = WeaponInfoList.filter((w) => !this.weapons.has(w.id));
      availableWeapons.forEach((w) => {
        upgrades.push({
          type: 'weapon',
          id: w.id,
          isNew: true,
          priority: 0,
        });
      });
    }

    // New passives (if slot available)
    if (this.passiveManager.getPassiveCount() < 6) {
      const availablePassives = this.passiveManager.getAvailablePassives();
      availablePassives.forEach((p) => {
        upgrades.push({
          type: 'passive',
          id: p,
          isNew: true,
          priority: 0,
        });
      });
    }

    // Sort by priority and randomize within same priority
    upgrades.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return Math.random() - 0.5;
    });

    // Return requested count
    return upgrades.slice(0, count).map(({ type, id, isNew, isEvolution }) => ({
      type,
      id,
      isNew,
      isEvolution,
    }));
  }
}
