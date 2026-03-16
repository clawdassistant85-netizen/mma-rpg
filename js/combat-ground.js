window.MMA = window.MMA || {};
window.MMA.Combat = window.MMA.Combat || {};
Object.assign(window.MMA.Combat, {
  GROUND_MOVES: {
    "jab": {
      "name": "Ground & Pound",
      "damage": 22,
      "staminaCost": 8,
      "cooldown": 500
    },
    "cross": {
      "name": "Elbow",
      "damage": 32,
      "staminaCost": 18,
      "cooldown": 900
    },
    "takedown": {
      "name": "Submission Attempt",
      "staminaCost": 22,
      "cooldown": 1200
    },
    "special": {
      "name": "Improve Position",
      "staminaCost": 10,
      "cooldown": 800
    }
  },
  resolveTakedownAttempt: function(scene, enemy) {
      var style = this.getPlayerGrappleStyle(scene);
      var baseChance = this.TAKEDOWN_BASE_CHANCE[style] || 0.5;
      var defense = enemy && enemy.type && typeof enemy.type.groundDefense === 'number' ? enemy.type.groundDefense : 0.2;
      var chance = Phaser.Math.Clamp(baseChance - (defense * 0.55), 0.1, 0.95);
      return Math.random() < chance;
    },
  getSubmissionsForPosition: function(scene, position) {
      var unlockedSubs = [];
      if (scene && scene.player && scene.player.unlockedSubmissions) {
        unlockedSubs = scene.player.unlockedSubmissions;
      } else {
        unlockedSubs = ['rnc']; // default
      }
      
      // Position-based submission availability
      var positionSubs = {
        fullGuard: ['rnc', 'triangleChoke', 'armbar', 'guillotine'],
        halfGuard: ['kimura', 'americana'],
        sideControl: ['americana', 'kimura'],
        mount: ['armbar', 'americana', 'rnc'],
        backControl: ['rnc', 'kimura', 'americana']
      };
      
      var allowed = positionSubs[position] || positionSubs.fullGuard;
      
      // Return only unlocked submissions that are valid for this position
      return allowed.filter(function(sub) {
        return unlockedSubs.indexOf(sub) !== -1;
      });
    },
  tryImprovePosition: function(scene, currentPosition) {
      var s = scene.player.stats;
      var skillLevel = s.grapplingLevel || 1;
      
      // Position improvement paths
      var improvePaths = {
        fullGuard: { halfGuard: 0.5, backControl: 0.25 },
        halfGuard: { sideControl: 0.4, fullGuard: 0.3 },
        sideControl: { mount: 0.35, halfGuard: 0.3 },
        mount: { backControl: 0.4 },
        backControl: { mount: 0.3 }
      };
      
      var paths = improvePaths[currentPosition] || {};
      var possiblePositions = Object.keys(paths);
      
      if (possiblePositions.length === 0) return false;
      
      // Higher skill = better chance
      var skillBonus = Math.min(0.3, (skillLevel - 1) * 0.05);
      
      // Try each possible position in order of preference
      for (var i = 0; i < possiblePositions.length; i++) {
        var newPos = possiblePositions[i];
        var chance = (paths[newPos] || 0.2) + skillBonus;
        
        if (Math.random() < chance) {
          scene.groundState.position = newPos;
          return true;
        }
      }
      
      // Failed to improve - small chance to at least transition to a worse position
      if (Math.random() < 0.15) {
        var fallback = { fullGuard: 'halfGuard', halfGuard: 'fullGuard', sideControl: 'halfGuard', mount: 'sideControl', backControl: 'mount' };
        if (fallback[currentPosition]) {
          scene.groundState.position = fallback[currentPosition];
          return true;
        }
      }
      
      return false;
    },
  showSubmissionPickerFiltered: function(scene, validSubs) {
      if (scene.groundState.submissionPickerShown) return;
      scene.groundState.submissionPickerShown = true;
      
      var enemy = scene.groundState.enemy;
      
      // Show prompt
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'SELECT SUBMISSION', '#ff66ff');
      
      // Set up for next input to select submission
      scene.groundState.waitingForSubmission = true;
      scene.groundState.showingSubmissionPicker = true;
    },
  executeGroundMove: function(scene, moveKey) {
      if (!scene.groundState || !scene.groundState.active || scene.gameOver) return;
      var map = { heavy: 'cross', grapple: 'takedown' };
      moveKey = map[moveKey] || moveKey;
      
      // Handle stand up from the new standup button
      if (moveKey === 'standup') {
        var position = scene.groundState.position || 'fullGuard';
        // Can only stand up from full guard or half guard
        if (position === 'fullGuard' || position === 'halfGuard') {
          scene._groundHitCount = 0;
          return scene.endGroundState('player-standup');
        }
        return;
      }
      
      // Handle position improvement (special button on ground)
      if (moveKey === 'special') {
        var pos = scene.groundState.position || 'fullGuard';
        var improveSuccess = this.tryImprovePosition(scene, pos);
        if (improveSuccess) {
          // Show position change
          var newPos = scene.groundState.position;
          var posNames = { fullGuard: 'HALF GUARD', halfGuard: 'SIDE CONTROL', sideControl: 'MOUNT', mount: 'MOUNT', backControl: 'BACK CONTROL' };
          MMA.UI.showGroundBanner(posNames[newPos] || 'POSITION UP!');
        }
        // Update UI to show new position
        MMA.UI.setActionButtonLabels(true, scene);
        MMA.UI.updateGroundHUD(scene);
        return;
      }
      
      // Handle submission selection - show submission picker if not already showing
      if (moveKey === 'takedown') {
        // Check if we have unlock submissions - show the submission picker
        var position = scene.groundState.position || 'fullGuard';
        var posSubs = this.getSubmissionsForPosition(scene, position);
        
        if (posSubs.length === 0) {
          // No submissions available for this position, try to improve position instead
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'NO SUBS! IMPROVE POSITION', '#ffaa33');
          return;
        }
        
        // Filter unlocked submissions to only those valid for current position
        var unlockedSubs = scene.player.unlockedSubmissions || ['rnc'];
        var validSubs = posSubs.filter(function(sub) { return unlockedSubs.indexOf(sub) !== -1; });
        
        if (validSubs.length === 0) {
          MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'NO SUBS FOR POS!', '#ffaa33');
          return;
        }
        
        if (!scene.groundState.showingSubmissionPicker) {
          this.showSubmissionPickerFiltered(scene, validSubs);
          return;
        }
        // If picker was shown and user selected, execute that submission
        var selectedSub = scene.groundState.selectedSubmission;
        if (selectedSub && validSubs.indexOf(selectedSub) !== -1) {
          var subMove = this.MOVE_ROSTER[selectedSub];
          if (subMove) {
            this.executeSubmission(scene, selectedSub, subMove);
          }
          scene.groundState.selectedSubmission = null;
          scene.groundState.showingSubmissionPicker = false;
          return;
        }
        return;
      }
      
      var gm = this.GROUND_MOVES[moveKey];
      if (!gm) return;
      var cdKey = 'ground_' + moveKey;
      var s = scene.player.stats;
      if (!scene.player.cooldowns[cdKey]) scene.player.cooldowns[cdKey] = 0;
      if (scene.player.cooldowns[cdKey] > 0 || s.stamina < gm.staminaCost) return;
      s.stamina -= gm.staminaCost;
      scene.player.cooldowns[cdKey] = gm.cooldown;
      var enemy = scene.groundState.enemy;
      if (!enemy || !enemy.active || enemy.state === 'dead') return scene.endGroundState('enemy-dead');
  
      var dmg = gm.damage + (scene.player.attackBonus || 0);
      enemy.stats.hp -= dmg;
      scene._groundTarget = enemy;
      if (moveKey === 'jab' || moveKey === 'cross') {
        scene._groundHitCount = (scene._groundHitCount || 0) + 1;
      }
      // Health Bar Damage Trail: record damage for visual effect
      if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
      MMA.UI.recordHitDealt(dmg, false, 1);
      MMA.UI.recordMoveUsage(moveKey, scene); // Track move for Style DNA
      MMA.Player.awardStyleXP(scene, moveKey); // Award style XP
      MMA.UI.showDamageText(scene, enemy.x, enemy.y - 20, '-' + dmg, '#ffd54f');
      MMA.VFX.flashEnemyHit(scene, enemy, 90);
      // Mounted combo finisher at 5+ ground hits
      if (scene && scene._groundHitCount && scene._groundHitCount >= 5) {
        // Rain of punches — rapid 3 more hits at reduced damage
        scene._groundHitCount = 0;
        var p = scene.player;
        var target = scene._groundTarget;
        if (target && target.stats && target.active) {
          var rainDmg = 6;
          for (var ri = 0; ri < 3; ri++) {
            (function(ridx) {
              scene.time.delayedCall(ridx * 150, function() {
                if (!target.active || !target.stats || target.stats.hp <= 0) return;
                target.stats.hp = Math.max(0, target.stats.hp - rainDmg);
                if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(target, rainDmg);
                if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
                  MMA.UI.showDamageText(scene, target.x, target.y - 20 - ridx * 10, rainDmg, '#ff8800');
                }
                if (target.stats.hp <= 0) {
                  MMA.Enemies.killEnemy(scene, target);
                  scene.endGroundState('enemy-dead');
                }
              });
            })(ri);
          }
          if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
            MMA.UI.showDamageText(scene, p.x, p.y - 40, 'GROUND & POUND!', '#ff4400');
          }
        }
      }
      if (enemy.stats.hp <= 0) {
        MMA.Enemies.killEnemy(scene, enemy);
        scene.endGroundState('enemy-dead');
      }
    },
  showSubmissionPicker: function(scene) {
      // Only show if not already showing
      if (scene.groundState.submissionPickerShown) return;
      scene.groundState.submissionPickerShown = true;
      
      var unlockedSubs = scene.player.unlockedSubmissions || ['rnc'];
      var roster = this.MOVE_ROSTER;
      var enemy = scene.groundState.enemy;
      
      // Calculate submission chance based on enemy defense and submission difficulty
      // Higher ground defense = harder to submit
      var enemyDefense = enemy && enemy.type ? (enemy.type.groundDefense || 0.2) : 0.2; // eslint-disable-line no-unused-vars
      
      // Show prompt
      MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 60, 'SELECT SUBMISSION', '#ff66ff');
      
      // Set up for next input to select submission
      scene.groundState.waitingForSubmission = true;
      scene.groundState.showingSubmissionPicker = true;
    },
  executeSubmission: function(scene, subKey, subMove) {
      var enemy = scene.groundState.enemy;
      if (!enemy || !enemy.active || enemy.state === 'dead') return scene.endGroundState('enemy-dead');
      
      var s = scene.player.stats;
      var staminaCost = subMove.staminaCost || 20;
      
      if (s.stamina < staminaCost) {
        MMA.UI.showDamageText(scene, scene.player.x, scene.player.y - 40, 'LOW STAMINA!', '#ff4444');
        return;
      }
      
      s.stamina -= staminaCost;
      
      // Calculate submission success chance based on:
      // - Enemy ground defense
      // - Submission difficulty (base chance varies by sub)
      // - Player's submission level
      var baseChances = {
        rnc: 0.45,
        guillotine: 0.40,
        armbar: 0.35,
        triangleChoke: 0.30,
        kimura: 0.35,
        americana: 0.30,
        heelHook: 0.25,
        kneebar: 0.28
      };
      
      var enemyDefense = enemy && enemy.type ? (enemy.type.groundDefense || 0.2) : 0.2;
      var subLevel = s.submissionLevel || 1;
      var baseChance = baseChances[subKey] || 0.3;
      
      // Bonus from submission level
      var levelBonus = (subLevel - 1) * 0.03;
      
      // Final chance
      var successChance = Phaser.Math.Clamp(baseChance + levelBonus - (enemyDefense * 0.4), 0.1, 0.75);
      
      if (Math.random() < successChance) {
        // Submission successful!
        var baseSubDamage = subMove.damage || 30;
        this.applyLimbInjuryOnHit(scene, enemy, subKey);
        var injuryAdjusted = this.applyInjuryDamageBonus(enemy, baseSubDamage);
        var dmg = injuryAdjusted.damage;
        enemy.stats.hp -= dmg;
        // Health Bar Damage Trail: record damage for visual effect
        if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, dmg);
        // Track swarm damage for split detection
        if (MMA.Enemies.recordSwarmDamage) {
          MMA.Enemies.recordSwarmDamage(enemy, dmg);
        }
        MMA.UI.recordHitDealt(dmg, false, 1);
        MMA.Player.awardStyleXP(scene, subKey);
        MMA.UI.recordMoveUsage(subKey, scene);
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 36, subMove.name + '!', '#ff66ff');
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 54, 'SUBMISSION!', '#ff00ff');
        if (injuryAdjusted.bonusPct > 0) MMA.UI.showDamageText(scene, enemy.x, enemy.y - 72, 'INJURY +' + Math.round(injuryAdjusted.bonusPct * 100) + '%', '#ffd166');
        MMA.VFX.flashEnemyHit(scene, enemy, 150);
        if ((subKey === 'rnc' || subKey === 'neckCrank') && MMA.Ground && typeof MMA.Ground.enableSubmissionDotTicker === 'function') {
          MMA.Ground.enableSubmissionDotTicker(scene, enemy, subMove);
        }
        
        if (enemy.stats.hp <= 0) {
          MMA.Enemies.killEnemy(scene, enemy);
          scene.endGroundState('submission');
        }
      } else {
        // Failed - enemy escapes
        MMA.UI.showDamageText(scene, enemy.x, enemy.y - 24, 'ESCAPED!', '#ffaa66');
        // Small damage from failed attempt
        enemy.stats.hp -= 5;
        // Health Bar Damage Trail: record damage for visual effect
        if (MMA.Enemies.recordDamageTrail) MMA.Enemies.recordDamageTrail(enemy, 5);
        if (enemy.stats.hp <= 0) {
          MMA.Enemies.killEnemy(scene, enemy);
          scene.endGroundState('enemy-dead');
        }
      }
    },
  TAKEDOWN_BASE_CHANCE: {
    "grappler": 0.8,
    "balanced": 0.5,
    "striker": 0.3
  },
  getPlayerGrappleStyle: function(scene) {
      var cardStyle = MMA.UI && MMA.UI.fighterCard ? MMA.UI.fighterCard.style : null;
      var style = (scene.player && scene.player.dominantStyle) || (scene.player && scene.player.stats && scene.player.stats.dominantStyle) || cardStyle || 'balanced';
      style = (style || '').toLowerCase();
      if (style !== 'grappler' && style !== 'striker') style = 'balanced';
      return style;
    }
});

MMA.Ground = MMA.Ground || {};

MMA.Ground.showGrappleEscapePrompt = function(scene) {
  if (!scene || scene._grapplePromptShowing) return;
  scene._grapplePromptShowing = true;

  var W = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_W) ? CONFIG.CANVAS_W : 500;
  var H = (typeof CONFIG !== 'undefined' && CONFIG.CANVAS_H) ? CONFIG.CANVAS_H : 400;

  var bg = scene.add.rectangle(W / 2, H / 2 + 60, 180, 22, 0x000000, 0.8).setDepth(310).setScrollFactor(0);
  var label = scene.add.text(W / 2, H / 2 + 60, 'MASH TO ESCAPE!', {
    fontSize: '10px', fontFamily: 'Arial Black', color: '#ff4400', stroke: '#000', strokeThickness: 2
  }).setOrigin(0.5).setDepth(311).setScrollFactor(0);

  // Progress bar (depletes over 2s)
  var barBg = scene.add.rectangle(W / 2, H / 2 + 72, 160, 6, 0x333333, 1).setDepth(311).setScrollFactor(0);
  var barFill = scene.add.rectangle(W / 2 - 80 + 80, H / 2 + 72, 160, 6, 0xff4400, 1).setOrigin(0, 0.5).setDepth(312).setScrollFactor(0);

  scene.tweens.add({ targets: barFill, scaleX: 0, duration: 2000, ease: 'Linear' });

  scene._grapplePromptObjs = [bg, label, barBg, barFill];
};

MMA.Ground.hideGrappleEscapePrompt = function(scene) {
  if (!scene) return;
  scene._grapplePromptShowing = false;
  if (scene._grapplePromptObjs) {
    scene._grapplePromptObjs.forEach(function(o) { if (o && o.active) o.destroy(); });
    scene._grapplePromptObjs = null;
  }
};

MMA.Ground.enableSubmissionDotTicker = function(scene, enemy, subMove) {
  if (!scene || !enemy) return;
  enemy._dotDamageActive = true;
  enemy._dotDamagePerTick = enemy._dotDamagePerTick || ((subMove && subMove.dotDamagePerTick) || 3);

  // DoT tick display
  if (enemy._dotDamageActive && !enemy._dotTickerShowing) {
    enemy._dotTickerShowing = true;
    var tickInterval = scene.time.addEvent({
      delay: 500,
      callback: function() {
        if (!enemy.active || !enemy._dotDamageActive || enemy.stats.hp <= 0) {
          tickInterval.remove();
          enemy._dotTickerShowing = false;
          return;
        }
        if (window.MMA && MMA.UI && typeof MMA.UI.showDamageText === 'function') {
          MMA.UI.showDamageText(scene, enemy.x + (Math.random() * 20 - 10), enemy.y - 20, enemy._dotDamagePerTick || 3, '#cc88ff');
        }
      },
      repeat: -1
    });
  }
};

// GameScene integration note:
// - Call MMA.Ground.showGrappleEscapePrompt(scene) when scene._grabbedByEnemyTs is set in the grab check block.
// - Call MMA.Ground.hideGrappleEscapePrompt(scene) when the escape QTE succeeds or fails / grab state ends.
