/**
 * CORE GAMES PLATFORM - Main Script v2.1.0
 * Gerencia autenticação e abas da plataforma
 * Usa o sistema de login do TermoCore para validações completas
 */

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
let currentUserSupabaseId = null;
let userStats = {};

// ============================================================
// FUNÇÃO PARA ESCONDER SPINNER
// ============================================================
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
        setTimeout(() => {
            spinner.style.display = 'none';
        }, 300);
    }
}

// ============================================================
// ADICIONAR EVENT LISTENERS
// ============================================================
function attachEventListeners() {
    console.log('🔗 Vinculando eventos aos botões...');
    
    // Botões de login
    document.getElementById('btn-login')?.addEventListener('click', handleAuth);
    document.getElementById('btn-toggle-mode')?.addEventListener('click', toggleAuthMode);
    document.getElementById('btn-guest-login')?.addEventListener('click', handleGuestLogin);
    
    // Botões de registro
    document.getElementById('btn-register')?.addEventListener('click', handleRegister);
    document.getElementById('btn-toggle-mode-2')?.addEventListener('click', toggleAuthMode);
    
    // Botões de toggle de senha
    document.getElementById('toggle-auth-pin')?.addEventListener('click', () => togglePasswordVisibility('auth-pin'));
    document.getElementById('toggle-reg-pin')?.addEventListener('click', () => togglePasswordVisibility('reg-pin'));
    document.getElementById('toggle-reg-pin-confirm')?.addEventListener('click', () => togglePasswordVisibility('reg-pin-confirm'));
    
    console.log('✅ Event listeners adicionados com sucesso');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('load', async () => {
    // Vincular eventos imediatamente
    attachEventListeners();

    console.log('🚀 Iniciando Core Games Platform v2.1.0');

    try {
        // Aguardar um pouco para o TermoCore carregar
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar se o TermoCore já fez login
        const platformUser = localStorage.getItem('cg_current_user');
        
        if (platformUser) {
            try {
                const userData = JSON.parse(platformUser);
                currentUserSupabaseId = userData.id;
                console.log('✅ Usuário autenticado:', userData.username);
                
                // Esconder spinner
                hideLoadingSpinner();
                
                // Mostrar tela principal
                showScreen('main');
                
                // Inicializar plataforma
                await initializePlatform();
            } catch (e) {
                console.error('❌ Erro ao parsear usuário:', e);
            }
        } else {
            console.log('⋳ Aguardando autenticação...');
            // Esconder spinner mesmo sem autenticação
            hideLoadingSpinner();
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar plataforma:', error);
    }
});

// ============================================================
// MONITORAR MUDANÇAS DE AUTENTICAÇÃO
// ============================================================
const authCheckInterval = setInterval(async () => {
    const platformUser = localStorage.getItem('cg_current_user');
    
    if (platformUser && !currentUserSupabaseId) {
        try {
            const userData = JSON.parse(platformUser);
            currentUserSupabaseId = userData.id;
            console.log('✅ Usuário autenticado (monitoramento):', userData.username);
            
            // Mostrar tela principal
            showScreen('main');
            
            // Inicializar plataforma
            await initializePlatform();
            
            // Parar de monitorar
            clearInterval(authCheckInterval);
        } catch (e) {
            console.error('❌ Erro ao parsear usuário:', e);
        }
    }
}, 500);

// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO (Wrapper do TermoCore)
// ============================================================

/**
 * Login com Email/Usuário e Senha
 * Usa o sistema de login do TermoCore
 */
async function handleAuth() {
    const userInput = document.getElementById('auth-user').value.trim();
    const password = document.getElementById('auth-pin').value;

    if (!userInput || !password) {
        showToast('Preencha email/usuário e senha', 'error');
        return;
    }

    try {
        // Chamar a função de login do TermoCore
        const result = await loginUser(userInput, password);
        
        if (result.success && result.user) {
            // Sincronizar com localStorage da plataforma
            const user = result.user;
            localStorage.setItem('cg_auth_token', 'authenticated');
            localStorage.setItem('cg_current_user', JSON.stringify({
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || user.email.split('@')[0],
                is_guest: user.user_metadata?.is_guest || false
            }));

            showToast('✅ Login realizado com sucesso!', 'success');
            
            // Aguardar um pouco e recarregar
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(result.error || 'Erro ao fazer login', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        showToast('Erro ao fazer login', 'error');
    }
}

/**
 * Criar nova conta
 * Usa o sistema de registro do TermoCore
 */
async function handleRegister() {
    const email = document.getElementById('reg-user').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-pin').value;
    const confirmPassword = document.getElementById('reg-pin-confirm').value;

    if (!email || !username || !password || !confirmPassword) {
        showToast('Preencha todos os campos', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('As senhas não coincidem', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    try {
        // Chamar a função de registro do TermoCore
        const result = await registerUser(email, password, username);
        
        if (result.success && result.user) {
            showToast('✅ Conta criada com sucesso! Faça login.', 'success');
            
            // Voltar para tela de login
            toggleAuthMode();
            
            // Limpar campos
            document.getElementById('reg-user').value = '';
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-pin').value = '';
            document.getElementById('reg-pin-confirm').value = '';
        } else {
            showToast(result.error || 'Erro ao criar conta', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao criar conta:', error);
        showToast('Erro ao criar conta', 'error');
    }
}

/**
 * Jogar como Visitante
 * Usa o sistema de visitante do TermoCore
 */
async function handleGuestLogin() {
    try {
        // Chamar a função de visitante do TermoCore
        const result = await registerGuestUser();
        
        if (result.success && result.user) {
            // Sincronizar com localStorage da plataforma
            const user = result.user;
            localStorage.setItem('cg_auth_token', 'guest');
            localStorage.setItem('cg_current_user', JSON.stringify({
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || 'Visitante',
                is_guest: true
            }));

            showToast('✅ Bem-vindo, visitante!', 'success');
            
            // Aguardar um pouco e recarregar
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(result.error || 'Erro ao fazer login como visitante', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login como visitante:', error);
        showToast('Erro ao fazer login como visitante', 'error');
    }
}

/**
 * Toggle entre login e registro
 */
function toggleAuthMode() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
    }
}

/**
 * Toggle visibilidade de senha
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    // Atualizar ícone do botão
    const btn = input.parentElement?.querySelector('.toggle-password-btn');
    if (btn) {
        btn.classList.toggle('password-hidden');
    }
}

// ============================================================
// MOSTRAR/OCULTAR TELAS
// ============================================================
function showScreen(screenName) {
    try {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(`screen-${screenName}`);
        if (screen) {
            screen.classList.add('active');
        }
    } catch (error) {
        console.error('❌ Erro ao mudar tela:', error);
    }
}

// ============================================================
// INICIALIZAR PLATAFORMA
// ============================================================
async function initializePlatform() {
    try {
        console.log('📱 Inicializando plataforma...');

        // Renderizar header
        await renderPlatformHeader();

        // Renderizar conteúdo padrão das abas
        await initializeDefaultContent();
        
        // Renderizar abas melhoradas com dados reais
        await renderEnhancedProfile();
        await renderEnhancedShop();
        await renderEnhancedSocial();
        await renderEnhancedAchievements();
        
        // Iniciar sincronização periódica
        startDataSyncInterval();
        startProfileUpdateInterval();
        startShopUpdateInterval();
        startAchievementsUpdateInterval();
        
        if (typeof initializeDefaultContent === 'function') {
            initializeDefaultContent();
            console.log('✅ Conteúdo padrão renderizado');
        }

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

        const platformUser = localStorage.getItem('cg_current_user');
        let username = 'Usuário';
        let level = 1;

        if (platformUser) {
            try {
                const userData = JSON.parse(platformUser);
                username = userData.username || 'Usuário';
            } catch (e) {
                console.error('❌ Erro ao parsear usuário:', e);
            }
        }

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
// LOGOUT
// ============================================================
async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        try {
            // Limpar localStorage
            localStorage.removeItem('cg_auth_token');
            localStorage.removeItem('cg_current_user');
            localStorage.removeItem('cg_current_game');

            // Limpar variáveis
            currentUserSupabaseId = null;
            userStats = {};

            // Voltar para login
            showScreen('login');
            
            // Resetar formulários
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');

            showToast('Desconectado com sucesso', 'success');
            
            // Recarregar página
            setTimeout(() => {
                window.location.reload();
            }, 1500);
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
        // Ícone baseado no tipo
        const icon = type === 'success' ? '✅' : 
                     type === 'error' ? '❌' : 
                     type === 'warning' ? '⚠️' : 'ℹ️';
        
        toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
        
        const bgColor = type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : 
                       type === 'warning' ? '#f59e0b' : '#3b82f6';
        
        const borderColor = type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
                           type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                           type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 14px 20px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            z-index: 9999;
            max-width: 320px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 2px solid ${borderColor};
            display: flex;
            align-items: center;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    } catch (error) {
        console.error('❌ Erro ao mostrar toast:', error);
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

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .loading-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    .loading-spinner.hidden {
        opacity: 0;
        pointer-events: none;
    }

    .spinner-circle {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(0, 212, 255, 0.2);
        border-top: 4px solid #00d4ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }

    .loading-spinner p {
        color: #00d4ff;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 2px;
    }

    .screen {
        display: none;
    }

    .screen.active {
        display: flex;
    }

    #screen-main.active {
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

    #screen-login {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    #screen-login .login-container {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
    }

    #screen-login .auth-container {
        width: 100%;
        max-width: 400px;
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

console.log('✅ Core Games Platform v2.1.0 carregado - Usando login do TermoCore');
