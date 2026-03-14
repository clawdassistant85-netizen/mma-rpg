# Pending Hooks
When a builder needs a change in GameScene.js or another file they don't own,
document it here. The Reviewer agent will integrate these.

## Format
- **Module**: which module needs the hook
- **Target file**: which file needs modification
- **Description**: what change is needed
- **Priority**: P0/P1/P2

## 2026-03-14 - Trickster Enemy Implementation

- **Module**: Enemies
- **Target file**: progress.log
- **Description**: Need to append implementation entry: "Implemented Trickster enemy (vanish/reappear behind player) - 4% spawn chance in zone 2+, pink/magenta color, ghost icon, dissolve particle effects, 1.25x backstab damage"
- **Priority**: P2
- **Note**: File allowlist restricted to js/enemies.js only - cannot write to progress.log directly

### Heartstopper Moment Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/sprites.js
- **Description**: On finishing blows, display dramatic EKG heartbeat line that flatlines as enemy falls. Different EKG patterns for different enemy types (steady for elites, erratic for bosses). Requires combat.js to trigger on KO, vfx.js for EKG animation rendering, sprites.js for any additional KO pose effects.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Pain Wave Ripple Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/sprites.js
- **Description**: Heavy attacks trigger concentric pain wave ripples across damaged enemy's body. Wave color matches damage type (red for strikes, blue for grapples), intensity scales with attack power. Requires combat.js to trigger on heavy attacks, vfx.js for wave particle rendering.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Stagger System Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/enemies.js, js/player.js, js/ui.js
- **Description**: Hidden stagger threshold builds faster with consistent attack rhythm. At 100%, enemy crumples for free hit. Requires combat.js to track attack intervals and calculate rhythm bonus, enemies.js for stagger state and crumple animation trigger, player.js for player-version stagger tracking, ui.js for stagger meter display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Weight Class Advantage Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/enemies.js, js/player.js
- **Description**: Rock-paper-scissors damage modifiers based on attacker/receiver weight class. Requires combat.js to calculate damage multipliers, enemies.js to store enemy weight class, player.js for player weight class tracking.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Do-or-Die Room Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/player.js, js/scenes/GameScene.js
- **Description**: Special room variant where player starts with 1 HP but deals 3x damage. Requires zones.js to flag room type, combat.js for damage multiplier, player.js for HP reset, GameScene.js for room entry handling.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Momentum Bank Feature
- **Module**: Player (js/player.js)
- **Target file**: js/combat.js, js/main.js
- **Description**: Between rooms, player can bank unused Momentum stacks as Stored Momentum. Requires player.js to manage bank, combat.js for momentum tracking, main.js for persistence.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Showstopper Enemy Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js, js/vfx.js, js/sprites.js
- **Description**: Rare boss variant that "pauses" player mid-attack for 1 second. Requires enemies.js for pause ability, combat.js to handle pause state, vfx.js for clockwork gear visual, sprites.js for enemy pose during pause.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Sore Loser AI Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js
- **Description**: Defeated enemies (below 10% HP) gain desperate final attack burst (+50% speed, -30% accuracy). Requires enemies.js to trigger at low HP, combat.js to apply modifiers.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Trickster Teleport Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js, js/sprites.js, js/vfx.js
- **Description**: Special enemy that vanishes and reappears behind player. Requires enemies.js for teleport ability, sprites.js for dissolve/reappear animations, vfx.js for particle effects.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Blood Moon Arena Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/enemies.js, js/items.js
- **Description**: Rare underground zone variant spawning at night (real-time) with +15% enemy damage and double loot drops. Requires zones.js to flag room type, combat.js for damage modifier, enemies.js for loot table boost, items.js for drop handling.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Championship Legacy Hall Feature
- **Module**: UI (js/ui.js)
- **Target file**: js/player.js, js/scenes/GameScene.js
- **Description**: Trophy room displaying defeated boss portraits with fight stats, unlocks concept art/lore. Requires ui.js for display, player.js for boss defeat tracking, GameScene.js for room navigation.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Finisher Repertoire Feature
- **Module**: Player (js/player.js)
- **Target file**: js/combat.js, js/ui.js
- **Description**: Track top 3 most-used finishing moves. Using #1 finisher grants "Signature Mastery" bonus (+20% damage). Requires combat.js to record finishing moves, player.js to track usage stats, ui.js to display current signature finisher.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Fighter's Roadmap Feature
- **Module**: Player (js/player.js)
- **Target file**: js/combat.js, js/ui.js, js/main.js, js/scenes/GameScene.js
- **Description**: Visual skill progression tree that maps available techniques based on player's playstyle analytics. Dynamically reveals branches based on combo preferences, favorite zones, and boss defeat patterns. Requires player.js to store analytics and roadmap state, combat.js to track move usage patterns, ui.js for roadmap visualization and challenge display, main.js for persistence, GameScene.js to trigger analytics updates.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Combo Style Discovery Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/ui.js, js/main.js
- **Description**: Hidden synergy bonuses discovered when specific move combinations are used repeatedly. Landing same combo 10+ times reveals synergy (e.g., boxer's rhythm +15% combo damage). Requires combat.js to track move sequences and detect synergy triggers, player.js to store unlocked synergies and apply bonuses, ui.js for "STYLE SYNERGY!" notification, main.js for persistence.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Rival Echo System Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js, js/player.js, js/ui.js, js/sprites.js
- **Description**: After 3+ defeats to same enemy type, that enemy's style echoes in future fights with +15% attack speed. Clear by defeating without repeating moves. Requires enemies.js to apply echo aura and stat boosts, combat.js to track player move repetition, player.js to track defeat counts and echo states, ui.js for "RIVAL ECHO" warnings, sprites.js for translucent ghost aura rendering.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Arena Atmosphere Gauge Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/player.js, js/ui.js, js/vfx.js
- **Description**: Real-time arena conditions change based on combat — crowd energy affects lighting warmth, floor condition affects movement, ambient noise shifts. Warm lighting = +5% accuracy, scuffed floor = +3% dodge, crowd roar = +10% intimidation. Requires zones.js to define atmosphere parameters per room, combat.js to update atmosphere based on combat events, player.js to apply atmosphere bonuses, ui.js for atmosphere state HUD, vfx.js for lighting/particle effects.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Entrance System Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/player.js, js/ui.js, js/scenes/GameScene.js, js/audio.js
- **Description**: Customizable pre-fight entrance animations/music that build player identity. 5 entrance styles, 4 music genres, unlockable variations via championship wins. Plays before boss fights. Requires sprites.js for entrance animation variants, player.js to store entrance preferences, ui.js for customization UI, GameScene.js to trigger entrance sequence, audio.js for entrance music tracks.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Spirit Animal Companion Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/player.js, js/combat.js, js/ui.js, js/scenes/GameScene.js
- **Description**: Persistent companion (raven/wolf/panther/hawk) follows player, reacts to combat with animations, provides passive buffs. Requires sprites.js to render companion, player.js to store companion type and apply buffs, combat.js for reaction triggers, ui.js for companion selection/upgrade UI, GameScene.js for spawning and lifecycle.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Technique Genealogy System Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/ui.js, js/main.js
- **Description**: Moves chain together to create "descendant" variants. Frequent combos (5+ uses) evolve into new techniques with combined properties. Requires combat.js to track move sequences and detect genealogy triggers, player.js to store descendant techniques and apply their properties, ui.js for genealogy tree visualization, main.js for persistence.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Crowd Personality Registry Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/player.js, js/ui.js, js/sprites.js
- **Description**: Specific crowd members have persistent personalities affecting combat. Hype Man/Skeptic/Old School types react differently to player actions. Requires zones.js to spawn personality crowd, sprites.js to render unique crowd members, combat.js to apply personality effects, player.js to track relationships, ui.js for relationship display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Gesture System Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/combat.js, js/player.js, js/ui.js
- **Description**: Personal taunts/celebrations evolve through use. 10 uses = Mark II variant, 15 uses = champion variant with particles. Enemies react to signature gestures. Requires sprites.js for gesture animation variants, combat.js to track gesture usage, player.js to store gesture unlocks, ui.js for gesture selection and enemy reaction display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Weather Adaptation System Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/player.js, js/combat.js, js/ui.js
- **Description**: Fight in specific weather types to gain affinity bonuses. Rain/gym/clear/night each provide +10% damage and +5% stamina efficiency when fighting in that weather again. Weekly weather rotation and "Weather Mastery" achievement. Requires zones.js to define weather per zone, player.js to track affinities and apply bonuses, combat.js for combat state, ui.js for affinity display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Home Arena Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/player.js, js/ui.js, js/scenes/GameScene.js, js/combat.js
- **Description**: After Zone 4 championship, unlock personal arena customization (theme, crowd, features). Home arena grants +5% all stats. Enables Title Defense mode. Requires zones.js to define customizable arena templates, player.js to store customization and apply home-field bonus, ui.js for customization UI, GameScene.js for home arena rendering, combat.js for challenger AI.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Tutorial Archive Feature
- **Module**: Player (js/player.js)
- **Target file**: js/scenes/GameScene.js, js/combat.js, js/ui.js
- **Description**: After first boss defeat, record fight as training video for replay. Requires GameScene.js to handle recording, combat.js to capture fight data, player.js to store replays, ui.js for playback UI.
- **Priority**: P3
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Combo Recipe Book Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/ui.js, js/main.js
- **Description**: Discover and save custom combo sequences. Landing 5+ unique move combos reveals recipes that can be named/saved. +10% damage when executing saved recipes. Requires combat.js to detect unique combos, player.js to store recipes, ui.js for recipe naming/display, main.js for save/load.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Fight Ghost Replay Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/sprites.js, js/scenes/GameScene.js
- **Description**: Best previous fight in each room replays as a ghost (60% damage). Player can study ghost to improve. Requires combat.js to record fight data, sprites.js to render ghost fighter, GameScene.js to manage ghost playback, player.js to store best recordings per room.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Style Fusion Chain Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/sprites.js, js/ui.js
- **Description**: Blend striker and grappler moves mid-combo. After striker attack, immediately input grapple for Fusion Chain (e.g., jab→arm drag = spinning backfist). Fusions deal 1.4x damage with unique animations. Requires Style Gauge 30+ threshold. Needs combat.js fusion detection, sprites.js for fusion animations, player.js for style gauge check, ui.js for fusion unlock notification.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Pre-Fight Betting Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/items.js, js/ui.js, js/main.js
- **Description**: Place wagers using in-game currency before entering fight rooms. Higher bets unlock better rewards on win. Multiplier tiers: 100g (1x), 500g (2x), 1000g (3x rare). Requires zones.js to flag bettable rooms, combat.js for outcome tracking, items.js for reward distribution, ui.js for bet UI, main.js for currency persistence.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Crowd Hypeman Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/ui.js, js/sprites.js
- **Description**: Specific crowd members in arena zones serve as hypemen. Acknowledge with taunt button pre-fight for temporary buffs. Each hypeman once per zone visit. Requires zones.js to spawn hypemen, sprites.js to render glowing hypemen, combat.js to apply buffs, ui.js for buff selection.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Counter Flow System Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/player.js, js/ui.js
- **Description**: Successful blocks build Counter Flow meter (max 3). Each stack reduces perfect-block timing by 20ms but increases counter damage +15%. At 3 stacks, next counter triggers "Flow State" — auto perfect counter for 3s. Requires combat.js meter tracking, player.js for timing windows, ui.js for meter display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Clash Combo Breaker Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/vfx.js, js/sprites.js, js/ui.js
- **Description**: During attack clashes, both fighters enter "Clash Standoff" — rapid button mash determines winner. Winner deals 2x damage + 1s stun. Loser gets knocked back. Requires combat.js for clash detection and mash logic, vfx.js for standoff visual, sprites.js for lockup poses, ui.js for mash prompt.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Combo Breaker System Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/enemies.js, js/ui.js, js/vfx.js
- **Description**: Enemy AI gains ability to interrupt player combos at 10+ hits. Interrupt chance scales with enemy Fight IQ (15% base, +5% per enemy tier). When broken, player suffers 300ms stun and combo resets. Creates high-combo risk/reward. Requires enemies.js for AI interrupt logic, combat.js for combo tracking, vfx.js for interrupt flash effect (yellow glow), ui.js for "COMBO BROKEN!" warning.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Tournament Bracket Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/enemies.js, js/player.js, js/ui.js, js/scenes/GameScene.js
- **Description**: Optional tournament mode with 4-8 fighter bracket. Self-contained roguelike run within main game. Requires zones.js for tournament arena rooms, enemies.js for evolved bracket variants, combat.js for bracket progression and match results, player.js for champion titles and bracket rewards, ui.js for bracket display and matchup announcements, GameScene.js for tournament flow.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Enemy Combo Memory Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js, js/player.js
- **Description**: Enemies track player attack patterns over 45+ second fights. After adaptation threshold, enemy gains +20% defense against player's most-used combos. Player must vary strategy or exploit predictable enemy. Requires enemies.js for pattern tracking and adaptation, combat.js to report player move sequences, player.js for optional "feint" ability to reset enemy memory.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Nemesis Encounter System Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/main.js, js/player.js, js/ui.js
- **Description**: Game tracks which enemy archetype defeats player most across sessions. That archetype becomes "Nemesis" with unique dialogue, purple/black glow, always scales to within 1 player level. Defeating Nemesis grants title + exclusive equipment. Requires main.js for persistent death tracking across saves, enemies.js for Nemesis variant spawning, player.js for Nemesis Slayer title, ui.js for Nemesis warning announcements.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Legacy Mode (New Game+) Feature
- **Module**: Player (js/player.js)
- **Target file**: js/main.js, js/scenes/GameScene.js, js/combat.js, js/enemies.js, js/ui.js
- **Description**: NG+ after final boss — carryover learned techniques, 50% gold, champion titles. Enemies scale 1.1x per cycle. New exclusive NG+ techniques and equipment. Requires player.js for carryover state, main.js for NG+ cycle tracking, GameScene.js for difficulty scaling, combat.js for NG+ technique unlocks, enemies.js for scaled variants, ui.js for cycle counter and exclusive content display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Training Day Minigames Feature
- **Module**: Player (js/player.js)
- **Target file**: js/scenes/GameScene.js, js/combat.js, js/ui.js
- **Description**: Optional pre-zone training sessions — speed bag (rhythm), heavy bag (combo), sparring dummy (counter). Performance grades D-S grant +2-10% stat bonuses. Requires player.js for bonus application, GameScene.js for minigame scene, combat.js for scoring logic, ui.js for grade display and zone selection.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

## Pending

### Progress Log — Feature Implementation Logging
- **Module**: Enemies (js/enemies.js)
- **Target file**: progress.log
- **Description**: Each feature implementation should append a line to progress.log with timestamp and description of what was done. Per task restriction, I was not allowed to modify js/enemies.js only, but logging to progress.log is required for audit trail.
- **Priority**: P2
- **Status**: 🔲 Not implemented (file out of scope for this task)
- **Added**: 2026-03-13

### Rapid Fire Room — Wave + Timer Logic
- **Module**: Zones (js/zones.js)
- **Target file**: js/scenes/GameScene.js, js/enemies.js, js/combat.js
- **Description**: New Rapid Fire Room (rapid1) exposes `rapidFire*` registry keys (duration, spawn interval, score multiplier, room label). GameScene/combat/enemies should:
  - On entering a rapidFireMode room, start a 15s timer and schedule enemy spawns at `rapidFireSpawnIntervalSeconds` (2s default) using the room's enemyPool.
  - Track and apply `rapidFireScoreMultiplier` to room score/XP or post-room rewards.
  - Stop spawning when timer expires, then either open the exit door or trigger a results summary.
- **Priority**: P1
- **Status**: ✅ Implemented in reviewer pass — GameScene now runs the rapid-fire timer/spawn loop and enemies.js applies rapid-fire reward/room-clear behavior.
- **Added**: 2026-03-14

### Gang Up Coordination Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: N/A (self-contained in enemies.js)
- **Description**: Implemented new feature - when 3+ enemies are alive, they can trigger coordinated attacks. One enemy acts as distracter (stuns player), others flank and attack from sides with +35% damage bonus. Visual warning circle appears 1s before attack. 8s cooldown between gang up attempts.
- **Priority**: P1
- **Status**: ✅ Implemented in js/enemies.js
- **Added**: 2026-03-13

### Adaptive Tactics — Player Attack Tracking
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js
- **Description**: When player successfully lands an attack on an enemy, call `MMA.Enemies.onPlayerAttack(scene, targetEnemy, moveKey)` to track the attack type for adaptive defense. This enables enemies to gain +15% defense when player uses repeated move types (striker/grappler patterns).
- **Priority**: P1
- **Status**: ✅ Implemented in reviewer pass (normal + special attacks now record landed moves and apply adaptive defense)
- **Added**: 2026-03-13

### Elite Enemy Item Pickups — Collision Logic
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/items.js
- **Description**: Elite enemies spawn rare item pickups via `MMA.Enemies.spawnItem()`. js/items.js needs overlap/collision logic so the player sprite can collect these pickups (apply stat effects, then destroy the sprite). Pickup sprites use texture key `'item_pickup'` or fall back to default; ensure that texture exists or is created in sprites.js.
- **Priority**: P1
- **Status**: ✅ Already implemented - spawnItem() creates sprites with isPickup flag, Items.ensurePickupSystem() handles overlap
- **Added**: 2026-03-13

## Completed

- ✅ Crowd Dynamics — Combat Integration (P2) - Implemented in js/combat.js lines 240-242
- ✅ Weather hooks (P0/P1) - Implemented rain movement slowdown in js/player.js handleMovement(); visibility/projectile drift set in js/zones.js

### Boss Chroma-Aura Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/scenes/BootScene.js, js/sprites.js
- **Description**: Unique pulsing chromatic aura system for boss enemies, including champion/underground/shadow variants plus low-HP pulse escalation.
- **Priority**: P2
- **Status**: ✅ Implemented in js/scenes/BootScene.js + js/sprites.js
- **Added**: 2026-03-14

### Arena Footwork Trails Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/player.js, js/enemies.js
- **Description**: Dust particle trails behind fighters in arena/cage zones. Requires player.js and enemies.js to spawn trail particles based on movement speed and zone type check.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Move Input Display Feature
- **Module**: UI (js/ui.js)
- **Target file**: js/ui.js, js/combat.js, index.html
- **Description**: Real-time HUD showing the last 6 button inputs with icons, plus a Settings toggle.
- **Priority**: P2
- **Status**: ✅ Implemented in js/ui.js + js/combat.js + index.html
- **Added**: 2026-03-14

### Rage Distortion VFX Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/enemies.js
- **Description**: Heat-shimmer distortion during Rage Mode. Requires combat.js and enemies.js to trigger distortion effect when rage activates.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Ring Gear Customization Feature
- **Module**: Items (js/items.js)
- **Target file**: js/sprites.js, js/player.js
- **Description**: Ring-specific gear items (corner wraps, mouth guard, color-coded hand wraps) that provide small passive bonuses and appear visually on fighter sprite. Requires sprites.js to render equipped gear overlay and player.js to apply stat bonuses.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Arena Wall Tech Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/player.js, js/combat.js, js/sprites.js
- **Description**: Environmental interaction system allowing players to use walls/ropes/corners strategically — bounce dodge off corner posts, vault over ropes for aerial attacks, trip grappled enemies using ring ropes. Zones now exposes `arenaWallTech*` registry keys with rope segments, corner post coordinates, and damage/stamina multipliers; player/combat/sprites should consume these instead of hardcoding geometry.
- **Priority**: P1
- **Status**: 🟡 Partially implemented – zones.js wiring complete; needs player/combat/sprites hooks for movement/combat interactions
- **Added**: 2026-03-14

### Dynamic Camera Distance Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/scenes/GameScene.js
- **Description**: Camera dynamically adjusts distance based on combat situation — pulls back for multi-enemy fights, zooms in for 1v1 boss duels, responds to room size. Requires GameScene.js camera management integration.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Screen Flash Color Coding Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js
- **Description**: Attack types trigger different colored screen flashes (strikes=white, grapples=blue, criticals=gold, finishing=red with longer fade). Requires combat.js to pass attack type to vfx.js when triggering flash.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Zone-Specific Ambient Audio Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/scenes/GameScene.js
- **Description**: Each zone has layered ambient sound that dynamically shifts based on combat intensity. Requires GameScene.js to manage audio zone transitions and combat intensity hooks.
- **Priority**: P3
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Zone Transition Pulse Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/scenes/GameScene.js, js/player.js
- **Description**: Zone transition pulse effect when entering new rooms — color matches zone theme. Requires GameScene.js to trigger pulse on room entry and player.js to hook into zone change events.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Exertion Visual Cues Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/player.js, js/combat.js
- **Description**: Fighter sprites show visible exhaustion states — heavy breathing at low stamina, stumble frames at zero stamina, recovery breathing when regening past 30%. Requires player.js stamina state hooks and sprites.js to render appropriate animation frames.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Weapon Clash Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/vfx.js, js/sprites.js
- **Description**: Attack clash triggers spark animation and lockup state. Requires combat.js to detect mid-frame intersection, vfx.js for spark/shockwave effects, sprites.js for lockup pose.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Enemy Role Call Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/ui.js, js/sprites.js
- **Description**: Enemy type icons (fist/striker, chain/grappler, shield/defender) display above enemy heads. Requires enemies.js to assign icons, ui.js or sprites.js to render above-sprite indicators.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Flickering Power Zones Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/scenes/GameScene.js, js/enemies.js
- **Description**: Underground/industrial zones have flickering lights (8-12s intervals) creating 1-second visibility blackout with AI behavior changes. Requires zones.js to flag flickering rooms, GameScene.js to control light timing, enemies.js for blackout behavior modifications.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Predator Patience Feature
- **Module**: Enemies (js/enemies.js)
- **Target file**: js/combat.js, js/scenes/GameScene.js
- **Description**: Elite+ enemies wait 3 seconds before attacking to "size up" player — free preemptive strike window during wait phase. Requires enemies.js to flag patience behavior, combat.js to apply preemptive bonus damage, GameScene.js for timing.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Ring Rust Mechanic Feature
- **Module**: Player (js/player.js)
- **Target file**: js/scenes/GameScene.js, js/main.js
- **Description**: Track last play timestamp in localStorage. On game load, if 3+ real-time days since last play, apply ring rust debuffs (-10% speed, -5% accuracy). First fight landing 5+ hits clears rust and removes debuffs. Requires GameScene.js to check on load, main.js to persist timestamp.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Clash Commentary System Feature
- **Module**: UI (js/ui.js)
- **Target file**: js/combat.js, js/scenes/GameScene.js
- **Description**: Dynamic announcer system that calls out combat events (combos, near-misses, dramatic moments). Requires combat.js to emit events (combo milestones, critical hits, finishing moves), ui.js to play voice/display text overlay, GameScene.js to manage audio. Different voice packs per zone.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Crowd Funding System Feature
- **Module**: Zones (js/zones.js)
- **Target file**: js/combat.js, js/items.js, js/ui.js
- **Description**: Arena zones accumulate crowd donations between rooms based on hype earned. Player can cash in mid-fight for boosts (+30% damage, stamina refill, enemy distraction). Requires zones.js to flag arena zones, combat.js to allow boost activation, items.js for boost effects, ui.js for donation counter display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Finisher Repertoire Feature
- **Module**: Player (js/player.js)
- **Target file**: js/combat.js, js/ui.js
- **Description**: Track top 3 most-used finishing moves. Using #1 finisher grants "Signature Mastery" bonus (+20% damage, visual flair). Requires combat.js to record finishing moves, player.js to track usage stats, ui.js to display current signature finisher and mastery bonus.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Fight IQ Aura Read Feature
- **Module**: Combat (js/combat.js)
- **Target file**: js/sprites.js, js/enemies.js, js/ui.js
- **Description**: Enemy attack telegraphing system with colored halos around enemy limbs 300ms before attack (yellow=jabs, orange=crosses, red=haymakers, blue=grapples). Requires enemies.js to assign attack types, combat.js to trigger telegraph timing, sprites.js to render halo overlays, ui.js for optional tutorial hints.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Clash Spark Veins Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/sprites.js
- **Description**: Mid-attack clashes trigger electric blue spark veins that spider across screen from impact point. Requires combat.js to detect clash state, vfx.js to render vein particle system, sprites.js for lockup pose during clash.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Color Splash Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/player.js, js/combat.js
- **Description**: Persistent color tint on screen edges based on fighting style (striker=red, grappler=blue, balanced=purple). Intensity grows with Style Gauge. Requires player.js to report dominant style, combat.js to update gauge, vfx.js to render edge tint.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Last Chance Pulse Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/player.js, js/combat.js
- **Description**: When player HP below 10%, screen gains heartbeat-synced red pulse effect accelerating as HP approaches critical. Requires player.js HP threshold monitoring, combat.js to trigger effect, vfx.js for pulse animation.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Combo Counter Shatter Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/sprites.js
- **Description**: 15+ hit combos trigger screen-crack glass effect behind enemy that spreads with each hit and shatters on combo end. Requires combat.js combo tracking, vfx.js for crack particle system, sprites.js for impact effects.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Bloodlust Mode Visual Feature
- **Module**: Sprites (js/sprites.js)
- **Target file**: js/combat.js, js/player.js
- **Description**: At maximum Momentum (5 stacks), player gains red double-image pulse with each attack signaling MOMENTUM SURGE readiness. Requires player.js momentum tracking, combat.js to apply effect, sprites.js to render duplicate sprite with pulse animation.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Footwork Audio Cues Feature
- **Module**: Audio (js/audio.js - new or integrate)
- **Target file**: js/player.js, js/scenes/GameScene.js
- **Description**: Distinct footstep sounds based on movement type (quick shuffle for dodge, heavy thud for roll, squeak for pivot). Requires new audio assets, player.js to trigger on movement types, GameScene.js audio management.
- **Priority**: P3
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Mood Lighting System Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/scenes/GameScene.js, js/combat.js
- **Description**: Ambient arena lights shift color based on combat state (neutral=exploration, orange= friendly, blue=intense, red=boss). Requires GameScene.js room state tracking, combat.js combat intensity monitoring, vfx.js for light color transitions.
- **Priority**: P3
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Knockdown Dust Cloud Feature
- **Module**: VFX (js/vfx.js)
- **Target file**: js/combat.js, js/sprites.js
- **Description**: When enemies hit the mat from takedowns/knockdowns, dust cloud erupts from impact point scaling with enemy size. Requires combat.js knockdown detection, vfx.js for dust particle burst, sprites.js for impact sprite.
- **Priority**: P3
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Training Flashback System Feature
- **Module**: Player (js/player.js)
- **Target file**: js/scenes/GameScene.js, js/combat.js, js/vfx.js
- **Description**: Before boss fights, trigger QTEs showing training flashbacks — success grants temporary buffs (damage, stamina regen, Focus). Requires player.js to store buff state, GameScene.js to detect boss room entry and trigger flashback scene, combat.js to apply buffs during fight, vfx.js for silhouette flashback visuals.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Signature Combo Deck Builder Feature
- **Module**: Player (js/player.js)
- **Target file**: js/combat.js, js/ui.js, js/main.js
- **Description**: Build/save combo decks of 5-6 moves, select before zone entry. Requires player.js to store deck configurations, combat.js to cycle through deck moves during normal attacks, ui.js for deck builder UI, main.js for save/load.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Gym Sponsorship System Feature
- **Module**: Items (js/items.js)
- **Target file**: js/player.js, js/zones.js, js/ui.js
- **Description**: Earn zone-specific gym reputation through wins, unlock free gear sponsorships. Requires items.js for sponsorship gear, player.js to track reputation per zone and apply gear stats, zones.js to flag sponsor availability, ui.js for sponsorship notification UI.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Weight Class Transition Challenge Feature
- **Module**: Player (js/player.js)
- **Target file**: js/scenes/GameScene.js, js/ui.js
- **Description**: Stat upgrades that shift weight class trigger weight cut minigame — success = +10% power, failure = -15% HP. Requires player.js to detect weight class shift, GameScene.js to trigger minigame on stat confirm, ui.js for cutscene and result display.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14

### Corner Cutscene Director Feature
- **Module**: UI (js/ui.js)
- **Target file**: js/scenes/GameScene.js, js/player.js, js/combat.js
- **Description**: Between arena rooms, play tactical cutscene with three advice paths granting buffs. Requires ui.js for cutscene scene and choice selection, GameScene.js to trigger between rooms, player.js to apply chosen buff, combat.js to track buff duration.
- **Priority**: P2
- **Status**: 🔲 Not implemented
- **Added**: 2026-03-14
