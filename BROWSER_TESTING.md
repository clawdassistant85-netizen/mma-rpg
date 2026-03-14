# BROWSER_TESTING.md — How to Launch & Test the MMA RPG via Browser Automation

> This guide explains how OpenClaw agents use browser automation to test the MMA RPG game. These are the exact commands used for automated testing.

## Prerequisites

- **OpenClaw** installed with browser control enabled
- **Chrome/Chromium** available on the machine
- **Game server running** on port 8088

## Step 1: Start the Game Server

```bash
cd /Users/tobyglennpeters/.openclaw/workspace/mma-rpg
pkill -f "python3 -m http.server 8088" 2>/dev/null
nohup python3 -m http.server 8088 > /tmp/mma-rpg-server.log 2>&1 &
```

Verify it's running:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8088
# Should return: 200
```

## Step 2: Open a Browser Tab

Using the OpenClaw `browser` tool:

```json
{
  "action": "open",
  "url": "http://localhost:8088/?test=1",
  "target": "host"
}
```

This returns a `targetId` (e.g., `"F24E4F18AEA6C6307AD7A31DB686AB5C"`) — save this for all subsequent commands.

## Step 3: Start the Game

The title screen requires a tap or Enter press to start. Use JavaScript evaluation:

```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { localStorage.clear(); document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', keyCode: 13, code: 'Enter', bubbles: true})); setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', keyCode: 13, code: 'Enter', bubbles: true})), 100); return 'starting'; }"
}
```

Wait 3 seconds for the game to load, then verify:

```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { const g = window.phaserGame; if (!g) return {error: 'no game'}; const gs = g.scene.scenes.find(s => s.sys.settings.key === 'GameScene' && s.sys.isActive()); if (!gs || !gs.player) return {error: 'GameScene not active'}; const ps = gs.player.stats; return { working: true, hp: ps.hp, maxHp: ps.maxHp, enemies: gs.enemies.length, room: gs.currentRoomId }; }"
}
```

Expected result:
```json
{
  "working": true,
  "hp": 200,
  "maxHp": 200,
  "enemies": 6,
  "room": "room1"
}
```

## Step 4: Check for Console Errors

```json
{
  "action": "console",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "level": "error",
  "limit": 10
}
```

Expected: `"messages": []` (empty array = no errors)

## Step 5: Take a Screenshot

```json
{
  "action": "screenshot",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>"
}
```

Returns a media path to the screenshot image.

## Step 6: Simulate Player Movement

Phaser uses its own keyboard system. Dispatching DOM keyboard events works but requires keydown + delay + keyup:

```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { const downW = new KeyboardEvent('keydown', {key: 'w', keyCode: 87, code: 'KeyW', bubbles: true}); document.dispatchEvent(downW); return new Promise(resolve => { setTimeout(() => { document.dispatchEvent(new KeyboardEvent('keyup', {key: 'w', keyCode: 87, code: 'KeyW', bubbles: true})); const g = window.phaserGame; const scene = g.scene.scenes.find(s => s.sys.settings.key === 'GameScene'); const p = scene.player; resolve({playerPos: {x: Math.round(p.x), y: Math.round(p.y)}}); }, 500); }); }"
}
```

### Movement Keys
| Key | Code | KeyCode | Direction |
|-----|------|---------|-----------|
| W   | KeyW | 87      | Up        |
| S   | KeyS | 83      | Down      |
| A   | KeyA | 65      | Left      |
| D   | KeyD | 68      | Right     |

## Step 7: Simulate Combat

### Attack Keys
| Key   | Code   | KeyCode | Action     |
|-------|--------|---------|------------|
| J     | KeyJ   | 74      | Jab        |
| K     | KeyK   | 75      | Cross      |
| L     | KeyL   | 76      | Takedown   |
| U     | KeyU   | 85      | Hook       |
| Space | Space  | 32      | Special    |
| G     | KeyG   | 71      | Guillotine |

Example — throw a jab:
```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { document.dispatchEvent(new KeyboardEvent('keydown', {key: 'j', keyCode: 74, code: 'KeyJ', bubbles: true})); setTimeout(() => { document.dispatchEvent(new KeyboardEvent('keyup', {key: 'j', keyCode: 74, code: 'KeyJ', bubbles: true})); }, 100); return 'jab thrown'; }"
}
```

## Step 8: Check Game State (Full Diagnostic)

```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { const g = window.phaserGame; const scene = g.scene.scenes.find(s => s.sys.settings.key === 'GameScene' && s.sys.isActive()); if (!scene) return {error: 'no active scene'}; const p = scene.player; const ps = p.stats; const enemies = scene.enemies.map(e => ({ type: e.typeKey, hp: e.stats ? e.stats.hp : '?', maxHp: e.stats ? e.stats.maxHp : '?', active: e.active, dist: Math.round(Math.sqrt((e.x-p.x)**2 + (e.y-p.y)**2)) })); return { player: { pos: {x: Math.round(p.x), y: Math.round(p.y)}, hp: ps.hp, maxHp: ps.maxHp, stamina: ps.stamina, strikingXP: ps.strikingXP, grapplingXP: ps.grapplingXP, submissionXP: ps.submissionXP, strikingLevel: ps.strikingLevel, grapplingLevel: ps.grapplingLevel, submissionLevel: ps.submissionLevel }, enemies: enemies, room: scene.currentRoomId, zone: scene.currentZone, defeated: scene.enemiesDefeated, gameOver: scene.gameOver, moveLoadout: p.moveLoadout, unlockedSubmissions: p.unlockedSubmissions }; }"
}
```

## Step 9: Test Specific Features

### Open Outfit Menu (E key)
```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { const g = window.phaserGame; const gs = g.scene.scenes.find(s => s.sys.settings.key === 'GameScene'); gs.physics.pause(); gs.paused = true; gs.scene.launch('OutfitScene'); return new Promise(resolve => { setTimeout(() => { const os = g.scene.scenes.find(s => s.sys.settings.key === 'OutfitScene'); resolve({active: os.sys.isActive(), children: os.children ? os.children.length : 0}); }, 500); }); }"
}
```

### Open Move List (I key)
```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { document.dispatchEvent(new KeyboardEvent('keydown', {key: 'i', keyCode: 73, code: 'KeyI', bubbles: true})); setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', {key: 'i', keyCode: 73, code: 'KeyI', bubbles: true})), 100); return 'opened move list'; }"
}
```

### Teleport Player to Enemy (for quick combat testing)
```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "evaluate",
  "fn": "() => { const g = window.phaserGame; const scene = g.scene.scenes.find(s => s.sys.settings.key === 'GameScene'); const p = scene.player; const e = scene.enemies.filter(e => e.active)[0]; if (!e) return {msg: 'no enemies'}; p.x = e.x - 30; p.y = e.y; return {playerPos: {x: Math.round(p.x), y: Math.round(p.y)}, enemyPos: {x: Math.round(e.x), y: Math.round(e.y)}}; }"
}
```

## Step 10: Test Mobile Layout

Resize viewport to mobile dimensions:
```json
{
  "action": "act",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>",
  "kind": "resize",
  "width": 430,
  "height": 932
}
```

Then take a screenshot to verify mobile layout.

## Step 11: Close Browser Tab

```json
{
  "action": "close",
  "target": "host",
  "targetId": "<YOUR_TARGET_ID>"
}
```

---

## Quick Smoke Test Script (All-in-One)

Run this sequence for a complete smoke test:

1. Open browser → get targetId
2. Clear localStorage + press Enter → start game
3. Wait 3 seconds
4. Verify GameScene active, player exists, enemies spawned
5. Check console for errors (expect 0)
6. Screenshot title + gameplay
7. Move player toward enemy (W key)
8. Attack (J key jab)
9. Verify enemy HP decreased
10. Close browser

## Notes

- **Phaser keyboard input**: DOM `KeyboardEvent` dispatch works for Phaser's keyboard system. The events must bubble (`bubbles: true`).
- **`JustDown` detection**: Phaser's `JustDown()` only works during the game's update loop frame, so dispatched events may miss it. For reliable input, use `evaluate` to call game functions directly.
- **Canvas focus**: The Phaser canvas may need focus for keyboard input. Click the canvas element first if keys don't register.
- **Cache busting**: Always append `?v=<number>` or `?t=<timestamp>` to the URL to avoid cached HTML/JS.
- **Touch controls**: Hidden on desktop (`@media (pointer: fine)` hides them). To test mobile controls, resize the viewport AND set pointer to coarse, or force-show them via JS: `document.getElementById('dpad').style.display = 'block'`.
