# Pending Hooks
When a builder needs a change in GameScene.js or another file they don't own,
document it here. The Reviewer agent will integrate these.

## Format
- **Module**: which module needs the hook
- **Target file**: which file needs modification
- **Description**: what change is needed
- **Priority**: P0/P1/P2

## Pending

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
