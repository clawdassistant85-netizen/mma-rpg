window.MMA = window.MMA || {};
window.MMA.Enemies = window.MMA.Enemies || {};
Object.assign(window.MMA.Enemies, {

  // Mercenary Contracts: boosts enemy stats when active (purchased by player)
  MERCENARY_CONTRACTS: {
    // No contract: default behavior
    none: { hpMultiplier: 1, attackMultiplier: 1, xpMultiplier: 1 },
    // Bronze: entry-level contract
    bronze: { hpMultiplier: 1.25, attackMultiplier: 1.10, xpMultiplier: 1.10 },
    // Silver: mid-tier contract
    silver: { hpMultiplier: 1.50, attackMultiplier: 1.20, xpMultiplier: 1.20 },
    // Gold: top-tier contract
    gold: { hpMultiplier: 2.0, attackMultiplier: 1.35, xpMultiplier: 1.35 }
  },



  // Blood Money Bounty: after defeating a boss, player gains a bounty that attracts mercenary hunters
  // Higher bounty = harder enemies spawn in subsequent zones with scaling bonuses
  BOUNTY_SYSTEM: {
    STORAGE_KEY: 'mma_rpg_bounty_level',
    MAX_BOUNTY: 10,                  // Maximum bounty level
    HP_PER_LEVEL: 0.15,              // +15% HP per bounty level
    DAMAGE_PER_LEVEL: 0.12,          // +12% damage per bounty level
    SPEED_PER_LEVEL: 0.05,           // +5% speed per bounty level
    SPAWN_CHANCE_BASE: 0.12,         // Base chance to spawn bounty hunter
    SPAWN_CHANCE_PER_LEVEL: 0.04,    // +4% per bounty level
    MERCY_WINDOW_MS: 12000,          // Time window to use mercy (non-lethal) to reduce bounty
    MERCY_REDUCTION: 1,              // Reduce bounty by 1 on mercy kill
    MAX_BOUNTY_TEXT: 'MAX BOUNTY!',
    HUNTER_NAME: 'Bounty Hunter',
    HUNTER_COLOR: 0xff4444,          // Red tint for bounty hunters
    WARNING_TEXT: 'BOUNTY HUNTER!',
    APPROACH_TEXT: 'The hunter tracks you...'
  },



  // Nemesis Encounter System: tracks which enemy archetype has defeated player most across sessions
  // That archetype becomes a "Nemesis" with unique dialogue, purple/black glow, scales to player level
  // Defeating Nemesis grants "Nemesis Slayer" title and exclusive equipment drop
  NEMESIS_CONFIG: {
    STORAGE_KEY: 'mma_rpg_nemesis_deaths',
    SLAYER_KEY: 'mma_rpg_nemesis_slain',
    DEFEAT_THRESHOLD: 2,          // Min deaths to become a nemesis
    HP_BONUS: 0.25,               // +25% HP for nemesis enemies
    DAMAGE_BONUS: 0.20,           // +20% damage for nemesis enemies
    SPEED_BONUS: 0.10,            // +10% speed for nemesis enemies
    LEVEL_GAP: 1,                 // Always within 1 level of player
    GLOW_COLOR: 0x8800ff,         // Purple glow for nemesis
    TEXT_COLOR: '#aa44ff',        // Purple text color
    SLAYER_TITLE: 'Nemesis Slayer',
    SLAYER_ITEM: 'nemesisRing'    // Exclusive ring drop
  },



  // Rival Echo System: after losing to an enemy type 3+ times, that enemy's style "echoes"
  // in future fights until player proves mastery by defeating without repeating moves.
  // Visual: defeated-echo enemies have translucent "ghost" aura in player's color.
  RIVAL_ECHO_CONFIG: {
    STORAGE_KEY: 'mma_rpg_rival_echo',
    CLEAR_KEY: 'mma_rpg_rival_echo_cleared',
    DEFEAT_THRESHOLD: 3,        // Min defeats to trigger echo
    ATTACK_SPEED_BONUS: 0.15,   // +15% attack speed for echo enemies
    ECHO_COLOR: 0x8844ff,       // Purple ghost aura
    ECHO_TEXT: 'RIVAL ECHO!',
    ECHO_COLOR_TEXT: '#8844ff',
    CLEAR_WINDOW_MS: 8000       // Time to clear echo after spawn
  },



  // Adaptive Tactics: enemy analyzes player's last 5 attacks and gains +15% defense against repeated move types
  ADAPTIVE_TACTICS: {
    TRACK_COUNT: 5,           // Number of recent attacks to track
    DEFENSE_BONUS: 0.15,       // +15% defense against repeated move types
    MOVE_TYPE_GROUPS: {        // Group similar moves together
      'jab': 'striker', 'cross': 'striker', 'hook': 'striker', 'uppercut': 'striker', 'bodyShot': 'striker', 'elbowStrike': 'striker', 'spinningBackFist': 'striker',
      'lowKick': 'kicker', 'headKick': 'kicker', 'roundhouseKick': 'kicker', 'kneeStrike': 'kicker',
      'takedown': 'grappler', 'singleLegTakedown': 'grappler', 'single_leg_takedown': 'grappler', 'hipThrow': 'grappler', 'guardPass': 'grappler', 'mountCtrl': 'grappler',
      'armbar': 'grappler', 'guillotine': 'grappler', 'triangleChoke': 'grappler', 'kimura': 'grappler', 'rnc': 'grappler'
    }
  },



  // Enemy Combo Memory: enemies track player attack patterns over 45+ seconds
  // and adapt by gaining +20% defense against most-used combos
  ENEMY_COMBO_MEMORY: {
    ADAPTATION_TIME_MS: 45000,    // 45 seconds to trigger adaptation
    DEFENSE_BONUS: 0.20,          // +20% defense against player's favorite combos
    TRACK_WINDOW_MS: 12000,       // Track attacks within last 12 seconds for pattern
    MIN_ATTACKS_TO_TRACK: 8,      // Minimum attacks needed to establish pattern
    ADAPTED_TEXT: 'MEMORY ADAPTED!',
    ADAPTED_COLOR: '#ff66ff'
  },



  // - striker-style enemies take +20% damage from grappler moves
  // - grappler-style enemies take +20% damage from striker pressure
  // - kickboxer-style enemies take +15% damage from striker (hands) pressure (crowding them)
  STYLE_COUNTER: {
    STRIKER_TAKES_FROM_GRAPPLER: 1.20,
    GRAPPLER_TAKES_FROM_STRIKER: 1.20,
    KICKBOXER_TAKES_FROM_STRIKER: 1.15
  },



  // Ring Rust: fighters who haven't competed in 3+ real-time days start with "ring rust" debuffs
  // -10% movement speed, -5% accuracy until they "shake it off" by landing 5+ hits in first fight.
  // Visual: slight sluggish animation, foggy vignette overlay. Resets after first room clear.
  RING_RUST: {
    INACTIVITY_DAYS: 3,              // Days of inactivity to trigger ring rust
    SPEED_DEBUFF: 0.10,             // -10% movement speed
    ACCURACY_DEBUFF: 0.05,          // -5% accuracy (implemented as damage dealt penalty)
    SHAKE_OFF_HITS: 5,              // Hits needed to shake off ring rust
    SHAKE_OFF_DURATION: 8000,       // Time window to land hits to shake off
    STORAGE_KEY: 'mma_rpg_last_fight',
    SHAKEN_KEY: 'mma_rpg_ring_rust_shaken',
    APPLIED_KEY: 'mma_rpg_ring_rust_applied'
  },



  // Body Language Read: enemies briefly telegraph attacks with subtle cues.
  // This makes attacks feel "readable" and gives players a small reaction window.
  TELEGRAPH: {
    ENABLED: true,
    DEFAULT_MS: 120,
    // Only telegraph if enemy is within this distance (avoids noisy spam off-screen)
    MAX_DIST_TO_PLAYER: 260
  },



  // Fight IQ Aura Read: enemy attack telegraphing system that displays subtle colored halos
  // around enemy limbs 300ms before attack - yellow for jabs, orange for crosses,
  // red for haymakers, blue for grapples. Creates readable attack prediction for skilled players.
  FIGHT_IQ: {
    ENABLED: true,
    AURA_DISTANCE: 18,          // Distance of aura from enemy center
    AURA_OPACITY: 0.6,          // Base opacity of the aura
    AURA_PULSE: true,           // Whether aura pulses
    // Attack type to color mapping for halos
    ATTACK_COLORS: {
      // Striker attacks (fast, yellow/orange)
      'jab': 0xffff00,           // Yellow - quick jab
      'cross': 0xffa500,         // Orange - power cross
      'hook': 0xff8c00,         // Dark orange - hook
      'uppercut': 0xff6600,     // Red-orange - uppercut
      'bodyShot': 0xffaa00,     // Amber - body shot
      'elbowStrike': 0xffcc00,  // Gold - elbow
      'spinningBackFist': 0xffd700, // Gold - spinning
      // Kicker attacks (legs, cyan/green)
      'lowKick': 0x00ff88,      // Teal - low kick
      'headKick': 0x00ffff,     // Cyan - head kick
      'roundhouseKick': 0x00cccc, // Cyan-dark - roundhouse
      'kneeStrike': 0x88ff00,   // Lime - knee
      // Grappler attacks (blue/purple)
      'takedown': 0x4444ff,     // Blue - takedown
      'singleLegTakedown': 0x4444ff, // Blue
      'single_leg_takedown': 0x4444ff, // Blue
      'hipThrow': 0x6666ff,     // Purple-blue - throw
      'guardPass': 0x8888ff,    // Light purple
      'mountCtrl': 0xaaaaff,    // Lavender
      'armbar': 0x2200ff,       // Deep blue - submission
      'guillotine': 0x3300ff,   // Deep blue
      'triangleChoke': 0x4400ff, // Purple
      'kimura': 0x5500ff,       // Purple
      'rnc': 0x6600ff,          // Deep purple
      // Special/finisher (red/magenta)
      'SHOULDER DIP': 0xff4444, // Red - basic attack telegraph
      'HAND FAKE': 0xff00ff,    // Magenta - stunner fake
      'PRESSURE STEP': 0xff8800, // Orange-red - bully attack
      'FEINT!': 0xffff00,       // Yellow - feint
      'STRIKE!': 0xff0000,      // Red - feint real
      'GLITCH TELL': 0x00e5ff, // Cyan - glitcher tell
      'HIGH KICK': 0x00ffcc,   // Teal - kickboxer
      'GRAB!': 0x4444ff,       // Blue - grab
      'THROWN!': 0xff4444       // Red - thrown
    },
    // Default color for unknown attacks
    DEFAULT_COLOR: 0xffffff
  },



  // Comeback Kid: if the player dies to an archetype, the next encounter vs that archetype
  // spawns the enemy at -10% HP and grants the player +1 focus (best-effort).
  COMEBACK_KID: {
    ENABLED: true,
    ENEMY_HP_MULT: 0.90,
    PLAYER_FOCUS_BONUS: 1
  },



  // Enemy Fear Tremble: enemies below 25% HP develop visible tremble animation
  // Intensity scales with recent damage dealt, telegraphing low-HP state without relying on health bar
  FEAR_TREMBLE_CONFIG: {
    HP_THRESHOLD: 0.25,        // Trigger tremble at 25% HP
    BASE_AMPLITUDE: 2,        // Base pixel shake amount
    MAX_AMPLITUDE: 6,         // Maximum shake when taking heavy damage
    DAMAGE_WINDOW_MS: 1500,   // Time window to track recent damage
    INTENSITY_SCALE: 0.15     // How much recent damage affects tremble intensity
  },



  // Desperation Enrage: non-boss enemies rage when below 25% HP
  ENRAGE_CONFIG: {
    HP_THRESHOLD: 0.25,        // Trigger at 25% HP
    DURATION: 2000,           // 2 second enrage duration
    COOLDOWN: 8000,           // 8 second cooldown between enrages
    SPEED_BONUS: 0.25,        // +25% move speed
    ATTACK_SPEED_BONUS: 0.30  // +30% attack speed (faster attacks)
  },



  // Sore Loser AI: defeated enemies (below 10% HP) gain a desperate final attack burst
  // - 50% attack speed increase but -30% accuracy for their last 3 seconds
  // Creates dramatic last-stand moments
  SORE_LOSER_CONFIG: {
    HP_THRESHOLD: 0.10,        // Trigger at 10% HP
    DURATION: 3000,            // 3 second desperate burst duration
    ATTACK_SPEED_BONUS: 0.50,  // +50% attack speed (faster attacks)
    ACCURACY_PENALTY: 0.30,    // -30% accuracy (miss chance)
    WARNING_TEXT: 'DESPERATION!',
    WARNING_COLOR: '#ff4444',
    ACTIVE_TEXT: 'FINAL STAND!',
    ACTIVE_COLOR: '#ff6666'
  },



  // Gimmick Specialist: Regenerator enemy slowly heals over time.
  // Visual cue: green tint, periodic "REGEN" floating text.
  REGENERATOR_CONFIG: {
    BASE_INTERVAL_MS: 1000,
    CRITICAL_INTERVAL_MS: 700,
    HEAL_PCT_PER_TICK: 0.03,      // 3% max HP per tick
    CRITICAL_HP_PCT: 0.30,        // below 30% HP -> faster/stronger regen
    CRITICAL_HEAL_MULT: 1.7
  },



  // Gimmick Specialist: Glitcher "teleports" (blinks) behind the player.
  // Visual cue: cyan tint, brief fade-out/fade-in and "BLINK!" text.
  GLITCHER_CONFIG: {
    COOLDOWN_MS: 3600,
    MIN_DIST: 60,
    MAX_DIST: 220,
    BEHIND_DISTANCE: 85,
    STRIKE_DELAY_MS: 180,
    STRIKE_MULT: 1.15
  },



  // Loyalty Bond / Vengeance Mode: when a non-boss ally dies, nearby enemies enter VENGEANCE
  // Coach Enemy: support-type enemy that boosts nearby allies (+15% attack speed per Coach in room)
  COACH_CONFIG: {
    BOOST_RADIUS: 200,
    ATTACK_SPEED_BONUS: 0.15,

    // When a Coach is KO'd, nearby allies become temporarily disorganized:
    // - cannot receive new coach boosts
    // - their attack cadence slows (handled via updateEnemies shakenAttackMult)
    NO_COACH_DURATION_MS: 5000
  },



  // Mirror Match Protocol: when player HP drops below 30%, enemy temporarily mirrors player's last 3 attacks
  // Player can exploit by sequencing weak attacks to confuse enemy AI - strategic mind games at low HP
  // Creates satisfying "outsmarting" moments when player predicts their own pattern
  MIRROR_MATCH_CONFIG: {
    PLAYER_HP_THRESHOLD: 0.30,      // Trigger when player below 30% HP
    MIRROR_WINDOW_MS: 4000,         // How long mirroring lasts
    MIRROR_COUNT: 3,                // Number of recent moves to mirror
    DAMAGE_MULT: 0.70,              // Mirrored attacks deal 70% damage
    WARNING_TEXT: 'READING YOU...', // Text when entering mirror mode
    MIRROR_TEXT: 'MIRROR!',          // Text during mirrored attack
    COOLDOWN_MS: 8000               // Time before next mirror attempt
  },



  // Echo Enemy: rare enemy that "records" player's attack pattern and plays it back after 5 seconds
  // Creates mind-game dynamics - player must vary approach or get hit by their own combo
  ECHO_CONFIG: {
    RECORD_WINDOW_MS: 5000,    // Time window to record player attacks
    PLAYBACK_DELAY_MS: 800,    // Delay between each recorded attack during playback
    DAMAGE_MULT: 0.85,         // Echo attacks deal 85% of original damage
    MAX_RECORDED_ATTACKS: 6,   // Maximum attacks to record
    WARNING_TEXT: 'ECHOING...', // Text shown when starting playback
    PLAYBACK_TEXT: 'ECHO!'     // Text shown during each echo attack
  },



  // Elite Coordination Break: elite enemies can occasionally attack without the attack token
  // This makes them feel more elite and dangerous - they break the coordination system
  ELITE_COORDINATION_BREAK: {
    ENABLED: true,
    CHANCE: 0.35,           // 35% chance to attack without token when no token held
    DAMAGE_MULT: 0.75,       // Coordinated-break attacks deal 75% damage
    COOLDOWN_MS: 1000        // Minimum time between elite strike texts per enemy
  },



  // Predator Patience: Elite+ enemies "size you up" for a few seconds after spawning.
  // During this window they will not attack, and the player gets a preemptive strike bonus.
  // (Implemented fully within enemies.js; no other file hooks required.)
  PREDATOR_PATIENCE: {
    ENABLED: true,
    ONLY_ELITES: true,
    SIZE_UP_MS: 3000,
    PREEMPTIVE_DAMAGE_MULT: 1.5,
    TOAST_TEXT: 'SIZING UP...',
    TOAST_COLOR: '#c0c0ff'
  },


  VENGEANCE_CONFIG: {
    RADIUS: 170,               // pixels - range to trigger vengeance
    DURATION: 5000,           // 5 seconds duration
    DAMAGE_BONUS: 0.20,       // +20% damage dealt
    DEFENSE_PENALTY: 0.15,    // -15% defense (player hits harder)
    DEFENSE_MULT: 0.85        // Multiplier applied to defense (1 - 0.15 = 0.85)
  },



  // Enemy Taunt System: enemies occasionally taunt the player during combat
  // Taunts can lower player Focus meter and boost enemy morale
  TAUNT_CONFIG: {
    ENABLED: true,
    MIN_ZONE: 2,               // Taunts start appearing in zone 2+
    COOLDOWN_MS: 8000,        // Minimum time between taunts per enemy
    CHANCE: 0.003,            // Chance per frame to taunt (roughly once per 5-6 seconds)
    FOCUS_REDUCTION: 8,        // Amount of Focus to drain from player
    DAMAGE_BONUS: 0.10,       // +10% damage for taunting enemy after taunt
    DURATION_MS: 3000,         // Duration of damage bonus
    // Taunt lines by enemy type/AI pattern
    TAUNT_LINES: {
      // Aggressive/chase types
      'chase': ['YOU CAN\'T HURT ME!', 'IS THAT ALL YOU GOT?', 'PATHETIC!', 'HIT HARDER!'],
      // Combo attackers
      'combo': ['TOO SLOW!', 'MISSED ME!', 'NICE TRY!', 'BOXING IS DEAD!'],
      // Kickboxers
      'kickboxer': ['LEGS FOR DAYS!', 'KICKS > PUNCHES!', 'MY RANGE!'],
      // Grapple types
      'grasper': ['GONNA GRIND YOU DOWN!', 'WANNABES DON\'T GRAPPLE!', 'GROUND GAME!'],
      'thrower': ['WEIGHT CLASS!', 'LEARN TO THROW!', 'BUDDY SYSTEM!'],
      'subHunter': ['TAP OR SLEEP!', 'SUBMISSION SPECIALIST!', 'ONE ARM BAR!'],
      // Specialists
      'tank': ['CAN\'T SCRATCH ME!', 'ARMORED UP!', 'FULL DEFENSE!'],
      'enforcer': ['BIG AND MEAN!', 'BEHIND ME!', 'WRONG SIDE!'],
      'regen': ['HEALING UP!', 'WEAR ME DOWN!', 'ALL DAY!'],
      'glitcher': ['CAN\'T TOUCH THIS!', 'GLITCH MODE!', 'PHASE SHIFT!'],
      'bully': ['SMALL FRY!', 'GO HOME KID!', 'SCARED YET?'],
      // Default/generic
      'default': ['COME ON!', 'LET\'S GO!', 'FIGHT ME!', 'BROWN NOSER!', 'DANCE!']
    },
    TAUNT_TEXT_COLOR: '#ffaa00',
    TAUNT_EMOTE: '💢'
  },



  // Injury System: tracking cumulative limb hits for stacking debuffs
  INJURY_SYSTEM: {
    ARM_HIT_DEBUFF: 0.10, // -10% attack speed per stack
    LEG_HIT_DEBUFF: 0.05,  // -5% movement speed per stack
    MAX_STACKS: 5,         // Max debuff stacks
    STACK_DURATION: 8000,  // How long stacks last before decaying
    DAMAGE_BONUS_VULN: 0.15 // +15% damage to vulnerable enemies
  },



  // Gang Up Coordination: when 3+ enemies are alive, they can trigger coordinated attacks
  // - One enemy stuns player (distracts) while others flank and attack from sides
  // - Visual warning indicator appears 1s before trigger
  // - Rewards single-target focus or area attacks
  GANG_UP_CONFIG: {
    ENABLED: true,
    MIN_ENEMIES: 3,
    COOLDOWN_MS: 8000,
    WARNING_MS: 1000,
    DISTRACT_DURATION: 600,
    ATTACK_WINDOW_MS: 800,
    DISTRACTOR_DAMAGE: 0.3,
    FLANKER_DAMAGE_MULT: 1.3,
    FLANK_ANGLE: 1.2
  },



  SWARM_CONFIG: {
    ENABLED: true,
    MIN_MEMBERS: 3,
    MERGE_COOLDOWN_MS: 12000,
    SWARM_DURATION: 8000,
    ATTACK_SPEED_BONUS: 0.6,
    DAMAGE_BONUS: 0.4,
    SPLIT_DAMAGE_THRESHOLD: 25,
    SPLIT_TEXT: 'SPLIT!',
    FORM_TEXT: 'SWARM!',
    MERGE_RADIUS: 80
  },



  TYPES: {
    streetThug:{name:'Street Thug',hp:40,maxHp:40,speed:80,attackDamage:8,attackCooldownMax:1200,attackRange:55,chaseRange:220,color:0xe83030,xpReward:15,teachesMove:'hook',zone:1,aiPattern:'chase',groundDefense:0.2,groundEscape:0.2},
    barBrawler:{name:'Bar Brawler',hp:65,maxHp:65,speed:65,attackDamage:14,attackCooldownMax:1500,attackRange:60,chaseRange:200,color:0xe87030,xpReward:25,teachesMove:'cross',zone:1,aiPattern:'chase',groundDefense:0.4,groundEscape:0.35},
    muayThaiFighter:{name:'Muay Thai Fighter',hp:85,maxHp:85,speed:90,attackDamage:18,attackCooldownMax:1000,attackRange:70,chaseRange:250,color:0x30e870,xpReward:40,teachesMove:'elbowStrike',zone:1,aiPattern:'kicker'},
    wrestler:{name:'Wrestler',hp:90,maxHp:90,speed:70,attackDamage:12,attackCooldownMax:1300,attackRange:60,chaseRange:210,color:0x4488cc,xpReward:30,teachesMove:'singleLegTakedown',zone:2,aiPattern:'grasper',groundDefense:0.7,groundEscape:0.6},
    judoka:{name:'Judoka',hp:85,maxHp:85,speed:75,attackDamage:14,attackCooldownMax:1200,attackRange:65,chaseRange:220,color:0x8844cc,xpReward:35,teachesMove:'hipThrow',zone:2,aiPattern:'thrower'},
    groundNPounder:{name:'Ground-n-Pounder',hp:100,maxHp:100,speed:60,attackDamage:16,attackCooldownMax:1400,attackRange:70,chaseRange:230,color:0xcc8844,xpReward:40,teachesMove:'guardPass',zone:2,aiPattern:'chase'},
    bjjBlackBelt:{name:'BJJ Black Belt',hp:120,maxHp:120,speed:55,attackDamage:22,attackCooldownMax:1600,attackRange:65,chaseRange:240,color:0x222222,xpReward:50,teachesMove:'armbar',zone:3,aiPattern:'subHunter'},
    mmaChamp:{name:'MMA Champ',hp:200,maxHp:200,speed:85,attackDamage:25,attackCooldownMax:1100,attackRange:70,chaseRange:260,color:0xffd700,xpReward:100,teachesMove:'spinningBackFist',zone:3,aiPattern:'chase'},
    kickboxer:{name:'Kickboxer',hp:70,maxHp:70,speed:100,attackDamage:16,attackCooldownMax:900,attackRange:90,chaseRange:280,color:0x00cccc,xpReward:35,teachesMove:'roundhouseKick',zone:2,aiPattern:'kickboxer',groundDefense:0.2,groundEscape:0.1},
    striker:{name:'Striker',hp:55,maxHp:55,speed:95,attackDamage:10,attackCooldownMax:600,attackRange:50,chaseRange:260,color:0xff3366,xpReward:32,teachesMove:'jab',zone:2,aiPattern:'combo',groundDefense:0.2,groundEscape:0.1},
    boxer:{name:'Boxer',hp:68,maxHp:68,speed:108,attackDamage:12,attackCooldownMax:700,attackRange:58,chaseRange:260,color:0xcc4444,xpReward:38,teachesMove:'jab',zone:2,aiPattern:'boxer',groundDefense:0.25,groundEscape:0.2},
    karateka:{name:'Karateka',hp:82,maxHp:82,speed:78,attackDamage:18,attackCooldownMax:1400,attackRange:82,chaseRange:230,color:0xf1f1f1,xpReward:42,teachesMove:'roundhouseKick',zone:2,aiPattern:'karateka',groundDefense:0.3,groundEscape:0.2},
    streetFighter:{name:'Street Fighter',hp:92,maxHp:92,speed:92,attackDamage:17,attackCooldownMax:1150,attackRange:68,chaseRange:270,color:0xff9922,xpReward:55,teachesMove:'bodyShot',zone:3,aiPattern:'streetFighter',groundDefense:0.35,groundEscape:0.3},
    stunner:{name:'Stunner',hp:80,maxHp:80,speed:70,attackDamage:12,attackCooldownMax:1200,attackRange:60,chaseRange:250,color:0x8800ff,xpReward:45,teachesMove:null,zone:2,aiPattern:'stunner',groundDefense:0.3,groundEscape:0.2},
    // Coach Enemy: support-type that boosts nearby allies (+15% attack speed per Coach in radius)
    coach:{name:'Coach',hp:60,maxHp:60,speed:88,attackDamage:6,attackCooldownMax:1800,attackRange:40,chaseRange:260,color:0x33ffcc,xpReward:45,teachesMove:null,zone:2,aiPattern:'coach'},
    drunkMonk:{name:'Drunk Monk',hp:70,maxHp:70,speed:75,attackDamage:12,attackCooldownMax:1300,attackRange:55,chaseRange:230,color:0x8866aa,xpReward:30,teachesMove:null,zone:2,aiPattern:'drunkMonk'},
    // Rival System: recurring "Shadow" boss that appears across zones with scaling stats
    shadowRival:{name:'Shadow Rival',hp:150,maxHp:150,speed:92,attackDamage:22,attackCooldownMax:1150,attackRange:70,chaseRange:280,color:0x111111,xpReward:90,teachesMove:null,zone:2,aiPattern:'chase'},
    // Feint Master: zones 2-3, mid HP, good speed, performs fake windup then real strike
    feintMaster:{name:'Feint Master',hp:75,maxHp:75,speed:95,attackDamage:16,attackCooldownMax:1400,attackRange:65,chaseRange:250,color:0xff00ff,xpReward:50,teachesMove:null,zone:2,aiPattern:'feintMaster',groundDefense:0.3,groundEscape:0.25},

    // Bully AI: pressures harder when player is low HP; panics/flees when its own HP is critical
    bully:{name:'Bully',hp:95,maxHp:95,speed:82,attackDamage:15,attackCooldownMax:1150,attackRange:60,chaseRange:260,color:0xff8800,xpReward:55,teachesMove:null,zone:2,aiPattern:'bully',groundDefense:0.35,groundEscape:0.25},

    // Gimmick Specialist: Regenerator (slow heal over time; punishes passive play)
    regenerator:{name:'Regenerator',hp:85,maxHp:85,speed:78,attackDamage:12,attackCooldownMax:1250,attackRange:60,chaseRange:240,color:0x22ff66,xpReward:60,teachesMove:null,zone:2,aiPattern:'regen',groundDefense:0.35,groundEscape:0.25},

    // Gimmick Specialist: Glitcher (blink teleport behind player + quick strike)
    glitcher:{name:'Glitcher',hp:80,maxHp:80,speed:92,attackDamage:14,attackCooldownMax:1050,attackRange:62,chaseRange:270,color:0x00e5ff,xpReward:65,teachesMove:null,zone:2,aiPattern:'glitcher',groundDefense:0.30,groundEscape:0.25},

    // Tutor Enemy: trainer-type that teaches a technique upon victory.
    // Also "mirrors" the player's recent attacks (best-effort) to force adaptation.
    tutor:{name:'Tutor',hp:95,maxHp:95,speed:84,attackDamage:14,attackCooldownMax:1150,attackRange:65,chaseRange:260,color:0x66ff33,xpReward:70,teachesMove:null,zone:2,aiPattern:'tutor',groundDefense:0.45,groundEscape:0.35},

    // Echo Enemy: rare zone 3+ enemy that records player attacks and plays them back
    echo:{name:'Echo',hp:110,maxHp:110,speed:88,attackDamage:16,attackCooldownMax:1000,attackRange:60,chaseRange:250,color:0x9933ff,xpReward:65,teachesMove:null,zone:3,aiPattern:'echo',groundDefense:0.35,groundEscape:0.25},

    // Temperamental Enforcer: heavy enemy that enrages when allies are defeated - gains +30% attack speed but loses 10% accuracy
    enforcer:{name:'Enforcer',hp:130,maxHp:130,speed:55,attackDamage:20,attackCooldownMax:1600,attackRange:65,chaseRange:220,color:0xff4444,xpReward:60,teachesMove:null,zone:2,aiPattern:'enforcer',groundDefense:0.5,groundEscape:0.4},

    // Tank: slow, heavily armored enemy that absorbs hits and delivers slow but powerful strikes
    // Designed to be a "wall" that players must work around - high defense, slow attacks, punishing to focus fire on
    tank:{name:'Tank',hp:150,maxHp:150,speed:45,attackDamage:18,attackCooldownMax:1800,attackRange:55,chaseRange:200,color:0x555555,xpReward:50,teachesMove:null,zone:2,aiPattern:'tank',groundDefense:0.75,groundEscape:0.3},

    // Trickster: special enemy that occasionally vanishes and reappears behind the player during combat
    // Requires quick camera awareness to defend. Visual: dissolve particle effect followed by reappearance behind player
    trickster:{name:'Trickster',hp:75,maxHp:75,speed:95,attackDamage:14,attackCooldownMax:1100,attackRange:65,chaseRange:270,color:0xff00aa,xpReward:55,teachesMove:null,zone:2,aiPattern:'trickster',groundDefense:0.25,groundEscape:0.2},

    // Showstopper: rare boss variant that "pauses" the player mid-attack
    // Requires timing adjustment to land hits. Visual: clockwork gears appear briefly around the enemy during pause
    showstopper:{name:'Showstopper',hp:140,maxHp:140,speed:75,attackDamage:18,attackCooldownMax:1400,attackRange:65,chaseRange:250,color:0xffaa00,xpReward:80,teachesMove:null,zone:3,aiPattern:'showstopper',groundDefense:0.4,groundEscape:0.3},

    // Bounty Hunter: mercenary hunter that tracks players with active bounties
    // Spawns based on bounty level, scales with player progress, has unique red glow
    bountyHunter:{name:'Bounty Hunter',hp:110,maxHp:110,speed:98,attackDamage:18,attackCooldownMax:950,attackRange:65,chaseRange:280,color:0xff4444,xpReward:75,teachesMove:null,zone:2,aiPattern:'bountyHunter',groundDefense:0.35,groundEscape:0.25}
  },



  // Bounty Hunter AI Config: aggressive hunter with tracking capabilities
  BOUNTY_HUNTER_CONFIG: {
    TRACKING_BONUS: 0.15,         // +15% damage when player is low HP
    LOW_HP_THRESHOLD: 0.30,       // Trigger tracking bonus below 30% HP
    PURSUE_SPEED_MULT: 1.2,       // 20% faster pursuit
    SNIPE_RANGE: 120,              // Can attack from longer range
    HUNTER_GLOW: 0xff4444          // Red glow color
  },



  // Trickster AI Config: teleports behind player mid-combat
  TRICKSTER_CONFIG: {
    TELEPORT_CHANCE: 0.008,         // Chance per frame to attempt teleport when eligible
    MIN_HP_FOR_TELEPORT: 0.40,      // Only teleport when above 40% HP
    MIN_COOLDOWN_MS: 3500,         // Minimum time between teleports
    BEHIND_DISTANCE: 70,            // Distance behind player to teleport to
    TELEPORT_DURATION: 400,         // How long the teleport effect lasts
    STRIKE_DELAY: 250,             // Delay before attacking after teleport
    DAMAGE_MULT: 1.25,             // Damage multiplier for post-teleport attacks
    WARNING_TEXT: 'VANISH!',
    WARNING_COLOR: '#ff00ff',
    TELEPORT_TEXT: 'BEHIND YOU!',
    TELEPORT_COLOR: '#ff66ff'
  },



  // Showstopper Enemy: rare boss variant that "pauses" the player for 1 second mid-attack
  // Requires timing adjustment to land hits. Visual: clockwork gears appear briefly around the enemy during pause
  SHOWSTOPPER_CONFIG: {
    PAUSE_DURATION: 1000,           // 1 second player pause
    PAUSE_CHANCE: 0.15,            // 15% chance per attack to trigger pause
    MIN_COOLDOWN_MS: 4000,         // Minimum time between pause triggers
    GEAR_COUNT: 4,                 // Number of clockwork gears to display
    GEAR_ROTATION_SPEED: 200,       // Rotation speed per gear (ms per degree)
    WARNING_TEXT: 'FREEZE!',
    WARNING_COLOR: '#ffaa00',
    PAUSE_TEXT: 'TIME STOPPED!',
    PAUSE_COLOR: '#ffcc00'
  },



  // Flash KO Blindness: dramatic KO causes camera flash that leaves enemy temporarily blinded
  // in next room (if same enemy type) - 30% miss chance for 10 seconds, visual white afterimage effect
  FLASH_KO_BLINDNESS: {
    ENABLED: true,
    MISS_CHANCE: 0.30,         // 30% miss chance while blinded
    DURATION: 10000,           // 10 seconds blindness duration
    STORAGE_KEY: 'mma_rpg_ko_blindness',
    BLIND_TEXT: 'BLINDED!',
    BLIND_COLOR: '#ffffff'
  },



  // Temperamental Enforcer Config: triggers when allies die nearby
  ENFORCER_CONFIG: {
    ENRAGE_RADIUS: 180,           // pixels - range to detect ally deaths
    ATTACK_SPEED_BONUS: 0.30,    // +30% attack speed when enraged
    ACCURACY_PENALTY: 0.10,      // -10% accuracy (miss chance) when enraged
    MAX_ENRAGE_STACKS: 3,        // Max enrage stacks from multiple ally deaths
    ENRAGE_DURATION: 6000,       // How long enrage lasts (ms)
    STACK_GAIN_TEXT: 'ENFORCER ENRAGED!',
    STACK_COLOR: '#ff2200'
  },



  // Phase Shift Boss: boss enemies trigger phase shifts at 75%, 50%, and 25% HP
  // Each shift changes their attack pattern (striker→grappler or vice versa), grants brief invulnerability, and has unique visual
  PHASE_SHIFT_CONFIG: {
    THRESHOLDS: [0.75, 0.50, 0.25],  // HP percentages that trigger phase shifts
    INVULN_DURATION: 500,             // 0.5s invulnerability during shift
    PHASES: [
      { name: 'aggressive', attackSpeedMult: 1.3, damageMult: 1.2, tint: 0xff0000, text: 'PHASE 2!', aiFrom: 'chase', aiTo: 'combo' },
      { name: 'defensive', attackSpeedMult: 0.8, damageMult: 1.4, tint: 0x00ff00, text: 'PHASE 3!', aiFrom: 'combo', aiTo: 'grasper' },
      { name: 'enraged', attackSpeedMult: 1.5, damageMult: 1.6, tint: 0xff00ff, text: 'FINAL FORM!', aiFrom: 'grasper', aiTo: 'subHunter' }
    ]
  },



  // Territory Control: enemies gain +10% attack when fighting in their "home" room (where they first spawned)
  // and within a short radius of their home position.
  TERRITORY_CONFIG: {
    HOME_RADIUS: 150,
    ATTACK_BONUS: 0.10
  },



  // Elite variants: 2x HP, stronger attacks, unique glow, rare drops
  ELITE_TYPES: {
    eliteStreetThug:{baseType:'streetThug',name:'Elite Street Thug',hpMultiplier:2,attackMultiplier:1.5,speedBonus:15,color:0xff4444,colorGlow:0xff0000,xpMultiplier:2.5,dropChance:0.2,rareItem:'speedPotion'},
    eliteBarBrawler:{baseType:'barBrawler',name:'Elite Bouncer',hpMultiplier:2,attackMultiplier:1.5,speedBonus:10,color:0xff7744,colorGlow:0xff6600,xpMultiplier:2.5,dropChance:0.2,rareItem:'powerGloves'},
    eliteMuayThai:{baseType:'muayThaiFighter',name:'Elite Muay Thai',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0x44ff88,colorGlow:0x00ff44,xpMultiplier:2.5,dropChance:0.25,rareItem:'elbowPads'},
    eliteWrestler:{baseType:'wrestler',name:'Elite Wrestler',hpMultiplier:2,attackMultiplier:1.5,speedBonus:12,color:0x66aaff,colorGlow:0x0088ff,xpMultiplier:2.5,dropChance:0.2,rareItem:'wrestlingBoots'},
    eliteJudoka:{baseType:'judoka',name:'Elite Judoka',hpMultiplier:2,attackMultiplier:1.6,speedBonus:15,color:0xaa66ff,colorGlow:0x8800ff,xpMultiplier:2.5,dropChance:0.25,rareItem:'giBelt'},
    eliteGroundNPounder:{baseType:'groundNPounder',name:'Elite Ground Pounder',hpMultiplier:2,attackMultiplier:1.5,speedBonus:8,color:0xffaa66,colorGlow:0xff8800,xpMultiplier:2.5,dropChance:0.2,rareItem:'kneePads'},
    eliteBJJ:{baseType:'bjjBlackBelt',name:'Elite BJJ Master',hpMultiplier:2,attackMultiplier:1.7,speedBonus:18,color:0x444444,colorGlow:0x222222,xpMultiplier:3,dropChance:0.3,rareItem:'submissionGloves'},
    eliteStriker:{baseType:'striker',name:'Elite Striker',hpMultiplier:2,attackMultiplier:1.6,speedBonus:20,color:0xff6699,colorGlow:0xff0066,xpMultiplier:2.5,dropChance:0.22,rareItem:'speedPotion'},
    eliteKickboxer:{baseType:'kickboxer',name:'Elite Kickboxer',hpMultiplier:2,attackMultiplier:1.6,speedBonus:22,color:0x00ffff,colorGlow:0x00cccc,xpMultiplier:2.5,dropChance:0.22,rareItem:'speedPotion'},
    eliteTank:{baseType:'tank',name:'Heavy Tank',hpMultiplier:2.2,attackMultiplier:1.7,speedBonus:8,color:0x666666,colorGlow:0x444444,xpMultiplier:2.8,dropChance:0.25,rareItem:'armorPlating'},
    eliteBoxer:{baseType:'boxer',name:'Elite Boxer',hpMultiplier:2,attackMultiplier:1.5,speedBonus:18,color:0xff6666,colorGlow:0xff0000,xpMultiplier:2.6,dropChance:0.24,rareItem:'speedPotion',specialAbility:'counterStance'},
    eliteKarateka:{baseType:'karateka',name:'Sensei',hpMultiplier:2.4,attackMultiplier:1.75,speedBonus:14,color:0xffffff,colorGlow:0x00ffff,xpMultiplier:3,dropChance:0.28,rareItem:'giBelt',specialAbility:'focusStrike'},
    eliteStreetFighter:{baseType:'streetFighter',name:'Chaos King',hpMultiplier:2.2,attackMultiplier:1.65,speedBonus:16,color:0xffaa44,colorGlow:0xff5500,xpMultiplier:2.8,dropChance:0.26,rareItem:'powerGloves',specialAbility:'chaosRush'}
  },


  // Chance to spawn elite instead of regular (15%)
  ELITE_SPAWN_CHANCE: 0.15,



  // Rare items that elite enemies can drop
  RARE_ITEMS: {
    speedPotion:{name:'Speed Potion',stat:'speed',value:10,duration:30000,color:0x00ff00,description:'+10 Speed for 30s'},
    powerGloves:{name:'Power Gloves',stat:'attackDamage',value:5,duration:30000,color:0xff0000,description:'+5 Attack for 30s'},
    elbowPads:{name:'Elbow Pads',stat:'defense',value:3,duration:30000,color:0xffff00,description:'+3 Defense for 30s'},
    wrestlingBoots:{name:'Wrestling Boots',stat:'speed',value:8,duration:30000,color:0x0088ff,description:'+8 Speed for 30s'},
    giBelt:{name:'Gi Belt',stat:'defense',value:5,duration:30000,color:0xff8800,description:'+5 Defense for 30s'},
    kneePads:{name:'Knee Pads',stat:'hp',value:20,duration:0,color:0xaa8800,description:'+20 Max HP (permanent)'},
    submissionGloves:{name:'Submission Gloves',stat:'attackDamage',value:8,duration:45000,color:0x8800ff,description:'+8 Attack for 45s'},
    armorPlating:{name:'Armor Plating',stat:'defense',value:8,duration:60000,color:0x888888,description:'+8 Defense for 60s'},
    nemesisRing:{name:'Nemesis Ring',stat:'all',value:15,duration:120000,color:0x8800ff,description:'+15 All Stats for 2min (Nemesis Slayer exclusive)'}
  },



  // Tag Team AI: paired enemies alternate who "pressures" the player.
  // The resting partner backs off, repositions, and recovers faster.
  TAG_TEAM: {
    ENABLED: true,
    MIN_ZONE: 2,
    SWAP_MS: 2000,
    REST_DISTANCE: 140,  // try to stay at least this far from player while resting
    FLANK_ANGLE: 1.1     // radians offset for flanking while resting
  },


  // Ensemble Cast: recurring enemy characters with unique names, backstories, and voice lines.
  // These replace generic enemy types occasionally for personality and lore.
  ENSEMBLE_CAST: {
    // Chance to spawn an ensemble character instead of generic enemy (per spawn attempt)
    SPAWN_CHANCE: 0.08,
    // Zone requirements for each character
    MIN_ZONE: 2,
    // Named characters pool - each has baseType, unique name, title, and voice lines
    CHARACTERS: [
      { baseType: 'streetThug', name: 'Rocco', title: 'the Brick', zone: 2, color: 0xcc4444,
        intro: "Rocco: 'You picked the wrong alley, pal.'",
        defeat: "Rocco: 'Not bad... for an amateur.'",
        attack: ['GRAB!', 'SUCKER!', 'STREET FIGHT!'] },
      { baseType: 'streetThug', name: 'Maya', title: 'Fist First', zone: 2, color: 0xcc44cc,
        intro: "Maya: 'Let's see what you got.'",
        defeat: "Maya: 'You got potential. Don't waste it.'",
        attack: ['QUICK!', 'DUCK!', 'COMBO!'] },
      { baseType: 'barBrawler', name: 'Big Tony', title: 'The Bouncer', zone: 2, color: 0xff8844,
        intro: "Tony: 'Nobody causes trouble in MY bar.'",
        defeat: "Tony: 'Alright, you win. Drinks are on me.'",
        attack: ['OUTTA HERE!', 'BEGONE!', 'ELBOW!'] },
      { baseType: 'wrestler', name: 'Kneecap Karl', title: 'Leg Lock Legend', zone: 2, color: 0x4488ff,
        intro: "Karl: 'Hope you like ground work.'",
        defeat: "Karl: 'Taught you everything you know.'",
        attack: ['TAKEDOWN!', 'LEG GRAB!', 'PIN!'] },
      { baseType: 'muayThaiFighter', name: 'Saenchai', title: 'The Thai Storm', zone: 3, color: 0x44ff88,
        intro: "Saenchai: 'Ready for the Eight Limbs?'",
        defeat: "Saenchai: 'Respect. You fight well.'",
        attack: ['ELBOW!', 'KNEE!', 'MUAY THAI!'] },
      { baseType: 'kickboxer', name: 'Dutch', title: 'The Dutch Destroyer', zone: 2, color: 0x44ffff,
        intro: "Dutch: 'Feet first, questions later.'",
        defeat: "Dutch: 'Fast hands... but my kicks are faster.'",
        attack: ['HIGH KICK!', 'CALF SMASH!', 'ROUNDHOUSE!'] },
      { baseType: 'striker', name: 'Flash Fiona', title: 'Pocket Rocket', zone: 2, color: 0xff4488,
        intro: "Fiona: 'Blink and you'll miss it.'",
        defeat: "Fiona: 'Fastest hands in the east... or west.'",
        attack: ['JAB!', 'COMBO!', 'SPEED!'] },
      { baseType: 'bjjBlackBelt', name: 'Professor Pete', title: 'The Submission Artist', zone: 3, color: 0x666666,
        intro: "Pete: 'Tap out. It's less embarrassing.'",
        defeat: "Pete: 'Technique beats strength. Remember that.'",
        attack: ['ARM BAR!', 'TRIANGLE!', 'GUILLOTINE!'] },
      { baseType: 'judoka', name: 'Yoshi', title: 'Throw Master', zone: 3, color: 0x8844ff,
        intro: "Yoshi: 'Balance is everything. You have none.'",
        defeat: "Yoshi: 'Impressive for a rookie.'",
        attack: ['HIP THROW!', 'SEOI NAGE!', 'IPPN!'] }
    ]
  },



  // Opponent Weight Read: enemies display subtle weight class indicators above their heads.
  // Light enemies move faster but are squishier; heavy enemies hit harder but are slower.
  WEIGHT_READ: {
    ENABLED: true,
    ICONS: { light: '🪶', medium: '🥊', heavy: '🧱' },
    // Stat tradeoffs applied at spawn (before global spawn scaling)
    LIGHT: { hpMult: 0.90, dmgMult: 0.95, speedMult: 1.12 },
    MEDIUM: { hpMult: 1.00, dmgMult: 1.00, speedMult: 1.00 },
    HEAVY: { hpMult: 1.15, dmgMult: 1.10, speedMult: 0.90 }
  },



  // Weight Class Advantage: rock-paper-scissors-ish damage dynamic.
  // - Light attacks (jabs/quick kicks) hit HEAVY enemies harder, but do worse vs LIGHT enemies.
  // - Heavy attacks (haymakers/throws) hit LIGHT enemies harder, but do worse vs HEAVY enemies.
  // Implemented as a defense multiplier in onPlayerAttack (lower = more damage).
  WEIGHT_CLASS_ADVANTAGE: {
    ENABLED: true,
    // Multipliers are applied to damage; we translate into defense multipliers via 1 / mult.
    LIGHT_ATTACK_VS_HEAVY: 1.20,
    LIGHT_ATTACK_VS_LIGHT: 0.85,
    HEAVY_ATTACK_VS_LIGHT: 1.20,
    HEAVY_ATTACK_VS_HEAVY: 0.85,
    FEEDBACK_COOLDOWN_MS: 900,
    FEEDBACK_TEXT: 'WEIGHT ADV!',
    FEEDBACK_COLOR: '#ffffff',
    LIGHT_MOVES: {
      jab: 1, cross: 1,
      lowKick: 1
    },
    HEAVY_MOVES: {
      hook: 1, uppercut: 1, bodyShot: 1, elbowStrike: 1, spinningBackFist: 1,
      headKick: 1, roundhouseKick: 1, kneeStrike: 1,
      takedown: 1, singleLegTakedown: 1, single_leg_takedown: 1, hipThrow: 1,
      armbar: 1, guillotine: 1, triangleChoke: 1, kimura: 1, rnc: 1
    }
  }
});
