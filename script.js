/**
 * CORE GAMES PLATFORM - Main Script v2.1.0 CORRIGIDO
 * Gerencia a plataforma completa com autenticação sincronizada
 */

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Core Games Platform v2.1.0');

    try {
        // Inicializar autenticação
        await initAuth();
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        showToast('Erro ao inicializar plataforma', 'error');
    }
});

// ============================================================
// INICIALIZAR AUTENTICAÇÃO
// ============================================================
async function initAuth() {
    try {
        // Inicializar auth manager
        await authManager.initSupabase();

        // Escutar mudanças de autenticação
        authManager.onAuthStateChange((user) => {
            if (user) {
                showAuthenticatedScreen();
            } else {
                showLoginScreen();
            }
        });

        // Verificar se já está autenticado
        const user = authManager.getCurrentUser();
        if (user) {
            showAuthenticatedScreen();
        } else {
            showLoginScreen();
        }

        console.log('✅ Autenticação inicializada');
    } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        showLoginScreen();
    }
}

// ============================================================
// MOSTRAR TELA DE LOGIN
// ============================================================
async function showLoginScreen() {
    try {
        document.getElementById('screen-authenticated').classList.remove('active');
        document.getElementById('screen-login').classList.add('active');

        await unifiedAuthUI.init(authManager);
        await unifiedAuthUI.renderLoginScreen();

        console.log('✅ Tela de login renderizada');
    } catch (error) {
        console.error('❌ Erro ao mostrar login:', error);
    }
}

// ============================================================
// MOSTRAR TELA AUTENTICADA
// ============================================================
async function showAuthenticatedScreen() {
    try {
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-authenticated').classList.add('active');

        // Renderizar header com navegação
        await unifiedAuthUI.renderAuthenticatedHeader();

        // Inicializar todos os managers
        await initializeAllManagers();

        // Renderizar todas as abas
        await renderAllTabs();

        // Adicionar event listeners
        attachTabListeners();

        console.log('✅ Tela autenticada renderizada');
    } catch (error) {
        console.error('❌ Erro ao mostrar tela autenticada:', error);
    }
}

// ============================================================
// INICIALIZAR TODOS OS MANAGERS
// ============================================================
async function initializeAllManagers() {
    try {
        const userId = authManager.getUserId();
        const supabaseClient = window.supabase;

        // Profile
        if (typeof globalProfileManager !== 'undefined') {
            await globalProfileManager.init(supabaseClient);
            await globalProfileManager.setCurrentUser(userId);
        }

        // Social
        if (typeof globalSocialManager !== 'undefined') {
            await globalSocialManager.init(supabaseClient);
            await globalSocialManager.setCurrentUser(userId);
        }

        // Achievements
        if (typeof globalAchievementsManager !== 'undefined') {
            await globalAchievementsManager.init(supabaseClient);
            await globalAchievementsManager.setCurrentUser(userId);
        }

        // Shop
        if (typeof universalShopManager !== 'undefined') {
            await universalShopManager.init(supabaseClient);
            await universalShopManager.setCurrentUser(userId);
        }

        // Roulette
        if (typeof platformRouletteManager !== 'undefined') {
            await platformRouletteManager.init(supabaseClient);
            await platformRouletteManager.setCurrentUser(userId);
        }

        // UI Components
        if (typeof globalProfileUI !== 'undefined') {
            await globalProfileUI.init(globalProfileManager);
        }
        if (typeof globalSocialUI !== 'undefined') {
            await globalSocialUI.init(globalSocialManager);
        }
        if (typeof globalAchievementsUI !== 'undefined') {
            await globalAchievementsUI.init(globalAchievementsManager);
        }
        if (typeof universalShopUI !== 'undefined') {
            await universalShopUI.init(universalShopManager);
        }
        if (typeof platformRouletteUI !== 'undefined') {
            await platformRouletteUI.init(platformRouletteManager);
        }
        if (typeof gameSelectorUI !== 'undefined') {
            gameSelectorUI.initializeGamesCatalog();
        }

        console.log('✅ Todos os managers inicializados');
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

        console.log('✅ Todas as abas renderizadas');
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
// FUNÇÃO GLOBAL: MOSTRAR TOAST
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

// ============================================================
// FUNÇÃO GLOBAL: JOGAR JOGO
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
        await authManager.syncWithGame(gameId);

        // Redirecionar
        window.location.href = game.path;
    } catch (error) {
        console.error('❌ Erro ao jogar:', error);
        showToast('Erro ao iniciar jogo', 'error');
    }
}

// ============================================================
// FUNÇÃO GLOBAL: LOGOUT
// ============================================================
async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        const success = await authManager.logout();
        if (success) {
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }
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
`;
document.head.appendChild(style);

console.log('✅ Core Games Platform v2.1.0 carregado');
