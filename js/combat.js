window.MMA = window.MMA || {};
window.MMA.Combat = window.MMA.Combat || {};

(function attachStaminaBreakFeature(Combat) {
  if (!Combat || Combat.__staminaBreakFeatureAttached) {
    return;
  }

  Combat.__staminaBreakFeatureAttached = true;

  Combat.STAMINA_BREAK_DURATION_MS = Combat.STAMINA_BREAK_DURATION_MS || 2000;
  Combat.STAMINA_BREAK_DAMAGE_MULTIPLIER = Combat.STAMINA_BREAK_DAMAGE_MULTIPLIER || 1.5;

  function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  function ensureCombatState(entity) {
    if (!entity || typeof entity !== "object") {
      return null;
    }

    entity.combatState = entity.combatState || {};
    return entity.combatState;
  }

  function hasNoStamina(entity) {
    if (!entity || typeof entity.stamina !== "number") {
      return false;
    }
    return entity.stamina <= 0;
  }

  Combat.triggerStaminaBreak = function triggerStaminaBreak(target, opts) {
    var state = ensureCombatState(target);
    if (!state) {
      return false;
    }

    var startedAt = nowMs();
    var durationMs = (opts && typeof opts.durationMs === "number") ? opts.durationMs : Combat.STAMINA_BREAK_DURATION_MS;

    state.staminaBreak = {
      active: true,
      startedAt: startedAt,
      expiresAt: startedAt + durationMs,
      damageMultiplier: (opts && typeof opts.damageMultiplier === "number")
        ? opts.damageMultiplier
        : Combat.STAMINA_BREAK_DAMAGE_MULTIPLIER
    };

    state.staggerUntil = state.staminaBreak.expiresAt;

    if (target && typeof target === "object") {
      target.isStaggered = true;
    }

    return true;
  };

  Combat.updateStaminaBreak = function updateStaminaBreak(target, atMs) {
    var state = ensureCombatState(target);
    var effect = state && state.staminaBreak;

    if (!effect || !effect.active) {
      return false;
    }

    var t = (typeof atMs === "number") ? atMs : nowMs();
    if (t < effect.expiresAt) {
      return true;
    }

    effect.active = false;
    if (target && typeof target === "object") {
      target.isStaggered = false;
    }

    return false;
  };

  Combat.isStaminaBreakActive = function isStaminaBreakActive(target, atMs) {
    return Combat.updateStaminaBreak(target, atMs);
  };

  Combat.maybeTriggerStaminaBreak = function maybeTriggerStaminaBreak(target, opts) {
    if (!hasNoStamina(target)) {
      return false;
    }
    return Combat.triggerStaminaBreak(target, opts);
  };

  Combat.applyStaminaBreakDamageMultiplier = function applyStaminaBreakDamageMultiplier(baseDamage, target, atMs) {
    var damage = (typeof baseDamage === "number") ? baseDamage : 0;

    if (!Combat.isStaminaBreakActive(target, atMs)) {
      return damage;
    }

    var state = ensureCombatState(target);
    var effect = state && state.staminaBreak;
    var multiplier = (effect && typeof effect.damageMultiplier === "number")
      ? effect.damageMultiplier
      : Combat.STAMINA_BREAK_DAMAGE_MULTIPLIER;

    return damage * multiplier;
  };

  Combat.getStaminaBreakRemainingMs = function getStaminaBreakRemainingMs(target, atMs) {
    var state = ensureCombatState(target);
    var effect = state && state.staminaBreak;

    if (!effect || !effect.active) {
      return 0;
    }

    var t = (typeof atMs === "number") ? atMs : nowMs();
    return Math.max(0, Math.floor(effect.expiresAt - t));
  };
})(window.MMA.Combat);
