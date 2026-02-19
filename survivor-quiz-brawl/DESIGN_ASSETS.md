# Survivor Quiz Brawl - Design Assets Checklist

## 🎮 Player Character
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| player_idle | 32x32 | Default standing pose | 🟡 Placeholder |
| player_walk_1-4 | 32x32 | Walking animation frames | ❌ Needed |
| player_hurt | 32x32 | Damage taken flash | ❌ Needed |
| player_dead | 32x32 | Death animation | ❌ Needed |

## 👾 Monsters
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| monster_basic | 24x24 | Common enemy (slime-like) | 🟡 Placeholder |
| monster_fast | 20x20 | Fast small enemy | 🟡 Placeholder |
| monster_tank | 32x32 | Large slow enemy | 🟡 Placeholder |
| monster_boss | 48x48 | Boss enemy | 🟡 Placeholder |
| monster_flying | 24x24 | Aerial enemy | ❌ Needed |
| monster_ranged | 24x24 | Enemy that shoots | ❌ Needed |

## ⚔️ Weapons (20 Total)
| ID | Asset | Size | Description | Status |
|----|-------|------|-------------|--------|
| whip | weapon_whip | 80x24 | Horizontal slash effect | 🟡 Placeholder |
| magic_wand | projectile_magic | 16x16 | Magic bolt | 🟡 Placeholder |
| knife | projectile_knife | 16x4 | Throwing knife | 🟡 Placeholder |
| axe | projectile_axe | 20x20 | Spinning axe | 🟡 Placeholder |
| cross | projectile_cross | 24x24 | Boomerang cross | 🟡 Placeholder |
| king_bible | area_bible | 24x24 | Orbiting book | 🟡 Placeholder |
| fire_wand | projectile_fireball | 12x12 | Fireball | 🟡 Placeholder |
| garlic | area_garlic | 64x64 | AOE circle | 🟡 Placeholder |
| santa_water | area_santa_water | 48x48 | Water splash zone | 🟡 Placeholder |
| runetracer | projectile_rune | 16x16 | Bouncing rune | ❌ Needed |
| lightning | area_lightning | 16x48 | Lightning bolt | 🟡 Placeholder |
| pentagram | effect_pentagram | 64x64 | Screen-clear effect | ❌ Needed |
| peachone | companion_bird_white | 16x16 | White bird | ❌ Needed |
| ebony_wings | companion_bird_black | 16x16 | Black bird | ❌ Needed |
| phiera | projectile_beam | 200x8 | Crossing beams | ❌ Needed |
| gatti | companion_cat | 16x16 | Cat companion | ❌ Needed |
| song | effect_wave | 100x32 | Sound wave | ❌ Needed |
| arrow | projectile_arrow | 20x4 | Arrow | 🟡 Placeholder |
| bone | projectile_bone | 16x8 | Bouncing bone | 🟡 Placeholder |
| cherry | projectile_cherry | 16x16 | Cherry bomb | ❌ Needed |

### 🍌 New Fun Weapons (To Add)
| ID | Asset | Size | Description | Priority |
|----|-------|------|-------------|----------|
| banana | projectile_banana | 20x12 | Boomerang banana | High |
| acorn | projectile_acorn | 12x12 | Bouncing acorns | High |
| pencil | projectile_pencil | 16x4 | Sharp pencil throw | Medium |
| eraser | projectile_eraser | 14x8 | Erasing projectile | Medium |
| ruler | weapon_ruler | 60x8 | Slap attack | Medium |
| book | projectile_book | 16x16 | Flying books | Medium |
| calculator | weapon_calculator | 24x24 | Math attack AOE | Medium |
| crayon | trail_crayon | varies | Rainbow trail damage | Low |

## 💎 Collectibles
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| xp_gem_small | 12x12 | Small XP (1-5) | 🟡 Placeholder |
| xp_gem_medium | 16x16 | Medium XP (10-25) | ❌ Needed |
| xp_gem_large | 20x20 | Large XP (50+) | ❌ Needed |
| health_pickup | 16x16 | HP restore | ❌ Needed |
| magnet_pickup | 16x16 | Attract all gems | ❌ Needed |
| chest | 24x24 | Bonus chest | ❌ Needed |

## 🎨 UI Elements
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| hp_bar_frame | 120x16 | Health bar container | ✅ CSS |
| hp_bar_fill | varies | Health fill (green/yellow/red) | ✅ CSS |
| xp_bar_frame | 120x16 | XP bar container | ✅ CSS |
| xp_bar_fill | varies | XP fill (blue/purple) | ✅ CSS |
| button_primary | varies | Main action button | ✅ CSS |
| button_secondary | varies | Secondary button | ✅ CSS |
| card_upgrade | varies | Upgrade selection card | ✅ CSS |
| badge_rarity | varies | Rarity indicators | ✅ CSS |
| icon_dot_cluster | 32x32 | Dot pattern decorations | ✅ CSS |

## 🖼️ Backgrounds
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| bg_game_tile | 64x64 | Repeating game background | 🟡 Generated |
| bg_menu | 1920x1080 | Menu background | ✅ CSS Gradient |
| bg_dot_grid | pattern | Dot grid pattern | ✅ CSS |

## ✨ Effects
| Asset | Frames | Description | Status |
|-------|--------|-------------|--------|
| effect_hit | 4 | Damage impact | ❌ Needed |
| effect_levelup | 8 | Level up celebration | ❌ Needed |
| effect_heal | 4 | Healing sparkle | ❌ Needed |
| effect_death | 6 | Monster death poof | ❌ Needed |
| effect_collect | 3 | Gem collection | ❌ Needed |

## 📊 Quiz UI
| Asset | Size | Description | Status |
|-------|------|-------------|--------|
| quiz_overlay_bg | full | Semi-transparent backdrop | ✅ CSS |
| quiz_timer | 48x48 | Countdown timer display | ✅ CSS |
| quiz_option_a | varies | Option A button | ✅ CSS |
| quiz_option_b | varies | Option B button | ✅ CSS |
| quiz_option_c | varies | Option C button | ✅ CSS |
| quiz_option_d | varies | Option D button | ✅ CSS |
| quiz_correct | 64x64 | Correct answer indicator | ✅ CSS |
| quiz_wrong | 64x64 | Wrong answer indicator | ✅ CSS |

## 🔊 Audio (Future)
| Asset | Type | Description | Status |
|-------|------|-------------|--------|
| bgm_menu | Music | Menu background music | ❌ Needed |
| bgm_game | Music | Gameplay music | ❌ Needed |
| sfx_hit | SFX | Weapon hit sound | ❌ Needed |
| sfx_levelup | SFX | Level up sound | ❌ Needed |
| sfx_quiz_correct | SFX | Correct answer | ❌ Needed |
| sfx_quiz_wrong | SFX | Wrong answer | ❌ Needed |
| sfx_gem_collect | SFX | Gem pickup | ❌ Needed |

---

## Legend
- ✅ Complete
- 🟡 Placeholder (functional but needs polish)
- ❌ Needed (not yet implemented)

## Recommended Art Style
- **Resolution**: 32x32 base, pixel art style
- **Color Palette**: Limited palette (16-32 colors)
- **Animation**: 4-8 frames per animation
- **Theme**: Cute/friendly educational game aesthetic
- **Format**: PNG with transparency

## Priority Order
1. Player animations
2. Fun weapons (banana, acorn, pencil, eraser)
3. Monster variety
4. Collectibles
5. Effects
6. Audio
