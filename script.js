/* ============================================================
   ABISMO ARCANO — SCRIPT.JS
   Expanded card game with bug fixes and new features
   ============================================================ */

// ============================================================
// DATA — Cards & Campaigns
// ============================================================

const allCards = [
    {
        id: 'c1', name: 'Mago do Vazio', type: 'Mago',
        hp: 30, maxHp: 30, atk: 18, def: 5,
        skill: 'Explosão Arcana', skillDesc: 'Ignora toda a defesa do inimigo',
        skillEffect: 'burst',
        img: '🧙'
    },
    {
        id: 'c2', name: 'Cavaleiro de Ônix', type: 'Guerreiro',
        hp: 55, maxHp: 55, atk: 13, def: 18,
        skill: 'Investida Pesada', skillDesc: 'Ataca e ganha escudo por 2 turnos',
        skillEffect: 'shield',
        img: '🗡️'
    },
    {
        id: 'c3', name: 'Arqueira Sombria', type: 'Arqueiro',
        hp: 28, maxHp: 28, atk: 24, def: 4,
        skill: 'Flecha Envenenada', skillDesc: 'Aplica veneno por 3 turnos',
        skillEffect: 'poison',
        img: '🏹'
    },
    {
        id: 'c4', name: 'Necromante', type: 'Mago',
        hp: 38, maxHp: 38, atk: 16, def: 9,
        skill: 'Roubo de Vida', skillDesc: 'Drena HP do inimigo',
        skillEffect: 'drain',
        img: '💀'
    },
    {
        id: 'c5', name: 'Druida da Névoa', type: 'Druida',
        hp: 45, maxHp: 45, atk: 11, def: 14,
        skill: 'Regeneração', skillDesc: 'Regenera HP por 3 turnos',
        skillEffect: 'regen',
        img: '🌿'
    },
    {
        id: 'c6', name: 'Paladina Ardente', type: 'Guerreiro',
        hp: 48, maxHp: 48, atk: 15, def: 16,
        skill: 'Chama Sagrada', skillDesc: 'Aplica queimadura no inimigo',
        skillEffect: 'burn',
        img: '⚜️'
    },
    {
        id: 'c7', name: 'Assassina das Sombras', type: 'Arqueiro',
        hp: 24, maxHp: 24, atk: 28, def: 3,
        skill: 'Golpe Crítico', skillDesc: 'Dano massivo com chance de acerto crítico',
        skillEffect: 'crit',
        img: '🗝️'
    },
    {
        id: 'c8', name: 'Elementalista', type: 'Mago',
        hp: 34, maxHp: 34, atk: 20, def: 7,
        skill: 'Tempestade Arcana', skillDesc: 'Ataca e remove status positivos do inimigo',
        skillEffect: 'storm',
        img: '⚡'
    }
];

const campaigns = [
    {
        id: 'f1',
        name: 'Capítulo I: Os Portões de Ferro',
        desc: 'Um guarda corrompido pela magia sombria barra sua passagem pelas ruínas da antiga fortaleza.',
        icon: '🏰',
        difficulty: 'easy',
        enemyId: 'c2',
        enemyName: 'Guarda Corrompido',
        requiredLevel: 1
    },
    {
        id: 'f2',
        name: 'Capítulo II: A Torre em Ruínas',
        desc: 'Cultistas realizam rituais profanos entre os escombros. Seu líder invoca forças proibidas.',
        icon: '🗼',
        difficulty: 'easy',
        enemyId: 'c4',
        enemyName: 'Cultista Sombrio',
        requiredLevel: 2
    },
    {
        id: 'f3',
        name: 'Capítulo III: Floresta dos Sussurros',
        desc: 'As árvores retorcem em agonia. Uma entidade silvestre tomada pela corrupção domina a floresta.',
        icon: '🌲',
        difficulty: 'medium',
        enemyId: 'c5',
        enemyName: 'Ent Corrompido',
        requiredLevel: 3
    },
    {
        id: 'f4',
        name: 'Capítulo IV: A Forja das Cinzas',
        desc: 'Nas profundezas da montanha, uma forja amaldiçoada cria guerreiros de aço e fogo.',
        icon: '🔥',
        difficulty: 'hard',
        enemyId: 'c6',
        enemyName: 'Paladino das Cinzas',
        requiredLevel: 4
    },
    {
        id: 'f5',
        name: 'Capítulo V: O Cume do Abismo',
        desc: 'O mestre das artes sombrias aguarda no topo. Seu poder deforma a própria realidade.',
        icon: '☠️',
        difficulty: 'boss',
        enemyId: 'c1',
        enemyName: 'Arquimago do Caos',
        requiredLevel: 5
    }
];

// ============================================================
// STATE
// ============================================================

let gameState = {
    playerDeck: [],
    unlockedLevel: 1,
    completedLevels: []
};

let battleState = {
    active: false,
    playerCard: null,
    enemyCard: null,
    turn: 'player',
    level: 0,
    campaignIndex: 0,
    defending: false,
    playerStatuses: [],  // { type, turns }
    enemyStatuses: []
};

let currentFilter = 'all';
let pendingBattle = null;

// ============================================================
// INIT
// ============================================================

window.onload = () => {
    loadProgress();
    renderDeckBuilder();
    renderCampaigns();
    updateNavMeta();
};

// ============================================================
// NAVIGATION
// ============================================================

function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId !== 'battle-arena') {
        battleState.active = false;
    }
}

// ============================================================
// PERSISTENCE
// ============================================================

function loadProgress() {
    try {
        const saved = localStorage.getItem('abismoArcano_v2');
        if (saved) gameState = { ...gameState, ...JSON.parse(saved) };
    } catch(e) { console.warn('Falha ao carregar progresso.'); }
}

function saveProgress() {
    localStorage.setItem('abismoArcano_v2', JSON.stringify(gameState));
}

function updateNavMeta() {
    document.getElementById('nav-level').textContent = gameState.unlockedLevel;
    document.getElementById('nav-deck').textContent = `${gameState.playerDeck.length}/5`;
}

// ============================================================
// DECK BUILDER
// ============================================================

function filterCards(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderDeckBuilder();
}

function renderDeckBuilder() {
    const availableContainer = document.getElementById('available-cards');
    const deckContainer     = document.getElementById('player-deck-view');

    availableContainer.innerHTML = '';
    deckContainer.innerHTML = '';

    const count = gameState.playerDeck.length;
    document.getElementById('deck-count-badge').textContent = `${count} / 5`;
    updateNavMeta();

    // Render deck
    gameState.playerDeck.forEach(cardId => {
        const card = allCards.find(c => c.id === cardId);
        if (!card) return;
        const el = createCardElement(card, () => removeCardFromDeck(card.id));
        el.classList.add('in-deck');
        deckContainer.appendChild(el);
    });

    // Render available (filtered)
    allCards.forEach(card => {
        if (gameState.playerDeck.includes(card.id)) return;
        if (currentFilter !== 'all' && card.type !== currentFilter) return;
        const el = createCardElement(card, () => addCardToDeck(card.id));
        availableContainer.appendChild(el);
    });
}

function addCardToDeck(cardId) {
    if (gameState.playerDeck.length >= 5) {
        showToast('Deck cheio! Máximo de 5 cartas.');
        return;
    }
    if (!gameState.playerDeck.includes(cardId)) {
        gameState.playerDeck.push(cardId);
        renderDeckBuilder();
    }
}

function removeCardFromDeck(cardId) {
    gameState.playerDeck = gameState.playerDeck.filter(id => id !== cardId);
    renderDeckBuilder();
}

function saveDeck() {
    if (gameState.playerDeck.length === 0) {
        showToast('Adicione pelo menos uma carta ao baralho!');
        return;
    }
    saveProgress();
    showToast('✦ Baralho selado com sucesso!', 'success');
}

// ============================================================
// CAMPAIGN MAP
// ============================================================

function renderCampaigns() {
    const list = document.getElementById('campaign-list');
    list.innerHTML = '';

    campaigns.forEach((camp, index) => {
        const levelRequired = camp.requiredLevel;
        const isLocked = levelRequired > gameState.unlockedLevel;
        const isCompleted = gameState.completedLevels.includes(camp.id);

        const div = document.createElement('div');
        div.className = `campaign-item${isLocked ? ' locked' : ''}${isCompleted ? ' completed' : ''}`;

        const diffLabel = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', boss: 'Chefe' }[camp.difficulty] || camp.difficulty;
        const diffClass = `diff-${camp.difficulty}`;

        div.innerHTML = `
            <div class="camp-icon">${camp.icon}</div>
            <div class="camp-info">
                <div class="camp-title">${camp.name}</div>
                <div class="camp-desc">${camp.desc}</div>
            </div>
            <div class="camp-meta">
                <span class="camp-difficulty ${diffClass}">${diffLabel}</span>
                ${isCompleted ? '<span class="camp-difficulty diff-easy">✓ Completo</span>' : ''}
                ${isLocked
                    ? `<button class="danger-btn" disabled>🔒 Bloqueado</button>`
                    : `<button class="cta-btn" onclick="openDeckSelector('${camp.enemyId}', ${index + 1}, '${camp.id}', '${camp.name}')">Enfrentar</button>`
                }
            </div>
        `;
        list.appendChild(div);
    });
}

// ============================================================
// DECK SELECTOR (choose which card to fight with)
// ============================================================

function openDeckSelector(enemyId, level, campId, campName) {
    if (gameState.playerDeck.length === 0) {
        showToast('Monte seu baralho primeiro!');
        navigate('deck-builder');
        return;
    }

    pendingBattle = { enemyId, level, campId, campName };

    const container = document.getElementById('deck-selector-cards');
    container.innerHTML = '';

    gameState.playerDeck.forEach(cardId => {
        const card = allCards.find(c => c.id === cardId);
        if (!card) return;
        const el = createCardElement(card, () => {
            closeDeckSelector();
            startBattle(card.id, pendingBattle);
        });
        container.appendChild(el);
    });

    document.getElementById('deck-selector-overlay').classList.remove('hidden');
}

function closeDeckSelector() {
    document.getElementById('deck-selector-overlay').classList.add('hidden');
}

// ============================================================
// BATTLE SYSTEM
// ============================================================

function startBattle(playerCardId, battleInfo) {
    const { enemyId, level, campId, campName } = battleInfo;

    navigate('battle-arena');
    document.getElementById('log-content').innerHTML = '';
    document.getElementById('battle-title').textContent = campName;

    const playerCardData = allCards.find(c => c.id === playerCardId);
    const enemyCardData  = allCards.find(c => c.id === enemyId);

    // Deep clone with full HP
    battleState = {
        active: true,
        level: level,
        campId: campId,
        turn: 'player',
        defending: false,
        playerStatuses: [],
        enemyStatuses: [],
        playerCard: JSON.parse(JSON.stringify({ ...playerCardData, hp: playerCardData.maxHp })),
        enemyCard:  JSON.parse(JSON.stringify({ ...enemyCardData,  hp: enemyCardData.maxHp }))
    };

    document.getElementById('skill-name-btn').textContent = playerCardData.skill;
    setTurnIndicator('player');
    updateBattleUI();
    disableControls(false);

    addLog(`A batalha começa! ${playerCardData.name} enfrenta ${enemyCardData.name}.`, 'system');
    addLog(`Use Atacar, Habilidade ou Defender para agir.`, 'system');
}

// ---- Player Turn ----

function executePlayerTurn(actionType) {
    if (battleState.turn !== 'player' || !battleState.active) return;

    const player = battleState.playerCard;
    const enemy  = battleState.enemyCard;
    battleState.defending = false;

    if (actionType === 'attack') {
        const def = Math.floor(enemy.def / 2);
        let damage = Math.max(1, player.atk - def);
        damage = applyDamage(enemy, damage);
        animateHit('enemy');
        addLog(`${player.name} ataca! ${damage} de dano causado.`, 'damage');

    } else if (actionType === 'skill') {
        applySkillEffect(player, enemy, 'player');

    } else if (actionType === 'defend') {
        battleState.defending = true;
        addStatus('player', 'shield', 1);
        addLog(`${player.name} assume posição defensiva! +50% de defesa por este turno.`, 'buff');
    }

    // Process player statuses (end of turn)
    processStatusEffects('player');

    updateBattleUI();
    if (!checkBattleEnd()) {
        battleState.turn = 'enemy';
        setTurnIndicator('enemy');
        disableControls(true);
        setTimeout(executeEnemyTurn, 1400);
    }
}

// ---- Enemy Turn ----

function executeEnemyTurn() {
    if (!battleState.active) return;

    const enemy  = battleState.enemyCard;
    const player = battleState.playerCard;

    const useSkill = Math.random() > 0.65;

    if (useSkill) {
        applySkillEffect(enemy, player, 'enemy');
    } else {
        let defMult = battleState.defending ? 1.5 : 1;
        const def = Math.floor(player.def * defMult);
        let damage = Math.max(1, enemy.atk - Math.floor(def / 2));
        damage = applyDamage(player, damage);
        animateHit('player');
        addLog(`${enemy.name} ataca! ${damage} de dano recebido.`, 'enemy');
    }

    // Process enemy statuses (end of turn)
    processStatusEffects('enemy');
    battleState.defending = false;

    updateBattleUI();
    if (!checkBattleEnd()) {
        battleState.turn = 'player';
        setTurnIndicator('player');
        disableControls(false);
    }
}

// ---- Damage Application ----

function applyDamage(card, amount) {
    amount = Math.round(amount);
    card.hp = Math.max(0, card.hp - amount);
    return amount;
}

function applyHeal(card, amount) {
    amount = Math.round(amount);
    card.hp = Math.min(card.maxHp, card.hp + amount);
    return amount;
}

// ---- Skill Effects ----

function applySkillEffect(attacker, defender, side) {
    const effect = attacker.skillEffect;
    const isPlayer = side === 'player';
    const defSide = isPlayer ? 'enemy' : 'player';
    const atkSide = side;

    addLog(`${attacker.name} usa [${attacker.skill}]!`, 'system');

    switch(effect) {
        case 'burst': {
            // Ignore defense
            const dmg = applyDamage(defender, attacker.atk + 6);
            animateHit(defSide);
            addLog(`Explosão Arcana! ${dmg} de dano ignorando defesa!`, 'damage');
            break;
        }
        case 'shield': {
            const dmg2 = applyDamage(defender, Math.max(1, attacker.atk - Math.floor(defender.def / 2)));
            animateHit(defSide);
            addStatus(atkSide, 'shield', 2);
            addLog(`Investida! ${dmg2} de dano + Escudo por 2 turnos!`, 'buff');
            break;
        }
        case 'poison': {
            const dmg3 = applyDamage(defender, Math.max(1, attacker.atk - 4));
            animateHit(defSide);
            addStatus(defSide, 'poison', 3);
            addLog(`Flecha Envenenada! ${dmg3} de dano + Veneno por 3 turnos!`, 'damage');
            break;
        }
        case 'drain': {
            const drainAmt = Math.round(attacker.atk * 0.9);
            applyDamage(defender, drainAmt);
            const healed = applyHeal(attacker, Math.round(drainAmt * 0.6));
            animateHit(defSide);
            addLog(`Roubo de Vida! Causou ${drainAmt} de dano e recuperou ${healed} HP.`, 'heal');
            break;
        }
        case 'regen': {
            addStatus(atkSide, 'regen', 3);
            addLog(`Regeneração ativada! Recupera HP por 3 turnos.`, 'heal');
            break;
        }
        case 'burn': {
            const dmg4 = applyDamage(defender, Math.max(1, attacker.atk - Math.floor(defender.def / 2)));
            animateHit(defSide);
            addStatus(defSide, 'burn', 3);
            addLog(`Chama Sagrada! ${dmg4} de dano + Queimadura por 3 turnos!`, 'damage');
            break;
        }
        case 'crit': {
            const isCrit = Math.random() > 0.3;
            const mult = isCrit ? 2.2 : 1.5;
            const dmg5 = applyDamage(defender, Math.round(attacker.atk * mult));
            animateHit(defSide);
            addLog(`Golpe ${isCrit ? 'CRÍTICO' : 'Poderoso'}! ${dmg5} de dano!`, 'damage');
            break;
        }
        case 'storm': {
            const dmg6 = applyDamage(defender, attacker.atk + 4);
            animateHit(defSide);
            // Remove positive statuses from enemy
            const defStatuses = isPlayer ? battleState.enemyStatuses : battleState.playerStatuses;
            const before = defStatuses.length;
            if (isPlayer) battleState.enemyStatuses = defStatuses.filter(s => s.type !== 'shield' && s.type !== 'regen');
            else          battleState.playerStatuses = defStatuses.filter(s => s.type !== 'shield' && s.type !== 'regen');
            const removed = before - (isPlayer ? battleState.enemyStatuses.length : battleState.playerStatuses.length);
            addLog(`Tempestade Arcana! ${dmg6} de dano${removed ? ' e buffs removidos!' : '!'}`, 'damage');
            break;
        }
        default: {
            const dmg7 = applyDamage(defender, attacker.atk + 5);
            animateHit(defSide);
            addLog(`${dmg7} de dano direto!`, 'damage');
        }
    }
}

// ---- Status Effects ----

function addStatus(side, type, turns) {
    const arr = side === 'player' ? battleState.playerStatuses : battleState.enemyStatuses;
    const existing = arr.find(s => s.type === type);
    if (existing) { existing.turns = turns; return; }
    arr.push({ type, turns });
}

function processStatusEffects(side) {
    const isPlayer = side === 'player';
    const card = isPlayer ? battleState.playerCard : battleState.enemyCard;
    const statuses = isPlayer ? battleState.playerStatuses : battleState.enemyStatuses;

    statuses.forEach((status, i) => {
        if (status.type === 'poison') {
            const dmg = Math.max(3, Math.round(card.maxHp * 0.07));
            card.hp = Math.max(0, card.hp - dmg);
            addLog(`Veneno causou ${dmg} de dano em ${card.name}.`, 'damage');
        } else if (status.type === 'burn') {
            const dmg = Math.max(2, Math.round(card.maxHp * 0.05));
            card.hp = Math.max(0, card.hp - dmg);
            addLog(`Queimadura causou ${dmg} de dano em ${card.name}.`, 'damage');
        } else if (status.type === 'regen') {
            const heal = Math.max(4, Math.round(card.maxHp * 0.08));
            card.hp = Math.min(card.maxHp, card.hp + heal);
            addLog(`${card.name} regenerou ${heal} de HP.`, 'heal');
        }
        status.turns--;
    });

    // Clean expired statuses
    if (isPlayer) battleState.playerStatuses = statuses.filter(s => s.turns > 0);
    else          battleState.enemyStatuses  = statuses.filter(s => s.turns > 0);
}

// ============================================================
// BATTLE END CHECK
// ============================================================

function checkBattleEnd() {
    if (battleState.enemyCard.hp <= 0) {
        battleState.active = false;
        disableControls(true);
        addLog(`VITÓRIA! ${battleState.playerCard.name} foi vitorioso!`, 'system');

        const campId = battleState.campId;
        const campLevel = battleState.level;

        if (!gameState.completedLevels.includes(campId)) {
            gameState.completedLevels.push(campId);
        }
        if (gameState.unlockedLevel === campLevel) {
            gameState.unlockedLevel++;
            addLog(`Novo capítulo desbloqueado!`, 'system');
        }

        saveProgress();
        updateNavMeta();

        setTimeout(() => {
            showResult('victory', '⚜️ Vitória!', `${battleState.playerCard.name} prevaleceu sobre as trevas. O caminho se abre.`);
        }, 800);

        return true;
    }

    if (battleState.playerCard.hp <= 0) {
        battleState.active = false;
        disableControls(true);
        addLog(`DERROTA! ${battleState.playerCard.name} foi derrotado.`, 'damage');

        setTimeout(() => {
            showResult('defeat', '💀 Derrota', `As trevas te consumiram. Fortaleça seu baralho e tente novamente.`);
        }, 800);

        return true;
    }

    return false;
}

// ============================================================
// UI UPDATES
// ============================================================

function updateBattleUI() {
    const p = battleState.playerCard;
    const e = battleState.enemyCard;

    // Names
    document.getElementById('player-name').textContent = p.name;
    document.getElementById('enemy-name').textContent  = e.name;

    // HP bars
    updateHPBar('player', p.hp, p.maxHp);
    updateHPBar('enemy',  e.hp, e.maxHp);

    // Cards
    document.getElementById('battle-player-card').innerHTML = '';
    document.getElementById('battle-enemy-card').innerHTML  = '';

    const playerEl = createCardElement(p);
    playerEl.classList.add('battle-mode');
    document.getElementById('battle-player-card').appendChild(playerEl);

    const enemyEl = createCardElement(e);
    enemyEl.classList.add('battle-mode');
    document.getElementById('battle-enemy-card').appendChild(enemyEl);

    // Status chips
    renderStatusChips('player', battleState.playerStatuses);
    renderStatusChips('enemy',  battleState.enemyStatuses);
}

function updateHPBar(side, hp, maxHp) {
    const pct = Math.max(0, Math.round((hp / maxHp) * 100));
    const bar  = document.getElementById(`${side}-hp-bar`);
    const text = document.getElementById(`${side}-hp-text`);

    bar.style.width = pct + '%';
    text.textContent = `${Math.max(0, hp)} / ${maxHp}`;

    // Color shift
    if (pct > 60) {
        bar.style.background = side === 'player'
            ? 'linear-gradient(90deg, #1a7a4a, #2ec47a)'
            : 'linear-gradient(90deg, #8b1a2a, #c0392b)';
    } else if (pct > 30) {
        bar.style.background = 'linear-gradient(90deg, #7a5a1a, #c49a2a)';
    } else {
        bar.style.background = 'linear-gradient(90deg, #8b1a2a, #c0392b)';
    }
}

function renderStatusChips(side, statuses) {
    const container = document.getElementById(`${side}-status`);
    container.innerHTML = '';

    const labels = {
        poison: { label: '☠ Veneno', cls: 'status-poison' },
        shield: { label: '🛡 Escudo', cls: 'status-shield' },
        burn:   { label: '🔥 Queimado', cls: 'status-burn' },
        regen:  { label: '💚 Regen', cls: 'status-regen' }
    };

    statuses.forEach(status => {
        const meta = labels[status.type];
        if (!meta) return;
        const chip = document.createElement('span');
        chip.className = `status-chip ${meta.cls}`;
        chip.textContent = `${meta.label} (${status.turns})`;
        container.appendChild(chip);
    });
}

function disableControls(disabled) {
    document.getElementById('btn-attack').disabled = disabled;
    document.getElementById('btn-skill').disabled  = disabled;
    document.getElementById('btn-defend').disabled = disabled;
}

function setTurnIndicator(turn) {
    const el = document.getElementById('turn-indicator');
    if (turn === 'player') {
        el.textContent = 'Seu Turno';
        el.className = 'turn-indicator player-turn';
    } else {
        el.textContent = 'Inimigo...';
        el.className = 'turn-indicator enemy-turn';
    }
}

// ============================================================
// ANIMATIONS
// ============================================================

function animateHit(side) {
    const slotId = side === 'player' ? 'battle-player-card' : 'battle-enemy-card';
    const card = document.querySelector(`#${slotId} .card`);
    if (!card) return;

    card.classList.remove('shake', 'hit');
    void card.offsetWidth; // reflow
    card.classList.add('shake', 'hit');
    card.addEventListener('animationend', () => card.classList.remove('shake', 'hit'), { once: true });
}

// ============================================================
// BATTLE LOG
// ============================================================

function addLog(text, type = '') {
    const container = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry${type ? ' ' + type : ''}`;
    entry.textContent = `› ${text}`;
    container.prepend(entry);
}

// ============================================================
// RESULT OVERLAY
// ============================================================

function showResult(type, title, msg) {
    const overlay = document.getElementById('result-overlay');
    document.getElementById('result-icon').textContent = type === 'victory' ? '🏆' : '💀';
    const titleEl = document.getElementById('result-title');
    titleEl.textContent = title;
    titleEl.className = `result-title ${type}`;
    document.getElementById('result-msg').textContent = msg;
    overlay.classList.remove('hidden');
}

function closeResult() {
    document.getElementById('result-overlay').classList.add('hidden');
    navigate('campaign-map');
    renderCampaigns();
    updateNavMeta();
}

// ============================================================
// FLEE
// ============================================================

function confirmFlee() {
    if (!battleState.active) { navigate('campaign-map'); return; }
    if (confirm('Tem certeza que quer fugir? Você perderá a batalha.')) {
        battleState.active = false;
        navigate('campaign-map');
    }
}

// ============================================================
// CARD ELEMENT FACTORY
// ============================================================

function createCardElement(cardData, onClickFn = null) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.type = cardData.type;

    if (onClickFn) card.onclick = onClickFn;

    // HP for display (current vs max)
    const displayHp = cardData.hp !== undefined ? cardData.hp : cardData.maxHp;

    card.innerHTML = `
        <div class="card-banner"></div>
        <div class="card-name">${cardData.name}</div>
        <div class="card-type">${cardData.type}</div>
        <div class="card-img-placeholder">${cardData.img}</div>
        <div class="card-skill">${cardData.skill}</div>
        <div class="card-stats">
            <div class="stat stat-atk" title="Ataque">
                <span>${cardData.atk}</span>
                <span class="stat-label">ATK</span>
            </div>
            <div class="stat stat-hp" title="Vida">
                <span>${displayHp}</span>
                <span class="stat-label">HP</span>
            </div>
            <div class="stat stat-def" title="Defesa">
                <span>${cardData.def}</span>
                <span class="stat-label">DEF</span>
            </div>
        </div>
    `;

    return card;
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: type === 'success' ? 'rgba(26,122,74,0.95)' : 'rgba(12,9,20,0.95)',
        color: type === 'success' ? '#2ec47a' : '#e8dfc4',
        border: `1px solid ${type === 'success' ? 'rgba(46,196,122,0.4)' : 'rgba(184,144,58,0.3)'}`,
        padding: '0.7rem 1.5rem',
        borderRadius: '4px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.78rem',
        fontWeight: '700',
        zIndex: '200',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
