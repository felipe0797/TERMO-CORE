/**
 * UNIFIED AUTH UI - Core Games Platform
 * Interface de autenticação unificada
 */

class UnifiedAuthUI {
    constructor() {
        this.authManager = null;
        this.currentMode = 'login'; // login, register, reset
    }

    async init(authManager) {
        this.authManager = authManager;
        console.log('✅ UnifiedAuthUI inicializado');
    }

    // ============================================================
    // RENDERIZAR TELA DE LOGIN
    // ============================================================
    async renderLoginScreen() {
        const container = document.getElementById('screen-login') || 
                         document.querySelector('[data-screen="login"]');
        if (!container) return;

        container.innerHTML = `
            <div class="auth-container">
                <!-- LOGO -->
                <div class="auth-logo">
                    <h1>🎮 Core Games</h1>
                    <p>Biblioteca de Jogos</p>
                </div>

                <!-- FORM CONTAINER -->
                <div class="auth-form-container">
                    <!-- LOGIN FORM -->
                    <form id="login-form" class="auth-form active" onsubmit="unifiedAuthUI.handleLogin(event)">
                        <h2>Bem-vindo de Volta</h2>
                        
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                placeholder="seu@email.com"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="login-password">Senha</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                placeholder="••••••••"
                                required
                            >
                        </div>

                        <button type="submit" class="btn-auth">Entrar</button>

                        <div class="auth-links">
                            <button type="button" onclick="unifiedAuthUI.switchMode('reset')" class="link-btn">
                                Esqueceu a senha?
                            </button>
                        </div>
                    </form>

                    <!-- REGISTER FORM -->
                    <form id="register-form" class="auth-form" onsubmit="unifiedAuthUI.handleRegister(event)">
                        <h2>Criar Conta</h2>
                        
                        <div class="form-group">
                            <label for="register-username">Username</label>
                            <input 
                                type="text" 
                                id="register-username" 
                                placeholder="seu_username"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input 
                                type="email" 
                                id="register-email" 
                                placeholder="seu@email.com"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="register-password">Senha</label>
                            <input 
                                type="password" 
                                id="register-password" 
                                placeholder="••••••••"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="register-password-confirm">Confirmar Senha</label>
                            <input 
                                type="password" 
                                id="register-password-confirm" 
                                placeholder="••••••••"
                                required
                            >
                        </div>

                        <button type="submit" class="btn-auth">Criar Conta</button>
                    </form>

                    <!-- RESET PASSWORD FORM -->
                    <form id="reset-form" class="auth-form" onsubmit="unifiedAuthUI.handleReset(event)">
                        <h2>Recuperar Senha</h2>
                        
                        <div class="form-group">
                            <label for="reset-email">Email</label>
                            <input 
                                type="email" 
                                id="reset-email" 
                                placeholder="seu@email.com"
                                required
                            >
                        </div>

                        <p class="reset-info">Enviaremos um link para recuperar sua senha</p>

                        <button type="submit" class="btn-auth">Enviar Link</button>
                    </form>

                    <!-- TABS -->
                    <div class="auth-tabs">
                        <button class="tab-btn active" onclick="unifiedAuthUI.switchMode('login')">
                            Entrar
                        </button>
                        <button class="tab-btn" onclick="unifiedAuthUI.switchMode('register')">
                            Registrar
                        </button>
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="auth-footer">
                    <p>🔒 Seus dados estão seguros com a gente</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ALTERNAR MODO
    // ============================================================
    switchMode(mode) {
        this.currentMode = mode;

        // Atualizar forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${mode}-form`).classList.add('active');

        // Atualizar tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Voltar para login se estiver em reset
        if (mode !== 'reset') {
            document.querySelectorAll('.tab-btn').forEach((btn, index) => {
                if ((mode === 'login' && index === 0) || (mode === 'register' && index === 1)) {
                    btn.classList.add('active');
                }
            });
        }
    }

    // ============================================================
    // HANDLE LOGIN
    // ============================================================
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await this.authManager.login(email, password);
        
        if (result.success) {
            // Redirecionar para game selector
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
    }

    // ============================================================
    // HANDLE REGISTER
    // ============================================================
    async handleRegister(event) {
        event.preventDefault();

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            showToast('As senhas não correspondem', 'error');
            return;
        }

        const result = await this.authManager.register(email, password, username);
        
        if (result.success) {
            showToast('Verifique seu email para confirmar a conta', 'info');
            this.switchMode('login');
        }
    }

    // ============================================================
    // HANDLE RESET PASSWORD
    // ============================================================
    async handleReset(event) {
        event.preventDefault();

        const email = document.getElementById('reset-email').value;
        const success = await this.authManager.resetPassword(email);
        
        if (success) {
            setTimeout(() => {
                this.switchMode('login');
            }, 2000);
        }
    }

    // ============================================================
    // RENDERIZAR HEADER AUTENTICADO
    // ============================================================
    async renderAuthenticatedHeader() {
        const container = document.getElementById('platform-header') ||
                         document.querySelector('[data-section="header"]');
        if (!container) return;

        const user = this.authManager.getCurrentUser();
        if (!user) return;

        const username = user.email.split('@')[0];

        container.innerHTML = `
            <div class="platform-header">
                <div class="header-left">
                    <h1 class="logo">🎮 Core Games</h1>
                </div>
                <div class="header-center">
                    <nav class="platform-nav">
                        <button class="nav-btn" onclick="switchTab('games')">🎮 Jogos</button>
                        <button class="nav-btn" onclick="switchTab('profile')">👤 Perfil</button>
                        <button class="nav-btn" onclick="switchTab('social')">👥 Social</button>
                        <button class="nav-btn" onclick="switchTab('achievements')">🏆 Conquistas</button>
                        <button class="nav-btn" onclick="switchTab('shop')">🛒 Loja</button>
                        <button class="nav-btn" onclick="switchTab('roulette')">🎡 Roleta</button>
                    </nav>
                </div>
                <div class="header-right">
                    <div class="user-menu">
                        <span class="username">${username}</span>
                        <button class="btn-logout" onclick="unifiedAuthUI.handleLogout()">
                            🚪 Sair
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // HANDLE LOGOUT
    // ============================================================
    async handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            const success = await this.authManager.logout();
            if (success) {
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        }
    }
}

// Instância global
const unifiedAuthUI = new UnifiedAuthUI();
