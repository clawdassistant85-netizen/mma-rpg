# DIGI_TASKS_REVIEW.md — Full Review, Optimization & Bug Fix Session

**Date:** 2026-03-14  
**Branch:** main (HEAD: e34cd6c)  
**Your working dir:** `/Users/tobyglennpeters/clawd/mma-rpg-work`  
**Game URL:** https://clawdassistant85-netizen.github.io/mma-rpg/

---

## ⚠️ IMPORTANT RULES

- **DO NOT run `git push`** — ARIA handles all commits and pushes
- **DO NOT run `git commit`** — ARIA handles this too
- **Your working dir:** `/Users/tobyglennpeters/clawd/mma-rpg-work` — all edits go here
- When done, just list every file you modified with a brief note on each change
- Run `node --check <file>` on every JS file you touch before reporting done

---

## Context: What was just built

Since your last session, the following was merged and pushed:
- **LAN co-op**: `js/network.js`, `js/scenes/LobbyScene.js`, `server/ws-server.js` (WebSocket relay port 8089)
- **DefeatScene**: `js/scenes/DefeatScene.js` — defeat screen with stats, RETRY/TITLE buttons
- **BootScene async refactor**: `js/scenes/BootScene.js` (2369 lines) — now chunks 20+ hook installs across frames with a loading bar instead of 11s freeze
- **Performance**: Removed 56 unused `textureEnemyAnimationSet` texture generations from `js/sprites.js`
- **Bug fix**: PauseScene CLOSE button was intercepted by DOM overlays — fixed by toggling `pointer-events` on `#dpad`, `#action-cluster`, `#mobile-pause-btn` around pause open/close

---

## TASK 1 — Bug fixes (do these first)

### 1A. BootScene still loads slowly (~8s) on first visit

**File:** `js/scenes/BootScene.js`

Even with the async refactor, the actual hook installation takes ~8 seconds total across 8 frames. The loading bar shows now (good) but 8 seconds is still long.

**Investigate:**
- Profile which `_bootStep_*` takes the longest by adding `console.time` / `console.timeEnd` around each step call in `_runNextBootStep`
- The main suspects are `_bootStep_auraHooks` (boss chroma aura, lines ~800–1004 of original) and `_bootStep_vfxHooks` (6 hook installs)
- For each hook inside a step: check if it's actually triggered during normal gameplay. If a hook's output is never visible or used in the current game build, **comment it out** with a note `// DEFERRED: not triggered by current gameplay`
- Goal: get boot to under 3 seconds without breaking anything

**Check:** After changes, verify `node --check js/scenes/BootScene.js` passes.

---

### 1B. GameScene update loop: `updateRoleIcons` runs every frame

**File:** `js/scenes/GameScene.js`

Search for `updateRoleIcons` in GameScene's `update()`. If it runs every single frame, throttle it to run at most every 500ms:

```javascript
if (!this._lastRoleIconUpdate || time - this._lastRoleIconUpdate > 500) {
  this._lastRoleIconUpdate = time;
  MMA.UI.updateRoleIcons(this); // or whatever the call is
}
```

Same treatment for any other UI update calls in the update loop that don't need per-frame precision (coordination system updates, bounty system checks, etc.).

---

### 1C. LobbyScene: SOLO PLAY button should work via keyboard too

**File:** `js/scenes/LobbyScene.js`

Add Enter key → SOLO PLAY, similar to how TitleScene uses Enter to start. This is needed for desktop play without needing to click the canvas.

```javascript
this.input.keyboard.once('keydown-ENTER', function() {
  // same logic as SOLO PLAY click
});
```

---

### 1D. DefeatScene RETRY doesn't reset properly

**File:** `js/scenes/DefeatScene.js`

The `retryGame` function calls:
```javascript
this.scene.stop('DefeatScene');
this.scene.stop('GameScene');  // GameScene may already be stopped
this.scene.start('GameScene');
```

Add a check: if `HUDScene` is still active when RETRY is pressed (edge case), stop it too:
```javascript
if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
```

Also make sure `window.MMA_AUDIO` is cleaned up on retry (stop any lingering BGM/ambient that wasn't stopped by `startDefeatScene`).

---

### 1E. PauseScene: keyboard shortcuts shown for moves that aren't unlocked yet

**File:** `js/scenes/PauseScene.js`

The move list currently shows ALL moves with their keys (J=Jab, K=Cross, etc.) regardless of what the player has actually unlocked. Cross-reference with `this.registry.get('unlockedMoves')` or `window.phaserGame.scene.keys.GameScene.player.loadout` to grey out or hide moves the player hasn't unlocked yet.

---

## TASK 2 — Performance & Code Quality

### 2A. `js/enemies.js` is 6268 lines — split into logical modules

This file is enormous. Split it into:
- `js/enemies-core.js` — base Enemy class, spawn logic, update loop, `getTargetPlayer`
- `js/enemies-ai.js` — AI states: idle, approach, attack, flee, special behaviors (Predator Patience, Flash KO, Rival Echo, Trickster)
- `js/enemies-ensemble.js` — Ensemble Cast system (9 named characters, dialogue)
- `js/enemies-bounty.js` — Bounty System

Keep all on `window.MMA.Enemies` namespace. Update `index.html` to load all 4 files in order (replace the single `enemies.js` line with the 4 new ones, same `?v=40` cache buster).

**Critical:** Run `node --check` on each new file. Don't break any existing function signatures.

---

### 2B. `js/ui.js` is 4720 lines — audit for dead code

Scan for functions defined but never called anywhere in the codebase:
```bash
# For each function defined in ui.js, check if it's called elsewhere
grep -oh "MMA\.UI\.[a-zA-Z]*" js/ui.js | sort -u
# Then check each one against the rest of the codebase
```

Comment out (don't delete) any that are clearly unused. Add a `// UNUSED - verify before removing` comment.

---

### 2C. `js/scenes/BootScene.js` — guard hooks against re-entry on scene restart

Currently hooks check `if (Phaser.Physics.Arcade.Sprite.prototype._mmaXxxHookInstalled) return;` at the top of each step. This is good. But the 8 `_bootStep_*` methods are called EVERY time BootScene runs (e.g., on RETRY). Make sure the loading bar objects (`this._loadBg`, `this._loadText`, `this._loadBar`, `this._loadBarBg`) are always created fresh and not referencing stale scene objects from a previous run.

---

### 2D. Memory leak: weather particle cleanup

**File:** `js/vfx.js`

When `applyRoomWeather` is called on room transition, it calls `this.weatherEffects.clear(scene)`. Verify that `clear()` properly removes all `scene.events.on('update', tick)` listeners added by `_createWeatherGraphics`. If listeners accumulate across room transitions, it creates a memory leak that slows the game over time. Add a listener count log on each transition to verify:
```javascript
console.log('scene update listeners after weather clear:', scene.events.listenerCount('update'));
```
Should be 0 (or close to it) after clearing. If not, fix the cleanup.

---

## TASK 3 — Polish & UX

### 3A. LobbyScene visual polish

**File:** `js/scenes/LobbyScene.js`

Current lobby is functional but plain. Add:
- A background (reuse an existing texture from sprites — `zone_floor` or similar — or just a gradient rectangle)
- Game title text at top: "MMA RPG" in large text with a subtitle "by Toby & Digi"
- Brief instruction text: "Press ENTER or click SOLO PLAY to start"
- Version number in bottom corner: "v0.4.0"

Keep it small — no new textures, just text and rectangles. Should add no more than ~30 lines.

---

### 3B. HUDScene: weight class indicator tooltip flicker

**File:** `js/scenes/HUDScene.js` (or wherever the `#weight-class-indicator` DOM element is managed)

The weight class scrolling tooltip scrolls continuously. If it's on an `setInterval` or Phaser `addEvent` loop, ensure it's properly cleaned up when HUDScene is stopped (to avoid multiple instances stacking up across retries).

---

### 3C. DefeatScene: animate stats counting up

**File:** `js/scenes/DefeatScene.js`

Instead of showing "Enemies Defeated: 5" statically, count up from 0 to the final value over 1 second using a Phaser tween or timer. Makes the defeat screen feel more alive. Use `this.time.addEvent` with a counter that updates the text each tick.

---

## TASK 4 — Verification checklist (run these tests, fix what fails)

For each item below, test it manually in the browser at `http://localhost:8088` (run `python3 -m http.server 8088` from the mma-rpg-work directory) and note pass/fail:

1. [ ] Lobby loads → SOLO PLAY works (click AND Enter key)
2. [ ] Game starts → player spawns, 3 enemies appear, HP/stamina bars visible
3. [ ] Press I → PauseScene opens with move list
4. [ ] Click CLOSE in PauseScene → closes cleanly, game resumes (physics running)
5. [ ] Press ESC in PauseScene → same as CLOSE
6. [ ] Player takes enough damage to die → DefeatScene shows DEFEATED + stats
7. [ ] Click RETRY in DefeatScene → new game starts cleanly (no lingering HUD/audio artifacts)
8. [ ] Click TITLE in DefeatScene → TitleScene shows, Enter starts new game
9. [ ] Room transition → new enemies spawn, weather/lighting updates
10. [ ] Kill all enemies → VictoryScene or room advance triggers

Report which items pass and which fail, with a brief note on any failures.

---

## Deliverables

When you're done, report back:
1. Every file you modified (list them)
2. Which Task 1 bugs are fixed (confirmed)
3. Which Task 2 optimizations were done
4. Which Task 3 polish was added
5. Verification checklist results (Task 4)
6. Any `node --check` failures encountered and how you resolved them

**DO NOT push or commit.** ARIA will review your changes and handle git.
