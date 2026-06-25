/**
 * SUPABASE CLIENT
 * Inicializa a conexão com Supabase e gerencia autenticação
 */

// Credenciais Supabase (injetadas diretamente)
const SUPABASE_URL = 'https://tdxygivlneimyorbxzzy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LjpRcjeUfTAw0TSxYJhlzQ_dX_jzYVa';

let supabaseClient = null;
// currentUserSupabaseId é declarado em script.js

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
async function registerUser(email, password, username, isGuest = false) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('❌ Supabase não inicializado');
        return { error: 'Supabase não inicializado' };
    }

    try {
        console.log('📝 Registrando usuário:', email);
        
        // Normalizar username para lowercase para garantir unicidade case-insensitive
        const normalizedUsername = username.toLowerCase();
        
        // Validar se username já existe
        const { data: existingUser, error: checkError } = await client
            .from('users')
            .select('id')
            .eq('username', normalizedUsername)
            .maybeSingle();
        
        if (existingUser) {
            console.error('❌ Nome de usuário já existe:', username);
            return { error: 'Nome de usuário já existe. Escolha outro.' };
        }
        
        // Registrar no Supabase Auth
        const { data: authData, error: authError } = await client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    username: normalizedUsername,
                    is_guest: isGuest
                }
            }
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
        if (typeof currentUserSupabaseId !== 'undefined') {
            currentUserSupabaseId = authData.user.id;
        }

        // Criar perfil na tabela users com username normalizado
        const { error: profileError } = await client
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                username: normalizedUsername,
                role: isGuest ? 'guest' : 'user'
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
 * Criar um usuário visitante anônimo no banco
 */
async function registerGuestUser() {
    const timestamp = Date.now();
    const guestId = Math.random().toString(36).substring(2, 8);
    const guestEmail = `guest_${timestamp}_${guestId}@termocore.temp`;
    const guestPassword = `guest_${guestId}_${timestamp}`;
    const guestUsername = `Visitante_${guestId}`;

    console.log('🎭 Criando conta temporária para visitante...');
    return await registerUser(guestEmail, guestPassword, guestUsername, true);
}

/**
 * Fazer login (aceita email OU nome de usuario - v1.0.6)
 */
async function loginUser(identifier, password) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('❌ Supabase não inicializado');
        return { error: 'Supabase não inicializado' };
    }

    try {
        let email = identifier.trim();

        // Se nao contiver @, tratar como username e resolver para email
        if (!email.includes('@')) {
            console.log('🔍 Resolvendo username para email:', email);
            const { data: userData, error: userError } = await client
                .from('users')
                .select('email')
                .eq('username', email.toLowerCase())
                .single();

            if (userError || !userData) {
                return { error: 'Usuário não encontrado. Verifique o nome de usuário.' };
            }
            email = userData.email;
            console.log('✅ Username resolvido para email:', email);
        }

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

        // Verificar se é visitante
        const isGuestUser = authData.user.user_metadata?.is_guest || false;
        if (typeof isGuest !== 'undefined') {
            isGuest = isGuestUser;
        }

        console.log('✅ Login bem-sucedido:', authData.user.id, isGuestUser ? '(VISITANTE)' : '');
        if (typeof currentUserSupabaseId !== 'undefined') {
            currentUserSupabaseId = authData.user.id;
        }

        // Garantir que o usuário existe em public.users
        const { data: existingUser, error: checkError } = await client
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (checkError || !existingUser) {
            // Se for um guest tentando logar mas o perfil sumiu, não recriamos
            const isGuestLogin = authData.user.user_metadata?.is_guest === true;
            if (isGuestLogin) {
                console.log('🎭 Sessão de visitante expirada ou deletada.');
                return { success: true, user: authData.user };
            }

            console.log('📝 Criando perfil em public.users para:', authData.user.id);
            const { error: insertError } = await client
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email,
                    username: email.split('@')[0],
                    role: 'user' 
                });

            if (insertError) {
                console.error('⚠️ Erro ao criar perfil:', insertError);
                // Não retorna erro aqui, pois o login já foi bem-sucedido
            } else {
                console.log('✅ Perfil criado em public.users');
            }
        } else {
            console.log('✅ Usuário já existe em public.users');
        }

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
        if (typeof currentUserSupabaseId !== 'undefined') {
            currentUserSupabaseId = null;
        }
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
            if (typeof currentUserSupabaseId !== 'undefined') {
                currentUserSupabaseId = session.user.id;
            }
            
            // Sincronizar flag de visitante
            if (typeof isGuest !== 'undefined') {
                isGuest = session.user.user_metadata?.is_guest || false;
            }

            console.log('✅ Usuário atual:', session.user.id, isGuest ? '(VISITANTE)' : '');
            return session.user;
        }
        return null;
    } catch (error) {
        console.error('❌ Erro ao obter usuário:', error);
        return null;
    }
}

/**
 * Obter username do usuário
 */
async function getUserUsername() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data: { session } } = await client.auth.getSession();
        if (!session?.user) return null;

        const { data: userData, error } = await client
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao obter username:', error);
            return null;
        }

        return userData?.username || session.user.email.split('@')[0];
    } catch (error) {
        console.error('Erro ao obter username:', error);
        return null;
    }
}

/**
 * Verificar se usuário é admin
 */
async function isUserAdmin() {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { data: { session } } = await client.auth.getSession();
        if (!session?.user) return false;

        const { data: userData, error } = await client
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao verificar role:', error);
            return false;
        }

        return userData?.role === 'admin';
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        return false;
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
