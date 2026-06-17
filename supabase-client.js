/**
 * SUPABASE CLIENT
 * Inicializa a conexão com Supabase e gerencia autenticação
 */

// Importar a biblioteca Supabase via CDN (já adicionada no index.html)
// const { createClient } = supabase;

let supabaseClient = null;

/**
 * Inicializar cliente Supabase
 */
function initSupabase() {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Variáveis de ambiente Supabase não configuradas');
        return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase inicializado');
    return supabaseClient;
}

/**
 * Obter cliente Supabase
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        initSupabase();
    }
    return supabaseClient;
}

/**
 * Registrar novo usuário
 */
async function registerUser(email, password, username) {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase não inicializado' };

    try {
        // Registrar no Supabase Auth
        const { data: authData, error: authError } = await client.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error('Erro ao registrar:', authError);
            return { error: authError.message };
        }

        // Criar perfil do usuário na tabela users
        const { data: userData, error: userError } = await client
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    username
                }
            ]);

        if (userError) {
            console.error('Erro ao criar perfil:', userError);
            return { error: userError.message };
        }

        // Criar estatísticas iniciais
        const { error: statsError } = await client
            .from('game_stats')
            .insert([
                {
                    user_id: authData.user.id,
                    xp: 0,
                    coins: 0
                }
            ]);

        if (statsError) {
            console.error('Erro ao criar estatísticas:', statsError);
            return { error: statsError.message };
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Erro inesperado no registro:', error);
        return { error: error.message };
    }
}

/**
 * Login de usuário
 */
async function loginUser(email, password) {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase não inicializado' };

    try {
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Erro ao fazer login:', error);
            return { error: error.message };
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Erro inesperado no login:', error);
        return { error: error.message };
    }
}

/**
 * Logout de usuário
 */
async function logoutUser() {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase não inicializado' };

    try {
        const { error } = await client.auth.signOut();

        if (error) {
            console.error('Erro ao fazer logout:', error);
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro inesperado no logout:', error);
        return { error: error.message };
    }
}

/**
 * Obter usuário atualmente autenticado
 */
async function getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data: { user } } = await client.auth.getUser();
        return user;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

/**
 * Verificar se usuário está autenticado
 */
async function isUserAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

console.log('✅ supabase-client.js carregado');
