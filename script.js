/**
 * CORE GAMES PLATFORM - Main Script v2.1.0
 * Inicializa a plataforma e gerencia o fluxo principal
 */

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Core Games Platform v2.1.0');
    
    try {
        // Inicializar Supabase
        const supabaseInitialized = await authManager.initSupabase();
        if (!supabaseInitialized) {
            showToast('Erro ao conectar com o servidor', 'error');
            return;
        }

        // Verificar se usuário está autenticado
        const user = await authManager.getCurrentUser();
        
        if (user) {
            // Usuário já logado → ir para Game Selector
            console.log('✅ Usuário autenticado:', user.email);
            showScreen('screen-games-selector');
            await gameSelector.renderGameSelector();
        } else {
            // Não logado → mostrar tela de login
            console.log('🔐 Nenhum usuário autenticado');
            showScreen('screen-login');
            authUI.renderLoginScreen();
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar plataforma:', error);
        showToast('Erro ao inicializar plataforma', 'error');
    }
});

// ============================================================
// VERIFICAR RETORNO DE JOGO
// ============================================================
window.addEventListener('focus', async () => {
    // Quando o usuário volta da aba do jogo
    const currentGame = getFromLocalStorage(STORAGE_KEYS.CURRENT_GAME);
    
    if (currentGame) {
        // Limpar jogo atual
        removeFromLocalStorage(STORAGE_KEYS.CURRENT_GAME);
        
        // Verificar se usuário ainda está autenticado
        const user = await authManager.getCurrentUser();
        
        if (user) {
            // Recarregar Game Selector
            console.log('🔄 Retornando do jogo:', currentGame);
            showScreen('screen-games-selector');
            await gameSelector.renderGameSelector();
        } else {
            // Sessão expirou
            showToast('Sua sessão expirou', 'warning');
            showScreen('screen-login');
            authUI.renderLoginScreen();
        }
    }
});

// ============================================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================================
window.addEventListener('error', (event) => {
    console.error('❌ Erro global:', event.error);
    showToast('Ocorreu um erro inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejection não tratada:', event.reason);
    showToast('Erro ao processar requisição', 'error');
});

// ============================================================
// DETECTAR MUDANÇAS DE VISIBILIDADE
// ============================================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 Plataforma minimizada');
    } else {
        console.log('👀 Plataforma em foco');
    }
});

// ============================================================
// PREVENIR RELOAD ACIDENTAL
// ============================================================
window.addEventListener('beforeunload', (event) => {
    const currentGame = getFromLocalStorage(STORAGE_KEYS.CURRENT_GAME);
    
    if (currentGame) {
        // Se estiver em um jogo, avisar
        event.preventDefault();
        event.returnValue = '';
    }
});

// ============================================================
// LOGS
// ============================================================
console.log('✅ Core Games Platform v2.1.0 carregado');
console.log('📍 Ambiente:', window.location.hostname);
console.log('🎮 Jogos disponíveis:', GAMES_CATALOG.length);
