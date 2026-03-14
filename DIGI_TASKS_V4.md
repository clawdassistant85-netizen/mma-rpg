# MMA RPG — DIGI_TASKS_V4

## What's Done

The V3 features are fully merged into the repo:
- ✅ Audio: BGM, ambient layers, move SFX, UI sounds, victory/defeat jingles (`js/sounds.js`)
- ✅ VFX: Weather effects, combo display, `applyRoomWeather`, `comboDisplay.update` (`js/vfx.js`)
- ✅ Enemies: `ENEMY_VARIANTS`, `DECORATIONS`, defender AI, team coordination (`js/enemies.js`, `js/sprites.js`)
- ✅ Zones: `decorationPositions`, fog weather options, musicCue fields (`js/zones.js`)
- ✅ Items: `DROP_TABLES`, `spawnDropsForEnemy` (`js/items.js`)
- ✅ VictoryScene: enhanced animations, XP counter, stats summary

---

## Remaining Work (4 tasks)

Work in: `/Users/tobyglennpeters/.openclaw/workspace/mma-rpg`

---

### Task 1 — Create `js/scenes/DefeatScene.js`

Create this file from scratch. Style should match VictoryScene.js but with dark/red theming.

```javascript
var DefeatScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function DefeatScene() {
    Phaser.Scene.call(this, { key: 'DefeatScene' });
  },

  create: function () {
    var centerX = this.cameras.main.width / 2;
    var centerY = this.cameras.main.height / 2;

    // Dark overlay
    var bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Defeat text — animated scale-in
    var defeatText = this.add.text(centerX, centerY - 140, 'DEFEATED', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#ff3333',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: defeatText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Stats summary
    var enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
    var playTime = this.registry.get('playTime') || 0;
    var minutes = Math.floor(playTime / 60);
    var seconds = Math.floor(playTime % 60);

    this.add.text(centerX, centerY, 'Enemies Defeated: ' + enemiesDefeated + '\nTime: ' + minutes + 'm ' + seconds + 's', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);

    // Retry button
    var retryBtn = this.add.text(centerX, centerY + 120, '[ RETRY ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(15);

    retryBtn.on('pointerover', function () { retryBtn.setColor('#ff9999'); });
    retryBtn.on('pointerout', function () { retryBtn.setColor('#ff6666'); });
    retryBtn.on('pointerdown', function () {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    }, this);

    // Title button
    var titleBtn = this.add.text(centerX, centerY + 170, '[ TITLE ]', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(15);

    titleBtn.on('pointerover', function () { titleBtn.setColor('#aaaaaa'); });
    titleBtn.on('pointerout', function () { titleBtn.setColor('#888888'); });
    titleBtn.on('pointerdown', function () {
      this.scene.stop('GameScene');
      this.scene.start('TitleScene');
    }, this);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    }
  }
});
```

---

### Task 2 — Register DefeatScene in `index.html` and `js/main.js`

**In `index.html`:** After the VictoryScene script tag (line ~635), add:
```html
  <script src="js/scenes/DefeatScene.js?v=37"></script>
```
Also bump all other `?v=36` cache busters to `?v=37` in the script tags.

**In `js/main.js`:** Line 24, add `DefeatScene` to the scenes array:
```javascript
// Change from:
scene: [TitleScene, BootScene, GameScene, HUDScene, PauseScene, UnlockScene, VictoryScene, OutfitScene],
// Change to:
scene: [TitleScene, BootScene, GameScene, HUDScene, PauseScene, UnlockScene, VictoryScene, OutfitScene, DefeatScene],
```

---

### Task 3 — Hook `applyRoomWeather` in `js/scenes/GameScene.js`

In `create()`, after `MMA.Zones.buildRoom(this, this.currentRoomId)` (around line 42), add:
```javascript
if (window.MMA && MMA.VFX && MMA.VFX.applyRoomWeather) {
  MMA.VFX.applyRoomWeather(this, this.currentRoomId);
}
```

Also find `enterRoom` or any equivalent function where `buildRoom` is called during room transitions and add the same call there too (search for `MMA.Zones.buildRoom` — there may be 1–2 occurrences).

---

### Task 4 — Launch DefeatScene on game over in `js/scenes/GameScene.js`

Find the `gameOver` block in `update()` (around line 282–291). Replace `this.scene.restart()` with:
```javascript
this.registry.set('enemiesDefeated', this.enemiesDefeated || 0);
this.registry.set('playTime', (this.time.now / 1000) || 0);
this.scene.start('DefeatScene');
```

The full block to find:
```javascript
if (Phaser.Input.Keyboard.JustDown(this.restartKey) || time - this.gameOverAt > 3000) {
  this.scene.restart();
}
```

Replace `this.scene.restart()` only — leave the condition untouched.

---

## Verification

After completing all 4 tasks, run `node --check` on every JS file you modified and confirm no syntax errors. Then confirm the game loads at `http://localhost:8088`.

**Do not run git commands.** ARIA handles all commits and pushes.
