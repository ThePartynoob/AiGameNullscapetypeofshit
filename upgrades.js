// Upgrades, coins and altar utilities
let playerMoney = 0;
let upgrades = {
    more_money: 0,      // max 2
    shield: 0,          // max 1
    coin_radar: 0,      // max 1
    coin_magnet: 0,     // max 5
    more_speed: 0,      // max 3
    extra_hp: 0,        // max 5
    curse_choices: 0,   // max 2 
    greater_choices: 0, // max 1 
    coin_luck: 0        // max 15 (NEW recursive coin luck)
};
let activeAltar = null;

function addCoins(n) {
    // Allows positive or negative values (debt)
    playerMoney += n;
    updateMoneyUI();
}

function updateMoneyUI() {
    const el = document.getElementById('moneyDisplay');
    if (!el) return;
    if (playerMoney < 0) {
        el.textContent = `${playerMoney} 🪙 (DEBT)`;
        el.style.color = "#ef4444";
    } else {
        el.textContent = `${playerMoney} 🪙`;
        el.style.color = "#fbbf24";
    }
}

function awardCoinsForWin(lvl) {
    let baseReward = Math.max(1, Math.floor(lvl / 3));
    
    // Apply 3x multiplier if Purgatory Altar was activated this level
    if (activeAltar && activeAltar.type === 'purgatory' && activeAltar.interacted) {
        baseReward *= 3;
    }

    // Apply +15% from Greed's Toll Curse
    if (typeof activeCurses !== 'undefined' && activeCurses.curse_greed_toll) {
        baseReward = Math.floor(baseReward * 1.15);
    }

    try {
        if (activeCurses.medal_goldrush) baseReward += 2 * activeCurses.medal_goldrush;
        if (activeCurses.medal_barrage) baseReward += 1 * activeCurses.medal_barrage;
        if (activeCurses.medal_frenzy) baseReward += 1 * activeCurses.medal_frenzy;
    } catch (e) {}

    addCoins(baseReward);
    if (typeof spawnFloatingText === 'function' && typeof playerPos !== 'undefined') {
        spawnFloatingText(playerPos.r, playerPos.c, `+${baseReward} 🪙`, '#f59e0b');
    }
}

function showUpgradeModal(targetLvl, next) {
    const modal = document.getElementById('choiceModal');
    const title = document.getElementById('modalTitle');
    const sub = document.getElementById('modalSub');
    const container = document.getElementById('choiceContainer');

    if (title) title.textContent = `LEVEL ${targetLvl}: SHOP`;
    if (sub) sub.textContent = `Purchase as many upgrades as you want. Click 'CONTINUE' when finished.`;

    function renderShopChoices() {
        if (!container) return;
        container.innerHTML = '';

        // Upgrades pricing config (including exponential multipliers)
        const costMoreMoney = 15 + (upgrades.more_money || 0) * 10;
        const costShield = 20;
        const costCoinRadar = 12;
        const costCoinMagnet = 10 + (upgrades.coin_magnet || 0) * 6;
        const costMoreSpeed = 15 + (upgrades.more_speed || 0) * 10;
        const costExtraHp = 75 * Math.pow(2, (upgrades.extra_hp || 0)); 
        const costCurseChoices = 100;
        const costGreaterChoices = 150;
        const costCoinLuck = Math.floor(200 * Math.pow(1.5, (upgrades.coin_luck || 0)));

        const choices = [];
        
        if ((upgrades.more_money || 0) < 2) {
            choices.push({id: 'more_money', name: 'BANKED INTERFACE', desc: `Gain +25% coin gains. (${upgrades.more_money}/2)`, cost: costMoreMoney});
        }
        if ((upgrades.shield || 0) < 1) {
            choices.push({id: 'shield', name: 'ENERGY SHIELD', desc: 'Blocks 1 hit of damage. Rebuyable if lost.', cost: costShield});
        }
        if ((upgrades.coin_radar || 0) < 1) {
            choices.push({id: 'coin_radar', name: 'COIN RADAR', desc: 'Reveal hidden coin indicators on the HUD compass.', cost: costCoinRadar});
        }
        if ((upgrades.coin_magnet || 0) < 5) {
            choices.push({id: 'coin_magnet', name: 'COIN MAGNET', desc: `Pull nearby coins towards you magnetically. (${upgrades.coin_magnet}/5)`, cost: costCoinMagnet});
        }
        if ((upgrades.more_speed || 0) < 3) {
            choices.push({id: 'more_speed', name: 'OVERCLOCK SPEED', desc: `Permanently increase movement speed. (${upgrades.more_speed}/3)`, cost: costMoreSpeed});
        }
        if ((upgrades.extra_hp || 0) < 5) {
            choices.push({id: 'extra_hp', name: 'VITALITY CORE', desc: `Gain +1 Max HP capacity container. (${upgrades.extra_hp}/5)`, cost: costExtraHp});
        }
        if ((upgrades.curse_choices || 0) < 2) {
            choices.push({id: 'curse_choices', name: 'CURSE EXPANSION', desc: `Offers +1 standard curse choice card slot. (${upgrades.curse_choices}/2)`, cost: costCurseChoices});
        }
        if ((upgrades.greater_choices || 0) < 1) {
            choices.push({id: 'greater_choices', name: 'GREATER VISION', desc: `Offers +1 GREATER curse choice card slot. (${upgrades.greater_choices}/1)`, cost: costGreaterChoices});
        }
        if ((upgrades.coin_luck || 0) < 15) {
            choices.push({id: 'coin_luck', name: 'LUCKY CASCADE', desc: `+1% base chance per tier to recursively trigger extra coin gains. (${upgrades.coin_luck}/15)`, cost: costCoinLuck});
        }

        choices.forEach(ch => {
            const btn = document.createElement('button');
            const canAfford = playerMoney >= ch.cost;
            
            btn.className = `w-full text-left p-3 rounded-lg border bg-slate-900 transition-all mb-2 flex justify-between items-center ${
                canAfford ? 'border-slate-700 hover:bg-slate-800 cursor-pointer' : 'border-slate-800 opacity-40 cursor-not-allowed'
            }`;
            
            btn.innerHTML = `
                <div class="flex-1">
                    <div class="font-bold text-slate-200 text-sm">${ch.name}</div>
                    <div class="text-[11px] text-slate-400">${ch.desc}</div>
                </div>
                <div class="font-bold text-sm min-w-[60px] text-right ${canAfford ? 'text-amber-300' : 'text-red-400'}">
                    ${ch.cost}🪙
                </div>
            `;
            
            btn.addEventListener('click', () => {
                if (playerMoney < ch.cost) return;
                playerMoney -= ch.cost;
                upgrades[ch.id] = (upgrades[ch.id] || 0) + 1;
                
                if (ch.id === 'extra_hp' && typeof maxHealth !== 'undefined') {
                    maxHealth = 5 + upgrades.extra_hp;
                    if (typeof playerHealth !== 'undefined') playerHealth = Math.min(maxHealth, playerHealth + 1);
                    if (typeof updateHealthUI === 'function') updateHealthUI();
                }
                
                updateMoneyUI();
                renderShopChoices();
            });
            container.appendChild(btn);
        });

        const continueBtn = document.createElement('button');
        continueBtn.className = 'w-full text-center p-3 mt-4 rounded-lg border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold tracking-wider hover:bg-emerald-900/60 transition-all cursor-pointer';
        continueBtn.textContent = 'CONTINUE TO NEXT LEVEL ➔';
        continueBtn.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
            
            if (activeAltar && activeAltar.type === 'purification' && activeAltar.interacted) {
                activeAltar = null;
                showPurificationModal(targetLvl, next);
            } else {
                activeAltar = null;
                if (typeof next === 'function') next();
                else if (typeof initNewLevel === 'function') initNewLevel(targetLvl);
            }
        });
        container.appendChild(continueBtn);
    }

    renderShopChoices();
    if (modal) modal.classList.remove('hidden');
}

function showPurificationModal(targetLvl, next) {
    const modal = document.getElementById('choiceModal');
    const title = document.getElementById('modalTitle');
    const sub = document.getElementById('modalSub');
    const container = document.getElementById('choiceContainer');

    if (title) title.textContent = `ALTAR: PURIFICATION`;
    if (sub) sub.textContent = `Choose one curse to purge. You can go into debt, but an extra permanent enemy will bypass wave security to track you!`;

    if (container) {
        container.innerHTML = '';

        const activeCurseKeys = [];
        if (typeof activeCurses !== 'undefined') {
            for (let key in activeCurses) {
                if (activeCurses[key]) {
                    let cost = 30; 
                    if (key.includes('medal')) cost = 60;
                    if (key.includes('greater') || key.includes('lap2')) cost = 85; 
                    if (key === 'curse_greed_toll') cost = 45;

                    activeCurseKeys.push({ id: key, name: key.replace(/_/g, ' ').toUpperCase(), cost: cost });
                }
            }
        }

        if (activeCurseKeys.length === 0) {
            const fallbackText = document.createElement('div');
            fallbackText.className = 'text-center text-xs text-slate-400 italic p-4';
            fallbackText.textContent = 'You carry no current active curses to purify.';
            container.appendChild(fallbackText);
        } else {
            activeCurseKeys.forEach(curse => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left p-3 rounded-lg border border-purple-900 bg-slate-950 hover:bg-purple-950/40 transition-all mb-2 flex justify-between items-center cursor-pointer';
                
                btn.innerHTML = `
                    <div>
                        <div class="font-bold text-purple-300 text-xs tracking-wide">${curse.name}</div>
                        <div class="text-[10px] text-slate-400">Purge curse structure + Spawns 1 extra persistent tracker.</div>
                    </div>
                    <div class="font-bold text-sm text-purple-400">${curse.cost}🪙</div>
                `;

                btn.addEventListener('click', () => {
                    playerMoney -= curse.cost;
                    
                    if (typeof activeCurses[curse.id] === 'number') {
                        activeCurses[curse.id] = 0;
                    } else {
                        activeCurses[curse.id] = false;
                    }
                    updateMoneyUI();

                    if (typeof forceSpawnPersistentBypassEnemy === 'function') {
                        forceSpawnPersistentBypassEnemy();
                    }

                    if (modal) modal.classList.add('hidden');
                    if (typeof next === 'function') next();
                    else if (typeof initNewLevel === 'function') initNewLevel(targetLvl);
                });
                container.appendChild(btn);
            });
        }

        const skipBtn = document.createElement('button');
        skipBtn.className = 'w-full text-center p-2 mt-2 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800 transition-all cursor-pointer';
        skipBtn.textContent = 'Decline Purification (Keep Curses)';
        skipBtn.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
            if (typeof next === 'function') next();
            else if (typeof initNewLevel === 'function') initNewLevel(targetLvl);
        });
        container.appendChild(skipBtn);
    }

    if (modal) modal.classList.remove('hidden');
}

function spawnAltarForLevel(lvl, altarTiles) {
    if (lvl < 20 || lvl % 2 !== 0) { 
        activeAltar = null; 
        updateAltarUI(); 
        return; 
    }
    
    // Altar coordinate fix: Map them explicitly onto verified grid tile structures
    if (!altarTiles || altarTiles.length === 0) return;
    const tile = altarTiles[Math.floor(Math.random() * altarTiles.length)];

    activeAltar = {
        type: Math.random() < 0.5 ? 'purification' : 'purgatory',
        level: lvl,
        pos: { r: tile.r, c: tile.c },
        interacted: false
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
    if (activeAltar.interacted) {
        el.textContent = `${activeAltar.type.toUpperCase()} (ACTIVATED)`;
    } else {
        el.textContent = `${activeAltar.type.toUpperCase()} AVAILABLE IN WORLD`;
    }
}

function updateEnemyList() {
    const el = document.getElementById('enemyListDisplay');
    if (!el) return;
    if (typeof enemies === 'undefined') { el.textContent = '—'; return; }
    
    let standardCount = 0;
    let tempCount = 0;
    
    enemies.forEach(e => {
        if (e.isTemporary) tempCount++;
        else standardCount++;
    });
    
    el.innerHTML = `<span style="color: #e2e8f0">Standard: ${standardCount}</span> | <span style="color: #22d3ee; opacity: 0.8">Ghost/Temp: ${tempCount}</span>`;
}

setInterval(() => { try { updateAltarUI(); updateMoneyUI(); updateEnemyList(); } catch(e){} }, 800);
window.addEventListener('load', () => { updateMoneyUI(); updateAltarUI(); updateEnemyList(); });