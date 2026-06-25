/**
 * AUTH UI - Core Games Platform
 * Interface de autenticação para a plataforma
 */

class AuthUI {
    constructor() {
        this.authMode = 'login'; // login ou register
    }

    /**
     * Renderizar tela de login
     */
    renderLoginScreen() {
        const loginScreen = document.getElementById('screen-login');
        if (!loginScreen) return;

        loginScreen.innerHTML = `
            <div class="login-bg-glow"></div>
            <div class="login-container">
                <div class="login-card">
                    <div class="login-logo">
                        <span class="logo-core">CORE</span>
                        <span class="logo-games">GAMES</span>
                    </div>
                    <p class="login-subtitle">Biblioteca de Jogos</p>

                    <!-- FORMULÁRIO DE LOGIN -->
                    <div id="login-form" class="auth-form">
                        <div class="input-group">
                            <label>EMAIL OU NOME DE USUÁRIO</label>
                            <input 
                                type="text" 
                                id="auth-user" 
                                placeholder="seu@email.com ou nome_usuario" 
                                maxlength="255"
                            >
                        </div>
                        <div class="input-group">
                            <label>SENHA</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="auth-pin" 
                                    placeholder="mínimo 6 caracteres" 
                                    maxlength="255"
                                    class="password-input"
                                >
                                <button 
                                    type="button" 
                                    class="toggle-password-btn password-hidden" 
                                    id="toggle-auth-pin"
                                    onclick="authUI.togglePasswordVisibility('auth-pin')"
                                    title="Mostrar/Ocultar senha"
                                >
                                    👁️
                                </button>
                            </div>
                        </div>
                        <button onclick="authUI.handleLogin()" class="btn-primary btn-full">ENTRAR</button>
                        <button onclick="authUI.toggleAuthMode()" class="btn-ghost btn-full">Criar conta</button>
                        <div class="auth-divider"><span>OU</span></div>
                        <button onclick="authUI.handleGuestLogin()" class="btn-secondary btn-full">JOGAR COMO VISITANTE</button>
                    </div>

                    <!-- FORMULÁRIO DE REGISTRO -->
                    <div id="register-form" class="auth-form hidden">
                        <div class="input-group">
                            <label>EMAIL</label>
                            <input 
                                type="email" 
                                id="reg-user" 
                                placeholder="seu@email.com" 
                                maxlength="255"
                            >
                        </div>
                        <div class="input-group">
                            <label>NOME DE USUÁRIO</label>
                            <input 
                                type="text" 
                                id="reg-username" 
                                placeholder="seu nome de usuário" 
                                maxlength="20"
                            >
                        </div>
                        <div class="input-group">
                            <label>SENHA</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="reg-pin" 
                                    placeholder="mínimo 6 caracteres" 
                                    maxlength="255"
                                    class="password-input"
                                >
                                <button 
                                    type="button" 
                                    class="toggle-password-btn password-hidden" 
                                    id="toggle-reg-pin"
                                    onclick="authUI.togglePasswordVisibility('reg-pin')"
                                    title="Mostrar/Ocultar senha"
                                >
                                    👁️
                                </button>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>CONFIRMAR SENHA</label>
                            <div class="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="reg-pin-confirm" 
                                    placeholder="repita a senha" 
                                    maxlength="255"
                                    class="password-input"
                                >
                                <button 
                                    type="button" 
                                    class="toggle-password-btn password-hidden" 
                                    id="toggle-reg-pin-confirm"
                                    onclick="authUI.togglePasswordVisibility('reg-pin-confirm')"
                                    title="Mostrar/Ocultar senha"
                                >
                                    👁️
                                </button>
                            </div>
                        </div>
                        <button onclick="authUI.handleRegister()" class="btn-primary btn-full">CADASTRAR</button>
                        <button onclick="authUI.toggleAuthMode()" class="btn-ghost btn-full">Voltar ao login</button>
                    </div>
                </div>

                <div class="login-version-badge">v2.0.0 - Platform</div>
            </div>
        `;
    }

    /**
     * Alternar entre login e registro
     */
    toggleAuthMode() {
        this.authMode = this.authMode === 'login' ? 'register' : 'login';
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (this.authMode === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    }

    /**
     * Alternar visibilidade de senha
     */
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = document.querySelector(`[id="toggle-${inputId}"]`);

        if (!input || !button) return;

        if (input.type === 'password') {
            input.type = 'text';
            button.classList.remove('password-hidden');
            button.classList.add('password-visible');
        } else {
            input.type = 'password';
            button.classList.add('password-hidden');
            button.classList.remove('password-visible');
        }
    }

    /**
     * Validar formulário de login
     */
    validateLoginForm() {
        const user = document.getElementById('auth-user').value.trim();
        const pin = document.getElementById('auth-pin').value;

        if (!user) {
            showToast('Por favor, insira email ou nome de usuário', 'error');
            return false;
        }

        if (!pin || pin.length < 6) {
            showToast('Senha deve ter no mínimo 6 caracteres', 'error');
            return false;
        }

        return { user, pin };
    }

    /**
     * Validar formulário de registro
     */
    validateRegisterForm() {
        const email = document.getElementById('reg-user').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const pin = document.getElementById('reg-pin').value;
        const pinConfirm = document.getElementById('reg-pin-confirm').value;

        if (!email || !isValidEmail(email)) {
            showToast('Por favor, insira um email válido', 'error');
            return false;
        }

        if (!username || !isValidUsername(username)) {
            showToast('Nome de usuário deve ter 3-20 caracteres (letras, números, underscore)', 'error');
            return false;
        }

        if (!pin || pin.length < 6) {
            showToast('Senha deve ter no mínimo 6 caracteres', 'error');
            return false;
        }

        if (pin !== pinConfirm) {
            showToast('Senhas não conferem', 'error');
            return false;
        }

        return { email, username, pin };
    }

    /**
     * Fazer login
     */
    async handleLogin() {
        const form = this.validateLoginForm();
        if (!form) return;

        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'ENTRANDO...';

        try {
            const result = await authManager.loginUser(form.user, form.pin);

            if (result.error) {
                showToast(result.error, 'error');
                btn.disabled = false;
                btn.textContent = 'ENTRAR';
                return;
            }

            showToast('Login realizado com sucesso!', 'success');
            
            // Aguardar um pouco e ir para Game Selector
            await delay(500);
            showScreen('screen-games-selector');
            gameSelector.renderGameSelector();

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showToast('Erro ao fazer login', 'error');
            btn.disabled = false;
            btn.textContent = 'ENTRAR';
        }
    }

    /**
     * Fazer registro
     */
    async handleRegister() {
        const form = this.validateRegisterForm();
        if (!form) return;

        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'CADASTRANDO...';

        try {
            const result = await authManager.registerUser(form.email, form.pin, form.username);

            if (result.error) {
                showToast(result.error, 'error');
                btn.disabled = false;
                btn.textContent = 'CADASTRAR';
                return;
            }

            showToast('Conta criada com sucesso! Faça login agora.', 'success');
            
            // Limpar formulário e voltar para login
            document.getElementById('reg-user').value = '';
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-pin').value = '';
            document.getElementById('reg-pin-confirm').value = '';
            
            this.toggleAuthMode();
            
            btn.disabled = false;
            btn.textContent = 'CADASTRAR';

        } catch (error) {
            console.error('Erro ao registrar:', error);
            showToast('Erro ao registrar', 'error');
            btn.disabled = false;
            btn.textContent = 'CADASTRAR';
        }
    }

    /**
     * Login como visitante
     */
    async handleGuestLogin() {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'CRIANDO CONTA...';

        try {
            const result = await authManager.loginAsGuest();

            if (result.error) {
                showToast(result.error, 'error');
                btn.disabled = false;
                btn.textContent = 'JOGAR COMO VISITANTE';
                return;
            }

            showToast('Bem-vindo, visitante!', 'success');
            
            await delay(500);
            showScreen('screen-games-selector');
            gameSelector.renderGameSelector();

        } catch (error) {
            console.error('Erro ao criar conta de visitante:', error);
            showToast('Erro ao criar conta de visitante', 'error');
            btn.disabled = false;
            btn.textContent = 'JOGAR COMO VISITANTE';
        }
    }
}

// Instância global
const authUI = new AuthUI();
