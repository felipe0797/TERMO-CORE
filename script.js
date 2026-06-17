/* 
   TERMO PRO v4.0 - DESIGN DE SUCESSO E DOPAMINA
   Motor de Sorteio Inteligente + Cards Premium + Loja Aprimorada
*/

// ============================================================
//  CONFIGURAÇÕES E ESTADO GLOBAL
// ============================================================
let currentUser     = null;
let currentUserSupabaseId = null; // ID do usuário no Supabase
let userStats       = {};
let gameInProgress  = false;
let currentGame     = null;
let globalDifficulty = 'NORMAL'; // EASY, NORMAL, HARD

// Forçar a dificuldade padrão ao carregar
window.addEventListener('DOMContentLoaded', async () => {
    globalDifficulty = 'NORMAL';
    updateDifficultyUI();
    
    // Inicializar Supabase
    initSupabase();
    
    // Verificar se usuário já está autenticado
    const user = await getCurrentUser();
    if (user) {
        currentUser = user.email;
        currentUserSupabaseId = user.id;
        const stats = await loadUserStatsFromSupabase(user.id);
        if (stats) {
            userStats = stats;
            showScreen('main');
            updateSidebar();
        }
    }
});
let isAdmin         = false;
let authMode        = 'login';

const SHOP_ITEMS = [
    { id: 'theme_neon', type: 'theme', name: 'Neon Night', desc: 'Visual futurista com glow azul.', price: 500, icon: '🌀' },
    { id: 'theme_dark', type: 'theme', name: 'Deep Dark', desc: 'Preto absoluto para os olhos.', price: 300, icon: '🌑' },
    { id: 'avatar_king', type: 'avatar', name: 'Coroa de Rei', desc: 'Ícone de coroa no seu perfil.', price: 1000, icon: '👑' },
    { id: 'avatar_ninja', type: 'avatar', name: 'Ninja', desc: 'Ícone de ninja furtivo.', price: 800, icon: '🥷' }
];

const TROPHIES_DEF = [
    { id: 'win_1', name: 'Primeira Vitória', desc: 'Vença sua primeira partida em qualquer modo.', icon: '🎯', reward: 50, check: (s) => (s['5_LETTERS'].wins + s['7_LETTERS'].wins + s['SURVIVAL'].wins + s['AVALANCHE'].wins) >= 1 },
    { id: 'perfect_5l', name: 'Perfeição 5L', desc: 'Complete o modo 5 Letras sem errar nenhuma etapa.', icon: '💎', reward: 200, check: (s) => s.perfectGames5L >= 1 },
    { id: 'perfect_7l', name: 'Perfeição 7L', desc: 'Complete o modo 7 Letras sem errar nenhuma etapa.', icon: '💍', reward: 300, check: (s) => s.perfectGames7L >= 1 },
    { id: 'survival_20', name: 'Sobrevivente Elite', desc: 'Chegue à rodada 20 no modo Sobrevivência.', icon: '🛡️', reward: 150, check: (s) => s.bestSurvivalRound >= 20 },
    { id: 'avalanche_10', name: 'Escalador Supremo', desc: 'Chegue à fase 10 no modo Avalanche.', icon: '🏔️', reward: 250, check: (s) => s.bestAvalanchePhase >= 10 },
    { id: 'level_10', name: 'Veterano Nível 10', desc: 'Alcance o nível 10.', icon: '⭐', reward: 500, check: (s, lvl) => lvl >= 10 },
    { id: 'rich', name: 'Tio Patinhas', desc: 'Acumule 10.000 moedas.', icon: '💰', reward: 100, check: (s, lvl, coins) => coins >= 10000 }
];

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth-pin').addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAuth();
    });
    document.getElementById('auth-user').addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('auth-pin').focus();
    });
    document.addEventListener('keydown', handlePhysicalKeyboard);
    showScreen('login');
    injectMobileMenuButton();
});

function injectMobileMenuButton() {
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.innerHTML = '☰';
    btn.onclick = toggleMobileSidebar;
    btn.className = 'mobile-menu-btn';

    const headers = document.querySelectorAll('.main-header');
    headers.forEach(h => {
        const existing = h.querySelector('.mobile-menu-btn');
        if (!existing) h.prepend(btn.cloneNode(true));
    });
    document.querySelectorAll('.mobile-menu-btn').forEach(b => {
        b.onclick = toggleMobileSidebar;
    });
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

// ============================================================
//  TECLADO FÍSICO
// ============================================================
function handlePhysicalKeyboard(event) {
    if (!gameInProgress || !currentGame) return;

    const key = event.key.toUpperCase();

    if (/^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÀÈÌÒÙÇ]$/.test(event.key.toUpperCase()) && event.key.length === 1) {
        event.preventDefault();
        handleInput(key);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        submitAttempt();
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleDelete();
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentGame.selectedFieldIndex > 0) {
            currentGame.selectedFieldIndex--;
            renderGame();
        }
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentGame.selectedFieldIndex < currentGame.wordLength - 1) {
            currentGame.selectedFieldIndex++;
            renderGame();
        }
    }
}

// ============================================================
//  AUTENTICAÇÃO
// ============================================================
function toggleAuthMode() {
    authMode = (authMode === 'login' ? 'register' : 'login');
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
    
    ['auth-user','auth-pin','reg-user','reg-pin','reg-pin-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

async function handleRegister() {
    const email = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pin').value.trim();
    const passwordConfirm = document.getElementById('reg-pin-confirm').value.trim();
    const username = email.split('@')[0];

    if (!email || !email.includes('@')) { showToast('Email inválido', 'error'); return; }
    if (password.length < 6) { showToast('Senha deve ter pelo menos 6 caracteres', 'error'); return; }
    if (password !== passwordConfirm) { showToast('Senhas não conferem', 'error'); return; }

    showToast('Criando conta...', 'info');
    const result = await registerUser(email, password, username);

    if (result.error) {
        showToast(`❌ Erro: ${result.error}`, 'error');
        return;
    }

    showToast(`✅ Conta criada! Faça login para continuar.`, 'success');
    setTimeout(toggleAuthMode, 1200);
}

async function handleAuth() {
    const email = document.getElementById('auth-user').value.trim();
    const password = document.getElementById('auth-pin').value.trim();

    if (!email || !password) {
        showToast('Preencha email e senha', 'error');
        return;
    }

    showToast('Autenticando...', 'info');
    const result = await loginUser(email, password);

    if (result.error) {
        showToast(`❌ Erro: ${result.error}`, 'error');
        return;
    }

    currentUser = email;
    currentUserSupabaseId = result.user.id;
    
    const stats = await loadUserStatsFromSupabase(result.user.id);
    if (stats) {
        userStats = stats;
    } else {
        userStats = createEmptyStats();
    }
    
    showToast(`✅ Bem-vindo, ${email}!`, 'success');
    showScreen('main');
    updateSidebar();

    const resetBtn = document.getElementById('reset-btn');
    const hackBtn = document.getElementById('hack-btn');
    if (resetBtn) resetBtn.classList.toggle('hidden', !isAdmin);
    if (hackBtn) hackBtn.classList.toggle('hidden', !isAdmin);
}

async function logout() {
    if (!confirm('Deseja sair?')) return;
    
    await logoutUser();
    
    currentUser    = null;
    currentUserSupabaseId = null;
    userStats      = {};
    gameInProgress = false;
    currentGame    = null;
    showScreen('login');
}

// ============================================================
//  ESTATÍSTICAS E XP
// ============================================================
function createEmptyStats(isInitialAdmin = false) {
    return {
        xp: isInitialAdmin ? 100 : 0,
        coins: isInitialAdmin ? 100000 : 0,
        totalGames: 0,
        winStreak: 0,
        unlockedTrophies: [],
        ownedItems: [],
        activeTheme: 'theme_dark',
        activeAvatar: null,
        '5_LETTERS': { wins: 0, losses: 0 },
        '7_LETTERS': { wins: 0, losses: 0 },
        'SURVIVAL':  { wins: 0, losses: 0 },
        'AVALANCHE': { wins: 0, losses: 0 },
        perfectGames5L: 0,
        perfectGames7L: 0,
        bestSurvivalRound: 0,
        bestAvalanchePhase: 0,
        survivalLivesBought: 0
    };
}

function loadUserStats() {
    const saved = localStorage.getItem(`termo_user_${currentUser}`);
    if (saved) {
        userStats = JSON.parse(saved);
        if (!userStats.unlockedTrophies) userStats.unlockedTrophies = [];
        if (!userStats.ownedItems) userStats.ownedItems = [];
        if (userStats.coins === undefined) userStats.coins = 0;
    } else {
        userStats = createEmptyStats();
        saveUserStats();
    }
}

async function saveUserStats() {
    if (currentUser && currentUserSupabaseId) {
        await saveUserStatsToSupabase(currentUserSupabaseId, userStats);
    } else if (currentUser) {
        localStorage.setItem(`termo_user_${currentUser}`, JSON.stringify(userStats));
    }
}

function getLevelInfo(xp) {
    const level = Math.floor(Math.pow(xp / 100, 1/1.5)) || 1;
    const currentLevelXP = Math.round(100 * Math.pow(level, 1.5));
    const nextLevelXP    = Math.round(100 * Math.pow(level + 1, 1.5));
    const progressXP     = xp - currentLevelXP;
    const neededXP       = nextLevelXP - currentLevelXP;
    return { level, progressXP, neededXP, nextLevelXP };
}

function updateSidebar() {
    const info = getLevelInfo(userStats.xp);
    
    const userNameEl = document.getElementById('sidebar-username');
    const levelEl = document.getElementById('sidebar-level-badge');
    const coinsEl = document.getElementById('sidebar-coins-value');
    const xpFillEl = document.getElementById('sidebar-xp-bar');
    const xpTextEl = document.querySelector('.xp-label-row');
    const avatarEl = document.getElementById('sidebar-avatar');

    if (userNameEl) userNameEl.textContent = currentUser;
    if (levelEl) levelEl.textContent = `Nível ${info.level}`;
    if (coinsEl) coinsEl.textContent = userStats.coins;
    
    if (xpFillEl) {
        const xpPercent = Math.min(100, (info.progressXP / info.neededXP) * 100);
        xpFillEl.style.width = `${xpPercent}%`;
    }
    if (xpTextEl) xpTextEl.innerHTML = `<span id="sidebar-xp-label">${userStats.xp} XP</span><span id="sidebar-xp-next">/ ${info.nextLevelXP} XP</span>`;

    if (avatarEl) {
        if (userStats.activeAvatar) {
            const item = SHOP_ITEMS.find(i => i.id === userStats.activeAvatar);
            avatarEl.textContent = item ? item.icon : '👤';
        } else {
            avatarEl.textContent = currentUser.charAt(0).toUpperCase();
        }
    }
    
    updateRankingUI();
}

function updateRankingUI() {
    const stats = userStats[currentGame?.mode || '5_LETTERS'] || userStats['5_LETTERS'];
    const score = document.querySelector('[data-stat="score"]');
    const partidas = document.querySelector('[data-stat="games"]');
    const sequência = document.querySelector('[data-stat="streak"]');
    const wins = document.querySelector('[data-stat="wins"]');
    const losses = document.querySelector('[data-stat="losses"]');

    if (score) score.textContent = userStats.xp || 0;
    if (partidas) partidas.textContent = (stats.wins || 0) + (stats.losses || 0);
    if (sequência) sequência.textContent = userStats.winStreak || 0;
    if (wins) wins.textContent = stats.wins || 0;
    if (losses) losses.textContent = stats.losses || 0;
}

function updateRankingStats(mode) {
    document.querySelectorAll('.ranking-mode-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateRankingUI();
}

function closeLevelUp() {
    const overlay = document.getElementById('levelup-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function backToMenu() {
    // Se estiver na jornada, voltar para a aba da jornada
    if (currentGame && currentGame.storyConfig) {
        if (gameInProgress) {
            if (!confirm('Deseja abandonar a missão?')) return;
        }
        gameInProgress = false;
        currentGame = null;
        enableDifficultyButtons();
        showMainTab('story-mode');
        return;
    }

    if (gameInProgress) {
        if (!confirm('Deseja voltar ao menu? Seu progresso será perdido!')) return;
    }
    gameInProgress = false;
    currentGame = null;
    enableDifficultyButtons();
    showMainTab('menu');
    updateSidebar();
}

// ============================================================
//  DIFICULDADE
// ============================================================
function setDifficulty(diff) {
    if (gameInProgress) { showToast('Não pode mudar dificuldade durante a partida!', 'error'); return; }
    
    // Se o usuário clicar na dificuldade que já está ativa, não faz nada (impede desmarcar)
    if (globalDifficulty === diff) return;
    
    globalDifficulty = diff;
    updateDifficultyUI();
    playSound('click');
}

function updateDifficultyUI() {
    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.classList.remove('active');
    });
    const active = document.getElementById(`diff-${globalDifficulty.toLowerCase()}`);
    if (active) active.classList.add('active');
}

function getDifficultyMultiplier() {
    return { EASY: 0.5, NORMAL: 1.0, HARD: 1.5 }[globalDifficulty];
}

function disableDifficultyButtons() {
    // Se for modo história, não desativa para permitir que o jogador mantenha sua escolha
    if (currentGame && currentGame.storyConfig) return;

    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.disabled = true;
    });
}

function enableDifficultyButtons() {
    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.disabled = false;
    });
}

// ============================================================
//  TELAS
// ============================================================
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('active');
}

function showMainTab(name) {
    closeMobileSidebar();
    document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById(`tab-${name}`);
    if (tab) tab.classList.add('active');

    if (name === 'trophies') renderTrophies();
    if (name === 'ranking') renderRanking();
    if (name === 'shop') renderShop();
}

// ============================================================
//  RENDERIZAÇÃO DE TROFÉUS
// ============================================================
function renderTrophies() {
    const container = document.getElementById('trophies-grid');
    if (!container) return;
    container.innerHTML = '';

    const info = getLevelInfo(userStats.xp || 0);

    TROPHIES_DEF.forEach(trophy => {
        const unlocked = trophy.check(userStats, info.level, userStats.coins);
        const isNew = unlocked && !userStats.unlockedTrophies.includes(trophy.id);

        const card = document.createElement('div');
        card.className = `trophy-card ${unlocked ? 'unlocked' : 'locked'}`;
        if (isNew) card.classList.add('new');

        card.innerHTML = `
            <div class="trophy-icon">${trophy.icon}</div>
            <div class="trophy-name">${trophy.name}</div>
            <div class="trophy-desc">${unlocked ? trophy.desc : '???'}</div>
            ${isNew ? '<div class="trophy-badge-new">NOVO!</div>' : ''}
            ${trophy.reward > 0 ? `<div class="trophy-reward">+${trophy.reward} XP</div>` : ''}
        `;

        if (isNew) {
            card.onclick = () => claimTrophy(trophy.id);
        }

        container.appendChild(card);
    });
}

async function claimTrophy(trophyId) {
    if (userStats.unlockedTrophies.includes(trophyId)) return;
    
    const trophy = TROPHIES_DEF.find(t => t.id === trophyId);
    if (!trophy) return;

    userStats.unlockedTrophies.push(trophyId);
    userStats.xp += trophy.reward;
    
    // Salvar troféu no Supabase
    if (currentUserSupabaseId) {
        await saveAchievementToSupabase(currentUserSupabaseId, trophyId);
    }
    
    await saveUserStats();
    updateSidebar();
    renderTrophies();
    showToast(`🏆 Troféu "${trophy.name}" desbloqueado! +${trophy.reward} XP`, 'success');
}

async function renderRanking() {
    const container = document.getElementById('ranking-grid');
    if (!container) return;
    container.innerHTML = '<div class="loading">Carregando ranking global...</div>';

    try {
        const globalRanking = await loadGlobalRankingFromSupabase(50);
        
        container.innerHTML = '';
        
        if (globalRanking.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum jogador no ranking ainda</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.innerHTML = `
            <thead>
                <tr style="border-bottom: 2px solid var(--accent);">
                    <th style="padding: 10px; text-align: left;">#</th>
                    <th style="padding: 10px; text-align: left;">Jogador</th>
                    <th style="padding: 10px; text-align: center;">XP</th>
                    <th style="padding: 10px; text-align: center;">Vitórias</th>
                </tr>
            </thead>
            <tbody>
                ${globalRanking.map(player => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); ${player.username === currentUser ? 'background: rgba(255,215,0,0.1);' : ''}">
                        <td style="padding: 10px; font-weight: bold;">${player.rank}</td>
                        <td style="padding: 10px;">${player.username}</td>
                        <td style="padding: 10px; text-align: center; color: var(--accent);">${player.xp}</td>
                        <td style="padding: 10px; text-align: center;">${player.totalWins}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        container.appendChild(table);
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        container.innerHTML = '<p style="text-align: center; color: #f00;">Erro ao carregar ranking</p>';
    }
}

// ============================================================
//  MODOS DE JOGO (ESTRUTURA REFORMULADA)
// ============================================================
function startMode(mode) {
    closeMobileSidebar();
    disableDifficultyButtons();

    const config = {
        '5_LETTERS': { 
            wordLength: 5, 
            stages: [
                { boards: 1, attempts: 6 },
                { boards: 3, attempts: 8 },
                { boards: 5, attempts: 10 }
            ] 
        },
        '7_LETTERS': { 
            wordLength: 7, 
            stages: [
                { boards: 1, attempts: 6 },
                { boards: 2, attempts: 7 }
            ] 
        },
        'SURVIVAL': { 
            wordLength: 5, 
            boards: 1, 
            attempts: 6, 
            lives: 3 
        },
        'AVALANCHE': { 
            wordLength: 5, 
            phase: 1
        }
    };

    const cfg = config[mode];
    if (!cfg) return;

    currentGame = {
        mode,
        modeName: { '5_LETTERS': '5 LETRAS', '7_LETTERS': '7 LETRAS', 'SURVIVAL': 'SOBREVIVÊNCIA', 'AVALANCHE': 'AVALANCHE' }[mode],
        wordLength: cfg.wordLength,
        maxAttempts: 0,
        currentRow: 0,
        currentInputArr: new Array(cfg.wordLength).fill(''),
        selectedFieldIndex: 0,
        words: [],
        attempts: [],
        score: 0,
        stage: 0,
        round: 1,
        phase: cfg.phase || 1,
        lives: cfg.lives || 0,
        usedHints: [],
        isAnimating: false,
        hintsUsedThisRound: 0,
        survivalLivesBought: 0,
        isPerfectGame: true,
        stageScores: [],
        usedWordsMemory: new Set()
    };

    initStage();

    gameInProgress = true;
    showMainTab('game');
    renderGame();
}

function initStage() {
    const mode = currentGame.mode;
    let numBoards = 1;
    let attempts = 6;

    if (mode === '5_LETTERS') {
        const stageCfg = [
            { boards: 1, attempts: 6 },
            { boards: 3, attempts: 8 },
            { boards: 5, attempts: 10 }
        ][currentGame.stage];
        numBoards = stageCfg.boards;
        attempts = stageCfg.attempts;
    } else if (mode === '7_LETTERS') {
        const stageCfg = [
            { boards: 1, attempts: 6 },
            { boards: 2, attempts: 7 }
        ][currentGame.stage];
        numBoards = stageCfg.boards;
        attempts = stageCfg.attempts;
    } else if (mode === 'SURVIVAL') {
        numBoards = 1;
        attempts = 6;
    } else if (mode === 'AVALANCHE') {
        // Ciclo de 1 a 5 palavras
        // Fase 1 = 1 palavra, Fase 2 = 2 palavras, ..., Fase 5 = 5 palavras, Fase 6 = 1 palavra, etc.
        const cyclePosition = ((currentGame.phase - 1) % 5) + 1;
        numBoards = cyclePosition;
        attempts = numBoards + 5;
    }

    currentGame.maxAttempts = attempts;
    currentGame.currentRow = 0;
    currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
    currentGame.selectedFieldIndex = 0;
    currentGame.words = Array.from({ length: numBoards }, () => getRandomWordByDifficulty(currentGame.wordLength));
    currentGame.attempts = Array.from({ length: numBoards }, () => new Array(attempts).fill(null));
}

// ============================================================
//  MOTOR DE SORTEIO INTELIGENTE POR DIFICULDADE
// ============================================================
function getRandomWordByDifficulty(length) {
    const key = `letras${length}`;
    
    if (typeof BANCO_DE_PALAVRAS !== 'object' || !BANCO_DE_PALAVRAS[key]) {
        return 'TERMO';
    }

    const bucket = BANCO_DE_PALAVRAS[key];
    let words = [];
    const roll = Math.random();
    let selectedDifficulty = 'medio';

    // Nova Lógica Probabilística de Dificuldade
    if (globalDifficulty === 'EASY') {
        // Fácil: 70% fácil, 30% médio
        selectedDifficulty = roll < 0.7 ? 'facil' : 'medio';
    } else if (globalDifficulty === 'HARD') {
        // Difícil: 70% difícil, 30% médio
        selectedDifficulty = roll < 0.7 ? 'dificil' : 'medio';
    } else {
        // NORMAL: 50% médio, 25% fácil, 25% difícil
        if (roll < 0.25) {
            selectedDifficulty = 'facil';
        } else if (roll < 0.75) {
            selectedDifficulty = 'medio';
        } else {
            selectedDifficulty = 'dificil';
        }
    }

    // Tentar a dificuldade selecionada
    if (bucket[selectedDifficulty] && bucket[selectedDifficulty].length > 0) {
        words = bucket[selectedDifficulty].filter(w => w && w.length === length);
    }
    
    // Fallback em cascata se a categoria estiver vazia
    if (words.length === 0) {
        const priority = ['medio', 'facil', 'dificil'];
        for (const p of priority) {
            if (bucket[p] && bucket[p].length > 0) {
                words = bucket[p].filter(w => w && w.length === length);
                if (words.length > 0) break;
            }
        }
    }

    if (words.length === 0) {
        // Fallback: pega qualquer palavra disponível
        for (const diff in bucket) {
            if (Array.isArray(bucket[diff])) {
                words = bucket[diff].filter(w => w && w.length === length);
                if (words.length > 0) break;
            }
        }
    }

    // FILTRO ANTI-REPETIÇÃO: Garantir que a palavra não foi usada nesta partida
    let selectedWord = null;
    const availableWords = words.filter(w => !currentGame.usedWordsMemory.has(normalizeWord(w)));
    
    if (availableWords.length > 0) {
        selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    } else if (words.length > 0) {
        // Se todas as palavras da dificuldade foram usadas, pega qualquer uma (fallback)
        selectedWord = words[Math.floor(Math.random() * words.length)];
    } else {
        selectedWord = 'TERMO';
    }

    // Adiciona a palavra à memória da partida
    if (selectedWord) {
        currentGame.usedWordsMemory.add(normalizeWord(selectedWord));
    }

    return selectedWord;
}

// ============================================================
//  RENDERIZAÇÃO DO JOGO
// ============================================================
function renderGame() {
    updateGameTopbar();
    renderBoards();
    renderKeyboard();
}

function updateGameTopbar() {
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();

    const titleBar = document.getElementById('game-title-bar');
    if (titleBar) titleBar.textContent = currentGame.modeName;

    const badge = document.getElementById('game-diff-badge');
    const icons  = { EASY: '🟢', NORMAL: '🟡', HARD: '🔴' };
    if (badge) {
        badge.textContent = `${icons[globalDifficulty]} ${globalDifficulty} ${mult}×`;
        badge.className   = `game-diff-badge ${globalDifficulty.toLowerCase()}`;
    }

    const statusBar = document.getElementById('game-status-bar');
    if (!statusBar) return;
    statusBar.innerHTML = '';

    const addChip = (label, value) => {
        const chip = document.createElement('div');
        chip.className = 'status-chip';
        chip.innerHTML = `${label} <span>${value}</span>`;
        statusBar.appendChild(chip);
    };

    if (mode === '5_LETTERS') {
        addChip('Etapa', `${currentGame.stage + 1}/3`);
        addChip('Tabuleiros', currentGame.words.length);
    } else if (mode === '7_LETTERS') {
        addChip('Etapa', `${currentGame.stage + 1}/2`);
        addChip('Tabuleiros', currentGame.words.length);
    } else if (mode === 'SURVIVAL') {
        addChip('Rodada', currentGame.round);
        addChip('Vidas', '❤️'.repeat(currentGame.lives));
    } else if (mode === 'AVALANCHE') {
        addChip('Fase', currentGame.phase);
        addChip('Tabuleiros', currentGame.words.length);
    }
    
    addChip('Score', currentGame.score);
}

function renderBoards() {
    const area = document.getElementById('game-boards-area');
    if (!area) return;
    area.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'game-boards-wrapper';

    const screenWidth = window.innerWidth;
    const sidebarWidth = screenWidth > 520 ? 240 : 0;
    const availableWidth = screenWidth - sidebarWidth - 40;
    const numBoards = currentGame.words.length;
    const boardGap = 15;
    const tileGap = 4;
    
    const totalGaps = (numBoards - 1) * boardGap + numBoards * (currentGame.wordLength - 1) * tileGap;
    let tileSize = Math.floor((availableWidth - totalGaps) / (numBoards * currentGame.wordLength));
    tileSize = Math.max(20, Math.min(52, tileSize));

    currentGame.words.forEach((word, wordIdx) => {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.style.setProperty('--tile-size', `${tileSize}px`);

        const wordDone = isBoardWon(wordIdx);
        if (wordDone) gridContainer.classList.add('won');

        const wordGrid = document.createElement('div');
        wordGrid.className = 'word-grid';

        for (let row = 0; row < currentGame.maxAttempts; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'tile-row';

            for (let col = 0; col < currentGame.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.fontSize = `${tileSize * 0.5}px`;

                const attempt = currentGame.attempts[wordIdx][row];

                if (attempt) {
                    const letter = attempt[col] || '';
                    tile.textContent = letter;
                    if (letter) {
                        tile.classList.add('filled');
                        const state = getLetterState(letter, col, word, attempt);
                        tile.classList.add(state);
                        
                        if (row === currentGame.currentRow - 1 && currentGame.isAnimating && !tile.dataset.animated) {
                            tile.classList.add('flipping');
                            tile.style.animationDelay = `${col * 0.1}s`;
                            tile.dataset.animated = "true";
                        }
                    }
                } else if (row === currentGame.currentRow && !wordDone) {
                    const letter = currentGame.currentInputArr[col] || '';
                    tile.textContent = letter;
                    if (letter) tile.classList.add('filled');

                    if (col === currentGame.selectedFieldIndex) {
                        tile.classList.add('selected');
                    }

                    const lastFilled = currentGame.currentInputArr.reduce((last, l, i) => l ? i : last, -1);
                    if (col === lastFilled + 1 && col !== currentGame.selectedFieldIndex) {
                        tile.classList.add('focused');
                    }

                    tile.classList.add('clickable');
                    tile.onclick = () => {
                        currentGame.selectedFieldIndex = col;
                        renderGame();
                    };
                }

                rowDiv.appendChild(tile);
            }
            wordGrid.appendChild(rowDiv);
        }

        gridContainer.appendChild(wordGrid);
        wrapper.appendChild(gridContainer);
    });

    area.appendChild(wrapper);
}

function renderKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    keyboard.innerHTML = '';

    const correctSet = new Set();
    const presentSet = new Set();
    const absentSet  = new Set();

    currentGame.words.forEach((word, wordIdx) => {
        currentGame.attempts[wordIdx].forEach(attempt => {
            if (!attempt) return;
            attempt.forEach((letter, col) => {
                const state = getLetterState(letter, col, word, attempt);
                const nl = normalizeWord(letter);
                if (state === 'correct') correctSet.add(nl);
                else if (state === 'present' && !correctSet.has(nl)) presentSet.add(nl);
                else if (state === 'absent' && !correctSet.has(nl) && !presentSet.has(nl)) absentSet.add(nl);
            });
        });
    });

    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    const container = document.createElement('div');
    container.className = 'keyboard-container';

    rows.forEach((row, rowIdx) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        if (rowIdx === 0) {
            rowDiv.appendChild(makeKey('ENTER', true, submitAttempt));
        }

        row.split('').forEach(letter => {
            const btn = makeKey(letter, false, () => handleInput(letter));
            const nl  = normalizeWord(letter);
            if (correctSet.has(nl))      btn.classList.add('correct');
            else if (presentSet.has(nl)) btn.classList.add('present');
            else if (absentSet.has(nl))  btn.classList.add('absent');
            rowDiv.appendChild(btn);
        });

        if (rowIdx === 2) {
            rowDiv.appendChild(makeKey('⌈', true, handleDelete));
        }
        
        container.appendChild(rowDiv);
    });

    keyboard.appendChild(container);

    const hintContainer = document.createElement('div');
    hintContainer.style.width = '100%';
    hintContainer.style.display = 'flex';
    hintContainer.style.justifyContent = 'center';
    hintContainer.style.marginTop = '6px';
    
    const hintBtn = document.createElement('button');
    hintBtn.className = 'hint-btn';
    hintBtn.type = 'button';
    hintBtn.innerHTML = `💡 Dica <small>💰${getHintPrice()}</small>`;
    hintBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        buyHint();
    };
    
    hintContainer.appendChild(hintBtn);
    keyboard.appendChild(hintContainer);
}

function makeKey(label, wide, action) {
    const btn = document.createElement('button');
    btn.className = `key ${wide ? 'wide' : ''}`;
    btn.textContent = label;
    btn.type = 'button';
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
        playSound('click');
    };
    return btn;
}

// ============================================================
//  LÓGICA DE ENTRADA
// ============================================================
function handleInput(letter) {
    if (!gameInProgress || !currentGame) return;
    
    currentGame.currentInputArr[currentGame.selectedFieldIndex] = letter;
    
    if (currentGame.selectedFieldIndex < currentGame.wordLength - 1) {
        currentGame.selectedFieldIndex++;
    }
    
    renderGame();
}

function handleDelete() {
    if (!gameInProgress || !currentGame) return;

    if (currentGame.currentInputArr[currentGame.selectedFieldIndex] === '') {
        if (currentGame.selectedFieldIndex > 0) {
            currentGame.selectedFieldIndex--;
        }
    }
    currentGame.currentInputArr[currentGame.selectedFieldIndex] = '';
    renderGame();
}

function isBoardWon(wordIdx) {
    const secret = normalizeWord(currentGame.words[wordIdx]);
    return currentGame.attempts[wordIdx].some(attempt => {
        if (!attempt) return false;
        return normalizeWord(attempt.join('')) === secret;
    });
}

function toggleHackMode() {
    if (!isAdmin) return;
    const display = document.getElementById('hack-display');
    if (display) {
        display.classList.toggle('hidden');
        if (!display.classList.contains('hidden')) {
            display.textContent = `🔑 HACK: ${currentGame.words.join(' | ').toUpperCase()}`;
        }
    }
}

// ============================================================
//  LÓGICA DE LETRAS — WORDLE OFFICIAL ALGORITHM
// ============================================================
function getLetterState(letter, position, secretWord, attempt) {
    const normLetter = normalizeWord(letter);
    const normSecret = normalizeWord(secretWord);
    const normSecretChar = normalizeWord(secretWord[position]);

    if (normLetter === normSecretChar) return 'correct';

    let secretOccurrences = 0;
    for (let i = 0; i < normSecret.length; i++) {
        if (normSecret[i] === normLetter) secretOccurrences++;
    }

    let correctOccurrences = 0;
    for (let i = 0; i < normSecret.length; i++) {
        if (normalizeWord(attempt[i]) === normSecret[i] && normSecret[i] === normLetter) {
            correctOccurrences++;
        }
    }

    let previousOccurrences = 0;
    for (let i = 0; i < position; i++) {
        if (normalizeWord(attempt[i]) === normLetter && normSecret[i] !== normLetter) {
            previousOccurrences++;
        }
    }

    if (normSecret.includes(normLetter) && (previousOccurrences < (secretOccurrences - correctOccurrences))) {
        return 'present';
    }

    return 'absent';
}

// ============================================================
//  SUBMISSÃO DE TENTATIVA
// ============================================================
function submitAttempt() {
    if (!gameInProgress || !currentGame) return;

    const input = currentGame.currentInputArr.join('').trim();
    if (input.length !== currentGame.wordLength) {
        showToast('Preencha todas as letras', 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    const word = input.toUpperCase();
    if (!isValidWord(word)) {
        if (!confirm(`"${word}" não está no dicionário. Deseja usar assim mesmo?`)) return;
    }

    currentGame.words.forEach((secret, idx) => {
        if (!isBoardWon(idx)) {
            currentGame.attempts[idx][currentGame.currentRow] = word.split('');
        }
    });

    currentGame.currentRow++;
    currentGame.isAnimating = true;
    renderGame();

    setTimeout(() => {
        currentGame.isAnimating = false;
        checkGameStatus();
    }, 1000);
}

function checkGameStatus() {
    const allWon = currentGame.words.every((_, idx) => isBoardWon(idx));
    const outOfAttempts = currentGame.currentRow >= currentGame.maxAttempts;

    if (allWon) {
        handleStageWon();
    } else if (outOfAttempts) {
        handleStageLost();
    } else {
        currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
        currentGame.selectedFieldIndex = 0;
        renderGame();
    }
}

// ============================================================
//  FIM DE ETAPA / JOGO — CARDS PREMIUM
// ============================================================
function handleStageWon() {
    playSound('victory');
    
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();
    const attemptUsed = currentGame.currentRow - 1;
    const baseScore = Math.max(0, (currentGame.maxAttempts - attemptUsed) * 50);
    const boardBonus = currentGame.words.length * 100;
    const stageScore = Math.round((baseScore + boardBonus) * mult);
    
    currentGame.score += stageScore;
    currentGame.stageScores.push(stageScore);

    if (mode === '5_LETTERS') {
        if (currentGame.stage < 2) {
            currentGame.stage++;
            showToast(`✅ Etapa ${currentGame.stage} Concluída!`, 'success');
            initStage();
            renderGame();
        } else {
            handleGameWon();
        }
    } else if (mode === '7_LETTERS') {
        if (currentGame.stage < 1) {
            currentGame.stage++;
            showToast(`✅ Etapa ${currentGame.stage} Concluída!`, 'success');
            initStage();
            renderGame();
        } else {
            handleGameWon();
        }
    } else if (mode === 'SURVIVAL') {
        currentGame.round++;
        showToast(`🔥 Rodada ${currentGame.round}!`, 'success');
        checkSurvivalShop();
        initStage();
        renderGame();
    } else if (mode === 'AVALANCHE') {
        // Ciclo de 1 a 5 palavras: após 5, volta para 1
        const currentWords = currentGame.words.length;
        if (currentWords < 5) {
            currentGame.phase++;
        } else {
            // Completou o ciclo, volta para 1 palavra (mas mantém a pontuação)
            currentGame.phase++;
        }
        showToast(`🏔️ Fase ${currentGame.phase}!`, 'success');
        initStage();
        renderGame();
    }
}

function handleStageLost() {
    const mode = currentGame.mode;
    currentGame.isPerfectGame = false;
    playSound('lose');

    const reveal = `A palavra era: ${currentGame.words.join(' | ')}`;
    showToast(reveal, 'error');

    if (mode === '5_LETTERS' || mode === '7_LETTERS') {
        const maxStages = mode === '5_LETTERS' ? 2 : 1;
        if (currentGame.stage < maxStages) {
            currentGame.stage++;
            setTimeout(() => {
                initStage();
                renderGame();
            }, 2000);
        } else {
            handleGameWon();
        }
    } else if (mode === 'SURVIVAL') {
        currentGame.lives--;
        if (currentGame.lives > 0) {
            showToast(`💔 Perdeu uma vida! Restam ${currentGame.lives}`, 'error');
            setTimeout(() => {
                initStage();
                renderGame();
            }, 2000);
        } else {
            handleGameLost();
        }
    } else if (mode === 'AVALANCHE') {
        handleGameLost();
    }
}

function handleGameWon() {
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();
    const baseXP = 100;
    const xpGain = Math.round(baseXP * mult);
    const coinsGain = Math.round(currentGame.score * 0.2 * mult);

    userStats.xp += xpGain;
    userStats.coins += coinsGain;
    userStats[mode].wins++;
    userStats.winStreak++;
    
    if (mode === 'SURVIVAL' && currentGame.round > (userStats.bestSurvivalRound || 0)) {
        userStats.bestSurvivalRound = currentGame.round;
    }
    if (mode === 'AVALANCHE' && currentGame.phase > (userStats.bestAvalanchePhase || 0)) {
        userStats.bestAvalanchePhase = currentGame.phase;
    }
    if (currentGame.isPerfectGame) {
        if (mode === '5_LETTERS') userStats.perfectGames5L++;
        if (mode === '7_LETTERS') userStats.perfectGames7L++;
    }

    saveUserStats();
    showGameEndModalPremium(true, xpGain, coinsGain);
}

function handleGameLost() {
    const mode = currentGame.mode;
    userStats[mode].losses++;
    userStats.winStreak = 0;
    saveUserStats();
    showGameEndModalPremium(false, 0, 0);
}

function showGameEndModalPremium(won, xpGain, coinsGain) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const attemptUsed = currentGame.currentRow - 1;
    const mult = getDifficultyMultiplier();
    
    // Gerar título dinâmico baseado em performance
    let titleText = '';
    let titleEmoji = '';
    
    if (won) {
        if (attemptUsed === 0) {
            titleText = 'MENTE BRILHANTE!';
            titleEmoji = '🧠';
        } else if (attemptUsed <= 2) {
            titleText = 'GENIAL!';
            titleEmoji = '⚡';
        } else if (attemptUsed <= 4) {
            titleText = 'EXCELENTE!';
            titleEmoji = '🎯';
        } else {
            titleText = 'UFA! POR UM TRIZ...';
            titleEmoji = '🥵';
        }
    } else {
        titleText = 'FIM DE JOGO';
        titleEmoji = '😢';
    }

    // Frases personalizadas por modo
    let modeMessage = '';
    if (won) {
        if (currentGame.mode === '5_LETTERS') modeMessage = 'Você conquistou as 5 letras!';
        else if (currentGame.mode === '7_LETTERS') modeMessage = 'Você dominou as 7 letras!';
        else if (currentGame.mode === 'SURVIVAL') modeMessage = `Você resistiu à maratona! Rodada ${currentGame.round}`;
        else if (currentGame.mode === 'AVALANCHE') modeMessage = `A montanha foi escalada! Fase ${currentGame.phase}`;
    } else {
        modeMessage = 'Tente novamente para ganhar mais XP!';
    }

    const body = document.getElementById('modal-body');
    if (body) {
        body.innerHTML = `
            <div class="modal-premium-content">
                <div class="modal-emoji">${titleEmoji}</div>
                <h2 class="modal-title-premium">${titleText}</h2>
                <p class="modal-mode-msg">${modeMessage}</p>
                <div class="modal-score-box">
                    <div class="score-item">Score Final: <span class="score-value">${currentGame.score}</span></div>
                </div>
                ${won ? `
                    <div class="modal-rewards-box">
                        <div class="reward-item">
                            <span class="reward-label">XP Base</span>
                            <span class="reward-value">+${Math.round(100)}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-label">Bônus ${globalDifficulty}</span>
                            <span class="reward-value">×${mult}</span>
                        </div>
                        <div class="reward-item" style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; margin-top: 10px;">
                            <span class="reward-label" style="font-weight: bold;">Total XP</span>
                            <span class="reward-value" style="color: var(--correct); font-size: 1.2em;">+${xpGain}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-label">Moedas</span>
                            <span class="reward-value" style="color: #fbbf24;">+${coinsGain}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    overlay.classList.remove('hidden');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    gameInProgress = false;
    enableDifficultyButtons();
    showMainTab('menu');
    updateSidebar();
}

// ============================================================
//  SISTEMA DE DICAS
// ============================================================
function getHintPrice() {
    return { EASY: 50, NORMAL: 100, HARD: 200 }[globalDifficulty];
}

function buyHint() {
    const price = getHintPrice();
    if (userStats.coins < price) {
        showToast('Moedas insuficientes!', 'error');
        return;
    }

    let hintFound = false;
    for (let b = 0; b < currentGame.words.length; b++) {
        if (isBoardWon(b)) continue;
        
        const word = normalizeWord(currentGame.words[b]);
        for (let c = 0; c < word.length; c++) {
            const letter = word[c];
            const alreadyCorrect = currentGame.attempts[b].some(att => att && normalizeWord(att[c]) === letter);
            
            if (!alreadyCorrect) {
                userStats.coins -= price;
                showToast(`💡 Dica: A letra "${letter}" está na posição ${c+1} do tabuleiro ${b+1}`, 'info');
                saveUserStats();
                updateSidebar();
                renderKeyboard();
                hintFound = true;
                break;
            }
        }
        if (hintFound) break;
    }

    if (!hintFound) showToast('Você já sabe todas as letras!', 'info');
}

// ============================================================
//  SOBREVIVÊNCIA - LOJA DE VIDAS
// ============================================================
function checkSurvivalShop() {
    const marcos = [5, 15, 30, 50];
    if (marcos.includes(currentGame.round)) {
        openSurvivalShop();
    }
}

function openSurvivalShop() {
    const overlay = document.getElementById('shop-overlay');
    if (!overlay) return;
    
    const info = document.getElementById('shop-info');
    const container = document.getElementById('shop-buttons');
    
    const price = Math.pow(2, currentGame.survivalLivesBought) * 10;
    if (info) info.textContent = `Você chegou à rodada ${currentGame.round}! Deseja comprar uma vida extra?`;
    
    if (container) {
        container.innerHTML = `
            <button class="btn-primary btn-full" onclick="buySurvivalLife(${price})">
                COMPRAR 1 VIDA ❤️ (💰${price})
            </button>
            <button class="btn-secondary btn-full" onclick="closeShop()">
                PROSSEGUIR SEM COMPRAR
            </button>
        `;
    }
    overlay.classList.remove('hidden');
}

function buySurvivalLife(price) {
    if (userStats.coins < price) {
        showToast('Moedas insuficientes!', 'error');
        return;
    }
    userStats.coins -= price;
    currentGame.lives++;
    currentGame.survivalLivesBought++;
    showToast('❤️ Vida comprada!', 'success');
    saveUserStats();
    closeShop();
}

function closeShop() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) overlay.classList.add('hidden');
    updateSidebar();
    renderGame();
}

// ============================================================
//  SISTEMA DE LOJA (COSMÉTICOS)
// ============================================================
function renderShop() {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;
    container.innerHTML = '';

    SHOP_ITEMS.forEach(item => {
        const isOwned = userStats.ownedItems && userStats.ownedItems.includes(item.id);
        const isActive = userStats.activeTheme === item.id || userStats.activeAvatar === item.id;

        const card = document.createElement('div');
        card.className = `shop-item-card ${isOwned ? 'owned' : ''}`;
        
        card.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-icon">${item.icon}</div>
                ${isOwned ? '<div class="shop-item-badge">✓ ADQUIRIDO</div>' : ''}
            </div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-footer">
                ${isOwned ? `
                    <button class="shop-item-btn ${isActive ? 'btn-active' : 'btn-apply'}" 
                            onclick="handleShopAction('${item.id}')">
                        ${isActive ? '✓ ATIVO' : 'USAR'}
                    </button>
                ` : `
                    <div class="shop-item-price">💰 ${item.price}</div>
                    <button class="shop-item-btn btn-buy" onclick="handleShopAction('${item.id}')">
                        COMPRAR
                    </button>
                `}
            </div>
        `;
        container.appendChild(card);
    });
}

async function handleShopAction(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (!userStats.ownedItems) userStats.ownedItems = [];

    if (userStats.ownedItems.includes(itemId)) {
        if (item.type === 'theme') {
            userStats.activeTheme = itemId;
            applyTheme(itemId);
        } else if (item.type === 'avatar') {
            userStats.activeAvatar = itemId;
        }
        
        if (currentUserSupabaseId) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, itemId, true);
        }
        
        showToast(`✅ ${item.name} aplicado!`, 'success');
    } else {
        if (userStats.coins < item.price) {
            showToast('💰 Moedas insuficientes!', 'error');
            return;
        }
        userStats.coins -= item.price;
        userStats.ownedItems.push(itemId);
        
        if (currentUserSupabaseId) {
            await saveShopItemToSupabase(currentUserSupabaseId, itemId, false);
        }
        
        showToast(`🎉 Você comprou ${item.name}!`, 'success');
    }

    await saveUserStats();
    updateSidebar();
    renderShop();
}

function applyTheme(themeId) {
    const root = document.documentElement;
    if (themeId === 'theme_neon') {
        root.style.setProperty('--accent', '#00f2ff');
        root.style.setProperty('--surface', '#0a0a12');
    } else if (themeId === 'theme_dark') {
        root.style.setProperty('--accent', '#6366f1');
        root.style.setProperty('--surface', '#18181b');
    }
}

// ============================================================
//  UTILITÁRIOS
// ============================================================
function normalizeWord(word) {
    if (!word) return '';
    return word.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isValidWord(word) {
    const normalized = normalizeWord(word);
    const custom = JSON.parse(localStorage.getItem('termo_user_words') || '[]');
    if (custom.includes(normalized)) return true;
    
    if (typeof BANCO_DE_PALAVRAS === 'object') {
        const allWords = [];
        for (const lenKey in BANCO_DE_PALAVRAS) {
            const categories = BANCO_DE_PALAVRAS[lenKey];
            if (typeof categories === 'object') {
                for (const diff in categories) {
                    if (Array.isArray(categories[diff])) {
                        allWords.push(...categories[diff]);
                    }
                }
            }
        }
        if (allWords.some(w => normalizeWord(w) === normalized)) return true;
    }
    return true; 
}

function showToast(msg, type = 'info') {
    const existing = document.querySelectorAll('.toast-container');
    existing.forEach(e => e.remove());

    const container = document.createElement('div');
    container.className = `toast-container ${type}`;
    const icon = type === 'success' ? '🎉' : (type === 'error' ? '⚠️' : 'ℹ️');
    container.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-message">${msg}</div><div class="toast-progress"></div>`;
    document.body.appendChild(container);
    setTimeout(() => {
        container.classList.add('fade-out');
        setTimeout(() => container.remove(), 500);
    }, 3000);
}

function shakeBoards() {
    const boards = document.querySelectorAll('.grid-container');
    boards.forEach(b => {
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 500);
    });
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'correct') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'victory') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'lose') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
    } catch(e) {}
}

function resetDatabase() {
    if (!confirm('Tem certeza? Isso vai deletar TODOS os dados e resetar para o padrão!')) return;
    localStorage.clear();
    const allUsers = { 'admin': { pin: '0000' } };
    localStorage.setItem('users', JSON.stringify(allUsers));
    const adminStats = createEmptyStats(true);
    localStorage.setItem('termo_user_admin', JSON.stringify(adminStats));
    showToast('✅ Banco de dados resetado!', 'success');
    setTimeout(() => location.reload(), 1000);
}


// ============================================================
//  INTEGRAÇÃO COM MODO HISTÓRIA
// ============================================================
function startStoryMode() {
    closeMobileSidebar();
    
    // Inicializar o Modo História com callbacks
    const callbacks = {
        startStoryGame: startStoryGame,
        addRewards: addStoryRewards,
        getCurrentWords: () => currentGame ? currentGame.words : []
    };
    
    initStoryMode(callbacks);
    
    // Mostrar tab
    showMainTab('story-mode');
}

function startStoryGame(phaseConfig) {
    // REMOVIDO: disableDifficultyButtons(); -> Permitir que o jogador mude ou veja a dificuldade
    
    // Preparar configuração do jogo
    const gameConfig = {
        mode: 'STORY_MODE_PHASE',
        wordLength: phaseConfig.wordLength,
        difficulty: globalDifficulty, // USAR globalDifficulty em vez da predefinida na fase
        numBoards: phaseConfig.numBoards,
        maxAttempts: phaseConfig.maxAttempts,
        anomalies: phaseConfig.anomalies,
        timeLimit: phaseConfig.timeLimit,
        forbiddenLetters: phaseConfig.forbiddenLetters,
        isBoss: phaseConfig.isBoss,
        phaseId: phaseConfig.phaseId,
        phaseName: phaseConfig.phaseName,
        onPhaseComplete: phaseConfig.onPhaseComplete
    };
    
    // Sincronizar dificuldade global com a da fase para o sorteio de palavras
    if (gameConfig.difficulty) {
        globalDifficulty = gameConfig.difficulty;
        updateDifficultyUI();
    }

    // Inicializar jogo com configuração do Modo História
    currentGame = {
        mode: gameConfig.mode,
        modeName: gameConfig.phaseName,
        wordLength: gameConfig.wordLength,
        maxAttempts: gameConfig.maxAttempts,
        currentRow: 0,
        currentInputArr: new Array(gameConfig.wordLength).fill(''),
        selectedFieldIndex: 0,
        words: [],
        attempts: [],
        score: 0,
        stage: 0,
        round: 1,
        phase: 1,
        lives: 3,
        usedHints: [],
        isAnimating: false,
        hintsUsedThisRound: 0,
        survivalLivesBought: 0,
        isPerfectGame: true,
        stageScores: [],
        usedWordsMemory: new Set(),
        // Campos específicos do Modo História
        storyConfig: gameConfig,
        timeRemaining: gameConfig.timeLimit,
        blockedCells: [],
        forbiddenLetters: gameConfig.forbiddenLetters || []
    };
    
    // Aplicar anomalias (Usando a função renomeada para evitar recursão)
    if (gameConfig.anomalies && gameConfig.anomalies.length > 0) {
        gameConfig.anomalies.forEach(anomaly => {
            if (typeof applyStoryAnomaly === 'function') {
                const anomalyConfig = applyStoryAnomaly(anomaly, gameConfig);
                if (anomalyConfig) {
                    currentGame.activeAnomalies = currentGame.activeAnomalies || {};
                    currentGame.activeAnomalies[anomaly] = anomalyConfig;
                    
                    // Tratamento específico para anomalias que mudam o estado inicial
                    if (anomaly === 'BLOCKED_CELLS' && anomalyConfig.cells) {
                        currentGame.blockedCells = anomalyConfig.cells;
                    }
                }
            }
        });
    }
    
    // Gerar palavras
    for (let i = 0; i < gameConfig.numBoards; i++) {
        currentGame.words.push(getRandomWordByDifficulty(gameConfig.wordLength));
        currentGame.attempts.push(new Array(gameConfig.maxAttempts).fill(null));
    }
    
    gameInProgress = true;
    showMainTab('game');
    renderGame();
    
    // Iniciar cronômetro se houver limite de tempo
    if (gameConfig.timeLimit) {
        startStoryTimer(gameConfig.timeLimit);
    }
}

function startStoryTimer(timeLimit) {
    currentGame.timeRemaining = timeLimit;
    const startTime = Date.now();
    const duration = timeLimit * 1000;

    // Limpar qualquer intervalo anterior por segurança
    if (currentGame.timerInterval) clearInterval(currentGame.timerInterval);

    currentGame.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        
        // Só atualiza se o valor mudar para evitar oscilação visual
        if (remaining !== currentGame.timeRemaining) {
            currentGame.timeRemaining = remaining;
            
            // Atualizar display do tempo
            const statusBar = document.getElementById('game-status-bar');
            if (statusBar) {
                const timeDisplay = statusBar.querySelector('[data-time]');
                if (timeDisplay) {
                    timeDisplay.textContent = currentGame.timeRemaining;
                }
            }
        }
        
        if (currentGame.timeRemaining <= 0) {
            clearInterval(currentGame.timerInterval);
            currentGame.timerInterval = null; // Garantir que está limpo
            handleStoryTimeUp();
        }
    }, 100); // Checagem mais frequente para maior precisão, mas decremento visual de 1s
}

function handleStoryTimeUp() {
    if (!gameInProgress) return; // Evita múltiplas chamadas
    gameInProgress = false;
    
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    const coinsEarned = 0;
    const xpEarned = 0;
    
    // Notificar falha ANTES do toast para abrir o modal de recompensa
    if (currentGame.storyConfig && currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(false, 0, coinsEarned, xpEarned);
    }
    
    showToast('⏰ Tempo esgotado! Fase falhada.', 'error');
}

function addStoryRewards(rewards) {
    userStats.coins += rewards.coins || 0;
    userStats.xp += rewards.xp || 0;
    
    if (rewards.item && !userStats.ownedItems.includes(rewards.item)) {
        userStats.ownedItems.push(rewards.item);
    }
    
    if (rewards.skin && !userStats.ownedItems.includes(rewards.skin)) {
        userStats.ownedItems.push(rewards.skin);
    }
    
    saveUserStats();
    updateSidebar();
}

// Função auxiliar para aplicar anomalias (chama a função do story_mode.js)
function applyAnomaly(anomalyType, config) {
    if (typeof window.applyStoryAnomaly === 'function') {
        return window.applyStoryAnomaly(anomalyType, config);
    }
    return null;
}

// Modificar submitAttempt para suportar anomalias do Modo História
const originalSubmitAttempt = submitAttempt;
submitAttempt = function() {
    if (!gameInProgress || !currentGame) return;

    const input = currentGame.currentInputArr.join('').trim();
    if (input.length !== currentGame.wordLength) {
        showToast('Preencha todas as letras', 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    // Verificar letras proibidas (anomalia do Modo História)
    if (currentGame.forbiddenLetters && currentGame.forbiddenLetters.length > 0) {
        const inputNormalized = normalizeWord(input);
        const forbiddenNormalized = currentGame.forbiddenLetters.map(l => normalizeWord(l));
        
        for (let letter of inputNormalized) {
            if (forbiddenNormalized.includes(letter)) {
                showToast(`❌ Letra "${letter}" está bloqueada pelo Firewall!`, 'error');
                playSound('error');
                return;
            }
        }
    }

    const word = input.toUpperCase();
    if (!isValidWord(word)) {
        if (!confirm(`"${word}" não está no dicionário. Deseja usar assim mesmo?`)) return;
    }

    currentGame.words.forEach((secret, idx) => {
        if (!isBoardWon(idx)) {
            currentGame.attempts[idx][currentGame.currentRow] = word.split('');
        }
    });

    currentGame.currentRow++;
    currentGame.isAnimating = true;
    renderGame();

    setTimeout(() => {
        currentGame.isAnimating = false;
        checkGameStatus();
    }, 1000);
};

// Modificar renderGame para mostrar informações do Modo História
const originalRenderGame = renderGame;
renderGame = function() {
    updateGameTopbar();
    renderBoards();
    renderKeyboard();
    
    // Adicionar informações do Modo História se ativo
    if (currentGame && currentGame.storyConfig) {
        const statusBar = document.getElementById('game-status-bar');
        if (statusBar && currentGame.storyConfig.timeLimit) {
            const timeChip = document.createElement('div');
            timeChip.className = 'status-chip';
            timeChip.innerHTML = `⏱️ <span data-time>${currentGame.timeRemaining || currentGame.storyConfig.timeLimit}</span>s`;
            statusBar.appendChild(timeChip);
        }
    }
};

// Modificar checkGameStatus para suportar Modo História
const originalCheckGameStatus = checkGameStatus;
checkGameStatus = function() {
    const allWon = currentGame.words.every((_, idx) => isBoardWon(idx));
    const outOfAttempts = currentGame.currentRow >= currentGame.maxAttempts;

    if (allWon) {
        if (currentGame.storyConfig) {
            handleStoryPhaseWon();
        } else {
            handleStageWon();
        }
    } else if (outOfAttempts) {
        if (currentGame.storyConfig) {
            handleStoryPhaseLost();
        } else {
            handleStageLost();
        }
    } else {
        currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
        currentGame.selectedFieldIndex = 0;
        renderGame();
    }
};

function handleStoryPhaseWon() {
    playSound('victory');
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    const mult = getDifficultyMultiplier();
    const attemptUsed = currentGame.currentRow - 1;
    const baseScore = Math.max(0, (currentGame.maxAttempts - attemptUsed) * 50);
    const boardBonus = currentGame.words.length * 100;
    const stageScore = Math.round((baseScore + boardBonus) * mult);
    
    currentGame.score += stageScore;
    
    // Calcular estrelas
    let starsEarned = 1;
    if (attemptUsed <= 2) starsEarned = 3;
    else if (attemptUsed <= 4) starsEarned = 2;
    
    const coinsEarned = currentGame.storyConfig.rewardCoins || 50;
    const xpEarned = currentGame.storyConfig.rewardXP || 10;
    
    userStats.coins += coinsEarned;
    userStats.xp += xpEarned;
    saveUserStats();
    
    gameInProgress = false;
    
    if (currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(true, starsEarned, coinsEarned, xpEarned);
    }
}

function handleStoryPhaseLost() {
    if (!gameInProgress) return;
    gameInProgress = false;

    playSound('lose');
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    // Notificar falha ANTES do toast para abrir o modal de recompensa
    if (currentGame.storyConfig && currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(false, 0, 0, 0);
    }

    showToast('❌ Fase falhada! Tente novamente.', 'error');
}

console.log('✅ Integração com Modo História carregada');
