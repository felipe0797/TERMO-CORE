/**
 * AUTH MANAGER - Core Games Platform
 * Gerencia autenticação unificada para todos os jogos
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentUserSupabaseId = null;
        this.isGuest = false;
        this.supabaseClient = null;
    }

    /**
     * Inicializar Supabase
     */
    async initSupabase() {
        if (!window.supabase) {
            console.error('❌ Biblioteca Supabase não carregada');
            return false;
        }

        try {
            this.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            return false;
        }
    }

    /**
     * Obter cliente Supabase
     */
    getSupabaseClient() {
        if (!this.supabaseClient) {
            this.initSupabase();
        }
        return this.supabaseClient;
    }

    /**
     * Registrar novo usuário
     */
    async registerUser(email, password, username) {
        const client = this.getSupabaseClient();
        if (!client) {
            return { error: 'Supabase não inicializado' };
        }

        try {
            console.log('📝 Registrando usuário:', email);
            
            const normalizedUsername = username.toLowerCase();
            
            // Validar se username já existe
            const { data: existingUser, error: checkError } = await client
                .from('users')
                .select('id')
                .eq('username', normalizedUsername)
                .maybeSingle();
            
            if (existingUser) {
                return { error: 'Nome de usuário já existe. Escolha outro.' };
            }
            
            // Registrar no Supabase Auth
            const { data: authData, error: authError } = await client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: { username: normalizedUsername }
                }
            });

            if (authError) {
                console.error('❌ Erro ao registrar:', authError);
                return { error: authError.message };
            }

            // Criar perfil do usuário
            const { data: userData, error: userError } = await client
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email: email,
                    username: normalizedUsername,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (userError) {
                console.error('❌ Erro ao criar perfil:', userError);
                return { error: 'Erro ao criar perfil do usuário' };
            }

            // Criar stats iniciais
            const { error: statsError } = await client
                .from('game_stats')
                .insert([{
                    user_id: authData.user.id,
                    xp: 0,
                    coins: 0,
                    total_games: 0,
                    active_theme: 'theme_default'
                }]);

            if (statsError) {
                console.error('❌ Erro ao criar stats:', statsError);
            }

            console.log('✅ Usuário registrado com sucesso:', email);
            return { success: true, user: userData };

        } catch (error) {
            console.error('❌ Erro ao registrar:', error);
            return { error: error.message };
        }
    }

    /**
     * Login do usuário
     */
    async loginUser(emailOrUsername, password) {
        const client = this.getSupabaseClient();
        if (!client) {
            return { error: 'Supabase não inicializado' };
        }

        try {
            console.log('🔐 Fazendo login:', emailOrUsername);

            // Verificar se é email ou username
            let email = emailOrUsername;
            
            if (!emailOrUsername.includes('@')) {
                // É username, buscar email
                const { data: userData, error: userError } = await client
                    .from('users')
                    .select('email')
                    .eq('username', emailOrUsername.toLowerCase())
                    .maybeSingle();

                if (userError || !userData) {
                    return { error: 'Usuário não encontrado' };
                }
                email = userData.email;
            }

            // Fazer login
            const { data: authData, error: authError } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                console.error('❌ Erro ao fazer login:', authError);
                return { error: authError.message };
            }

            // Obter dados do usuário
            const { data: userData, error: userError } = await client
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError) {
                console.error('❌ Erro ao obter dados do usuário:', userError);
                return { error: 'Erro ao obter dados do usuário' };
            }

            this.currentUser = userData.email;
            this.currentUserSupabaseId = userData.id;
            this.isGuest = false;

            console.log('✅ Login realizado com sucesso:', email);
            return { success: true, user: userData };

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            return { error: error.message };
        }
    }

    /**
     * Login como visitante
     */
    async loginAsGuest() {
        try {
            console.log('👤 Criando conta de visitante');

            const guestEmail = `guest_${Date.now()}@guest.local`;
            const guestPassword = Math.random().toString(36).substring(2, 15);
            const guestUsername = `guest_${Date.now()}`;

            const result = await this.registerUser(guestEmail, guestPassword, guestUsername);
            
            if (result.error) {
                return result;
            }

            this.isGuest = true;
            this.currentUser = guestUsername;
            this.currentUserSupabaseId = result.user.id;

            console.log('✅ Conta de visitante criada');
            return { success: true, user: result.user };

        } catch (error) {
            console.error('❌ Erro ao criar conta de visitante:', error);
            return { error: error.message };
        }
    }

    /**
     * Logout do usuário
     */
    async logoutUser() {
        const client = this.getSupabaseClient();
        if (!client) {
            return { error: 'Supabase não inicializado' };
        }

        try {
            console.log('🚪 Fazendo logout');

            // Se for visitante, deletar conta
            if (this.isGuest && this.currentUserSupabaseId) {
                await this.deleteGuestAccount();
            }

            // Fazer logout no Supabase
            const { error } = await client.auth.signOut();

            if (error) {
                console.error('❌ Erro ao fazer logout:', error);
                return { error: error.message };
            }

            this.currentUser = null;
            this.currentUserSupabaseId = null;
            this.isGuest = false;

            console.log('✅ Logout realizado com sucesso');
            return { success: true };

        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            return { error: error.message };
        }
    }

    /**
     * Deletar conta de visitante
     */
    async deleteGuestAccount() {
        const client = this.getSupabaseClient();
        if (!client || !this.currentUserSupabaseId) {
            return;
        }

        try {
            // Deletar stats
            await client
                .from('game_stats')
                .delete()
                .eq('user_id', this.currentUserSupabaseId);

            // Deletar usuário
            await client
                .from('users')
                .delete()
                .eq('id', this.currentUserSupabaseId);

            console.log('✅ Conta de visitante deletada');
        } catch (error) {
            console.error('❌ Erro ao deletar conta de visitante:', error);
        }
    }

    /**
     * Obter usuário atual
     */
    async getCurrentUser() {
        const client = this.getSupabaseClient();
        if (!client) {
            return null;
        }

        try {
            const { data: { user }, error } = await client.auth.getUser();

            if (error || !user) {
                return null;
            }

            // Obter dados do usuário
            const { data: userData, error: userError } = await client
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError || !userData) {
                return null;
            }

            this.currentUser = userData.email;
            this.currentUserSupabaseId = userData.id;

            return userData;

        } catch (error) {
            console.error('❌ Erro ao obter usuário atual:', error);
            return null;
        }
    }

    /**
     * Verificar se usuário está autenticado
     */
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return user !== null;
    }

    /**
     * Obter ID do usuário atual
     */
    getCurrentUserId() {
        return this.currentUserSupabaseId;
    }

    /**
     * Obter nome do usuário atual
     */
    getCurrentUsername() {
        return this.currentUser;
    }

    /**
     * Verificar se é visitante
     */
    isGuestUser() {
        return this.isGuest;
    }
}

// Instância global
const authManager = new AuthManager();
