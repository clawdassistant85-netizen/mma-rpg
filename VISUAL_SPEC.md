# MMA RPG — Visual & UX Implementation Guide

*Practical design concepts for Clarity GPT implementation. No code — just the "what" and "why" to guide the build.*

---

## 1. CHARACTER DESIGN WITHOUT EXTERNAL ASSETS

### The Layered Circle System

Build characters entirely from Phaser Graphics primitives. Every fighter follows this structure:

```
┌─────────────────────────────────────────┐
│            DIRECTION INDICATOR          │  ← Small triangle pointing where they'll attack
│              (above head)               │
├─────────────────────────────────────────┤
│              STANCE GLOW                │  ← Outer ring pulses; color = fighter type
│           (radius: 28px)                │
├─────────────────────────────────────────┤
│             BODY SILHOUETTE             │  ← Main circle (radius: 18px)
│          (solid fill + outline)         │
├─────────────────────────────────────────┤
│           COMBAT STANCE ARMS            │  ← 1-2 smaller circles showing hand position
│         (left = jab, right = power)     │
├─────────────────────────────────────────┤
│              SHADOW BLUR                │  ← Dark ellipse underneath
└─────────────────────────────────────────┘
```

### Player vs Enemy Differentiation

| Element | Player | Enemy |
|---------|--------|-------|
| Body color | Bright blue (#4a90e2) | Zone-dependent (see enemy section) |
| Outline | White (#ffffff, 2px) | Same as accent color |
| Direction indicator | Always visible, white | Visible during attack windup only |
| Shadow | Subtle blur, dark gray | Sharp, no blur |

### State-Based Visual Changes

**Idle**: Gentle vertical bob (2px, 800ms cycle)
- Player: Blue glow pulses slowly
- Enemy: Static, eyes (two dots) may blink

**Moving**: Lean in movement direction (max 10° rotation)
- Add motion blur trail (3 fading circles behind)

**Attacking**: Arm/leg extends as line primitive toward target
- Jab: Short white line (30px)
- Cross: Longer diagonal line (45px) with "hip" rotation
- Kick: Line with foot shape at end
- Takedown: Both arms reach out, enemy slides toward player

**Hit/Staggered**: Flash red, shake horizontally
- Quick shake (50ms, 4px left/right)
- Red tint overlay (100ms)

**Blocking**: Two smaller circles appear in front of body
- Slight blue tint to body

---

## 2. ATTACK READABILITY BY DIRECTION

### The Core Principle

**Every attack type has a distinct visual shape and direction.** Player should know what's coming just by seeing the arm/leg extend.

### Strike Visual Vocabulary

| Attack | Shape | Direction | Duration | Color |
|--------|-------|-----------|----------|-------|
| Jab | Straight thin line | Horizontal forward | 100ms | White |
| Cross | Thick diagonal line | Horizontal forward, slight arc | 150ms | Yellow-white |
| Hook | Curved arc | Side swing (90° from facing) | 200ms | Orange |
| Uppercut | Vertical line | Upward 45° | 150ms | Red |
| Low Kick | Line + foot shape | Low horizontal sweep | 200ms | Cyan |
| Head Kick | Line + foot shape | High horizontal arc | 250ms | Magenta |
| Elbow | Short angular line | Diagonal in-close | 120ms | Green |
| Knee | Line + rounded end | Upward arc (knee shape) | 150ms | Lime |

### Grapple/Takedown Visual Vocabulary

| Attack | Visual | Duration |
|--------|--------|----------|
| Single Leg | One arm reaches down | 300ms |
| Double Leg | Both arms reach low | 350ms |
| Hip Throw | Arm wraps + rotation arc | 400ms |
| Guard Pass | Horizontal slide | 250ms |
| Rear Naked Choke | Arms wrap from behind (show on enemy) | 500ms |
| Armbar | Leg over arm shape | 500ms |

### Direction-to-Control Mapping

The game uses 4-directional facing. Here's how attacks map:

- **Facing RIGHT** (default): Jab/Cross extend right, Hook swings up, Kick goes right
- **Facing LEFT**: All horizontal attacks mirror
- **Facing UP**: Uppercut goes up, kicks become stomps
- **Facing DOWN**: High kicks become sweeps

**Implementation tip**: Store facing direction as integer (0=right, 1=down, 2=left, 3=up) and multiply attack vectors by direction matrix.

---

## 3. ENEMY ARCHETYPES & TELEGRAPHING

### The Eight Archetypes

Each enemy has: silhouette shape + accent color + telegraph behavior + danger indicator

| Enemy | Silhouette | Accent | Telegraph | Danger Sign |
|-------|------------|--------|-----------|-------------|
| Street Thug | Short (28px), wide (24px), hands at waist | 🔴 Red #e83030 | Bobs forward 2x before punch | Fist icon |
| Bar Brawler | Medium (32px), wide stance (30px) | 🟠 Orange #ff8800 | Shakes both hands, steps closer | Beer mug icon |
| Muay Thai Fighter | Tall (36px), lean, arms guard up | 🟢 Green #30e830 | Windup leg back for kick | Foot icon |
| Wrestler | Bulky (38px), low center, shoulders wide | 🔵 Blue #3080ff | Crouches lower, arms wide grab | Hand grab icon |
| Judoka | Medium balanced (32px), arms extended | 🟣 Purple #9030ff | Pulls one arm back (arm throw) | Arm icon |
| Ground-n-Pounder | Heavy (40px), slow | 🟤 Brown #885522 | Low crouch, slow approach | Ground icon |
| BJJ Black Belt | Thin (26px), coiled | ⚫ Dark #222222 | Circles, changes stance often | Mat icon |
| MMA Champ | Perfect proportions (34px), balanced | 🟡 Gold #ffcc00 | Studies player, varied combos | Skull icon |

### Telegraph Timing System

```
START: Enemy enters attack range
  ↓
WINDUP (200-400ms)
  - Color shifts lighter (accent → 50% white blend)
  - Direction indicator appears
  - Arms/legs pull back
  ↓
ATTACK (100-250ms based on move)
  - Strike extends
  - Hitbox active
  ↓
RECOVERY (300-500ms)
  - Return to idle
  - Can be interrupted during this phase
```

### Enemy Health Bars

- Position: 20px above enemy
- Width: 40px, Height: 4px
- Color: Matches accent color
- Background: Dark gray (#222222)
- On hit: Flash white briefly, shrink from right

### Boss Special Behaviors

**MMA Champ (Zone 3 Boss)**:
- Has 3 phases at 66% and 33% HP
- Phase change: Brief invulnerability (1s), flashes gold, regenerates 10 HP
- Uses combos: jab → cross → kick in sequence
- More aggressive at low health
- "CHAMPION" name tag floats above

---

## 4. ENVIRONMENTAL STORYTELLING

### Zone Progression = Visual Narrative

The three zones tell a story of escalation: street → training → championship.

---

### Zone 1: The Streets (Enemies: Thug → Brawler → Muay Thai)

**When player enters**: Tutorial zone, gritty but manageable

**Visual elements**:
- **Background gradient**: Deep purple (#1a0a2e) at top → black (#000000) at bottom
- **Floor**: Dark concrete gray (#2a2a2a) with crack lines (drawn procedurally)
- **Walls**: Brick pattern — dark rectangles with mortar gaps
- **Props**:
  - Trash cans: Gray rectangles with circular lids, scattered
  - Barrels: Red/orange vertical shapes in corners
  - Graffiti: Random colorful streaks on back wall (purple, cyan, orange)
  - Flickering streetlight: Occasional yellow flash (10% chance per 2 seconds)
- **Lighting**: Dim, some tiles slightly brighter (simulating distant lights)
- **Exits**: Darker doorway shapes on right side of room

**Enemy placement**: 1-2 enemies per room, spread out

**What it tells the player**: "You're fighting on the streets. It's dark, but you can handle this."

---

### Zone 2: The Gym (Enemies: Wrestler → Judoka → Ground-n-Pounder)

**When player enters**: Transition — "You've made it to training. Things get serious."

**Visual elements**:
- **Background gradient**: Warm gray (#333333) → dark gray (#1a1a1a)
- **Floor**: Classic wrestling mat — alternating blue (#1a3a6a) and red (#6a1a1a) rectangular zones
- **Walls**: Metal fence — horizontal lines with vertical supports
- **Props**:
  - Ring corners: White corner posts (simple L shapes) in each corner
  - Heavy bag: Hanging rectangle that sways when nearby enemies attack
  - Weight plates: Colored circles (red/yellow/green) stacked in corner
  - Punching dummy: Stationary figure shape
  - Canvas corners: Red/blue/white corner markers on floor
- **Lighting**: Overhead fluorescent — subtle brightness pulse every 3 seconds
- **Exits**: Door frames on right, possibly stairs-up visual on left

**Enemy placement**: 2-3 enemies, some near props (wrestlers near center)

**What it tells the player**: "This is where fighters train. The mat is your domain now."

---

### Zone 3: The Octagon (Enemies: BJJ Black Belt → MMA Champ Boss)

**When player enters**: Climax — "This is it. Championship fight."

**Visual elements**:
- **Background**: Near-black (#0a0a0a) with crowd silhouette
  - Top 60px: Layer of tiny gray dots (#444444) representing crowd heads
  - Occasional "crowd cheer" ripple effect (dots pulse brighter briefly)
- **Floor**: White canvas (#f0f0f0) with red corner markings
  - Red X in each corner (simple X shapes)
  - Center circle: White with subtle logo placeholder (text "MMA" in center)
- **Walls**: Cage wireframe — grid of thin silver lines (#888888) with slight perspective
- **Props**:
  - Corner posts: Colored padding (red corner, blue corner, white neutral corners)
  - Flashing lights: When boss takes damage, corner lights flash
  - Title banners: "CHAMPION" text at top (appears after boss defeat)
- **Lighting**: Dramatic spotlights
  - Cone of brighter light follows player position
  - Slight lens flare effect at screen edges during boss fight
- **Exits**: Victory path after boss — bright white doorway

**Enemy placement**: 
- BJJ Belt: 1 enemy, center mat
- MMA Champ: Boss room — single large enemy, special arena layout

**What it tells the player**: "This is what you've trained for. Win here, and you're a champion."

---

### Room Transition Effects

- **Entering new room**: Brief fade-to-black (200ms), room fades in (300ms)
- **Zone transition**: Full black (500ms), zone name text appears ("ZONE 2: THE GYM") for 2 seconds, then gameplay
- **Boss room**: Extra dramatic — slow fade, spotlight effect, boss already in position

---

## 5. MOBILE UI BUTTON STYLING

### Design Philosophy

Buttons should feel like a real fighting game controller. Think classic arcade — responsive, satisfying, instantly readable.

---

### D-Pad (Movement)

**Design**:
- Circular base: 100px diameter, dark semi-transparent (#000000, 60% opacity)
- Inner cross: Four triangular arrows in cross pattern
- Color: White (#ffffff) with subtle gray (#888888) outlines

**Touch feedback**:
- On press: Scale to 1.1x, arrow brightens to full white
- On release: Scale back to 1.0x

**Position**: Bottom-left corner, 20px padding from screen edges

---

### Action Buttons (Attack)

**Layout**: Diamond formation
```
        [JAB]
          |
    [HEAVY]---[GRAPPLE]
          |
       [SPECIAL]
```

**Button design**:
- Shape: Rounded rectangle (60px × 40px, 8px corner radius)
- Each button has gradient fill + icon + label

| Button | Icon | Gradient | Position (relative) |
|--------|------|----------|---------------------|
| Jab | Straight line → | Blue (#4a90e2 → #2a70c2) | Top |
| Heavy | Fist circle | Red (#e83030 → #c21010) | Bottom-left |
| Grapple | Grab hand | Green (#30e830 → #10c210) | Bottom-right |
| Special | Star/bolt | Purple (#9030ff → #7010df) | Bottom |

**Touch feedback** (all buttons):
- On press: Scale to 0.95x, brightness increases, glow appears
- On release: Scale back, button depresses visually
- During cooldown: Grayed out (#444444), countdown number displayed

**Visual indicators on buttons**:
- Stamina cost: Small white number in corner (e.g., "5")
- Cooldown: Circular progress indicator filling up

---

### HUD Elements (Top of Screen)

**Player bars** (left side):
- HP: Red bar (#e83030), 200px wide × 16px tall, black border
- Stamina: Blue bar (#30a8e8), same size, below HP
- XP: Yellow bar (#e8c830), shorter (100px wide), below stamina
- Numbers: "HP: 85/100" text next to each bar

**Zone indicator** (top center):
- Text: "ZONE 1: THE STREETS"
- Font: Bold, white, 24px

**Pause/Menu** (top-right):
- Pause icon: Gear or hamburger menu
- Size: 40px × 40px
- Tap: Opens pause overlay

---

### Enemy Intent Display

**Above each enemy**:
- Small icon (24px) showing what they'll do next
- Appears during enemy windup phase
- Icons: Fist (strike), Foot (kick), Hand (grab), Skull (finishing move)

**Position**: Floats 30px above enemy, fades in over 100ms

---

### Mobile-Specific Considerations

- **Safe area**: Respect notched phones — keep UI inside safe area
- **Minimum touch target**: 48px × 48px for all buttons
- **Landscape only**: For now, show "rotate device" message if portrait
- **Auto-hide UI option**: Triple-tap screen to toggle UI visibility for screenshot

---

## IMPLEMENTATION CHECKLIST FOR CLARITY GPT

### Phase 1: Characters (Priority 1)
- [ ] Create `createCharacterGraphics()` function returning container with all layers
- [ ] Implement direction indicator that rotates with facing
- [ ] Add state machine for visual states (idle/move/attack/hit/block)
- [ ] Build attack arm/leg drawing with direction matrix

### Phase 2: Enemies (Priority 2)
- [ ] Define 8 enemy configs with silhouette sizes + accent colors
- [ ] Build telegraph system: windup → attack → recovery phases
- [ ] Add health bars above enemies with accent color
- [ ] Implement enemy intent icons

### Phase 3: Environments (Priority 3)
- [ ] Create zone background drawing functions (gradients + props)
- [ ] Add procedural floor patterns per zone
- [ ] Build prop placement system for each room
- [ ] Implement room transition fades

### Phase 4: Mobile UI (Priority 4)
- [ ] Design D-pad with touch handling
- [ ] Create action button diamond layout
- [ ] Add button press/release visual feedback
- [ ] Build cooldown display system
- [ ] Position HUD bars at top

---

## QUICK REFERENCE: COLOR PALETTE

```
PLAYER
  Body:      #4a90e2 (bright blue)
  Outline:   #ffffff (white)
  Shadow:    #000000 (black, 30% opacity)

ENEMIES
  Thug:      #e83030 (red)
  Brawler:   #ff8800 (orange)
  Muay Thai: #30e830 (green)
  Wrestler:  #3080ff (blue)
  Judoka:    #9030ff (purple)
  GNP:       #885522 (brown)
  BJJ:       #222222 (dark)
  Champ:     #ffcc00 (gold)

ZONES
  Street BG: #1a0a2e → #000000 (purple to black)
  Gym BG:    #333333 → #1a1a1a (gray gradient)
  Octagon:   #0a0a0a (near black)

UI
  HP:        #e83030 (red)
  Stamina:   #30a8e8 (blue)
  XP:        #e8c830 (yellow)
  Buttons:   #4a90e2 / #30e830 / #e83030 / #9030ff
```

---

*This document serves as the design spec for Clarity GPT. Reference it when building visual systems.*
