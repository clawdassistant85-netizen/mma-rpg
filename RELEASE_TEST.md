# MMA RPG — Release Test Plan

Every push is a **release**. No code ships without this checklist passing in the browser.
GitHub pushes are gated to **every 8 hours** max unless a critical hotfix is needed.

---

## 1. Boot Check
- [ ] Page loads, no console errors
- [ ] LobbyScene visible, Enter starts game
- [ ] BootScene runs, progress bar completes
- [ ] GameScene + HUDScene active, ≥55fps

## 2. HUD & UI
- [ ] HP and Stamina bars visible
- [ ] Room name / zone message shows on entry
- [ ] Settings (⚙️) button opens PauseScene
- [ ] PauseScene shows move list, loadout slots
- [ ] CLOSE button closes PauseScene, game resumes
- [ ] Weight class indicator NOT visible mid-gameplay (display:none)

## 3. Standing Combat — All Buttons
- [ ] **Jab** (J key / Jab button) → deals damage to enemy
- [ ] **Cross** (K key / Heavy button) → deals damage
- [ ] **Hook** (U key) → deals damage
- [ ] **Low Kick** (N key) → deals damage (if unlocked)
- [ ] **Head Kick** (Space) → deals damage (if unlocked)
- [ ] **Takedown** (L key / Grapple button) → enters ground state OR shows SPRAWL!
- [ ] Cooldown visual shows on buttons after use

## 4. Ground Game — All Buttons
- [ ] Takedown succeeds → ground overlay visible
- [ ] Ground state shows: position label (FULL GUARD etc.)
- [ ] Ground timer bar visible and counting down
- [ ] **G&P** button (Jab in ground) → deals damage
- [ ] **Elbow** button (Heavy in ground) → deals damage
- [ ] **Choke** button (Grapple in ground) → shows submission picker or executes Choke
- [ ] Choke button label is "Choke" NOT "RNC" or "Rear Naked Choke"
- [ ] **Improve** button (Special in ground) → changes position (fullGuard → halfGuard/sideControl)
- [ ] Stand Up button visible and works → exits ground state
- [ ] Ground overlay hides after standup

## 5. Room Navigation — 3 Rooms
- [ ] **Room 1 (Alley Entrance)**: enemies spawn, combat works
- [ ] Kill all enemies → 4 doors visible: left, right, up, down
- [ ] **Right door** → Side Alley (same difficulty, grind)
  - [ ] Player visible in new room (not buried under floor)
  - [ ] Player at depth ≥ 5
  - [ ] Enemies spawn
  - [ ] Can return via left door
- [ ] **Left door** → Back Lot (slightly harder, muay thai)
  - [ ] Same render checks as above
- [ ] **Down door** → Back Street (forward progression)
  - [ ] Same render checks as above
- [ ] **Up door** → Storage Area (boss path, significantly harder)
  - [ ] Same render checks as above

## 6. Visual Spot Check (screenshot each room)
- [ ] Player sprite visible with correct outfit
- [ ] Enemies render with HP bars
- [ ] Floor tiles don't cover player
- [ ] Action cluster buttons show correct labels in standing/ground mode
- [ ] No floating debug text mid-screen

## 7. Error Check
- [ ] `window._errors` empty after full session
- [ ] No `undefined` or `null` crashes in console

---

## Automated Test Coverage (run via browser eval)

The automated smoke test (`SMOKE_TEST` in browser console) covers items 1–5 programmatically.
Items 6–7 require screenshot review.

**Test cadence:** Run full test before every push. Max 1 push per 8 hours.
**Release naming:** `v=N` in index.html cache buster. Increment on every push.
