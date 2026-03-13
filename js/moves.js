var MOVES = {
  jab:      { name:'Jab',         type:'strike',  damage:8,  staminaCost:5,  cooldown:400 },
  cross:    { name:'Cross',       type:'strike',  damage:12, staminaCost:8,  cooldown:600 },
  hook:     { name:'Hook',        type:'strike',  damage:15, staminaCost:10, cooldown:800,  unlockLevel:2 },
  kick:     { name:'Low Kick',    type:'strike',  damage:10, staminaCost:7,  cooldown:600,  unlockLevel:2 },
  takedown: { name:'Takedown',    type:'grapple', damage:5,  staminaCost:20, cooldown:1200, unlockLevel:3 },
  rncchoke: { name:'RNC',         type:'sub',     damage:35, staminaCost:25, cooldown:2000, unlockLevel:6 },
  armbar:   { name:'Armbar',      type:'sub',     damage:30, staminaCost:22, cooldown:1800, unlockLevel:5 },
  headkick: { name:'Head Kick',   type:'strike',  damage:25, staminaCost:18, cooldown:1000, unlockLevel:5 }
};
