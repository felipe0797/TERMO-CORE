/**
 * CORE GAMES PLATFORM - Main Script v2.1.0
 * Usa o sistema de login do TermoCore + Plataforma com abas
 */

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
let currentUserSupabaseId = null;
let isGuest = false;
let userStats = {};
let authMode = 'login';

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Core Games Platform v2.1.0');

    try {
        // Inicializar Supabase
        initSupabase();

        // Verificar se já está autenticado
        const user = await getCurrentUser();
        if (user) {
            currentUserSupabaseId = user.id;
            await loadUserStats();
            showScreen('main');
            await initializePlatform();
        } else {
            showScreen('login');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        showScreen('login');
    }
});

// ============================================================
// MOSTRAR/OCULTAR TELAS
// ============================================================
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screen = document.getElementById(`screen-${screenName}`);
    if (screen) {
        screen.classList.add('active');
    }
}

// ============================================================
// AUTENTICAÇÃO (Do TermoCore)
// ============================================================
async function handleAuth() {
    const userInput = document.getElementById('auth-user').value.trim();
    const password = document.getElementById('auth-pin').value;

    if (!userInput || !password) {
        showToast('Preencha email/usuário e senha', 'error');
        return;
    }

    const result = await loginUser(userInput, password);
    if (result.success) {
        currentUserSupabaseId = result.userId;
        isGuest = false;
        await loadUserStats();
        
        // Sincronizar com localStorage para TermoCore
        localStorage.setItem('cg_auth_token', result.token || 'authenticated');
        localStorage.setItem('cg_current_user', JSON.stringify({
            id: result.userId,
            email: result.email,
            username: result.username,
            is_guest: false
        }));

        showScreen('main');
        await initializePlatform();
        showToast('✅ Login realizado com sucesso!', 'success');
    } else {
        showToast(result.error || 'Erro ao fazer login', 'error');
    }
}

async function handleRegister() {
    const email = document.getElementById('reg-user').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-pin').value;
    const passwordConfirm = document.getElementById('reg-pin-confirm').value;

    if (!email || !username || !password || !passwordConfirm) {
        showToast('Preencha todos os campos', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showToast('As senhas não correspondem', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    const result = await registerUser(email, password, username, false);
    if (result.success) {
        currentUserSupabaseId = result.userId;
        isGuest = false;
        await loadUserStats();

        // Sincronizar com localStorage para TermoCore
        localStorage.setItem('cg_auth_token', result.token || 'authenticated');
        localStorage.setItem('cg_current_user', JSON.stringify({
            id: result.userId,
            email: email,
            username: username,
            is_guest: false
        }));

        showScreen('main');
        await initializePlatform();
        showToast('✅ Conta criada com sucesso!', 'success');
    } else {
        showToast(result.error || 'Erro ao criar conta', 'error');
    }
}

async function handleGuestLogin() {
    const result = await loginAsGuest();
    if (result.success) {
        currentUserSupabaseId = result.userId;
        isGuest = true;
        await loadUserStats();

        // Sincronizar com localStorage para TermoCore
        localStorage.setItem('cg_auth_token', result.token || 'guest');
        localStorage.setItem('cg_current_user', JSON.stringify({
            id: result.userId,
            email: 'visitante@termocore.local',
            username: 'Visitante',
            is_guest: true
        }));

        showScreen('main');
        await initializePlatform();
        showToast('✅ Bem-vindo, visitante!', 'success');
    } else {
        showToast(result.error || 'Erro ao entrar como visitante', 'error');
    }
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(`toggle-${inputId}`);
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.classList.remove('password-hidden');
    } else {
        input.type = 'password';
        btn.classList.add('password-hidden');
    }
}

// ============================================================
// CARREGAR STATS DO USUÁRIO
// ============================================================
async function loadUserStats() {
    try {
        const client = getSupabaseClient();
        if (!client || !currentUserSupabaseId) return;

        const { data, error } = await client
            .from('game_stats')
            .select('*')
            .eq('user_id', currentUserSupabaseId)
            .maybeSingle();

        if (error) {
            console.warn('⚠️ Erro ao carregar stats:', error);
            userStats = getDefaultUserStats();
        } else if (data) {
            userStats = data;
        } else {
            userStats = getDefaultUserStats();
        }

        console.log('✅ Stats carregados:', userStats);
    } catch (error) {
        console.error('❌ Erro ao carregar stats:', error);
        userStats = getDefaultUserStats();
    }
}

function getDefaultUserStats() {
    return {
        xp: 0,
        coins: 0,
        tickets: 1,
        totalGames: 0,
        ownedItems: [],
        activeCosmetics: {},
        activeTheme: 'theme_default'
    };
}

// ============================================================
// INICIALIZAR PLATAFORMA
// ============================================================
async function initializePlatform() {
    try {
        // Renderizar header
        await renderPlatformHeader();

        // Inicializar todos os managers
        await initializeAllManagers();

        // Renderizar todas as abas
        await renderAllTabs();

        // Anexar event listeners
        attachTabListeners();

        console.log('✅ Plataforma inicializada');
    } catch (error) {
        console.error('❌ Erro ao inicializar plataforma:', error);
    }
}

// ============================================================
// RENDERIZAR HEADER
// ============================================================
async function renderPlatformHeader() {
    try {
        const headerDiv = document.getElementById('platform-header');
        if (!headerDiv) return;

        const username = await getUserUsername() || 'Usuário';
        const level = getLevelInfo(userStats.xp || 0).level;

        headerDiv.innerHTML = `
            <div class="platform-header">
                <div class="header-left">
                    <h1 class="header-title">🎮 CORE GAMES</h1>
                </div>
                <div class="header-nav">
                    <button data-nav-btn="games" class="nav-btn active" onclick="switchTab('games')">🎮 Jogos</button>
                    <button data-nav-btn="profile" class="nav-btn" onclick="switchTab('profile')">👤 Perfil</button>
                    <button data-nav-btn="social" class="nav-btn" onclick="switchTab('social')">👥 Social</button>
                    <button data-nav-btn="achievements" class="nav-btn" onclick="switchTab('achievements')">🏆 Conquistas</button>
                    <button data-nav-btn="shop" class="nav-btn" onclick="switchTab('shop')">🛒 Loja</button>
                    <button data-nav-btn="roulette" class="nav-btn" onclick="switchTab('roulette')">🎡 Roleta</button>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <span class="user-level">Nível ${level}</span>
                        <span class="user-name">${username}</span>
                    </div>
                    <button onclick="handleLogout()" class="btn-logout">Sair</button>
                </div>
            </div>
        `;

        console.log('✅ Header renderizado');
    } catch (error) {
        console.error('❌ Erro ao renderizar header:', error);
    }
}

// ============================================================
// INICIALIZAR TODOS OS MANAGERS
// ============================================================
async function initializeAllManagers() {
    try {
        const client = getSupabaseClient();

        // Profile
        if (typeof globalProfileManager !== 'undefined') {
            await globalProfileManager.init(client);
            await globalProfileManager.setCurrentUser(currentUserSupabaseId);
        }

        // Social
        if (typeof globalSocialManager !== 'undefined') {
            await globalSocialManager.init(client);
            await globalSocialManager.setCurrentUser(currentUserSupabaseId);
        }

        // Achievements
        if (typeof globalAchievementsManager !== 'undefined') {
            await globalAchievementsManager.init(client);
            await globalAchievementsManager.setCurrentUser(currentUserSupabaseId);
        }

        // Shop
        if (typeof universalShopManager !== 'undefined') {
            await universalShopManager.init(client);
            await universalShopManager.setCurrentUser(currentUserSupabaseId);
        }

        // Roulette
        if (typeof platformRouletteManager !== 'undefined') {
            await platformRouletteManager.init(client);
            await platformRouletteManager.setCurrentUser(currentUserSupabaseId);
        }

        console.log('✅ Managers inicializados');
    } catch (error) {
        console.error('❌ Erro ao inicializar managers:', error);
    }
}

// ============================================================
// RENDERIZAR TODAS AS ABAS
// ============================================================
async function renderAllTabs() {
    try {
        // Jogos
        if (typeof gameSelectorUI !== 'undefined') {
            await gameSelectorUI.renderGameSelector();
        }

        // Perfil
        if (typeof globalProfileUI !== 'undefined') {
            await globalProfileUI.renderGlobalProfile();
        }

        // Social
        if (typeof globalSocialUI !== 'undefined') {
            await globalSocialUI.renderGlobalSocial();
        }

        // Conquistas
        if (typeof globalAchievementsUI !== 'undefined') {
            await globalAchievementsUI.renderGlobalAchievements();
        }

        // Loja
        if (typeof universalShopUI !== 'undefined') {
            await universalShopUI.renderShop();
        }

        // Roleta
        if (typeof platformRouletteUI !== 'undefined') {
            await platformRouletteUI.renderRoulette();
        }

        console.log('✅ Abas renderizadas');
    } catch (error) {
        console.error('❌ Erro ao renderizar abas:', error);
    }
}

// ============================================================
// NAVEGAÇÃO ENTRE ABAS
// ============================================================
function switchTab(tabName) {
    try {
        // Esconder todas as abas
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });

        // Mostrar aba selecionada
        const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Atualizar botões
        document.querySelectorAll('[data-nav-btn]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-nav-btn="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        console.log(`✅ Mudou para aba: ${tabName}`);
    } catch (error) {
        console.error('❌ Erro ao mudar aba:', error);
    }
}

// ============================================================
// ANEXAR EVENT LISTENERS
// ============================================================
function attachTabListeners() {
    try {
        const navButtons = document.querySelectorAll('[data-nav-btn]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.getAttribute('data-nav-btn');
                switchTab(tabName);
            });
        });

        console.log('✅ Event listeners anexados');
    } catch (error) {
        console.error('❌ Erro ao anexar listeners:', error);
    }
}

// ============================================================
// JOGAR JOGO
// ============================================================
async function playGame(gameId) {
    try {
        if (typeof gameSelectorUI === 'undefined') {
            showToast('Erro ao iniciar jogo', 'error');
            return;
        }

        const game = gameSelectorUI.games.find(g => g.id === gameId);
        if (!game || game.status !== 'available') {
            showToast('Jogo não disponível', 'warning');
            return;
        }

        // Sincronizar com jogo
        localStorage.setItem('cg_current_game', gameId);

        // Redirecionar
        window.location.href = game.path;
    } catch (error) {
        console.error('❌ Erro ao jogar:', error);
        showToast('Erro ao iniciar jogo', 'error');
    }
}

// ============================================================
// LOGOUT
// ============================================================
async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        try {
            const client = getSupabaseClient();
            if (client) {
                await client.auth.signOut();
            }

            // Limpar localStorage
            localStorage.removeItem('cg_auth_token');
            localStorage.removeItem('cg_current_user');
            localStorage.removeItem('cg_current_game');

            // Limpar variáveis
            currentUserSupabaseId = null;
            isGuest = false;
            userStats = {};

            // Voltar para login
            showScreen('login');
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('register-form').classList.add('hidden');
            authMode = 'login';

            showToast('Desconectado com sucesso', 'success');
        } catch (error) {
            console.error('❌ Erro ao desconectar:', error);
            showToast('Erro ao desconectar', 'error');
        }
    }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function showToast(message, type = 'info') {
    try {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const bgColor = type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : 
                       type === 'warning' ? '#f59e0b' : '#3b82f6';
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    } catch (error) {
        console.error('❌ Erro ao mostrar toast:', error);
    }
}

function getLevelInfo(xp) {
    const level = Math.floor(xp / 100) + 1;
    const xpForLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const progress = ((xp - xpForLevel) / (xpForNextLevel - xpForLevel)) * 100;
    return { level, progress: Math.min(progress, 100) };
}

// ============================================================
// ADICIONAR ESTILOS GLOBAIS
// ============================================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .screen {
        display: none;
    }

    .screen.active {
        display: block;
    }

    [data-tab] {
        display: none;
    }

    [data-tab].active {
        display: block;
        animation: fadeIn 0.3s ease;
    }

    #main-content {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .platform-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-bottom: 2px solid #00d4ff;
        gap: 20px;
        flex-wrap: wrap;
    }

    .header-title {
        color: #00d4ff;
        font-size: 24px;
        margin: 0;
        font-weight: 700;
    }

    .header-nav {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .nav-btn {
        padding: 8px 16px;
        background: rgba(0, 212, 255, 0.1);
        color: #cbd5e0;
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 14px;
    }

    .nav-btn:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: rgba(0, 212, 255, 0.5);
    }

    .nav-btn.active {
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        color: #000;
        border-color: #00d4ff;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .user-level {
        color: #00d4ff;
        font-weight: 700;
        font-size: 12px;
    }

    .user-name {
        color: #cbd5e0;
        font-size: 14px;
    }

    .btn-logout {
        padding: 8px 16px;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.5);
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 14px;
    }

    .btn-logout:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.7);
    }

    @media (max-width: 768px) {
        .platform-header {
            flex-direction: column;
            align-items: stretch;
        }

        .header-nav {
            justify-content: center;
        }

        .header-right {
            justify-content: space-between;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Core Games Platform v2.1.0 carregado');
