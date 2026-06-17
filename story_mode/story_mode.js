/**
 * STORY_MODE.JS - Controlador Principal do Modo História
 * Gerencia o mapa de jornadas, fases, anomalias e recompensas
 */

// ============================================================
//  ESTADO GLOBAL DO MODO HISTÓRIA
// ============================================================
// Dados padrão caso o usuário não tenha progresso
const STORY_MODE_DEFAULT = {
    activeJourney: 'jornada_1',
    progress: {
        jornada_1: {
            currentPhase: 1,
            completedPhases: [],
            stars: {},
            claimedChests: {},
            introSeen: false
        }
    }
};

let STORY_MODE_DATA = { ...STORY_MODE_DEFAULT };

let currentStoryPhase = null;
let storyGameCallbacks = {};

// ============================================================
//  INICIALIZAÇÃO DO MODO HISTÓRIA
// ============================================================
function initStoryMode(gameCallbacks) {
    // Registrar callbacks do jogo base
    storyGameCallbacks = gameCallbacks;
    
    // Carregar dados salvos
    loadStoryModeData();
    
    // Renderizar o mapa
    renderStoryMap();
    
    console.log('✅ Modo História inicializado');
}

async function loadStoryModeData() {
    if (typeof userStats !== 'undefined' && userStats && typeof currentUserSupabaseId !== 'undefined' && currentUserSupabaseId) {
        // Carregar do Supabase
        const journeyId = 'jornada_1';
        const progress = await loadJourneyProgressFromSupabase(currentUserSupabaseId, journeyId);
        
        if (progress) {
            STORY_MODE_DATA.progress[journeyId] = progress;
        } else {
            if (!userStats.storyProgress) {
                userStats.storyProgress = JSON.parse(JSON.stringify(STORY_MODE_DEFAULT));
            }
            STORY_MODE_DATA = userStats.storyProgress;
        }
    } else if (typeof userStats !== 'undefined' && userStats) {
        if (!userStats.storyProgress) {
            userStats.storyProgress = JSON.parse(JSON.stringify(STORY_MODE_DEFAULT));
            saveUserStats();
        }
        STORY_MODE_DATA = userStats.storyProgress;
    } else {
        const saved = localStorage.getItem('STORY_MODE_DATA');
        if (saved) {
            try {
                STORY_MODE_DATA = JSON.parse(saved);
            } catch (e) {
                STORY_MODE_DATA = { ...STORY_MODE_DEFAULT };
            }
        }
    }
}

async function saveStoryModeData() {
    if (typeof userStats !== 'undefined' && userStats && typeof currentUserSupabaseId !== 'undefined' && currentUserSupabaseId) {
        userStats.storyProgress = STORY_MODE_DATA;
        
        // Salvar no Supabase
        const journeyId = 'jornada_1';
        const progress = STORY_MODE_DATA.progress[journeyId];
        if (progress) {
            await saveJourneyProgressToSupabase(currentUserSupabaseId, journeyId, progress);
        }
        
        if (typeof saveUserStats === 'function') {
            await saveUserStats();
        }
    } else if (typeof userStats !== 'undefined' && userStats) {
        userStats.storyProgress = STORY_MODE_DATA;
        if (typeof saveUserStats === 'function') {
            await saveUserStats();
        }
    } else {
        localStorage.setItem('STORY_MODE_DATA', JSON.stringify(STORY_MODE_DATA));
    }
}

// ============================================================
//  RENDERIZAÇÃO DO MAPA DE JORNADA
// ============================================================
function renderStoryMap() {
    const mapContainer = document.getElementById('story-map');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = '';
    
    const jornada = getJornada(STORY_MODE_DATA.activeJourney);
    if (!jornada) return;
    
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];

    // Verificar se deve mostrar a Intro da História
    if (!progress.introSeen && jornada.introHistory) {
        showStoryIntro(jornada);
        return;
    }
    
    jornada.chapters.forEach((chapter, chapterIdx) => {
        const chapterEl = document.createElement('div');
        chapterEl.className = 'story-chapter';
        
        const chapterStars = chapter.phases.reduce((sum, phase) => {
            return sum + (progress.stars[phase.id] || 0);
        }, 0);
        
        const chapterProgress = Math.round((chapterStars / chapter.totalStars) * 100);
        
        chapterEl.innerHTML = `
            <div class="chapter-header" onclick="showChapterInfo('${chapter.id}')">
                <div class="chapter-number">${chapter.number}</div>
                <div class="chapter-title">
                    <h3>${chapter.name}</h3>
                    <p>${chapter.description}</p>
                </div>
                <div class="chapter-progress">
                    <span>${chapterStars}/${chapter.totalStars}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${chapterProgress}%"></div>
                    </div>
                </div>
            </div>
            <div class="phases-grid" id="phases-${chapter.id}"></div>
        `;
        
        mapContainer.appendChild(chapterEl);
        
        // Renderizar fases
        const phasesContainer = document.getElementById(`phases-${chapter.id}`);
        chapter.phases.forEach(phase => {
            const isCompleted = progress.completedPhases.includes(phase.id);
            const isCurrent = progress.currentPhase === phase.number;
            const isLocked = progress.currentPhase < phase.number;
            const stars = progress.stars[phase.id] || 0;
            
            const phaseEl = document.createElement('div');
            phaseEl.className = `phase-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${phase.isBoss ? 'boss' : ''}`;
            
            let starsHTML = '';
            for (let i = 0; i < 3; i++) {
                starsHTML += `<span class="star ${i < stars ? '' : 'empty'}">★</span>`;
            }
            
            phaseEl.innerHTML = `
                <div class="phase-icon">${phase.isBoss ? '⚔️' : '⚙️'}</div>
                <div class="phase-label">${phase.number}</div>
                <div class="phase-stars">${starsHTML}</div>
                ${isLocked ? '<div class="phase-lock">🔒</div>' : ''}
            `;
            
            if (!isLocked) {
                phaseEl.onclick = () => showPhaseBriefing(phase, chapter);
            }
            
            phasesContainer.appendChild(phaseEl);
        });
    });
}

// ============================================================
//  INFORMAÇÕES DO CAPÍTULO
// ============================================================
function showChapterInfo(chapterId) {
    const jornada = getJornada(STORY_MODE_DATA.activeJourney);
    const chapter = jornada.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];
    const chapterStars = chapter.phases.reduce((sum, phase) => {
        return sum + (progress.stars[phase.id] || 0);
    }, 0);
    const chapterProgress = Math.round((chapterStars / chapter.totalStars) * 100);
    
    // Atualizar painel
    document.getElementById('chapter-title').textContent = chapter.name;
    document.getElementById('chapter-description').textContent = chapter.description;
    document.getElementById('chapter-stars').textContent = `${chapterStars}/${chapter.totalStars}`;
    document.getElementById('chapter-progress').textContent = `${chapterProgress}%`;
    
    // Renderizar baús
    const chestsContainer = document.getElementById('chapter-chests');
    chestsContainer.innerHTML = '';
    
    const chestTypes = [
        { key: 'bronze', name: '🥉 Baú de Bronze', stars: chapter.totalStars / 3 },
        { key: 'silver', name: '🥈 Baú de Prata', stars: (chapter.totalStars * 2) / 3 },
        { key: 'gold', name: '🏆 Baú de Ouro', stars: chapter.totalStars }
    ];
    
    chestTypes.forEach(chest => {
        const isClaimed = progress.claimedChests[chapterId]?.includes(chest.key);
        const isUnlocked = chapterStars >= chest.stars;
        
        const chestEl = document.createElement('div');
        chestEl.className = `chest-item ${!isUnlocked ? 'locked' : ''}`;
        chestEl.innerHTML = `
            <div class="chest-icon">${chest.name.split(' ')[0]}</div>
            <div class="chest-info">
                <div class="chest-type">${chest.name}</div>
                <div class="chest-requirement">${Math.round(chest.stars)}/${chapter.totalStars} ⭐</div>
            </div>
            <div class="chest-arrow">${isClaimed ? '✓' : '→'}</div>
        `;
        
        if (isUnlocked && !isClaimed) {
            chestEl.onclick = () => openChestModal(chapter, chest.key);
        }
        
        chestsContainer.appendChild(chestEl);
    });
    
    // Mostrar painel
    document.getElementById('chapter-info-panel').style.display = 'block';
}

function closeChapterInfo() {
    document.getElementById('chapter-info-panel').style.display = 'none';
}

// ============================================================
//  BRIEFING DA FASE
// ============================================================
function showPhaseBriefing(phase, chapter) {
    currentStoryPhase = { ...phase, chapterId: chapter.id };
    
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];
    const stars = progress.stars[phase.id] || 0;
    
    // Atualizar modal com narrativa
    document.getElementById('briefing-title').textContent = `SETOR ${phase.number}`;
    document.getElementById('briefing-subtitle').textContent = phase.name;
    document.getElementById('briefing-icon').textContent = phase.isBoss ? '⚔️' : '⚙️';
    document.getElementById('briefing-story').textContent = phase.storyBefore || "Nenhuma transmissão adicional recebida.";
    document.getElementById('briefing-text').textContent = phase.briefing;
    
    // Renderizar estrelas anteriores
    const starsDisplay = document.getElementById('briefing-stars');
    starsDisplay.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = `star ${i < stars ? '' : 'empty'}`;
        star.textContent = '★';
        starsDisplay.appendChild(star);
    }
    
    // Mostrar modal
    document.getElementById('story-briefing-modal').classList.remove('hidden');
}

function showStoryIntro(jornada) {
    const modal = document.getElementById('story-intro-modal');
    const container = document.getElementById('story-intro-text');
    if (!modal || !container) return;

    container.innerHTML = '';
    jornada.introHistory.forEach((line, idx) => {
        const p = document.createElement('p');
        p.className = 'terminal-line';
        p.textContent = line;
        p.style.animationDelay = `${idx * 0.8}s`;
        container.appendChild(p);
    });

    modal.classList.remove('hidden');
}

function closeStoryIntro() {
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];
    progress.introSeen = true;
    saveStoryModeData();
    document.getElementById('story-intro-modal').classList.add('hidden');
    renderStoryMap();
}

function closeBriefingModal() {
    document.getElementById('story-briefing-modal').classList.add('hidden');
}

// ============================================================
//  INICIAR FASE DO JOGO
// ============================================================
function startStoryPhase() {
    if (!currentStoryPhase) return;
    
    closeBriefingModal();
    
    // Preparar configuração da fase
    const phaseConfig = {
        mode: 'STORY_MODE_PHASE',
        wordLength: currentStoryPhase.wordLength,
        // Respeitar a dificuldade global do jogador, mas permitir que a fase defina se for necessário (fallback)
        difficulty: (typeof globalDifficulty !== 'undefined') ? globalDifficulty : currentStoryPhase.difficulty,
        numBoards: currentStoryPhase.numBoards,
        maxAttempts: currentStoryPhase.maxAttempts,
        anomalies: currentStoryPhase.anomalies || [],
        timeLimit: currentStoryPhase.timeLimit || null,
        forbiddenLetters: currentStoryPhase.forbiddenLetters || [],
        isBoss: currentStoryPhase.isBoss,
        phaseId: currentStoryPhase.id,
        phaseName: currentStoryPhase.name,
        onPhaseComplete: handleStoryPhaseComplete
    };
    
    // Chamar função do jogo base para iniciar a fase
    if (storyGameCallbacks.startStoryGame) {
        storyGameCallbacks.startStoryGame(phaseConfig);
    } else {
        console.error('ERRO: Callback startStoryGame não inicializado.');
        if (typeof showToast === 'function') {
            showToast('Erro ao iniciar missão. Tente reabrir a Jornada pelo Menu.', 'error');
        }
        // Reabrir o modal se falhou para não deixar o usuário perdido
        document.getElementById('story-briefing-modal').classList.remove('hidden');
    }
}

function handleStoryPhaseComplete(won, starsEarned, coinsEarned, xpEarned) {
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];
    
    if (won) {
        // Marcar fase como completa
        if (!progress.completedPhases.includes(currentStoryPhase.id)) {
            progress.completedPhases.push(currentStoryPhase.id);
        }
        
        // Atualizar estrelas
        progress.stars[currentStoryPhase.id] = starsEarned;
        
        // Avançar para próxima fase
        if (progress.currentPhase === currentStoryPhase.number) {
            progress.currentPhase++;
        }
    }
    
    saveStoryModeData();
    
    // Mostrar modal de recompensa
    showRewardModal(won, starsEarned, coinsEarned, xpEarned);
}

// ============================================================
//  MODAL DE RECOMPENSA
// ============================================================
function showRewardModal(won, starsEarned, coinsEarned, xpEarned) {
    const modal = document.getElementById('story-reward-modal');
    const statusIcon = document.getElementById('reward-status-icon');
    const title = document.getElementById('reward-title');
    const starsEl = document.getElementById('stars-earned');
    const actionsContainer = document.getElementById('reward-actions');
    
    if (won) {
        statusIcon.textContent = '✅';
        title.textContent = 'FASE CONCLUÍDA!';
        statusIcon.style.filter = 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.6))';
        
        starsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = `star ${i < starsEarned ? '' : 'empty'}`;
            star.textContent = '★';
            if (i < starsEarned) {
                star.style.animation = `bounce 0.6s ease ${i * 0.1}s`;
            }
            starsEl.appendChild(star);
        }
    } else {
        statusIcon.textContent = '❌';
        title.textContent = 'FASE FALHADA';
        statusIcon.style.filter = 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))';
        starsEl.innerHTML = '<p style="color: #94a3b8; font-size: 16px;">Tente novamente para ganhar estrelas!</p>';
    }
    
    document.getElementById('reward-coins').textContent = `+${coinsEarned}`;
    document.getElementById('reward-xp').textContent = `+${xpEarned}`;
    
    let storyText = won ? 
        (currentStoryPhase.storyAfter || "Missão cumprida. O sistema está um passo mais limpo.") :
        "Falha crítica detectada. O Parasita repeliu nossa tentativa de purga.";
    
    // Revelar a palavra secreta na jornada se falhar
    if (!won && storyGameCallbacks.getCurrentWords) {
        const words = storyGameCallbacks.getCurrentWords();
        if (words && words.length > 0) {
            storyText += `\n\n[SISTEMA]: A chave de criptografia era: **${words.join(' | ').toUpperCase()}**`;
        }
    }
    
    document.getElementById('reward-story').innerText = storyText;
    
    actionsContainer.innerHTML = '';
    
    if (won) {
        const nextPhase = getFaseByNumber(STORY_MODE_DATA.activeJourney, currentStoryPhase.number + 1);
        if (nextPhase) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn-reward-next';
            nextBtn.textContent = 'PRÓXIMA FASE';
            nextBtn.onclick = () => {
                closeRewardModal();
                showPhaseBriefing(nextPhase, getCapitulo(STORY_MODE_DATA.activeJourney, nextPhase.chapterId));
            };
            actionsContainer.appendChild(nextBtn);
        }
    } else {
        // Botão Repetir na derrota
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn-reward-next'; // Usa o mesmo estilo de destaque
        retryBtn.textContent = 'REPETIR MISSÃO';
        retryBtn.onclick = () => {
            closeRewardModal();
            const chapter = getCapitulo(STORY_MODE_DATA.activeJourney, currentStoryPhase.chapterId);
            showPhaseBriefing(currentStoryPhase, chapter);
        };
        actionsContainer.appendChild(retryBtn);
    }
    
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-reward-back';
    backBtn.textContent = 'VOLTAR AO MAPA';
    backBtn.onclick = closeRewardModal;
    actionsContainer.appendChild(backBtn);
    
    modal.classList.remove('hidden');
}

function closeRewardModal() {
    document.getElementById('story-reward-modal').classList.add('hidden');
    // Forçar a volta para a aba da jornada
    if (typeof showMainTab === 'function') {
        showMainTab('story-mode');
    }
    renderStoryMap();
}

// ============================================================
//  MODAL DE BAÚ
// ============================================================
function openChestModal(chapter, chestType) {
    const chest = chapter.chestRewards[chestType];
    const header = document.getElementById('chest-header');
    const rewards = document.getElementById('chest-rewards');
    
    const chestIcons = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🏆'
    };
    
    const chestNames = {
        bronze: 'Baú de Bronze',
        silver: 'Baú de Prata',
        gold: 'Baú de Ouro'
    };
    
    header.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">${chestIcons[chestType]}</div>
        <h2>${chestNames[chestType]}</h2>
    `;
    
    rewards.innerHTML = `
        <div class="chest-reward-item">
            <span class="chest-reward-label">💰 Moedas</span>
            <span class="chest-reward-value">+${chest.coins}</span>
        </div>
        <div class="chest-reward-item">
            <span class="chest-reward-label">⭐ XP</span>
            <span class="chest-reward-value">+${chest.xp}</span>
        </div>
        ${chest.item ? `
            <div class="chest-reward-item">
                <span class="chest-reward-label">🎖️ Emblema</span>
                <span class="chest-reward-value">${chest.item}</span>
            </div>
        ` : ''}
        ${chest.skin ? `
            <div class="chest-reward-item">
                <span class="chest-reward-label">🎨 Skin</span>
                <span class="chest-reward-value">${chest.skin}</span>
            </div>
        ` : ''}
    `;
    
    // Armazenar dados para reivindicação
    window.pendingChestClaim = { chapter, chestType, chest };
    
    document.getElementById('story-chest-modal').classList.remove('hidden');
}

function closeChestModal() {
    document.getElementById('story-chest-modal').classList.add('hidden');
}

function claimChest() {
    const { chapter, chestType, chest } = window.pendingChestClaim;
    const progress = STORY_MODE_DATA.progress[STORY_MODE_DATA.activeJourney];
    
    // Marcar baú como reivindicado
    if (!progress.claimedChests[chapter.id]) {
        progress.claimedChests[chapter.id] = [];
    }
    progress.claimedChests[chapter.id].push(chestType);
    
    // Adicionar recompensas (será integrado com userStats do jogo base)
    if (storyGameCallbacks.addRewards) {
        storyGameCallbacks.addRewards({
            coins: chest.coins,
            xp: chest.xp,
            item: chest.item,
            skin: chest.skin
        });
    }
    
    saveStoryModeData();
    closeChestModal();
    showChapterInfo(chapter.id);
}

// ============================================================
//  SELETOR DE JORNADAS
// ============================================================
function switchJourney(journeyId) {
    STORY_MODE_DATA.activeJourney = journeyId;
    saveStoryModeData();
    
    // Atualizar botões
    document.querySelectorAll('.journey-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.journey-btn').classList.add('active');
    
    renderStoryMap();
}

// ============================================================
//  SISTEMA DE ANOMALIAS
// ============================================================
function applyStoryAnomaly(anomalyType, config) {
    switch (anomalyType) {
        case 'THERMAL_OVERLOAD':
            return applyThermalOverload(config);
        case 'BLOCKED_CELLS':
            return applyBlockedCells(config);
        case 'FORBIDDEN_LETTERS':
            return applyForbiddenLetters(config);
        case 'DELAYED_FEEDBACK':
            return applyDelayedFeedback(config);
        case 'AVALANCHE_ACCELERATED':
            return applyAvalancheAccelerated(config);
        case 'CONVEYOR_CHAOS':
            return applyConveyorChaos(config);
        case 'TIME_BONUS':
            return applyTimeBonus(config);
        default:
            return null;
    }
}

function applyThermalOverload(config) {
    // Cronômetro regressivo
    return {
        type: 'THERMAL_OVERLOAD',
        timeLimit: config.timeLimit || 90,
        description: 'Sobrecarga Térmica: Cronômetro regressivo ativo!'
    };
}

function applyBlockedCells(config) {
    // Células bloqueadas aleatórias
    const blockedCount = config.blockedCount || 2;
    const blockedPositions = [];
    
    for (let i = 0; i < blockedCount; i++) {
        blockedPositions.push(Math.floor(Math.random() * 5));
    }
    
    return {
        type: 'BLOCKED_CELLS',
        blockedPositions,
        description: `Trilhas Queimadas: ${blockedCount} célula(s) bloqueada(s)`
    };
}

function applyForbiddenLetters(config) {
    // Letras proibidas
    return {
        type: 'FORBIDDEN_LETTERS',
        forbiddenLetters: config.forbiddenLetters || ['X', 'Z'],
        description: `Frequência Bloqueada: Letras ${config.forbiddenLetters?.join(', ')} proibidas`
    };
}

function applyDelayedFeedback(config) {
    // Feedback atrasado (cores não aparecem até 4º palpite)
    return {
        type: 'DELAYED_FEEDBACK',
        delayUntilAttempt: 4,
        description: 'Código Fantasma: Feedback atrasado até o 4º palpite'
    };
}

function applyAvalancheAccelerated(config) {
    // Avalanche acelerada (múltiplos tabuleiros)
    return {
        type: 'AVALANCHE_ACCELERATED',
        description: 'Avalanche Acelerada: Múltiplos tabuleiros simultâneos'
    };
}

function applyConveyorChaos(config) {
    // Caos de esteira (novos tabuleiros a cada 2 erros)
    return {
        type: 'CONVEYOR_CHAOS',
        newBoardPerErrors: 2,
        description: 'Caos de Esteira: Novo tabuleiro a cada 2 erros'
    };
}

function applyTimeBonus(config) {
    // Bônus de tempo por letras verdes
    return {
        type: 'TIME_BONUS',
        bonusPerCorrectLetter: config.timeBonus || 10,
        description: 'Bônus de Tempo: +10s por letra verde'
    };
}

// ============================================================
//  UTILITÁRIOS
// ============================================================
function normalizeStoryWord(word) {
    if (!word) return '';
    return word.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Adicionar animação de bounce ao CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

console.log('✅ story_mode.js carregado');
