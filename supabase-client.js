/**
 * SUPABASE CLIENT
 * Inicializa a conexão com Supabase e gerencia autenticação
 */

// Credenciais Supabase (injetadas diretamente)
const SUPABASE_URL = 'https://tdxygivlneimyorbxzzy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LjpRcjeUfTAw0TSxYJhlzQ_dX_jzYVa';

let supabaseClient = null;
let currentUserSupabaseId = null;

/**
 * Inicializar cliente Supabase
 */
function initSupabase() {
    if (!window.supabase) {
        console.error('❌ Biblioteca Supabase não carregada');
        return null;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Credenciais Supabase não configuradas');
        return null;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado com sucesso');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return null;
    }
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
async function registerUser(email, password) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('❌ Supabase não inicializado');
        return { error: 'Supabase não inicializado' };
    }

    try {
        console.log('📝 Registrando usuário:', email);
        
        // Registrar no Supabase Auth
        const { data: authData, error: authError } = await client.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error('❌ Erro de autenticação:', authError);
            return { error: authError.message };
        }

        if (!authData.user) {
            console.error('❌ Usuário não criado');
            return { error: 'Falha ao criar usuário' };
        }

        console.log('✅ Usuário registrado:', authData.user.id);
        currentUserSupabaseId = authData.user.id;

        // Criar perfil na tabela users
        const { error: profileError } = await client
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                username: email.split('@')[0]
            });

        if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            return { error: profileError.message };
        }

        // Criar stats iniciais
        const { error: statsError } = await client
            .from('game_stats')
            .insert({
                user_id: authData.user.id,
                xp: 0,
                coins: 0
            });

        if (statsError) {
            console.error('❌ Erro ao criar stats:', statsError);
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('❌ Erro ao registrar:', error);
        return { error: error.message };
    }
}

/**
 * Fazer login
 */
async function loginUser(email, password) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('❌ Supabase não inicializado');
        return { error: 'Supabase não inicializado' };
    }

    try {
        console.log('🔐 Fazendo login:', email);
        
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('❌ Erro de login:', authError);
            return { error: authError.message };
        }

        if (!authData.user) {
            console.error('❌ Usuário não autenticado');
            return { error: 'Falha ao fazer login' };
        }

        console.log('✅ Login bem-sucedido:', authData.user.id);
        currentUserSupabaseId = authData.user.id;

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        return { error: error.message };
    }
}

/**
 * Fazer logout
 */
async function logoutUser() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        await client.auth.signOut();
        currentUserSupabaseId = null;
        console.log('✅ Logout realizado');
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
    }
}

/**
 * Obter usuário atual
 */
async function getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
            currentUserSupabaseId = session.user.id;
            console.log('✅ Usuário atual:', session.user.id);
            return session.user;
        }
        return null;
    } catch (error) {
        console.error('❌ Erro ao obter usuário:', error);
        return null;
    }
}

/**
 * Verificar sessão ativa (alias para getCurrentUser)
 */
async function checkSession() {
    return await getCurrentUser();
}

// Inicializar Supabase quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Supabase...');
    initSupabase();
    checkSession();
});
