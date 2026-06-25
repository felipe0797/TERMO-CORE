/**
 * UNIFIED AUTH MANAGER - Core Games Platform
 * Gerencia autenticação unificada para plataforma e todos os jogos
 */

class UnifiedAuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.sessionToken = null;
        this.authStateChangeListeners = [];
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async initSupabase() {
        try {
            // Supabase já deve estar inicializado em supabase-client.js
            this.supabase = window.supabase;
            
            if (!this.supabase) {
                console.error('❌ Supabase não inicializado');
                return false;
            }

            // Verificar sessão existente
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session) {
                this.currentUser = session.user;
                this.sessionToken = session.access_token;
                await this.initializeUserData();
                this.notifyAuthStateChange(this.currentUser);
            }

            // Escutar mudanças de autenticação
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                if (session) {
                    this.currentUser = session.user;
                    this.sessionToken = session.access_token;
                    await this.initializeUserData();
                    this.notifyAuthStateChange(this.currentUser);
                } else {
                    this.currentUser = null;
                    this.sessionToken = null;
                    this.notifyAuthStateChange(null);
                }
            });

            console.log('✅ Autenticação unificada inicializada');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar autenticação:', error);
            return false;
        }
    }

    // ============================================================
    // INICIALIZAR DADOS DO USUÁRIO
    // ============================================================
    async initializeUserData() {
        if (!this.currentUser) return;

        try {
            // Inicializar managers globais
            if (typeof globalProfileManager !== 'undefined') {
                await globalProfileManager.setCurrentUser(this.currentUser.id);
            }
            if (typeof globalSocialManager !== 'undefined') {
                await globalSocialManager.setCurrentUser(this.currentUser.id);
            }
            if (typeof globalAchievementsManager !== 'undefined') {
                await globalAchievementsManager.setCurrentUser(this.currentUser.id);
            }
            if (typeof universalShopManager !== 'undefined') {
                await universalShopManager.setCurrentUser(this.currentUser.id);
            }
            if (typeof platformRouletteManager !== 'undefined') {
                await platformRouletteManager.setCurrentUser(this.currentUser.id);
            }

            console.log('✅ Dados do usuário inicializados');
        } catch (error) {
            console.error('❌ Erro ao inicializar dados do usuário:', error);
        }
    }

    // ============================================================
    // REGISTRAR
    // ============================================================
    async register(email, password, username) {
        if (!this.supabase) return { success: false, error: 'Supabase não inicializado' };

        try {
            // Registrar no Supabase Auth
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            // Criar perfil do usuário
            const { error: profileError } = await this.supabase
                .from('global_users')
                .insert([{
                    id: data.user.id,
                    email,
                    username: username || email.split('@')[0],
                    created_at: new Date().toISOString()
                }]);

            if (profileError) throw profileError;

            showToast('✅ Conta criada com sucesso! Verifique seu email.', 'success');
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ Erro ao registrar:', error);
            showToast(`Erro ao registrar: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    // ============================================================
    // LOGIN
    // ============================================================
    async login(email, password) {
        if (!this.supabase) return { success: false, error: 'Supabase não inicializado' };

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.sessionToken = data.session.access_token;

            await this.initializeUserData();
            this.notifyAuthStateChange(this.currentUser);

            showToast('✅ Login realizado com sucesso!', 'success');
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            showToast(`Erro ao fazer login: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    async logout() {
        if (!this.supabase) return false;

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.sessionToken = null;
            this.notifyAuthStateChange(null);

            // Limpar localStorage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

            showToast('✅ Logout realizado com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            return false;
        }
    }

    // ============================================================
    // RECUPERAR SENHA
    // ============================================================
    async resetPassword(email) {
        if (!this.supabase) return false;

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            showToast('✅ Email de recuperação enviado!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao recuperar senha:', error);
            showToast(`Erro: ${error.message}`, 'error');
            return false;
        }
    }

    // ============================================================
    // ATUALIZAR PERFIL
    // ============================================================
    async updateProfile(updates) {
        if (!this.currentUser || !this.supabase) return false;

        try {
            const { error } = await this.supabase
                .from('global_users')
                .update(updates)
                .eq('id', this.currentUser.id);

            if (error) throw error;

            showToast('✅ Perfil atualizado!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            showToast('Erro ao atualizar perfil', 'error');
            return false;
        }
    }

    // ============================================================
    // GETTERS
    // ============================================================
    getCurrentUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser?.id || null;
    }

    getUserEmail() {
        return this.currentUser?.email || null;
    }

    getSessionToken() {
        return this.sessionToken;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    // ============================================================
    // NOTIFICAÇÕES DE MUDANÇA DE ESTADO
    // ============================================================
    onAuthStateChange(callback) {
        this.authStateChangeListeners.push(callback);
    }

    notifyAuthStateChange(user) {
        this.authStateChangeListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('❌ Erro em listener de autenticação:', error);
            }
        });
    }

    // ============================================================
    // SINCRONIZAR COM JOGO
    // ============================================================
    async syncWithGame(gameId) {
        if (!this.currentUser) return false;

        try {
            // Salvar no localStorage para o jogo acessar
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, this.sessionToken);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
            localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);

            console.log(`✅ Sincronizado com jogo: ${gameId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao sincronizar com jogo:', error);
            return false;
        }
    }

    // ============================================================
    // VERIFICAR AUTENTICAÇÃO DO JOGO
    // ============================================================
    async verifyGameAuth() {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

            if (!token || !userStr) {
                return null;
            }

            const user = JSON.parse(userStr);
            return user;
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação do jogo:', error);
            return null;
        }
    }
}

// Instância global
const authManager = new UnifiedAuthManager();

// Constantes de armazenamento
const STORAGE_KEYS = {
    AUTH_TOKEN: 'cg_auth_token',
    CURRENT_USER: 'cg_current_user',
    CURRENT_GAME: 'cg_current_game'
};

// Constantes de catálogo de jogos
const GAMES_CATALOG = [
    {
        id: 'termocore',
        name: 'TermoCore',
        path: 'games/termocore/index.html'
    }
];
