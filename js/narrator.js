// Narrator integration for MMA RPG
// Must be loaded via <script> before GameScene usage
const NARRATOR_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://127.0.0.1:18789/v1/chat/completions'
  : null;

// Prompt templates for different events
const PROMPT_TEMPLATES = {
  combatStart: (data) => `You are an MMA announcer. In one sentence, have the ${data.enemy.name} taunt the player before the fight. Be trash‑talky and MMA‑specific.`,
  moveUnlock: (data) => `In one sentence, describe the player learning the ${data.move} technique after defeating the ${data.enemy.name}. Make it dramatic and martial‑arts flavored.`,
  bigHit: (data) => `In eight words or fewer, hype the ${data.move} that dealt ${data.damage} damage.`,
  levelUp: (data) => `In one sentence, narrate the player reaching level ${data.level} as an MMA fighter.`
};

// Fallback strings (multiple variants for variety)
const FALLBACKS = {
  combatStart: [
    (data) => `${data.enemy.name} snarls, ready to throw down!`,
    (data) => `The ${data.enemy.name} cracks its knuckles, eyeing you.`
  ],
  moveUnlock: [
    (data) => `You mastered ${data.move}!`,
    (data) => `${data.move} added to your arsenal.`
  ],
  bigHit: [
    (data) => `${data.move.toUpperCase()}!`,
    (data) => `Massive ${data.move}!`
  ],
  levelUp: [
    (data) => `Level ${data.level} achieved!`,
    (data) => `You are now level ${data.level}.`
  ]
};

// Simple queue with max 3 pending items. Newest dropped when overflow.
const narrateQueue = [];
let processing = false;

function enqueue(eventType, data) {
  // Drop newest if queue would exceed 3 pending
  if (narrateQueue.length >= 3) {
    // Discard this new request
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    narrateQueue.push({eventType, data, resolve});
    processQueue();
  });
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (narrateQueue.length) {
    const {eventType, data, resolve} = narrateQueue.shift();
    const result = await fetchNarration(eventType, data);
    resolve(result);
  }
  processing = false;
}

async function fetchNarration(eventType, data) {
  const promptFn = PROMPT_TEMPLATES[eventType];
  if (!promptFn) return null;
  if (!NARRATOR_URL) {
    const fallbacks = FALLBACKS[eventType];
    if (fallbacks && fallbacks.length) {
      const fn = fallbacks[Math.floor(Math.random()*fallbacks.length)];
      return fn(data);
    }
    return '';
  }
  const prompt = promptFn(data);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const resp = await fetch(NARRATOR_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({model: 'gpt-4o-mini', messages: [{role: 'user', content: prompt}]}),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('bad status');
    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content?.trim();
    if (content) return content;
    throw new Error('no content');
  } catch (e) {
    // fallback random variant
    const fallbacks = FALLBACKS[eventType];
    if (fallbacks && fallbacks.length) {
      const fn = fallbacks[Math.floor(Math.random()*fallbacks.length)];
      return fn(data);
    }
    return '';
  }
}

// Exported function
async function narrate(eventType, data) {
  return enqueue(eventType, data);
}

// expose globally
window.narrate = narrate;
