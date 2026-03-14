# Enemies Split Plan

Original file left unchanged: `js/enemies.js`

## Suggested script load order
1. `js/enemies-config.js`
2. `js/enemies-combat.js`
3. `js/enemies-core.js`
4. `js/enemies-ai.js`

Reasoning: config first, then combat helpers (`damagePlayer`, rewards/status systems), then spawn/core lifecycle, then AI object and behavior tables last. Cross-file calls go through `window.MMA.Enemies.*` at runtime.

## Module contents

### js/enemies-config.js
- `MERCENARY_CONTRACTS`
- `BOUNTY_SYSTEM`
- `NEMESIS_CONFIG`
- `RIVAL_ECHO_CONFIG`
- `ADAPTIVE_TACTICS`
- `ENEMY_COMBO_MEMORY`
- `STYLE_COUNTER`
- `RING_RUST`
- `TELEGRAPH`
- `FIGHT_IQ`
- `COMEBACK_KID`
- `FEAR_TREMBLE_CONFIG`
- `ENRAGE_CONFIG`
- `SORE_LOSER_CONFIG`
- `REGENERATOR_CONFIG`
- `GLITCHER_CONFIG`
- `COACH_CONFIG`
- `MIRROR_MATCH_CONFIG`
- `ECHO_CONFIG`
- `ELITE_COORDINATION_BREAK`
- `PREDATOR_PATIENCE`
- `VENGEANCE_CONFIG`
- `TAUNT_CONFIG`
- `INJURY_SYSTEM`
- `GANG_UP_CONFIG`
- `SWARM_CONFIG`
- `TYPES`
- `BOUNTY_HUNTER_CONFIG`
- `TRICKSTER_CONFIG`
- `SHOWSTOPPER_CONFIG`
- `FLASH_KO_BLINDNESS`
- `ENFORCER_CONFIG`
- `PHASE_SHIFT_CONFIG`
- `TERRITORY_CONFIG`
- `ELITE_TYPES`
- `ELITE_SPAWN_CHANCE`
- `RARE_ITEMS`
- `TAG_TEAM`
- `ENSEMBLE_CAST`
- `WEIGHT_READ`
- `WEIGHT_CLASS_ADVANTAGE`

### js/enemies-core.js
- `getTotalDamageMultiplier`
- `recordComebackLossIfNeeded`
- `applyComebackIfAny`
- `getMoveGroup`
- `getStyleCounterDefenseMult`
- `getPredatorPatienceDefenseMult`
- `_checkEnsembleSpawn`
- `_applyEnsembleCharacter`
- `_showEnsembleIntro`
- `_getEnsembleAttackLine`
- `getHealthBarColor`
- `_inferWeightClassFromBase`
- `applyWeightReadToType`
- `_getAttackWeightClass`
- `getWeightClassDefenseMult`
- `getWeightIconForEnemy`
- `updateWeightIcons`
- `getRoleIcon`
- `getDynamicRoleIcon`
- `updateRoleIcons`
- `getActivePlayers`
- `getTargetPlayer`
- `spawnEnemy`
- `spawnForRoom`
- `spawnBoss`
- `tail: ENSEMBLE_CAST override`
- `tail: spawnForRoom wrapper`
- `tail: damagePlayer wrapper`

### js/enemies-ai.js
- `checkRingRust`
- `applyRingRust`
- `recordRingRustHit`
- `shakeOffRingRust`
- `updateRingRust`
- `recordFightTime`
- `startTelegraphAttack`
- `updateTelegraphAttack`
- `onPlayerAttack`
- `showAdaptiveFeedback`
- `checkMirrorMatch`
- `updateMirrorMatch`
- `consumeMirrorMove`
- `canEliteBreakCoordination`
- `recordEliteStrike`
- `checkEnemyTaunt`
- `executeEnemyTaunt`
- `updateEnemyTaunts`
- `checkGangUpCoordination`
- `_triggerGangUp`
- `updateGangUp`
- `checkSwarmBehavior`
- `_formSwarm`
- `_breakSwarm`
- `updateSwarm`
- `getSwarmDamageMult`
- `getSwarmAttackSpeedMult`
- `getPackDamageMultiplier`
- `checkPhaseShift`
- `executePhaseShift`
- `updatePhaseShift`
- `getPhaseShiftDamageMult`
- `getTerritoryAttackMultiplier`
- `getTerritoryDefenseMultiplier`
- `_ensureTagTeams`
- `_updateTagTeams`
- `coordination`
- `_playEnemyAnimation`
- `_didPlayerRecentlyAttack`
- `_getPlayerStyle`
- `updateEnemies`
- `tail: AI object assignment`
- `tail: spawnShadow alias/helpers`

### js/enemies-combat.js
- `SCOUTING_SYSTEM`
- `getScoutLevel`
- `isEnemyScouted`
- `getScoutCost`
- `scoutEnemy`
- `getScoutInfo`
- `getBountyLevel`
- `increaseBounty`
- `decreaseBounty`
- `getBountyMultipliers`
- `shouldSpawnBountyHunter`
- `applyBountyHunterMods`
- `getBountyWarning`
- `recordMercyKill`
- `getContractTier`
- `getContractMultipliers`
- `_getNemesisDeathCount`
- `recordNemesisDefeat`
- `getCurrentNemesis`
- `hasSlainNemesis`
- `markNemesisSlain`
- `applyNemesisModifiers`
- `_getAiPatternFromType`
- `getNemesisText`
- `_getRivalEchoDeathCount`
- `recordRivalEchoDefeat`
- `getCurrentRivalEcho`
- `hasClearedRivalEcho`
- `markRivalEchoCleared`
- `checkRivalEchoClearAttempt`
- `resetRivalEchoTracking`
- `applyRivalEchoModifiers`
- `getRivalEchoText`
- `applyRivalEchoAura`
- `updateRivalEchoGhost`
- `cleanupRivalEchoGhost`
- `initAdaptiveTracking`
- `recordPlayerAttack`
- `getAdaptiveDefense`
- `initComboMemory`
- `recordComboMemoryAttack`
- `checkComboMemoryAdaptation`
- `_analyzeComboPattern`
- `_getPatternName`
- `getComboMemoryDefenseMult`
- `getEliteMultiplier`
- `damagePlayer`
- `_comebackKey`
- `applyFearTremble`
- `updateFearTrembleAll`
- `applyCoachBoost`
- `getTauntDamageMultiplier`
- `applyInjury`
- `applyInjuryDebuffs`
- `updateInjuries`
- `getInjuryDamageMultiplier`
- `applyVengeanceToNearby`
- `getVengeanceDamageMult`
- `getVengeanceDefenseMult`
- `updateVengeance`
- `showInjuryFeedback`
- `getBlindnessState`
- `applyBlindnessToEnemy`
- `recordFlashKO`
- `clearBlindness`
- `updateBlindness`
- `rollBlindMiss`
- `spawnItem`
- `applyEliteAbility`
- `recordDamageTrail`
- `killEnemy`

## Circular dependency notes
- Cross-file references are runtime namespace calls on `window.MMA.Enemies`, not static imports.
- The only notable load-order-sensitive wrappers are the tail overrides in `enemies-core.js` (`spawnForRoom` and `damagePlayer`). Loading `enemies-combat.js` before `enemies-core.js` ensures the damage wrapper decorates the base `damagePlayer` function instead of replacing a missing value.
- AI behaviors in `enemies-ai.js` depend on helpers from the other three files, so it should load last.
