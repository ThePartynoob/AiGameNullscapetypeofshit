// Upgrades, coins and altar utilities
let playerMoney = 0;
let upgrades = {
    more_money: 0, // max 2
    shield: 0, // max 1
    coin_radar: 0 // max 1
};
let activeAltar = null;
let lastPurificationLevel = -999;

function addCoins(n) {
    playerMoney += n;
    updateMoneyUI();
}

function updateMoneyUI() {
    const el = document.getElementById('moneyDisplay');
    if (!el) return;
    el.textContent = `${playerMoney} 🪙`;
}

function awardCoinsForWin(lvl) {
    // base reward scales slowly with level
    let reward = Math.max(1, Math.floor(lvl / 3));
    try {
        if (activeCurses.medal_goldrush) reward += 2;
        if (activeCurses.medal_barrage) reward += 1;
        if (activeCurses.medal_frenzy) reward += 1;
    } catch (e) {}
    addCoins(reward);
    spawnFloatingText(0, 0, `+${reward} 🪙 (WIN)`, '#f59e0b');
}

function showUpgradeModal(targetLvl) {
    const modal = document.getElementById('choiceModal');
    const title = document.getElementById('modalTitle');
    const sub = document.getElementById('modalSub');
    const container = document.getElementById('choiceContainer');

    title.textContent = `LEVEL ${targetLvl}: SHOP`;
    sub.textContent = `Choose one upgrade to buy (one-time).`;
    container.innerHTML = '';

    const choices = [];
    if (upgrades.more_money < 2 && playerMoney >= 6) choices.push({id: 'more_money', name: 'BANKED INTERFACE', desc: 'Gain +25% coin gains. (Max 2)', cost: 6});
    if (upgrades.shield < 1 && playerMoney >= 8) choices.push({id: 'shield', name: 'ENERGY SHIELD', desc: 'Gain one-time shield that blocks 1 damage.', cost: 8});
    if (upgrades.coin_radar < 1 && playerMoney >= 5) choices.push({id: 'coin_radar', name: 'COIN RADAR', desc: 'Reveal coin hints on HUD and minimap.', cost: 5});

    if (choices.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400 italic">No upgrades available</div>';
        modal.classList.remove('hidden');
        return;
    }

    choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-3 rounded-lg border bg-slate-900 transition-all mb-2';
        btn.innerHTML = `<div class="font-bold">${ch.name} <span class="text-amber-300">${ch.cost}🪙</span></div><div class="text-[11px] text-slate-400">${ch.desc}</div>`;
        btn.addEventListener('click', () => {
            if (playerMoney < ch.cost) {
                playSynthSound('tick_down');
                return;
            }
            playerMoney -= ch.cost;
            upgrades[ch.id] = (upgrades[ch.id] || 0) + 1;
            updateMoneyUI();
            updateAltarUI();
            modal.classList.add('hidden');
            initNewLevel(targetLvl);
        });
        container.appendChild(btn);
    });

    modal.classList.remove('hidden');
}

function spawnAltarForLevel(lvl, candidateTiles = []) {
    // Only spawn altars starting at level 20, max one altar
    if (lvl < 20) { activeAltar = null; updateAltarUI(); return; }
    if (activeAltar && activeAltar.level === lvl) return; // already spawned for this level

    // 30% chance to spawn an altar
    if (Math.random() > 0.30) { activeAltar = null; updateAltarUI(); return; }

    const types = ['purification', 'purgatory'];
    const type = types[Math.floor(Math.random() * types.length)];

    const validTiles = candidateTiles.filter(tile => tile.r !== 0 || tile.c !== 0);
    let chosenPos = null;
    if (validTiles.length > 0) {
        chosenPos = validTiles[Math.floor(Math.random() * validTiles.length)];
    }

    activeAltar = {
        type: type,
        level: lvl,
        pos: chosenPos,
        interacted: false,
        purified: false,
        spawnedAt: Date.now(),
        expiresAt: Date.now() + 60000 // lasts 60s or until used
    };
    updateAltarUI();
}

function updateAltarUI() {
    const el = document.getElementById('altarDisplay');
    if (!el) return;
    if (!activeAltar) {
        el.textContent = 'None';
        return;
    }
    const remaining = Math.max(0, Math.floor((activeAltar.expiresAt - Date.now()) / 1000));
    if (activeAltar.type === 'purification') {
        el.textContent = `Purification (${remaining}s)${activeAltar.interacted ? ' - Activated' : ''}`;
    } else {
        el.textContent = `Purgatory (${remaining}s)${activeAltar.interacted ? ' - Touched' : ''}`;
    }
}

function clearExpiredAltar() {
    if (!activeAltar) return;
    if (Date.now() >= activeAltar.expiresAt) {
        activeAltar = null;
        updateAltarUI();
    }
}

function updateEnemyList() {
    const el = document.getElementById('enemyListDisplay');
    if (!el) return;
    if (typeof selectedEnemies === 'undefined') { el.textContent = '—'; return; }
    const parts = [];
    for (let [k, v] of Object.entries(selectedEnemies)) {
        if (v > 0) parts.push(`${k}: ${v}`);
    }
    if (parts.length === 0) el.textContent = 'None';
    else el.textContent = parts.join(' | ');
}

// Periodic UI tick to keep altar/money displays fresh
setInterval(() => { try { updateAltarUI(); updateMoneyUI(); clearExpiredAltar(); } catch(e){} }, 800);

// Ensure initial UI state
window.addEventListener('load', () => { updateMoneyUI(); updateAltarUI(); updateEnemyList(); });
