# DIGI_TASKS.md — Parallel Tasks for Digi (Codex Harness)

> **Important**: These tasks are safe to work on in parallel. Do NOT modify the files listed in the "DO NOT TOUCH" section — another agent is actively editing them.

## DO NOT TOUCH (Active Edits by Other Agents)
- `js/combat.js` — combat system, ground game, submissions
- `js/moves.js` — move definitions
- `js/progression.js` — leveling/XP system
- `js/player.js` — player stats, loadout, attribute system
- `js/ui.js` — mobile button labels, ground state UI
- `js/scenes/GameScene.js` — game loop, input handling
- `js/scenes/OutfitScene.js` — outfit selection screen

## Project Overview
- **Engine**: Phaser 3 (loaded via CDN in index.html)
- **Language**: Vanilla JavaScript (no modules, no bundler, no TypeScript)
- **Namespace**: All game modules use `window.MMA = window.MMA || {}; window.MMA.ModuleName = { ... }`
- **Sprites**: Generated programmatically via Canvas in `js/sprites.js` and `js/scenes/BootScene.js`
- **Canvas**: 768×576 pixels, 16×12 tile grid (48px tiles)
- **Server**: `python3 -m http.server 8088` from project root
- **Repo**: `https://github.com/clawdassistant85-netizen/mma-rpg.git`

## How to Test
```bash
cd /Users/tobyglennpeters/.openclaw/workspace/mma-rpg
python3 -m http.server 8088
# Open http://localhost:8088 in browser
```

## After Making Changes
```bash
# Verify syntax on ALL modified files
node --check js/<filename>.js

# Bump cache busters (find current version first)
grep '\.js?v=' index.html | head -1  # see current version
sed -i '' 's/\.js?v=<old>/.js?v=<new>/g' index.html

# Restart server
pkill -f "python3 -m http.server 8088"
nohup python3 -m http.server 8088 > /tmp/mma-rpg-server.log 2>&1 &

# Commit and push
git add -A && git commit -m "description" && git push origin main
```

---

## Task 1: Zone 2 & Zone 3 Room Designs

**Files to edit**: `js/zones.js`, `js/rooms.js`

**Current state**: Zone 1 has 4 rooms (room1-room4) defined in `js/zones.js` as `ZONE1_ROOMS`. Rooms have `doors`, `connections`, `spawnPositions`, `enemyPool`, and `name` properties.

**What to build**:

### Zone 2 — "The Gym" (4-6 rooms)
A training gym/dojo environment. Rooms should use these enemy types (already defined in `js/enemies.js`):
- `wrestler` (HP 90, grappling AI)
- `judoka` (HP 85, throwing AI)
- `kickboxer` (HP 70, fast kicker AI)
- `striker` (HP 55, combo AI)
- `groundNPounder` (HP 100, chase AI)
- `stunner` (HP 80, stunner AI)
- `coach` (HP 60, support AI)

Room ideas:
- **Sparring Ring** — central room, 2-3 enemies, standard doors
- **Weight Room** — narrow room, wrestler + groundNPounder
- **Locker Room** — small room, 1-2 strikers
- **Mat Area** — open room, judoka + wrestler, multiple spawn points
- **Coach's Office** — boss room with the `shadowRival` enemy (HP 150)

Each room needs:
```javascript
'roomId': {
  id: 'roomId',
  zone: 2,
  doors: { left: {col: 0, row: 5}, right: {col: 15, row: 5} },  // door positions on 16x12 grid
  connections: { left: 'otherRoomId', right: 'anotherRoomId' },
  spawnPositions: [ {col: 3, row: 3}, {col: 12, row: 9} ],  // where enemies spawn
  enemyPool: ['wrestler', 'judoka'],  // which enemies can appear
  name: 'Room Display Name'
}
```

### Zone 3 — "The Underground" (4-6 rooms)
An underground fighting pit. Use these enemy types:
- `bjjBlackBelt` (HP 120, submission hunter AI)
- `mmaChamp` (HP 200, the final boss)
- `feintMaster` (HP 75, feint AI)
- `bully` (HP 95, bully AI)

Room ideas:
- **Tunnel Entrance** — narrow, 2 bullies
- **The Pit** — large central arena, 3-4 mixed enemies
- **VIP Lounge** — 2 feint masters
- **Champion's Arena** — boss room, mmaChamp (final boss fight)
- **Back Alley** — escape route, 2-3 bjjBlackBelts

### Integration
Add `ZONE2_ROOMS` and `ZONE3_ROOMS` objects to `js/zones.js` following the exact same pattern as `ZONE1_ROOMS`. Make sure room connections form a connected graph within each zone. Connect zones via special doors (Zone 1 room4 up → Zone 2 entry, Zone 2 boss room → Zone 3 entry).

---

## Task 2: Boss Fight AI Patterns

**Files to edit**: `js/enemies.js`

**Current state**: Enemies have AI patterns defined in the `updateEnemies` function. Patterns include: `chase`, `kicker`, `grasper`, `thrower`, `combo`, `stunner`, `coach`, `regen`, `feintMaster`, `bully`. Bosses (`isBoss: true`) use the same AI as regular enemies but with higher stats.

**What to build**: Create unique boss AI behaviors that make boss fights feel special and challenging.

### Shadow Rival Boss (Zone 2 Boss)
- **Phase 1** (HP > 50%): Aggressive striker, charges at player, combos of 3-4 attacks
- **Phase 2** (HP ≤ 50%): Switches to grappling, tries to take player down, uses submissions
- **Visual cue**: Tint change when entering Phase 2 (red → dark purple)
- **Special move**: "Shadow Step" — teleports behind player (swap X position), then attacks

### MMA Champ Boss (Zone 3 Final Boss)
- **Phase 1** (HP > 66%): Mixed martial arts — alternates between striking and grappling every 10 seconds
- **Phase 2** (66% > HP > 33%): "Rage mode" — faster movement, shorter cooldowns, screen shake on hits
- **Phase 3** (HP ≤ 33%): "Desperate" — throws everything, ground game attempts, much higher damage but lower defense
- **Special move**: "Championship Combo" — 5-hit combo that stuns player for 1 second if all hits land
- **Visual cue**: Aura color changes per phase (gold → orange → red)

### Implementation
In `js/enemies.js`, the `updateEnemies` function has a switch on `e.aiPattern`. Add new patterns:
```javascript
case 'shadowRivalBoss':
  // Phase-based AI logic here
  break;
case 'mmaChampBoss':
  // 3-phase AI logic here
  break;
```
Then update the enemy definitions to use these new patterns:
```javascript
shadowRival: { ..., aiPattern: 'shadowRivalBoss' },
mmaChamp: { ..., aiPattern: 'mmaChampBoss' }
```

---

## Task 3: Sound & Music System

**Files to edit**: `js/sounds.js`

**Current state**: `js/sounds.js` has basic Web Audio API sound effects (punch, kick, hit, level-up). Uses `window.MMA_AUDIO` namespace.

**What to build**: Expand the audio system with:

### Background Music (per zone)
- Zone 1: Dark alley ambient (low synth drone + distant traffic)
- Zone 2: Gym music (rhythmic percussion, training montage feel)
- Zone 3: Underground (heavy bass, crowd noise)
- Boss fights: Intense combat music (fast tempo, dramatic)

Implementation approach:
- Use Web Audio API oscillators and noise generators (no external audio files)
- Create procedural music using layered oscillators with different waveforms
- Music should loop seamlessly
- Provide volume control
- Crossfade between zone music on room transitions

### Sound Effect Variety
Add variations for:
- **Punch sounds**: 3-4 variations (randomize pitch/filter)
- **Kick sounds**: 2-3 variations
- **Block/dodge**: whoosh sound
- **Critical hit**: louder, with reverb
- **Enemy death**: impact + body fall
- **Room transition**: door/swoosh sound
- **Submission lock**: grinding/pressure sound
- **Level up**: triumphant fanfare (3-note arpeggio)
- **Item pickup**: bright chime

### API
```javascript
MMA_AUDIO.playBGM('zone1');  // Start zone background music
MMA_AUDIO.stopBGM();         // Stop background music
MMA_AUDIO.playHit('punch');  // Play randomized hit sound
MMA_AUDIO.setVolume(0.5);    // Master volume 0-1
```

---

## Task 4: Visual Effects (VFX) Polish

**Files to edit**: `js/vfx.js`

**Current state**: `js/vfx.js` has basic VFX (combat text floating, some tint effects). The game uses Phaser 3 graphics for all rendering.

**What to build**:

### Hit Sparks
When an attack lands, spawn 5-8 small white/yellow particles that fly outward from the impact point and fade. Use Phaser particle emitter or manual sprite spawning.
```javascript
MMA.VFX.hitSpark = function(scene, x, y, color) {
  // Create particle burst at impact point
};
```

### Screen Shake
On big hits (crits, special moves), shake the camera briefly:
```javascript
MMA.VFX.screenShake = function(scene, intensity, duration) {
  scene.cameras.main.shake(duration || 100, intensity || 0.005);
};
```
Call this from combat when crit damage is dealt.

### KO Animation
When an enemy is killed:
1. Flash the enemy sprite white for 200ms
2. Slow-motion effect (set game speed to 0.3 for 500ms)
3. Enemy sprite fades out while falling (alpha tween + Y position down)
4. Screen flash (white overlay, 100ms)

### Damage Numbers
Floating damage numbers that pop up when damage is dealt:
- White text for normal damage
- Yellow text for critical hits
- Red text for enemy attacks on player
- Green text for healing
- Numbers float upward and fade out over 1 second
- Slight random X offset so multiple numbers don't stack

### Ground Pound VFX
When ground & pound connects:
- Small circular shockwave expanding outward from impact
- Screen shake (mild)
- Red tint pulse on the ground area

---

## Task 5: Items & Loot System Expansion

**Files to edit**: `js/items.js`

**Current state**: `js/items.js` has basic items (Health Potion, Power Gloves, Speed Potion, Knee Pads) that drop from enemies. Items have `name`, `stat`, `value`, `duration`, `color`, `description`.

**What to build**: Expand to a richer loot system.

### New Item Types

**Consumables** (temporary buffs, used immediately on pickup):
- `energyDrink` — +30 stamina instantly
- `proteinShake` — +50 HP heal
- `smellingSalts` — clear stun/stagger status
- `icepack` — reduce damage taken by 30% for 15 seconds
- `adrenalineShot` — +50% attack speed for 10 seconds
- `bandage` — regenerate 5 HP/sec for 10 seconds

**Equipment** (permanent stat boosts, like existing items):
- `mouthguard` — +10 max HP (permanent)
- `ankleWraps` — +2 speed (permanent)
- `handWraps` — +5% crit chance (permanent)
- `cupProtector` — -10% incoming grapple damage (permanent)
- `headgear` — -15% incoming strike damage (permanent)

**Rare Drops** (from bosses/elites only):
- `championBelt` — +3 all stats (permanent)
- `blackBelt` — +5 submission damage (permanent)
- `goldGloves` — +20% strike damage (permanent)

### Drop Tables
Update enemy kill rewards to use weighted drop tables:
- Regular enemies: 20% chance to drop a consumable
- Elite enemies: 50% chance for consumable, 15% chance for equipment
- Bosses: guaranteed equipment drop + 30% chance for rare

### Item Pickup Display
When an item drops, show it as a colored circle on the ground (use existing pickup sprite system). When player walks over it, show a brief toast notification: "Picked up Health Potion! +50 HP"

### Implementation
Add items to the `ITEMS` object in `js/items.js`:
```javascript
energyDrink: {
  name: 'Energy Drink',
  type: 'consumable',
  stat: 'stamina',
  value: 30,
  duration: 0,  // instant
  color: 0x00ff88,
  description: '+30 Stamina',
  rarity: 'common'
}
```

---

## Priority Order
1. **Task 4: VFX** — highest visual impact, least risk of conflicts
2. **Task 3: Sound** — independent system, no file conflicts
3. **Task 5: Items** — mostly self-contained in items.js
4. **Task 1: Zones** — independent but needs testing with room transitions
5. **Task 2: Boss AI** — depends on zones existing for boss rooms

Pick any task and implement it fully. Test by running the game locally. Commit each task separately.
