/*
   TERMO PRO v1.0.8 - PREPARAÇÃO PARA MODO ONLINE
   Multiplayer em Tempo Real + Redesign da Roleta + Preços Ajustados + Melhorias de Gameplay
*/

// ============================================================
//  CONFIGURAÇÕES E ESTADO GLOBAL
// ============================================================
let currentUser     = null;
let currentUserSupabaseId = null; // ID do usuário no Supabase
let userStats       = {};
let gameInProgress  = false;
let currentGame     = null;
let globalDifficulty = 'NORMAL'; // EASY, NORMAL, HARD
let isAdmin         = false;
let isGuest         = false;
let authMode        = 'login';

// Forçar a dificuldade padrão ao carregar
window.addEventListener('DOMContentLoaded', async () => {
    globalDifficulty = 'NORMAL';
    updateDifficultyUI();
    
    // Inicializar Supabase
    initSupabase();
    
    // ===== SINCRONIZAÇÃO COM PLATAFORMA =====
    // Verificar se veio da plataforma com autenticação
    const platformAuthToken = localStorage.getItem('cg_auth_token');
    const platformCurrentUser = localStorage.getItem('cg_current_user');
    
    let user = null;
    let fromPlatform = false;
    
    if (platformAuthToken && platformCurrentUser) {
        // Usuário veio da plataforma - usar sessão compartilhada
        console.log('✅ Sincronizando com autenticação da plataforma');
        try {
            const userData = JSON.parse(platformCurrentUser);
            currentUserSupabaseId = userData.id;
            currentUser = userData.email;
            isGuest = userData.is_guest || false;
            user = userData;
            fromPlatform = true;
        } catch (e) {
            console.error('❌ Erro ao sincronizar com plataforma:', e);
        }
    } else {
        // Verificar se usuário já está autenticado (sessão persistida)
        user = await getCurrentUser();
    }
    
    // Verificar se usuário está autenticado
    if (user && (fromPlatform || user.id)) {
        currentUser = user.email;
        currentUserSupabaseId = user.id;
        const stats = await loadUserStatsFromSupabase(user.id);
        if (stats) {
            userStats = stats;
            // Aplicar tema e avatar salvos ao restaurar sessão
            if (userStats.activeTheme) applyTheme(userStats.activeTheme);
            await applyAvatarCosmetics();
            isAdmin = await isUserAdmin();
            showScreen('main');
            updateSidebar();
            initNotificationSystem();
            updateAdminUI();
            
            // Iniciar verificação de amigos (v1.1.0)
            checkFriendNotifications();
            setInterval(checkFriendNotifications, 30000); // Verifica a cada 30 segundos
        }
    }
});

const SHOP_ITEMS = [
    { id: 'theme_default', type: 'theme', name: 'Padrão', desc: 'Tema padrão do jogo.', price: 0, icon: '⚪', isDefault: true },
    { id: 'theme_neon', type: 'theme', name: 'Neon Night', desc: 'Visual futurista com glow azul.', price: 5000, icon: '🌀' },
    { id: 'theme_sunset', type: 'theme', name: 'Sunset Horizon', desc: 'Cores quentes de um pôr do sol.', price: 6000, icon: '🌅' },
    { id: 'theme_emerald', type: 'theme', name: 'Emerald Forest', desc: 'Elegância em tons de verde esmeralda.', price: 7500, icon: '🌲' },
    { id: 'theme_cyberpunk', type: 'theme', name: 'Cyberpunk 2077', desc: 'Amarelo vibrante e contraste intenso.', price: 10000, icon: '🤖' },
    
    // Molduras de Perfil (Frames)
    { id: 'cosmetic_frame_neon', type: 'cosmetic', category: 'frame', name: 'Moldura Neon', desc: 'Brilho pulsante cibernético.', price: 3000, icon: '⭕', frameClass: 'frame-neon' },
    { id: 'cosmetic_frame_industrial', type: 'cosmetic', category: 'frame', name: 'Moldura Industrial', desc: 'Estilo rústico e metálico.', price: 3000, icon: '⚙️', frameClass: 'frame-industrial' },
    { id: 'cosmetic_frame_glitch', type: 'cosmetic', category: 'frame', name: 'Moldura Glitch', desc: 'Efeito de erro digital.', price: 25000, icon: '📺', frameClass: 'frame-glitch' },

    // Avatares removidos - nova estrutura abaixo

    // Avatares: Toon Head (5 variantes com URLs exatas)
    { id: 'avatar_toon_1', type: 'avatar_variant', category: 'toon-head', name: 'Toon Head #1', desc: 'Personagem animado com estilo Toon Head.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/toon-head/svg?mouthVariant=sad,smile&eyesVariant=bow,wide,wink&seed=Felix' },
    { id: 'avatar_toon_2', type: 'avatar_variant', category: 'toon-head', name: 'Toon Head #2', desc: 'Personagem animado com estilo Toon Head.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/toon-head/svg?mouthVariant=sad,smile&eyesVariant=bow,happy,wide,wink&seed=5znxue0i' },
    { id: 'avatar_toon_3', type: 'avatar_variant', category: 'toon-head', name: 'Toon Head #3', desc: 'Personagem animado com estilo Toon Head.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/toon-head/svg?mouthVariant=sad,smile&eyesVariant=bow,happy,wide,wink&seed=uetru753' },
    { id: 'avatar_toon_4', type: 'avatar_variant', category: 'toon-head', name: 'Toon Head #4', desc: 'Personagem animado com estilo Toon Head.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/toon-head/svg?beardVariant=&mouthVariant=smile&eyesVariant=happy,humble,wink&skinColor=5c3829,f1c3a5,a36b4f,c68e7a&seed=l3b347zh' },
    { id: 'avatar_toon_5', type: 'avatar_variant', category: 'toon-head', name: 'Toon Head #5', desc: 'Personagem animado com estilo Toon Head.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/toon-head/svg?beardVariant=&mouthVariant=smile&eyesVariant=happy,humble,wink&skinColor=5c3829,f1c3a5,a36b4f,c68e7a&seed=6pc1u1c7' },

    // Avatares: Croodles (5 variantes com URLs exatas)
    { id: 'avatar_croo_1', type: 'avatar_variant', category: 'croodles', name: 'Croodles #1', desc: 'Desenho artesanal com estilo Croodles.', price: 150, avatarUrl: 'https://api.dicebear.com/10.x/croodles/svg?seed=Felix' },
    { id: 'avatar_croo_2', type: 'avatar_variant', category: 'croodles', name: 'Croodles #2', desc: 'Desenho artesanal com estilo Croodles.', price: 150, avatarUrl: 'https://api.dicebear.com/10.x/croodles/svg?seed=d0dq28rk' },
    { id: 'avatar_croo_3', type: 'avatar_variant', category: 'croodles', name: 'Croodles #3', desc: 'Desenho artesanal com estilo Croodles.', price: 150, avatarUrl: 'https://api.dicebear.com/10.x/croodles/svg?seed=dhvf37co' },
    { id: 'avatar_croo_4', type: 'avatar_variant', category: 'croodles', name: 'Croodles #4', desc: 'Desenho artesanal com estilo Croodles.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/croodles/svg?seed=x8gn98ms' },
    { id: 'avatar_croo_5', type: 'avatar_variant', category: 'croodles', name: 'Croodles #5', desc: 'Desenho artesanal com estilo Croodles.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/croodles/svg?seed=ibymbvb8' },

    // Avatares: Big Ears (5 variantes com URLs exatas)
    { id: 'avatar_ears_1', type: 'avatar_variant', category: 'big-ears', name: 'Big Ears #1', desc: 'Criatura com orelhas expressivas.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/big-ears/svg?seed=yakiavp2' },
    { id: 'avatar_ears_2', type: 'avatar_variant', category: 'big-ears', name: 'Big Ears #2', desc: 'Criatura com orelhas expressivas.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/big-ears/svg?seed=41oayskw' },
    { id: 'avatar_ears_3', type: 'avatar_variant', category: 'big-ears', name: 'Big Ears #3', desc: 'Criatura com orelhas expressivas.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/big-ears/svg?seed=f5k6l08p' },
    { id: 'avatar_ears_4', type: 'avatar_variant', category: 'big-ears', name: 'Big Ears #4', desc: 'Criatura com orelhas expressivas.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/big-ears/svg?seed=uv1ctksm' },
    { id: 'avatar_ears_5', type: 'avatar_variant', category: 'big-ears', name: 'Big Ears #5', desc: 'Criatura com orelhas expressivas.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/big-ears/svg?seed=200jcrh3' },

    // Avatares: Boots (5 variantes com URLs exatas)
    { id: 'avatar_boots_1', type: 'avatar_variant', category: 'bottts', name: 'Boots #1', desc: 'Robô aventureiro com personalidade.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/bottts/svg?seed=Felix' },
    { id: 'avatar_boots_2', type: 'avatar_variant', category: 'bottts', name: 'Boots #2', desc: 'Robô aventureiro com personalidade.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/bottts/svg?seed=7wjkt4k4' },
    { id: 'avatar_boots_3', type: 'avatar_variant', category: 'bottts', name: 'Boots #3', desc: 'Robô aventureiro com personalidade.', price: 200, avatarUrl: 'https://api.dicebear.com/10.x/bottts/svg?seed=ijatfvt7' },
    { id: 'avatar_boots_4', type: 'avatar_variant', category: 'bottts', name: 'Boots #4', desc: 'Robô aventureiro com personalidade.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/bottts/svg?seed=hgk2grpe' },
    { id: 'avatar_boots_5', type: 'avatar_variant', category: 'bottts', name: 'Boots #5', desc: 'Robô aventureiro com personalidade.', price: 250, avatarUrl: 'https://api.dicebear.com/10.x/bottts/svg?seed=qf4aajei' }
];

const TROPHIES_DEF = [
    { id: 'win_1', name: 'Primeira Vitória', desc: 'Vença sua primeira partida em qualquer modo.', icon: '🎯', reward: 50, check: (s) => (s['5_LETTERS'].wins + s['7_LETTERS'].wins + s['SURVIVAL'].wins + s['AVALANCHE'].wins) >= 1 },
    { id: 'perfect_5l', name: 'Perfeição 5L', desc: 'Complete o modo 5 Letras sem errar nenhuma etapa.', icon: '💎', reward: 200, check: (s) => s.perfectGames5L >= 1 },
    { id: 'perfect_7l', name: 'Perfeição 7L', desc: 'Complete o modo 7 Letras sem errar nenhuma etapa.', icon: '💍', reward: 300, check: (s) => s.perfectGames7L >= 1 },
    { id: 'survival_20', name: 'Sobrevivente Elite', desc: 'Chegue à rodada 20 no modo Sobrevivência.', icon: '🛡️', reward: 150, check: (s) => s.bestSurvivalRound >= 20 },
    { id: 'avalanche_10', name: 'Escalador Supremo', desc: 'Chegue à fase 10 no modo Avalanche.', icon: '🏔️', reward: 250, check: (s) => s.bestAvalanchePhase >= 10 },
    { id: 'level_10', name: 'Veterano Nível 10', desc: 'Alcance o nível 10.', icon: '⭐', reward: 500, check: (s, lvl) => lvl >= 10 },
    { id: 'rich', name: 'Tio Patinhas', desc: 'Acumule 10.000 moedas.', icon: '💰', reward: 100, check: (s, lvl, coins) => coins >= 10000 }
];

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
// v1.1.3: Garantir saída da sala ao fechar ou recarregar
window.addEventListener('beforeunload', (e) => {
    if (gameInProgress && currentGame && currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined') {
        OnlineManager.leaveRoom();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth-pin').addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAuth();
    });
    document.getElementById('auth-user').addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('auth-pin').focus();
    });
    document.addEventListener('keydown', handlePhysicalKeyboard);
    showScreen('login');
    injectMobileMenuButton();
});

function injectMobileMenuButton() {
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.innerHTML = '☰';
    btn.onclick = toggleMobileSidebar;
    btn.className = 'mobile-menu-btn';

    const headers = document.querySelectorAll('.main-header');
    headers.forEach(h => {
        const existing = h.querySelector('.mobile-menu-btn');
        if (!existing) h.prepend(btn.cloneNode(true));
    });
    document.querySelectorAll('.mobile-menu-btn').forEach(b => {
        b.onclick = toggleMobileSidebar;
    });
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

// ============================================================
//  TECLADO FÍSICO
// ============================================================
function handlePhysicalKeyboard(event) {
    if (!gameInProgress || !currentGame) return;

    const key = event.key.toUpperCase();

    if (/^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÀÈÌÒÙÇ]$/.test(event.key.toUpperCase()) && event.key.length === 1) {
        event.preventDefault();
        handleInput(key);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        submitAttempt();
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleDelete();
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentGame.selectedFieldIndex > 0) {
            currentGame.selectedFieldIndex--;
            renderGame();
        }
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentGame.selectedFieldIndex < currentGame.wordLength - 1) {
            currentGame.selectedFieldIndex++;
            renderGame();
        }
    }
}

// ============================================================
//  AUTENTICAÇÃO
// ============================================================
function toggleAuthMode() {
    authMode = (authMode === 'login' ? 'register' : 'login');
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
    
    ['auth-user','auth-pin','reg-user','reg-username','reg-pin','reg-pin-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Resetar visibilidade das senhas
    ['auth-pin', 'reg-pin', 'reg-pin-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.type = 'password';
            const btn = document.getElementById(`toggle-${id}`);
            if (btn) {
                btn.classList.add('password-hidden');
                btn.classList.remove('password-visible');
            }
        }
    });
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(`toggle-${inputId}`);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        if (btn) {
            btn.classList.remove('password-hidden');
            btn.classList.add('password-visible');
        }
    } else {
        input.type = 'password';
        if (btn) {
            btn.classList.add('password-hidden');
            btn.classList.remove('password-visible');
        }
    }
}

async function handleRegister() {
    const email = document.getElementById('reg-user').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-pin').value.trim();
    const passwordConfirm = document.getElementById('reg-pin-confirm').value.trim();

    if (!email || !email.includes('@')) { showToast('Email inválido', 'error'); return; }
    if (!username || username.length < 3) { showToast('Nome de usuário deve ter pelo menos 3 caracteres', 'error'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) { showToast('Nome de usuário pode conter apenas letras, números, _ e -', 'error'); return; }
    if (password.length < 6) { showToast('Senha deve ter pelo menos 6 caracteres', 'error'); return; }
    if (password !== passwordConfirm) { showToast('Senhas não conferem', 'error'); return; }

    showToast('Criando conta...', 'info');
    
    // Se for visitante, guardamos o XP e Moedas atuais para migrar
    const statsToMigrate = isGuest ? { ...userStats } : null;
    const oldGuestId = isGuest ? currentUserSupabaseId : null;

    const result = await registerUser(email, password, username);

    if (result.error) {
        showToast(`❌ Erro: ${result.error}`, 'error');
        return;
    }

    // Se houve migração, precisamos atualizar o banco com os dados antigos
    if (statsToMigrate && result.user) {
        console.log('🔄 Migrando dados de visitante para nova conta...');
        // Adicionar bônus de migração
        statsToMigrate.coins = (statsToMigrate.coins || 0) + 500;
        statsToMigrate.xp = (statsToMigrate.xp || 0) + 100;
        
        await saveUserStatsToSupabase(result.user.id, statsToMigrate);
        
        // Notificação de sucesso na migração
        setTimeout(() => {
            createNotification(
                "Conta Vinculada com Sucesso! 🔗", 
                "Seu progresso de visitante foi migrado. Você recebeu um bônus de +500 moedas e +100 XP!", 
                "success"
            );
        }, 2000);
    } else {
        // Notificação de boas-vindas para novos usuários sem migração
        setTimeout(() => {
            createNotification(
                "Bem-vindo ao TermoCore! 🚀", 
                "Sua jornada começa agora! Para começar com o pé direito, você recebeu um Kit de Boas-vindas. Divirta-se e conquiste o ranking global!", 
                "success",
                "claim_reward",
                { coins: 200, xp: 50 }
            );
        }, 2000);
        
        // FASE 1: Notificação de ticket de roleta para novos usuários
        setTimeout(() => {
            createNotification(
                "🎟️ Você ganhou um Ticket de Roleta!",
                "Parabéns! Como novo jogador, você recebeu 1 ticket grátis para girar a Roleta da Sorte e ganhar recompensas incríveis!",
                "success",
                "claim_wheel_ticket",
                { tickets: 1 }
            );
        }, 4000);
    }

    showToast(`✅ Conta criada com sucesso!`, 'success');
    isFirstLogin = true; // Marcar para o próximo login
    setTimeout(toggleAuthMode, 1200);
}

let isFirstLogin = false;

async function handleAuth() {
    const identifier = document.getElementById('auth-user').value.trim();
    const password = document.getElementById('auth-pin').value.trim();

    if (!identifier || !password) {
        showToast('Preencha o identificador e a senha', 'error');
        return;
    }

    showToast('Autenticando...', 'info');
    const result = await loginUser(identifier, password);

    if (result.error) {
        showToast(`❌ Erro: ${result.error}`, 'error');
        return;
    }

    // Usar email real (pode ter sido resolvido de username)
    const email = result.user?.email || identifier;
    currentUser = email;
    currentUserSupabaseId = result.user.id;
    
    const stats = await loadUserStatsFromSupabase(result.user.id);
    if (stats) {
        userStats = stats;
    } else {
        userStats = createEmptyStats();
    }
    
    // Aplicar tema salvo imediatamente após carregar os stats
    if (userStats.activeTheme) applyTheme(userStats.activeTheme);
    
    isAdmin = await isUserAdmin();
    
    showToast(`✅ Bem-vindo, ${email}!`, 'success');
    showScreen('main');
    updateSidebar();
    
    // Se for o primeiro login, podemos disparar um evento especial aqui
    if (isFirstLogin) {
        console.log("✨ Primeiro login detectado, preparando boas-vindas...");
        // O sistema de notificações já vai criar a notificação de boas-vindas
    }
    
    initNotificationSystem();
    updateAdminUI();
    
    // Verificar ticket diário APENAS se não for primeiro login
    // Isso evita conflito com notificações de boas-vindas
    if (!isFirstLogin) {
        checkDailyTicket(); // v1.0.6: verificar ticket diario apos login
    }
    
    isFirstLogin = false; // Reset flag
}

async function handleGuestLogin() {
    showToast('Iniciando sessão de visitante...', 'info');
    
    // Criar conta temporária no banco
    const result = await registerGuestUser();
    
    if (result.error) {
        showToast('❌ Erro ao iniciar sessão de visitante. Tente novamente.', 'error');
        console.error('Erro Guest Login:', result.error);
        return;
    }

    isGuest = true;
    currentUser = result.user.email;
    currentUserSupabaseId = result.user.id;
    
    // Carregar stats (serão os iniciais do banco)
    const stats = await loadUserStatsFromSupabase(result.user.id);
    if (stats) {
        userStats = stats;
    } else {
        userStats = createEmptyStats();
    }
    
    const username = await getUserUsername() || "Visitante";
    showToast(`✅ Bem-vindo, ${username}!`, 'success');
    showScreen('main');
    updateSidebar();
    
    // Notificação para visitantes (agora no banco)
    setTimeout(async () => {
        await createNotification(
            "Sessão de Visitante Ativa! 🎭", 
            "Você está jogando em uma conta temporária. Crie uma conta definitiva para ganhar um BÔNUS de +500 Moedas e +100 XP, manter seu progresso atual e desbloquear o Modo Jornada!", 
            "info",
            "create_account"
        );
        // Forçar atualização da badge e lista
        if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
        if (typeof renderNotifications === 'function') renderNotifications();
    }, 1500);
}

async function logout() {
    const message = isGuest 
        ? 'Sair da sessão de visitante? Seu progresso será perdido permanentemente se você não criar uma conta.' 
        : 'Deseja sair da sua conta?';
        
    if (!confirm(message)) return;
    
    const client = getSupabaseClient();
    
    // 1. Sair da sala online se estiver em uma
    if (typeof OnlineManager !== 'undefined' && OnlineManager.currentRoom) {
        console.log("Limpando sala online antes do logout...");
        await OnlineManager.leaveRoom();
    }
    
    if (isGuest && currentUserSupabaseId) {
        showToast('Limpando sessão temporária...', 'info');
        try {
            // Deleta o registro do visitante no banco ENQUANTO ainda está logado
            const { error: deleteError } = await client.from('users').delete().eq('id', currentUserSupabaseId);
            if (deleteError) console.error("Erro RLS ao limpar visitante (users):", deleteError.message);
            
            // Apagar também o game_stats do visitante
            const { error: statsError } = await client.from('game_stats').delete().eq('user_id', currentUserSupabaseId);
            if (statsError) console.error("Erro RLS ao limpar visitante (game_stats):", statsError.message);
            
            // E apagar o usuário do Supabase Auth usando Edge Function ou RPC se possível
            // Como não temos acesso direto de admin no client, o token auth.signOut() limpa a sessão,
            // mas o usuário auth real pode ficar órfão. A limpeza de 'users' e 'game_stats' já resolve a sujeira visual.
            
            // O logout do Supabase Auth limpa o token
            await client.auth.signOut();
        } catch (e) {
            console.error("Erro ao limpar visitante:", e);
        }
    } else {
        await logoutUser();
    }
    
    // Reset total do estado local
    isGuest = false;
    currentUser = null;
    currentUserSupabaseId = null;
    userStats = {};
    gameInProgress = false;
    currentGame = null;
    
    // Limpar localStorage relacionado ao usuário
    localStorage.removeItem('termo_user_stats');
    localStorage.removeItem('termo_guest_stats');
    
    showScreen('login');
}

// ============================================================
//  ESTATÍSTICAS E XP
// ============================================================
function createEmptyStats(isInitialAdmin = false) {
    return {
        xp: isInitialAdmin ? 100 : 0,
        coins: isInitialAdmin ? 100000 : 0,
        totalGames: 0,
        winStreak: 0,
        maxWinStreak: 0,  // Sequencia maxima historica (Melhoria 3)
        unlockedTrophies: [],
        ownedItems: [],
        activeTheme: 'theme_default',  // Tema padrão (Melhoria 5)
        activeAvatar: null,
        activeAvatarVariant: null,      // Nova estrutura v1.1.0
        activeCosmetics: {},            // Cosméticos por categoria (Melhoria 6)
        '5_LETTERS': { wins: 0, losses: 0 },
        '7_LETTERS': { wins: 0, losses: 0 },
        'SURVIVAL':  { wins: 0, losses: 0 },
        'AVALANCHE': { wins: 0, losses: 0 },
        perfectGames5L: 0,
        perfectGames7L: 0,
        bestSurvivalRound: 0,
        bestSurvivalScore: 0,  // Melhor score Sobrevivencia (Melhoria 3)
        bestAvalanchePhase: 0,
        bestAvalancheScore: 0,  // Melhor score Avalanche (Melhoria 3)
        survivalLivesBought: 0,
        spinTickets: 0,         // v1.0.6 Roleta
        lastDailyTicket: null,  // v1.0.6 Roleta
        // FASE 2: Preços dinâmicos para avatares
        avatarCategoryPurchases: {
            'toon-head': 0,
            'croodles': 0,
            'big-ears': 0,
            'bottts': 0
        },
        // FASE 3: Palavra Diária
        dailyWordBestScore: 0,
        dailyWordPlayed: false
    };
}

function loadUserStats() {
    const saved = localStorage.getItem(`termo_user_${currentUser}`);
    if (saved) {
        userStats = JSON.parse(saved);
        if (!userStats.unlockedTrophies) userStats.unlockedTrophies = [];
        if (!userStats.ownedItems) userStats.ownedItems = [];
        if (userStats.coins === undefined) userStats.coins = 0;
        if (!userStats.activeCosmetics) userStats.activeCosmetics = {};  // Melhoria 6
    } else {
        userStats = createEmptyStats();
        saveUserStats();
    }
}

async function saveUserStats() {
    if (isGuest) {
        localStorage.setItem(`termo_guest_stats`, JSON.stringify(userStats));
        return;
    }
    
    if (currentUser && currentUserSupabaseId) {
        await saveUserStatsToSupabase(currentUserSupabaseId, userStats);
    } else if (currentUser) {
        localStorage.setItem(`termo_user_${currentUser}`, JSON.stringify(userStats));
    }
}

function getLevelInfo(xp) {
    const level = Math.floor(Math.pow(xp / 100, 1/1.5)) || 1;
    const currentLevelXP = Math.round(100 * Math.pow(level, 1.5));
    const nextLevelXP    = Math.round(100 * Math.pow(level + 1, 1.5));
    const progressXP     = xp - currentLevelXP;
    const neededXP       = nextLevelXP - currentLevelXP;
    return { level, progressXP, neededXP, nextLevelXP };
}

async function updateSidebar() {
    const info = getLevelInfo(userStats.xp);
    
    const userNameEl = document.getElementById('sidebar-username');
    const levelEl = document.getElementById('sidebar-level-badge');
    const coinsEl = document.getElementById('sidebar-coins-value');
    const xpFillEl = document.getElementById('sidebar-xp-bar');
    const xpTextEl = document.querySelector('.xp-label-row');
    const avatarEl = document.getElementById('sidebar-avatar');

    const username = isGuest ? "Visitante" : (await getUserUsername() || (currentUser ? currentUser.split('@')[0] : 'Jogador'));

    if (userNameEl) {
        userNameEl.textContent = username;
    }
    
    if (avatarEl) {
        avatarEl.innerHTML = getAvatarDisplay(username);
    }
    if (levelEl) levelEl.textContent = `Nível ${info.level}`;
    if (coinsEl) coinsEl.textContent = userStats.coins;
    
    if (xpFillEl) {
        const xpPercent = Math.min(100, (info.progressXP / info.neededXP) * 100);
        xpFillEl.style.width = `${xpPercent}%`;
    }
    if (xpTextEl) xpTextEl.innerHTML = `<span id="sidebar-xp-label">${userStats.xp} XP</span><span id="sidebar-xp-next">/ ${info.nextLevelXP} XP</span>`;
    
    updateRankingUI();
    updateTicketBadge();
}

// Atualizar badge de tickets na sidebar (v1.0.6)
function updateTicketBadge() {
    const badge = document.getElementById('nav-ticket-badge');
    if (badge) {
        const tickets = userStats.spinTickets || 0;
        badge.textContent = tickets;
        badge.style.display = tickets > 0 ? 'inline-flex' : 'none';
    }
}

// Modo de ranking atual (xp, 5_LETTERS, 7_LETTERS, SURVIVAL, AVALANCHE)
let currentRankingMode = 'xp';
// Período de ranking atual (all, weekly, monthly) - Melhoria 4
let currentRankingPeriod = 'all';

function setRankingMode(mode, btn) {
    currentRankingMode = mode;
    document.querySelectorAll('.ranking-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRanking();
}

// Filtro por período (Melhoria 4)
function setRankingPeriod(period, btn) {
    currentRankingPeriod = period;
    document.querySelectorAll('.ranking-period-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRanking();
}

// Mantém compatibilidade com chamadas antigas
function updateRankingUI() {}
function updateRankingStats(mode) {}

function closeLevelUp() {
    const overlay = document.getElementById('levelup-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function backToMenu() {
    if (gameInProgress) {
        showConfirmModal(() => {
            const isStory = currentGame && currentGame.storyConfig;
            gameInProgress = false;
            currentGame = null;
            enableDifficultyButtons();
            showMainTab(isStory ? 'story-mode' : 'menu');
            updateSidebar();
        });
        return;
    }
    
    const isStory = currentGame && currentGame.storyConfig;
    gameInProgress = false;
    currentGame = null;
    enableDifficultyButtons();
    showMainTab(isStory ? 'story-mode' : 'menu');
    updateSidebar();
}

// Sistema de Confirmação Customizado
let onConfirmAction = null;

function showConfirmModal(onConfirm, title = "ABANDONAR PARTIDA?", message = "Seu progresso atual será perdido permanentemente.", icon = "⚠️") {
    onConfirmAction = onConfirm;
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) {
        // Atualizar textos e ícone se existirem elementos para isso
        const titleEl = overlay.querySelector('.modal-title-confirm');
        const bodyEl = overlay.querySelector('.modal-body-confirm p');
        const iconEl = overlay.querySelector('.modal-icon');
        
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = message;
        if (iconEl) iconEl.textContent = icon;

        // v1.1.10: Estilização condicional baseada no título
        const confirmBox = overlay.querySelector('.confirm-box');
        if (confirmBox) {
            if (title.includes("SAIR")) {
                confirmBox.style.borderTop = "4px solid var(--accent)";
            } else {
                confirmBox.style.borderTop = "4px solid var(--error)";
            }
        }

        overlay.classList.remove('hidden');
        const yesBtn = document.getElementById('confirm-yes');
        yesBtn.onclick = () => {
            if (onConfirmAction) onConfirmAction();
            closeConfirmModal();
        };
    }
}

function closeConfirmModal() {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.classList.add('hidden');
    // Não limpamos onConfirmAction aqui para evitar race conditions
}

// ============================================================
//  DIFICULDADE
// ============================================================
function setDifficulty(diff) {
    if (gameInProgress) { showToast('Não pode mudar dificuldade durante a partida!', 'error'); return; }
    
    // Se o usuário clicar na dificuldade que já está ativa, não faz nada (impede desmarcar)
    if (globalDifficulty === diff) return;
    
    globalDifficulty = diff;
    updateDifficultyUI();
    playSound('click');
}

function updateDifficultyUI() {
    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.classList.remove('active');
    });
    const active = document.getElementById(`diff-${globalDifficulty.toLowerCase()}`);
    if (active) active.classList.add('active');
}

function getDifficultyMultiplier() {
    return { EASY: 0.5, NORMAL: 1.0, HARD: 1.5 }[globalDifficulty];
}

function disableDifficultyButtons() {
    // Se for modo história, não desativa para permitir que o jogador mantenha sua escolha
    if (currentGame && currentGame.storyConfig) return;

    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.disabled = true;
    });
}

function enableDifficultyButtons() {
    ['easy','normal','hard'].forEach(d => {
        const btn = document.getElementById(`diff-${d}`);
        if (btn) btn.disabled = false;
    });
}

// ============================================================
//  TELAS
// ============================================================
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('active');
}

function showMainTab(name) {
    // v1.1.9: Tratamento especial para o modo online (Cobre Lobby e Partida)
    // Se estiver em uma sala e NÃO estiver indo para a tela de jogo (início da partida)
    if (typeof OnlineManager !== 'undefined' && OnlineManager.currentRoom && name !== 'online' && name !== 'game') {
        showConfirmModal(() => {
            OnlineManager.leaveRoom().then(() => {
                forceShowMainTab(name);
            });
        }, "SAIR DA SALA?", "Deseja realmente sair da sala online? Você será removido da lista de jogadores.", "🚪");
        return;
    }

    // Se estiver em jogo e tentar mudar de aba pela sidebar/header
    if (gameInProgress && name !== 'game') {
        if (typeof showConfirmModal === 'function') {
            showConfirmModal(() => {
                gameInProgress = false;
                if (currentGame && currentGame.timerInterval) {
                    clearInterval(currentGame.timerInterval);
                    currentGame.timerInterval = null;
                }
                forceShowMainTab(name);
            });
        } else {
            if (confirm('Deseja realmente sair da partida atual? Seu progresso será perdido.')) {
                gameInProgress = false;
                if (currentGame && currentGame.timerInterval) {
                    clearInterval(currentGame.timerInterval);
                    currentGame.timerInterval = null;
                }
                forceShowMainTab(name);
            }
        }
        return;
    }
    forceShowMainTab(name);
}

function forceShowMainTab(name) {
    closeMobileSidebar();
    document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById(`tab-${name}`);
    if (tab) tab.classList.add('active');

    if (name === 'trophies') { if (typeof renderTrophies === 'function') renderTrophies(); }
    if (name === 'ranking') { if (typeof renderRanking === 'function') renderRanking(); }
    if (name === 'online') { if (typeof OnlineUI !== 'undefined' && OnlineUI.renderLobby) OnlineUI.renderLobby(); }
    if (name === 'social') { if (typeof renderSocial === 'function') renderSocial(); }
    if (name === 'shop') renderShop();
    if (name === 'notifications') renderNotifications();
    if (name === 'profile') renderProfile();
    if (name === 'roleta') renderRoleta(); // v1.0.6
    updateTicketBadge(); // Atualizar badge de tickets na sidebar
}

// ============================================================
//  RENDERIZAÇÃO DE TROFÉUS
// ============================================================
function renderTrophies() {
    const container = document.getElementById('trophies-grid');
    if (!container) return;
    container.innerHTML = '';

    const info = getLevelInfo(userStats.xp || 0);

    TROPHIES_DEF.forEach(trophy => {
        const unlocked = trophy.check(userStats, info.level, userStats.coins);
        const isNew = unlocked && !userStats.unlockedTrophies.includes(trophy.id);

        const card = document.createElement('div');
        card.className = `trophy-card ${unlocked ? 'unlocked' : 'locked'}`;
        if (isNew) card.classList.add('new');

        card.innerHTML = `
            <div class="trophy-icon">${trophy.icon}</div>
            <div class="trophy-name">${trophy.name}</div>
            <div class="trophy-desc">${unlocked ? trophy.desc : '???'}</div>
            ${isNew ? '<div class="trophy-badge-new">NOVO!</div>' : ''}
            ${trophy.reward > 0 ? `<div class="trophy-reward">+${trophy.reward} XP</div>` : ''}
        `;

        if (isNew) {
            card.onclick = () => claimTrophy(trophy.id);
        }

        container.appendChild(card);
    });
}

async function claimTrophy(trophyId) {
    if (userStats.unlockedTrophies.includes(trophyId)) return;
    
    const trophy = TROPHIES_DEF.find(t => t.id === trophyId);
    if (!trophy) return;

    userStats.unlockedTrophies.push(trophyId);
    userStats.xp += trophy.reward;
    
    // Salvar troféu no Supabase
    if (currentUserSupabaseId) {
        await saveAchievementToSupabase(currentUserSupabaseId, trophyId);
    }
    
    await saveUserStats();
    updateSidebar();
    renderTrophies();
    showToast(`🏆 Troféu "${trophy.name}" desbloqueado! +${trophy.reward} XP`, 'success');
}

async function renderRanking() {
    const podiumEl   = document.getElementById('ranking-podium');
    const boardEl    = document.getElementById('ranking-leaderboard');
    const myPosEl    = document.getElementById('ranking-my-position');
    if (!podiumEl || !boardEl) return;

    podiumEl.innerHTML  = '<div class="ranking-loading"><span class="ranking-spinner"></span> Carregando...</div>';
    boardEl.innerHTML   = '';
    if (myPosEl) myPosEl.innerHTML = '';

    try {
        // Usar ranking por período (Melhoria 4)
        const allPlayers = await loadRankingByPeriod(currentRankingPeriod, 100);

        // Ordenar conforme modo selecionado
        const mode = currentRankingMode;
        const modeLabels = {
            'xp': { label: 'XP', getValue: p => p.xp },
            '5_LETTERS': { label: 'Vitórias 5L', getValue: p => p.fiveLettersWins },
            '7_LETTERS': { label: 'Vitórias 7L', getValue: p => p.sevenLettersWins },
            'SURVIVAL':  { label: 'Melhor Rodada', getValue: p => p.bestSurvival },
            'AVALANCHE': { label: 'Melhor Fase', getValue: p => p.bestAvalanche }
        };
        const modeInfo = modeLabels[mode] || modeLabels['xp'];

        const sorted = [...allPlayers].sort((a, b) => modeInfo.getValue(b) - modeInfo.getValue(a));
        const ranked = sorted.map((p, i) => ({ ...p, rank: i + 1 }));

        // Buscar username do jogador atual
        const myUsername = await getUserUsername() || (currentUser ? currentUser.split('@')[0] : '');

        // ---- PÓDIO TOP 3 ----
        podiumEl.innerHTML = '';
        if (ranked.length === 0) {
            podiumEl.innerHTML = '<p class="ranking-empty">Nenhum jogador no ranking ainda.</p>';
            boardEl.innerHTML = '';
            return;
        }

        const podiumOrder = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
        const podiumMeta  = [
            { pos: 2, label: '2º', cls: 'silver',  height: '90px',  crown: '🥈' },
            { pos: 1, label: '1º', cls: 'gold',    height: '120px', crown: '🥇' },
            { pos: 3, label: '3º', cls: 'bronze',  height: '70px',  crown: '🥉' }
        ];

        const podiumWrap = document.createElement('div');
        podiumWrap.className = 'podium-wrap';

        podiumOrder.forEach((player, idx) => {
            if (!player) return;
            const meta = podiumMeta[idx];
            const isMe = player.username === myUsername;
            const value = modeInfo.getValue(player);
            const col = document.createElement('div');
            col.className = `podium-col podium-${meta.cls}${isMe ? ' podium-me' : ''}`;
            col.innerHTML = `
                <div class="podium-crown">${meta.crown}</div>
                <div class="podium-avatar">${getAvatarDisplay(player.username)}</div>
                <div class="podium-name">${player.username}${isMe ? ' <span class="podium-you">(Você)</span>' : ''}</div>
                <div class="podium-score">${value.toLocaleString('pt-BR')} <span class="podium-score-label">${modeInfo.label}</span></div>
                <div class="podium-base" style="height:${meta.height}">
                    <span class="podium-rank-num">${meta.label}</span>
                </div>
            `;
            podiumWrap.appendChild(col);
        });
        podiumEl.appendChild(podiumWrap);

        // ---- LEADERBOARD (4º em diante) ----
        boardEl.innerHTML = '';
        const rest = ranked.slice(3);
        if (rest.length > 0) {
            const table = document.createElement('div');
            table.className = 'leaderboard-table';
            table.innerHTML = `
                <div class="leaderboard-header">
                    <span class="lb-col-rank">#</span>
                    <span class="lb-col-name">Jogador</span>
                    <span class="lb-col-score">${modeInfo.label}</span>
                    <span class="lb-col-wins">Vitórias</span>
                </div>
                ${rest.map(p => {
                    const isMe = p.username === myUsername;
                    const value = modeInfo.getValue(p);
                    return `<div class="leaderboard-row${isMe ? ' leaderboard-me' : ''}">
                        <span class="lb-col-rank">${p.rank}</span>
                        <span class="lb-col-name">${p.username}${isMe ? ' <span class="lb-you-tag">★ Você</span>' : ''}</span>
                        <span class="lb-col-score">${value.toLocaleString('pt-BR')}</span>
                        <span class="lb-col-wins">${p.totalWins}</span>
                    </div>`;
                }).join('')}
            `;
            boardEl.appendChild(table);
        }

        // ---- MINHA POSIÇÃO (se não estiver no top 10) ----
        if (myPosEl) {
            const myEntry = ranked.find(p => p.username === myUsername);
            if (myEntry && myEntry.rank > 10) {
                const value = modeInfo.getValue(myEntry);
                myPosEl.innerHTML = `
                    <div class="my-position-card">
                        <span class="my-pos-label">Sua posição</span>
                        <span class="my-pos-rank">#${myEntry.rank}</span>
                        <span class="my-pos-name">${myEntry.username}</span>
                        <span class="my-pos-score">${value.toLocaleString('pt-BR')} ${modeInfo.label}</span>
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        podiumEl.innerHTML = '<p class="ranking-empty" style="color:#f66">Erro ao carregar ranking. Tente novamente.</p>';
    }
}

// ============================================================
//  MODOS DE JOGO (ESTRUTURA REFORMULADA)
// ============================================================
function startMode(mode) {
    closeMobileSidebar();
    disableDifficultyButtons();

    const config = {
        '5_LETTERS': { 
            wordLength: 5, 
            stages: [
                { boards: 1, attempts: 6 },
                { boards: 3, attempts: 8 },
                { boards: 5, attempts: 10 }
            ] 
        },
        '7_LETTERS': { 
            wordLength: 7, 
            stages: [
                { boards: 1, attempts: 6 },
                { boards: 2, attempts: 7 }
            ] 
        },
        'SURVIVAL': { 
            wordLength: 5, 
            boards: 1, 
            attempts: 6, 
            lives: 3 
        },
        'AVALANCHE': { 
            wordLength: 5, 
            phase: 1
        }
    };

    const cfg = config[mode];
    if (!cfg) return;

    currentGame = {
        mode,
        modeName: { '5_LETTERS': '5 LETRAS', '7_LETTERS': '7 LETRAS', 'SURVIVAL': 'SOBREVIVÊNCIA', 'AVALANCHE': 'AVALANCHE' }[mode],
        wordLength: cfg.wordLength,
        maxAttempts: 0,
        currentRow: 0,
        currentInputArr: new Array(cfg.wordLength).fill(''),
        selectedFieldIndex: 0,
        words: [],
        attempts: [],
        score: 0,
        stage: 0,
        round: 1,
        phase: cfg.phase || 1,
        lives: cfg.lives || 0,
        usedHints: [],
        isAnimating: false,
        hintsUsedThisRound: 0,
        survivalLivesBought: 0,
        isPerfectGame: true,
        stageScores: [],
        usedWordsMemory: new Set()
    };

    initStage();

    gameInProgress = true;
    showMainTab('game');
    updateAdminUI(); // Mostrar botão hack se for admin
    renderGame();
}

function initStage() {
    const mode = currentGame.mode;
    let numBoards = 1;
    let attempts = 6;

    if (mode === '5_LETTERS') {
        const stageCfg = [
            { boards: 1, attempts: 6 },
            { boards: 3, attempts: 8 },
            { boards: 5, attempts: 10 }
        ][currentGame.stage];
        numBoards = stageCfg.boards;
        attempts = stageCfg.attempts;
    } else if (mode === '7_LETTERS') {
        const stageCfg = [
            { boards: 1, attempts: 6 },
            { boards: 2, attempts: 7 }
        ][currentGame.stage];
        numBoards = stageCfg.boards;
        attempts = stageCfg.attempts;
    } else if (mode === 'SURVIVAL') {
        numBoards = 1;
        attempts = 6;
    } else if (mode === 'AVALANCHE') {
        // Ciclo de 1 a 5 palavras
        // Fase 1 = 1 palavra, Fase 2 = 2 palavras, ..., Fase 5 = 5 palavras, Fase 6 = 1 palavra, etc.
        const cyclePosition = ((currentGame.phase - 1) % 5) + 1;
        numBoards = cyclePosition;
        attempts = numBoards + 5;
    }

    currentGame.maxAttempts = attempts;
    currentGame.currentRow = 0;
    currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
    currentGame.selectedFieldIndex = 0;
    currentGame.words = Array.from({ length: numBoards }, () => getRandomWordByDifficulty(currentGame.wordLength));
    currentGame.attempts = Array.from({ length: numBoards }, () => new Array(attempts).fill(null));
}

// ============================================================
//  MOTOR DE SORTEIO INTELIGENTE POR DIFICULDADE
// ============================================================
function getRandomWordByDifficulty(length) {
    const key = `letras${length}`;
    
    // Fallback básico se o banco não estiver carregado
    if (typeof BANCO_DE_PALAVRAS !== 'object' || !BANCO_DE_PALAVRAS[key]) {
        return length === 7 ? 'PLANETA' : 'TERMO';
    }

    const bucket = BANCO_DE_PALAVRAS[key];
    let words = [];
    const roll = Math.random();
    let selectedDifficulty = 'medio';

    // Determinar dificuldade probabilística
    if (typeof globalDifficulty !== 'undefined') {
        if (globalDifficulty === 'EASY') {
            selectedDifficulty = roll < 0.7 ? 'facil' : 'medio';
        } else if (globalDifficulty === 'HARD') {
            selectedDifficulty = roll < 0.7 ? 'dificil' : 'medio';
        } else {
            if (roll < 0.25) selectedDifficulty = 'facil';
            else if (roll < 0.75) selectedDifficulty = 'medio';
            else selectedDifficulty = 'dificil';
        }
    }

    // Função auxiliar para filtrar palavras não usadas
    const filterUnused = (wordList) => {
        if (!Array.isArray(wordList)) return [];
        return wordList.filter(w => {
            if (!w || w.length !== length) return false;
            // Só filtra se currentGame existir e tiver memória de palavras
            if (currentGame && currentGame.usedWordsMemory) {
                return !currentGame.usedWordsMemory.has(normalizeWord(w));
            }
            return true;
        });
    };

    // 1. Tentar dificuldade selecionada
    words = filterUnused(bucket[selectedDifficulty]);
    
    // 2. Fallback em cascata (outras dificuldades)
    if (words.length === 0) {
        const priority = ['medio', 'facil', 'dificil'];
        for (const p of priority) {
            words = filterUnused(bucket[p]);
            if (words.length > 0) break;
        }
    }

    // 3. Fallback final: ignora o filtro de "já usadas" se necessário
    if (words.length === 0) {
        for (const p in bucket) {
            if (Array.isArray(bucket[p])) {
                words = bucket[p].filter(w => w && w.length === length);
                if (words.length > 0) break;
            }
        }
    }

    // Selecionar palavra final
    let selectedWord = 'TERMO';
    if (words.length > 0) {
        selectedWord = words[Math.floor(Math.random() * words.length)];
    } else if (length === 7) {
        selectedWord = 'PLANETA';
    }

    // Registrar na memória se possível
    if (currentGame && currentGame.usedWordsMemory) {
        currentGame.usedWordsMemory.add(normalizeWord(selectedWord));
    }

    return selectedWord;
}

// ============================================================
//  RENDERIZAÇÃO DO JOGO
// ============================================================
function renderGame() {
    updateGameTopbar();
    renderBoards();
    renderKeyboard();
}

function updateGameTopbar() {
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();

    const titleBar = document.getElementById('game-title-bar');
    if (titleBar) titleBar.textContent = currentGame.modeName;

    const badge = document.getElementById('game-diff-badge');
    const icons  = { EASY: '🟢', NORMAL: '🟡', HARD: '🔴' };
    if (badge) {
        badge.textContent = `${icons[globalDifficulty]} ${globalDifficulty} ${mult}×`;
        badge.className   = `game-diff-badge ${globalDifficulty.toLowerCase()}`;
    }

    const statusBar = document.getElementById('game-status-bar');
    if (!statusBar) return;
    statusBar.innerHTML = '';

    const addChip = (label, value) => {
        const chip = document.createElement('div');
        chip.className = 'status-chip';
        chip.innerHTML = `${label} <span>${value}</span>`;
        statusBar.appendChild(chip);
    };

    if (mode === '5_LETTERS') {
        addChip('Etapa', `${currentGame.stage + 1}/3`);
        addChip('Tabuleiros', currentGame.words.length);
    } else if (mode === '7_LETTERS') {
        addChip('Etapa', `${currentGame.stage + 1}/2`);
        addChip('Tabuleiros', currentGame.words.length);
    } else if (mode === 'SURVIVAL') {
        addChip('Rodada', currentGame.round);
        addChip('Vidas', '❤️'.repeat(currentGame.lives));
    } else if (mode === 'AVALANCHE') {
        addChip('Fase', currentGame.phase);
        addChip('Tabuleiros', currentGame.words.length);
    }
    
    addChip('Score', currentGame.score);
}

function renderBoards() {
    const area = document.getElementById('game-boards-area');
    if (!area) return;
    
    // Limpar área completamente
    area.innerHTML = '';
    
    if (currentGame && currentGame.mode === 'ONLINE_1V1') {
        area.classList.add('online-match-layout');
        
        // Criar painel do oponente (Se não existir)
        let opponentBoard = document.getElementById('opponent-board-container');
        if (!opponentBoard) {
            opponentBoard = document.createElement('div');
            opponentBoard.id = 'opponent-board-container';
            opponentBoard.className = 'opponent-side';
            opponentBoard.innerHTML = `
                <div class="opponent-header">OPONENTE</div>
                <div id="opponent-mini-grid" class="mini-grid">
                    ${Array(6).fill(0).map(() => `
                        <div class="mini-row">
                            ${Array(5).fill(0).map(() => `<div class="mini-tile"></div>`).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        area.appendChild(opponentBoard);
    } else {
        area.classList.remove('online-match-layout');
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'game-boards-wrapper';

    const screenWidth = window.innerWidth;
    const sidebarWidth = screenWidth > 520 ? 240 : 0;
    const availableWidth = screenWidth - sidebarWidth - 40;
    const numBoards = currentGame.words.length;
    const boardGap = 15;
    const tileGap = 4;
    
    const totalGaps = (numBoards - 1) * boardGap + numBoards * (currentGame.wordLength - 1) * tileGap;
    let tileSize = Math.floor((availableWidth - totalGaps) / (numBoards * currentGame.wordLength));
    tileSize = Math.max(20, Math.min(52, tileSize));

    currentGame.words.forEach((word, wordIdx) => {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.style.setProperty('--tile-size', `${tileSize}px`);

        const wordDone = isBoardWon(wordIdx);
        if (wordDone) gridContainer.classList.add('won');

        const wordGrid = document.createElement('div');
        wordGrid.className = 'word-grid';

        for (let row = 0; row < currentGame.maxAttempts; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'tile-row';

            for (let col = 0; col < currentGame.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.fontSize = `${tileSize * 0.5}px`;

                const attempt = currentGame.attempts[wordIdx][row];

                if (attempt) {
                    const letter = attempt[col] || '';
                    tile.textContent = letter;
                    if (letter) {
                        tile.classList.add('filled');
                        const state = getLetterState(letter, col, word, attempt);
                        tile.classList.add(state);
                        
                        if (row === currentGame.currentRow - 1 && currentGame.isAnimating && !tile.dataset.animated) {
                            tile.classList.add('flipping');
                            tile.style.animationDelay = `${col * 0.1}s`;
                            tile.dataset.animated = "true";
                        }
                    }
                } else if (row === currentGame.currentRow && !wordDone) {
                    const letter = currentGame.currentInputArr[col] || '';
                    tile.textContent = letter;
                    if (letter) tile.classList.add('filled');

                    if (col === currentGame.selectedFieldIndex) {
                        tile.classList.add('selected');
                    }

                    const lastFilled = currentGame.currentInputArr.reduce((last, l, i) => l ? i : last, -1);
                    if (col === lastFilled + 1 && col !== currentGame.selectedFieldIndex) {
                        tile.classList.add('focused');
                    }

                    tile.classList.add('clickable');
                    tile.onclick = () => {
                        currentGame.selectedFieldIndex = col;
                        renderGame();
                    };
                }

                rowDiv.appendChild(tile);
            }
            wordGrid.appendChild(rowDiv);
        }

        gridContainer.appendChild(wordGrid);
        wrapper.appendChild(gridContainer);
    });

    area.appendChild(wrapper);

    // Se for modo online, garantir que o progresso do oponente seja renderizado após os boards
    if (currentGame && currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined' && OnlineManager.opponentProgress) {
        OnlineUI.renderOpponentProgress(OnlineManager.opponentProgress);
    }
}

function renderKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    keyboard.innerHTML = '';

    const correctSet = new Set();
    const presentSet = new Set();
    const absentSet  = new Set();

    currentGame.words.forEach((word, wordIdx) => {
        currentGame.attempts[wordIdx].forEach(attempt => {
            if (!attempt) return;
            attempt.forEach((letter, col) => {
                const state = getLetterState(letter, col, word, attempt);
                const nl = normalizeWord(letter);
                if (state === 'correct') correctSet.add(nl);
                else if (state === 'present' && !correctSet.has(nl)) presentSet.add(nl);
                else if (state === 'absent' && !correctSet.has(nl) && !presentSet.has(nl)) absentSet.add(nl);
            });
        });
    });

    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    const container = document.createElement('div');
    container.className = 'keyboard-container';

    rows.forEach((row, rowIdx) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        if (rowIdx === 0) {
            rowDiv.appendChild(makeKey('ENTER', true, submitAttempt));
        }

        row.split('').forEach(letter => {
            const btn = makeKey(letter, false, () => handleInput(letter));
            const nl  = normalizeWord(letter);
            if (correctSet.has(nl))      btn.classList.add('correct');
            else if (presentSet.has(nl)) btn.classList.add('present');
            else if (absentSet.has(nl))  btn.classList.add('absent');
            rowDiv.appendChild(btn);
        });

        if (rowIdx === 2) {
            rowDiv.appendChild(makeKey('⌫', true, handleDelete));
        }
        
        container.appendChild(rowDiv);
    });

    keyboard.appendChild(container);

    const hintContainer = document.createElement('div');
    hintContainer.style.width = '100%';
    hintContainer.style.display = 'flex';
    hintContainer.style.justifyContent = 'center';
    hintContainer.style.marginTop = '6px';
    
    const hintBtn = document.createElement('button');
    hintBtn.className = 'hint-btn';
    hintBtn.type = 'button';
    hintBtn.innerHTML = `💡 Dica <small>💰${getHintPrice()}</small>`;
    hintBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        buyHint();
    };
    
    hintContainer.appendChild(hintBtn);
    keyboard.appendChild(hintContainer);
}

function makeKey(label, wide, action) {
    const btn = document.createElement('button');
    btn.className = `key ${wide ? 'wide' : ''}`;
    btn.textContent = label;
    btn.type = 'button';
    btn.title = label === '⌫' ? 'Deletar (Backspace)' : '';
    if (label === '⌫') btn.classList.add('delete-key');
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
        playSound('click');
    };
    return btn;
}

// ============================================================
//  LÓGICA DE ENTRADA
// ============================================================
function handleInput(letter) {
    if (!gameInProgress || !currentGame) return;
    
    currentGame.currentInputArr[currentGame.selectedFieldIndex] = letter;
    
    if (currentGame.selectedFieldIndex < currentGame.wordLength - 1) {
        currentGame.selectedFieldIndex++;
    }
    
    renderGame();
}

function handleDelete() {
    if (!gameInProgress || !currentGame) return;

    if (currentGame.currentInputArr[currentGame.selectedFieldIndex] === '') {
        if (currentGame.selectedFieldIndex > 0) {
            currentGame.selectedFieldIndex--;
        }
    }
    currentGame.currentInputArr[currentGame.selectedFieldIndex] = '';
    renderGame();
}

function isBoardWon(wordIdx) {
    const secret = normalizeWord(currentGame.words[wordIdx]);
    return currentGame.attempts[wordIdx].some(attempt => {
        if (!attempt) return false;
        return normalizeWord(attempt.join('')) === secret;
    });
}

function updateAdminUI() {
    const resetBtn = document.getElementById('reset-btn');
    const hackBtn = document.getElementById('hack-btn');
    const adminIndicator = document.getElementById('admin-indicator');
    
    if (resetBtn) resetBtn.classList.toggle('hidden', !isAdmin);
    if (hackBtn) hackBtn.classList.toggle('hidden', !isAdmin);
    if (adminIndicator) adminIndicator.classList.toggle('hidden', !isAdmin);
}

function toggleHackMode() {
    if (!isAdmin) return;
    const display = document.getElementById('hack-display');
    if (display) {
        display.classList.toggle('hidden');
        if (!display.classList.contains('hidden')) {
            display.textContent = `🔑 HACK: ${currentGame.words.join(' | ').toUpperCase()}`;
        }
    }
}

// ============================================================
//  LÓGICA DE LETRAS — WORDLE OFFICIAL ALGORITHM
// ============================================================
function getLetterState(letter, position, secretWord, attempt) {
    const normLetter = normalizeWord(letter);
    const normSecret = normalizeWord(secretWord);
    const normSecretChar = normalizeWord(secretWord[position]);

    if (normLetter === normSecretChar) return 'correct';

    let secretOccurrences = 0;
    for (let i = 0; i < normSecret.length; i++) {
        if (normSecret[i] === normLetter) secretOccurrences++;
    }

    let correctOccurrences = 0;
    for (let i = 0; i < normSecret.length; i++) {
        if (normalizeWord(attempt[i]) === normSecret[i] && normSecret[i] === normLetter) {
            correctOccurrences++;
        }
    }

    let previousOccurrences = 0;
    for (let i = 0; i < position; i++) {
        if (normalizeWord(attempt[i]) === normLetter && normSecret[i] !== normLetter) {
            previousOccurrences++;
        }
    }

    if (normSecret.includes(normLetter) && (previousOccurrences < (secretOccurrences - correctOccurrences))) {
        return 'present';
    }

    return 'absent';
}

// ============================================================
//  SUBMISSÃO DE TENTATIVA
// ============================================================
function submitAttempt() {
    if (!gameInProgress || !currentGame) return;

    const input = currentGame.currentInputArr.join('').trim();
    if (input.length !== currentGame.wordLength) {
        showToast('Preencha todas as letras', 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    const word = input.toUpperCase();
    if (!isValidWord(word)) {
        if (!confirm(`"${word}" não está no dicionário. Deseja usar assim mesmo?`)) return;
    }

    currentGame.words.forEach((secret, idx) => {
        if (!isBoardWon(idx)) {
            currentGame.attempts[idx][currentGame.currentRow] = word.split('');
        }
    });

    currentGame.currentRow++;
    currentGame.isAnimating = true;
    renderGame();

    // Sincronização Online: Se estiver em duelo, enviar progresso e atualizar mini-grid
    if (currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined') {
        // Pegar o resultado da última tentativa (que acabou de ser incrementada)
        const lastRow = currentGame.currentRow - 1;
        const lastAttempt = currentGame.attempts[0][lastRow];
        const secret = currentGame.words[0];
        const result = lastAttempt.map((letter, i) => getLetterState(letter, i, secret, lastAttempt));
        
        OnlineManager.sendProgress(lastAttempt.join(''), result);
        
        // Forçar atualização do mini-grid para revelar a tentativa do oponente se ele já tiver feito
        if (typeof OnlineUI !== 'undefined' && OnlineManager.opponentProgress) {
            OnlineUI.renderOpponentProgress(OnlineManager.opponentProgress);
        }
    }

    setTimeout(() => {
        currentGame.isAnimating = false;
        checkGameStatus();
    }, 1000);
}

function checkGameStatus() {
    const allWon = currentGame.words.every((_, idx) => isBoardWon(idx));
    const outOfAttempts = currentGame.currentRow >= currentGame.maxAttempts;

    if (allWon) {
        if (currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined') {
            // v1.1.0: No modo online, o OnlineManager cuida de tudo
            OnlineManager.finishMatch(true);
        } else {
            handleStageWon();
        }
    } else if (outOfAttempts) {
        if (currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined') {
            // v1.1.0: No modo online, o OnlineManager cuida de tudo
            OnlineManager.finishMatch(false);
        } else {
            handleStageLost();
        }
    } else {
        currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
        currentGame.selectedFieldIndex = 0;
        renderGame();
    }
}

// ============================================================
//  FIM DE ETAPA / JOGO — CARDS PREMIUM
// ============================================================
function handleStageWon() {
    playSound('victory');
    
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();
    const attemptUsed = currentGame.currentRow - 1;
    
    // Novo sistema de score com multiplicador exponencial por tentativa
    // Quanto menos tentativas, mais score (exponencial)
    const attemptMultiplier = Math.pow(2, Math.max(0, currentGame.maxAttempts - attemptUsed - 1));
    const scorePerBoard = 100;
    const baseScore = scorePerBoard * currentGame.words.length * attemptMultiplier;
    const stageScore = Math.round(baseScore * mult);
    
    currentGame.score += stageScore;
    currentGame.stageScores.push(stageScore);

    if (mode === '5_LETTERS') {
        if (currentGame.stage < 2) {
            currentGame.stage++;
            showToast(`✅ Etapa ${currentGame.stage} Concluída!`, 'success');
            initStage();
            renderGame();
        } else {
            handleGameWon();
        }
    } else if (mode === '7_LETTERS') {
        if (currentGame.stage < 1) {
            currentGame.stage++;
            showToast(`✅ Etapa ${currentGame.stage} Concluída!`, 'success');
            initStage();
            renderGame();
        } else {
            handleGameWon();
        }
    } else if (mode === 'SURVIVAL') {
        currentGame.round++;
        showToast(`🔥 Rodada ${currentGame.round}!`, 'success');
        checkSurvivalShop();
        initStage();
        renderGame();
    } else if (mode === 'AVALANCHE') {
        // Ciclo de 1 a 5 palavras: após 5, volta para 1
        const currentWords = currentGame.words.length;
        if (currentWords < 5) {
            currentGame.phase++;
        } else {
            // Completou o ciclo, volta para 1 palavra (mas mantém a pontuação)
            currentGame.phase++;
        }
        showToast(`🏔️ Fase ${currentGame.phase}!`, 'success');
        initStage();
        renderGame();
    }
}

function handleStageLost() {
    const mode = currentGame.mode;
    currentGame.isPerfectGame = false;
    playSound('lose');

    const reveal = `A palavra era: ${currentGame.words.join(' | ')}`;
    showToast(reveal, 'error');

    if (mode === '5_LETTERS' || mode === '7_LETTERS') {
        const maxStages = mode === '5_LETTERS' ? 2 : 1;
        if (currentGame.stage < maxStages) {
            currentGame.stage++;
            setTimeout(() => {
                initStage();
                renderGame();
            }, 2000);
        } else {
            handleGameWon();
        }
    } else if (mode === 'SURVIVAL') {
        currentGame.lives--;
        if (currentGame.lives > 0) {
            showToast(`💔 Perdeu uma vida! Restam ${currentGame.lives}`, 'error');
            setTimeout(() => {
                initStage();
                renderGame();
            }, 2000);
        } else {
            handleGameLost();
        }
    } else if (mode === 'AVALANCHE') {
        handleGameLost();
    }
}

function handleGameWon() {
    const mode = currentGame.mode;
    const mult = getDifficultyMultiplier();
    
    // Novo sistema de XP baseado em performance
    let xpGain = 0;
    if (currentGame.isPerfectGame === false && currentGame.score === 0) {
        // Se nao acertou nenhuma palavra: XP base minimo
        xpGain = 50;
    } else {
        // XP baseado em score e dificuldade
        const baseXP = 100;
        const scoreBonus = Math.floor(currentGame.score / 100);  // 1 XP por 100 score
        const difficultyBonus = baseXP * (mult - 1);  // Bonus por dificuldade
        xpGain = Math.round(baseXP + scoreBonus + difficultyBonus);
    }
    
    // Novo sistema de moedas - escassas, apenas em vitoria
    const baseCoins = 50;  // Minimo por vitoria
    const scoreCoins = Math.floor(currentGame.score / 50);  // 1 moeda por 50 score
    const difficultyCoins = Math.floor(baseCoins * (mult - 1) * 2);
    const coinsGain = Math.round(baseCoins + scoreCoins + difficultyCoins);

    userStats.xp += xpGain;
    userStats.coins += coinsGain;
    userStats[mode].wins++;
    userStats.winStreak++;
    
    // Rastrear sequencia maxima (Melhoria 3)
    if (userStats.winStreak > (userStats.maxWinStreak || 0)) {
        userStats.maxWinStreak = userStats.winStreak;
    }
    
    // Rastrear melhores scores (Melhoria 3)
    if (mode === 'SURVIVAL') {
        if (currentGame.round > (userStats.bestSurvivalRound || 0)) {
            userStats.bestSurvivalRound = currentGame.round;
        }
        if (currentGame.score > (userStats.bestSurvivalScore || 0)) {
            userStats.bestSurvivalScore = currentGame.score;
        }
    }
    if (mode === 'AVALANCHE') {
        if (currentGame.phase > (userStats.bestAvalanchePhase || 0)) {
            userStats.bestAvalanchePhase = currentGame.phase;
        }
        if (currentGame.score > (userStats.bestAvalancheScore || 0)) {
            userStats.bestAvalancheScore = currentGame.score;
        }
    }
    if (currentGame.isPerfectGame) {
        if (mode === '5_LETTERS') userStats.perfectGames5L++;
        if (mode === '7_LETTERS') userStats.perfectGames7L++;
    }

    saveUserStats();
    // Salvar no histórico de partidas (Melhoria 4 - Ranking Temporal)
    if (currentUserSupabaseId) {
        saveMatchToHistory(currentUserSupabaseId, {
            mode,
            score: currentGame.score || 0,
            xpGained: xpGain,
            coinsGained: coinsGain,
            won: true,
            perfect: currentGame.isPerfectGame || false,
            rounds: currentGame.round || currentGame.phase || 0
        });
    }
    showGameEndModalPremium(true, xpGain, coinsGain);
}

function handleGameLost() {
    const mode = currentGame.mode;
    userStats[mode].losses++;
    userStats.winStreak = 0;
    saveUserStats();
    // Salvar no histórico de partidas (Melhoria 4 - Ranking Temporal)
    if (currentUserSupabaseId) {
        saveMatchToHistory(currentUserSupabaseId, {
            mode,
            score: currentGame.score || 0,
            xpGained: 0,
            coinsGained: 0,
            won: false,
            perfect: false,
            rounds: currentGame.round || currentGame.phase || 0
        });
    }
    showGameEndModalPremium(false, 0, 0);
}

function showGameEndModalPremium(won, xpGain, coinsGain) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const attemptUsed = currentGame.currentRow - 1;
    const mult = getDifficultyMultiplier();
    
    // Gerar título dinâmico baseado em performance
    let titleText = '';
    let titleEmoji = '';
    
    if (won) {
        if (attemptUsed === 0) {
            titleText = 'MENTE BRILHANTE!';
            titleEmoji = '🧠';
        } else if (attemptUsed <= 2) {
            titleText = 'GENIAL!';
            titleEmoji = '⚡';
        } else if (attemptUsed <= 4) {
            titleText = 'EXCELENTE!';
            titleEmoji = '🎯';
        } else {
            titleText = 'UFA! POR UM TRIZ...';
            titleEmoji = '🥵';
        }
    } else {
        titleText = 'FIM DE JOGO';
        titleEmoji = '😢';
    }

    // Frases personalizadas por modo
    let modeMessage = '';
    if (won) {
        if (currentGame.mode === '5_LETTERS') modeMessage = 'Você conquistou as 5 letras!';
        else if (currentGame.mode === '7_LETTERS') modeMessage = 'Você dominou as 7 letras!';
        else if (currentGame.mode === 'SURVIVAL') modeMessage = `Você resistiu à maratona! Rodada ${currentGame.round}`;
        else if (currentGame.mode === 'AVALANCHE') modeMessage = `A montanha foi escalada! Fase ${currentGame.phase}`;
        else if (currentGame.mode === 'DAILY_WORD') modeMessage = 'Você decifrou a Palavra Diária! Volte amanhã.';
    } else {
        if (currentGame.mode === 'DAILY_WORD') modeMessage = 'A palavra de hoje era ' + (currentGame.words && currentGame.words[0] ? '"' + currentGame.words[0].toUpperCase() + '"' : '') + '. Volte amanhã!';
        else modeMessage = 'Tente novamente para ganhar mais XP!';
    }

    // Detalhamento de recompensas específico do modo diário (sem bônus de dificuldade)
    const isDaily = currentGame.mode === 'DAILY_WORD';
    const dailyRewardsHTML = `
                    <div class="modal-rewards-box">
                        <div class="reward-item" style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                            <span class="reward-label" style="font-weight: bold;">Total XP</span>
                            <span class="reward-value" style="color: var(--correct); font-size: 1.2em;">+${xpGain}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-label">Moedas</span>
                            <span class="reward-value" style="color: #fbbf24;">+${coinsGain}</span>
                        </div>
                    </div>`;

    const body = document.getElementById('modal-body');
    if (body) {
        body.innerHTML = `
            <div class="modal-premium-content">
                <div class="modal-emoji">${titleEmoji}</div>
                <h2 class="modal-title-premium">${titleText}</h2>
                <p class="modal-mode-msg">${modeMessage}</p>
                <div class="modal-score-box">
                    <div class="score-item">Score Final: <span class="score-value">${currentGame.score}</span></div>
                </div>
                ${won ? (isDaily ? dailyRewardsHTML : `
                    <div class="modal-rewards-box">
                        <div class="reward-item">
                            <span class="reward-label">XP Base</span>
                            <span class="reward-value">+${Math.round(100)}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-label">Bônus ${globalDifficulty}</span>
                            <span class="reward-value">×${mult}</span>
                        </div>
                        <div class="reward-item" style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; margin-top: 10px;">
                            <span class="reward-label" style="font-weight: bold;">Total XP</span>
                            <span class="reward-value" style="color: var(--correct); font-size: 1.2em;">+${xpGain}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-label">Moedas</span>
                            <span class="reward-value" style="color: #fbbf24;">+${coinsGain}</span>
                        </div>
                    </div>
                `) : ''}
            </div>
        `;
    }
    
    overlay.classList.remove('hidden');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    gameInProgress = false;
    enableDifficultyButtons();
    showMainTab('menu');
    updateSidebar();
}

// ============================================================
//  SISTEMA DE DICAS
// ============================================================
function getHintPrice() {
    return { EASY: 100, NORMAL: 200, HARD: 400 }[globalDifficulty];
}

function buyHint() {
    const price = getHintPrice();
    if (userStats.coins < price) {
        showToast('Moedas insuficientes!', 'error');
        return;
    }

    // Inicializar memória de dicas se não existir
    if (!currentGame.hintsUsedThisRound) currentGame.hintsUsedThisRound = 0;
    if (!currentGame.maxHintsPerRound) currentGame.maxHintsPerRound = 3;
    if (!currentGame.revealedHintPositions) currentGame.revealedHintPositions = []; // Armazena {boardIdx, pos}

    if (currentGame.hintsUsedThisRound >= currentGame.maxHintsPerRound) {
        showToast(`❌ Limite de dicas atingido (${currentGame.maxHintsPerRound})!`, 'error');
        return;
    }

    // Tentar encontrar uma letra que ainda não foi revelada por dicas nem pelo jogador
    let availableHints = [];
    
    for (let b = 0; b < currentGame.words.length; b++) {
        if (isBoardWon(b)) continue;
        
        const word = normalizeWord(currentGame.words[b]);
        for (let c = 0; c < word.length; c++) {
            const letter = word[c];
            
            // Verifica se o jogador já acertou essa letra (verde)
            const alreadyCorrect = currentGame.attempts[b].some(att => att && normalizeWord(att[c]) === letter);
            
            // Verifica se essa posição específica já foi revelada por uma dica anterior
            const alreadyHinted = currentGame.revealedHintPositions.some(h => h.boardIdx === b && h.pos === c);
            
            if (!alreadyCorrect && !alreadyHinted) {
                availableHints.push({ boardIdx: b, pos: c, letter: letter });
            }
        }
    }

    if (availableHints.length === 0) {
        showToast('Você já sabe todas as letras possíveis!', 'info');
        return;
    }

    // Sortear uma das dicas disponíveis (para não ser sempre a primeira da esquerda)
    const randomHint = availableHints[Math.floor(Math.random() * availableHints.length)];
    
    // Registrar a dica para evitar repetição
    currentGame.revealedHintPositions.push({ boardIdx: randomHint.boardIdx, pos: randomHint.pos });
    
    // Injetar no input atual se o jogador estiver no tabuleiro certo ou se for tabuleiro único
    if (currentGame.words.length === 1) {
        currentGame.currentInputArr[randomHint.pos] = randomHint.letter;
    } else {
        // Em multi-tabuleiro, apenas avisamos qual letra é em qual posição
        // ou poderíamos focar o tabuleiro (mas o sistema atual compartilha o input)
        currentGame.currentInputArr[randomHint.pos] = randomHint.letter;
    }

    userStats.coins -= price;
    currentGame.hintsUsedThisRound++;
    
    const boardMsg = currentGame.words.length > 1 ? ` no Tabuleiro ${randomHint.boardIdx + 1}` : "";
    showToast(`💡 Letra revelada: "${randomHint.letter}" na posição ${randomHint.pos + 1}${boardMsg}`, 'success');
    
    saveUserStats();
    updateSidebar();
    renderGame();
}

// ============================================================
//  SOBREVIVÊNCIA - LOJA DE VIDAS
// ============================================================
function checkSurvivalShop() {
    const marcos = [5, 15, 30, 50];
    if (marcos.includes(currentGame.round)) {
        openSurvivalShop();
    }
}

function openSurvivalShop() {
    const overlay = document.getElementById('shop-overlay');
    if (!overlay) return;
    
    const info = document.getElementById('shop-info');
    const container = document.getElementById('shop-buttons');
    
    // Novo sistema de precos escalonados para vidas
    const prices = [2000, 5000, 7000, 10000];
    const price = prices[Math.min(currentGame.survivalLivesBought, prices.length - 1)];
    if (info) info.textContent = `Você chegou à rodada ${currentGame.round}! Deseja comprar uma vida extra?`;
    
    if (container) {
        container.innerHTML = `
            <button class="btn-primary btn-full" onclick="buySurvivalLife(${price})">
                COMPRAR 1 VIDA ❤️ (💰${price})
            </button>
            <button class="btn-secondary btn-full" onclick="closeShop()">
                PROSSEGUIR SEM COMPRAR
            </button>
        `;
    }
    overlay.classList.remove('hidden');
}

function buySurvivalLife(price) {
    if (userStats.coins < price) {
        showToast('Moedas insuficientes!', 'error');
        return;
    }
    userStats.coins -= price;
    currentGame.lives++;
    currentGame.survivalLivesBought++;
    showToast('❤️ Vida comprada!', 'success');
    saveUserStats();
    closeShop();
}

function closeShop() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) overlay.classList.add('hidden');
    updateSidebar();
    renderGame();
}

// ============================================================
//  SISTEMA DE LOJA (COSMÉTICOS)
// ============================================================
let currentShopTab = 'themes';
let currentAvatarCategory = null;

// FASE 2: Calcular preço dinâmico de avatares por categoria
function getAvatarPrice(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || item.type !== 'avatar_variant') return item?.price || 0;
    
    const category = item.category;
    if (!userStats.avatarCategoryPurchases) {
        userStats.avatarCategoryPurchases = {
            'toon-head': 0,
            'croodles': 0,
            'big-ears': 0,
            'bottts': 0
        };
    }
    
    const purchasedCount = userStats.avatarCategoryPurchases[category] || 0;
    // Preço base 1000 + (purchasedCount * 1000)
    return 1000 + (purchasedCount * 1000);
}

function switchShopTab(tab, btn) {
    currentShopTab = tab;
    currentAvatarCategory = null; // Resetar categoria ao mudar de aba
    document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderShop();
}

function renderShop() {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;
    container.innerHTML = '';

    // Filtrar por aba ativa
    let filteredItems;
    if (currentShopTab === 'themes') {
        filteredItems = SHOP_ITEMS.filter(i => i.type === 'theme' && !i.isDefault);
    } else if (currentShopTab === 'avatars') {
        // Mostrar todos os avatares diretamente (sem subcategorias)
        filteredItems = SHOP_ITEMS.filter(i => i.type === 'avatar_variant');
    } else if (currentShopTab === 'cosmetics') {
        filteredItems = SHOP_ITEMS.filter(i => i.type === 'cosmetic');
    } else {
        filteredItems = SHOP_ITEMS.filter(i => !i.isDefault);
    }

    if (filteredItems.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Nenhum item nesta categoria.</p>';
        return;
    }

    // Se estamos em uma subcategoria de avatares, adicionar prévia
    if (currentAvatarCategory && currentShopTab === 'avatars') {
        const categoryItem = SHOP_ITEMS.find(i => i.id === currentAvatarCategory);
        if (categoryItem) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'shop-avatar-preview';
            previewDiv.style.gridColumn = '1 / -1';
            previewDiv.style.textAlign = 'center';
            previewDiv.style.marginBottom = '20px';
            previewDiv.style.padding = '20px';
            previewDiv.style.background = 'var(--surface2)';
            previewDiv.style.borderRadius = '12px';
            previewDiv.style.border = '1px solid var(--border)';
            
            // Gerar prévia do primeiro avatar da categoria
            const firstVariant = filteredItems[0];
            if (firstVariant) {
                const seed = currentUser ? currentUser.split('@')[0] : 'preview';
                const dicebearStyle = categoryItem.style === 'bottts-boots' ? 'bottts' : categoryItem.style;
                const avatarUrl = `https://api.dicebear.com/7.x/${dicebearStyle}/svg?seed=${encodeURIComponent(seed)}&${firstVariant.variantParams}`;
                previewDiv.innerHTML = `
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">Prévia da Categoria</div>
                    <img src="${avatarUrl}" alt="Prévia" style="width: 120px; height: 120px; border-radius: 8px; border: 2px solid var(--accent);" onerror="this.src='https://api.dicebear.com/7.x/${dicebearStyle}/svg?seed=${encodeURIComponent(seed)}';">
                `;
            }
            container.appendChild(previewDiv);
        }
    }

    filteredItems.forEach(item => {
        const isOwned = userStats.ownedItems && userStats.ownedItems.includes(item.id);
        const activeCosmetics = userStats.activeCosmetics || {};
        
        // MELHORIA v1.1.1: Verificacao rigorosa de ativo - sincronizar com estado real
        let isActive = false;
        if (item.type === 'theme') {
            isActive = userStats.activeTheme === item.id;
        } else if (item.type === 'avatar_variant') {
            isActive = userStats.activeAvatarVariant === item.id;
        } else if (item.type === 'cosmetic') {
            isActive = activeCosmetics[item.category] === item.id;
        } else if (item.type === 'avatar') {
            isActive = userStats.activeAvatar === item.id;
        }

        const card = document.createElement('div');
        card.className = `shop-item-card ${isOwned ? 'owned' : ''}`;
        
        // Badge de categoria para cosméticos e variantes
        let categoryLabel = '';
        if (item.type === 'cosmetic') {
            const icons = { face: '👤', accessory: '🎩', baseColor: '🎨', eyes: '👁️', mouth: '👄', frame: '🖼️' };
            const labels = { face: 'Rosto', accessory: 'Acessório', baseColor: 'Pintura', eyes: 'Olhos', mouth: 'Boca', frame: 'Moldura' };
            categoryLabel = `<div class="shop-item-category">${icons[item.category] || '✨'} ${labels[item.category] || 'Item'}</div>`;
        } else if (item.type === "avatar_variant") {
            const categoryMap = { "toon-head": "Toon Head", "croodles": "Croodles", "big-ears": "Big Ears", "bottts": "Boots" };
            const categoryName = categoryMap[item.category] || "Avatar";
            categoryLabel = `<div class="shop-item-category">🎭 ${categoryName}</div>`;
        }
        
        // Para avatares, usar a imagem como ícone
        let iconContent = '';
        if (item.type === 'avatar_variant' && item.avatarUrl) {
            iconContent = `<img src="${item.avatarUrl}" alt="${item.name}" style="width: 100%; height: 100%; border-radius: 8px; object-fit: cover;">`;
        } else {
            iconContent = item.icon || '🎭';
        }
        
        // FASE 2: Calcular preço dinâmico para avatares
        let displayPrice = item.price;
        let priceIndicator = '';
        if (item.type === 'avatar_variant' && !isOwned) {
            displayPrice = getAvatarPrice(item.id);
            const purchasedCount = (userStats.avatarCategoryPurchases?.[item.category] || 0) + 1;
            priceIndicator = `<div class="shop-item-price-indicator" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${purchasedCount}º de 5</div>`;
        }
        
        card.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-icon">${iconContent}</div>

            </div>
            ${categoryLabel}
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-footer">
                ${isOwned ? `
                    <button class="shop-item-btn ${isActive ? 'btn-active' : 'btn-apply'}" 
                            onclick="handleShopAction('${item.id}')">
                        ${isActive ? '✓ ATIVO' : 'USAR'}
                    </button>
                ` : `
                    <div class="shop-item-price">💰 ${displayPrice}</div>
                    ${priceIndicator}
                    <button class="shop-item-btn btn-buy" onclick="handleShopAction('${item.id}')">
                        COMPRAR
                    </button>
                `}
            </div>
        `;
        container.appendChild(card);
    });
}

async function handleShopAction(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (!userStats.ownedItems) userStats.ownedItems = [];

    if (userStats.ownedItems.includes(itemId)) {
        const activeCosmetics = userStats.activeCosmetics || {};
        const isActive = userStats.activeTheme === itemId
            || userStats.activeAvatar === itemId
            || (item.type === 'cosmetic' && activeCosmetics[item.category] === itemId);

        if (isActive) {
            // Se já estiver ativo, vamos desequipar (exceto tema padrão)
            if (item.type === 'theme' && itemId !== 'theme_default') {
                userStats.activeTheme = 'theme_default';
                applyTheme('theme_default');
            } else if (item.type === "avatar_variant") {
            const categoryMap = { "toon-head": "Toon Head", "croodles": "Croodles", "big-ears": "Big Ears", "bottts": "Boots" };
            const categoryName = categoryMap[item.category] || "Avatar";
            categoryLabel = `<div class="shop-item-category">🎭 ${categoryName}</div>`;
                userStats.activeAvatarVariant = null; // Volta para o robô azul padrão
                // Aplicar o avatar padrão imediatamente
                await applyAvatarCosmetics();
            } else if (item.type === 'cosmetic') {
                delete userStats.activeCosmetics[item.category];
            }
            
            if (currentUserSupabaseId) {
                await updateActiveShopItemToSupabase(currentUserSupabaseId, itemId, false);
            }
            showToast(`❌ ${item.name} desequipado!`, 'info');
        } else {
            // Equipar novo item
            if (item.type === 'theme') {
                // Desativar tema antigo no banco
                if (currentUserSupabaseId && userStats.activeTheme) {
                    await updateActiveShopItemToSupabase(currentUserSupabaseId, userStats.activeTheme, false);
                }
                userStats.activeTheme = itemId;
                applyTheme(itemId);
            } else if (item.type === "avatar_variant") {
            const categoryMap = { "toon-head": "Toon Head", "croodles": "Croodles", "big-ears": "Big Ears", "bottts": "Boots" };
            const categoryName = categoryMap[item.category] || "Avatar";
            categoryLabel = `<div class="shop-item-category">🎭 ${categoryName}</div>`;
                // Desativar variante antiga no banco
                if (currentUserSupabaseId && userStats.activeAvatarVariant) {
                    await updateActiveShopItemToSupabase(currentUserSupabaseId, userStats.activeAvatarVariant, false);
                }
                userStats.activeAvatarVariant = itemId;
                // Aplicar o novo avatar imediatamente
                await applyAvatarCosmetics();
            } else if (item.type === 'cosmetic') {
                // Desativar cosmético antigo da mesma categoria no banco
                if (currentUserSupabaseId && activeCosmetics[item.category]) {
                    await updateActiveShopItemToSupabase(currentUserSupabaseId, activeCosmetics[item.category], false);
                }
                if (!userStats.activeCosmetics) userStats.activeCosmetics = {};
                userStats.activeCosmetics[item.category] = itemId;
            }
            
            if (currentUserSupabaseId) {
                await updateActiveShopItemToSupabase(currentUserSupabaseId, itemId, true);
            }
            showToast(`✅ ${item.name} aplicado!`, 'success');
        }
    } else {
        // FASE 2: Usar preço dinâmico para avatares
        const finalPrice = item.type === 'avatar_variant' ? getAvatarPrice(itemId) : item.price;
        
        if (userStats.coins < finalPrice) {
            showToast('💰 Moedas insuficientes!', 'error');
            return;
        }
        userStats.coins -= finalPrice;
        userStats.ownedItems.push(itemId);
        
        // FASE 2: Incrementar contador de categoria
        if (item.type === 'avatar_variant') {
            if (!userStats.avatarCategoryPurchases) {
                userStats.avatarCategoryPurchases = {
                    'toon-head': 0,
                    'croodles': 0,
                    'big-ears': 0,
                    'bottts': 0
                };
            }
            userStats.avatarCategoryPurchases[item.category]++;
        }
        
        if (currentUserSupabaseId) {
            await saveShopItemToSupabase(currentUserSupabaseId, itemId, false);
        }
        
        showToast(`🎉 Você comprou ${item.name}!`, 'success');
    }

    await saveUserStats();
    updateSidebar();
    renderShop();
}

function applyTheme(themeId) {
    const root = document.documentElement;
    
    // Resetar variáveis base que podem ter sido alteradas por outros temas
    root.style.setProperty('--bg', '#0d0d0f');
    root.style.setProperty('--surface', '#18181b');
    root.style.setProperty('--surface2', '#222226');
    root.style.setProperty('--border', '#2e2e33');
    root.style.setProperty('--accent', '#6366f1');
    root.style.setProperty('--accent-hover', '#818cf8');
    root.style.setProperty('--accent-glow', 'rgba(99,102,241,0.3)');
    root.style.setProperty('--text', '#ffffff'); // Reset de texto para branco padrão

    if (themeId === 'theme_neon') {
        root.style.setProperty('--accent', '#00f2ff');
        root.style.setProperty('--accent-hover', '#67e8f9');
        root.style.setProperty('--accent-glow', 'rgba(0,242,255,0.3)');
        root.style.setProperty('--surface', '#0a0a12');
        root.style.setProperty('--bg', '#050508');
    } else if (themeId === 'theme_sunset') {
        root.style.setProperty('--accent', '#f97316'); // Laranja Sunset
        root.style.setProperty('--accent-hover', '#fb923c');
        root.style.setProperty('--accent-glow', 'rgba(249,115,22,0.3)');
        root.style.setProperty('--surface', '#1a0f0a');
        root.style.setProperty('--bg', '#0f0906');
    } else if (themeId === 'theme_emerald') {
        root.style.setProperty('--accent', '#10b981'); // Verde Esmeralda
        root.style.setProperty('--accent-hover', '#34d399');
        root.style.setProperty('--accent-glow', 'rgba(16,185,129,0.3)');
        root.style.setProperty('--surface', '#061a14');
        root.style.setProperty('--bg', '#030d0a');
    } else if (themeId === 'theme_cyberpunk') {
        root.style.setProperty('--accent', '#facc15'); // Amarelo Cyberpunk
        root.style.setProperty('--accent-hover', '#fde047');
        root.style.setProperty('--accent-glow', 'rgba(250,204,21,0.3)');
        root.style.setProperty('--surface', '#0f172a');
        root.style.setProperty('--bg', '#020617');
        root.style.setProperty('--text', '#facc15'); // Texto também em amarelo para contraste extremo
    }
}

// Aplica cosméticos de avatar no perfil (Melhoria 6)
async function applyAvatarCosmetics() {
    const avatarEl = document.getElementById('profile-avatar-big');
    if (!avatarEl) return;
    const username = isGuest ? "Visitante" : (await getUserUsername() || (currentUser ? currentUser.split('@')[0] : 'Jogador'));
    avatarEl.innerHTML = getAvatarDisplay(username);
}

// Retorna o display do avatar com DiceBear e Molduras para uso geral
// overrideCosmetics: objeto opcional { activeAvatarVariant, frame } para renderizar avatar de outro usuário (FIX #4)
function getAvatarDisplay(username, overrideCosmetics = null) {
    // Se overrideCosmetics for fornecido, usar esses dados em vez de userStats
    const cosmetics = overrideCosmetics || userStats.activeCosmetics || {};
    const frameItem = cosmetics.frame ? SHOP_ITEMS.find(i => i.id === cosmetics.frame) : null;
    
    let style = 'bottts';
    let variantParams = '';
    let seed = username || currentUserSupabaseId || 'termo';

    if (isGuest && !overrideCosmetics) {
        // Avatar Visitante: Bottts Neutral Customizado
        const frameClass = frameItem ? frameItem.frameClass : '';
        return `
            <div class="profile-avatar-wrapper">
                <div class="avatar-composite">
                    <img src="https://api.dicebear.com/10.x/bottts-neutral/svg?seed=ph96ns0y" 
                         class="dicebear-img" 
                         alt="Avatar Visitante">
                </div>
                ${frameClass ? `<div class="profile-frame ${frameClass}"></div>` : ''}
            </div>
        `;
    } else {
        // FIX #4 (v2): usar ?? em vez de || para que null explicito nao caia para o avatar do jogador
        // Se overrideCosmetics !== null, usa o avatar do amigo (pode ser null = sem avatar especial)
        // Se overrideCosmetics === null, usa o avatar do proprio jogador
        const activeVariantId = overrideCosmetics !== null
            ? overrideCosmetics.activeAvatarVariant   // null = amigo sem avatar especial (nao faz fallback)
            : userStats.activeAvatarVariant;           // undefined = usa o do jogador logado
        const variantItem = activeVariantId ? SHOP_ITEMS.find(i => i.id === activeVariantId) : null;
        
        if (variantItem) {
            // Se a variante tem uma URL pré-definida, usar diretamente
            if (variantItem.avatarUrl) {
                const frameClass = frameItem ? frameItem.frameClass : '';
                return `
                    <div class="profile-avatar-wrapper">
                        <div class="avatar-composite">
                            <img src="${variantItem.avatarUrl}" 
                                 class="dicebear-img" 
                                 alt="Avatar">
                        </div>
                        ${frameClass ? `<div class="profile-frame ${frameClass}"></div>` : ''}
                    </div>
                `;
            }
            style = variantItem.style;
            variantParams = variantItem.variantParams ? `&${variantItem.variantParams}` : '';
        } else {
            // Avatar Padrão (Novo Usuário): Bottts Neutral Customizado
            const frameClass = frameItem ? frameItem.frameClass : '';
            return `
                <div class="profile-avatar-wrapper">
                    <div class="avatar-composite">
                        <img src="https://api.dicebear.com/10.x/bottts-neutral/svg?seed=tdunppc5" 
                             class="dicebear-img" 
                             alt="Avatar Padrão">
                    </div>
                    ${frameClass ? `<div class="profile-frame ${frameClass}"></div>` : ''}
                </div>
            `;
        }
    }
    
    // URL do DiceBear (SVG dinâmico)
    // Converter bottts-boots para bottts se necessário (fallback)
    let dicebearStyle = style === 'bottts-boots' ? 'bottts' : style;
    const avatarUrl = `https://api.dicebear.com/7.x/${dicebearStyle}/svg?seed=${encodeURIComponent(seed)}${variantParams}`;
    
    // Classe da Moldura
    const frameClass = frameItem ? frameItem.frameClass : '';

    return `
        <div class="profile-avatar-wrapper">
            <div class="avatar-composite">
                <img src="${avatarUrl}" 
                     class="dicebear-img" 
                     alt="Avatar" 
                     onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}';">
            </div>
            ${frameClass ? `<div class="profile-frame ${frameClass}"></div>` : ''}
        </div>
    `;
}

// ============================================================
//  PERFIL DO JOGADOR
// ============================================================
let currentProfileMode = '5_LETTERS';

async function renderProfile() {
    const info = getLevelInfo(userStats.xp || 0);
    const myUsername = await getUserUsername() || (currentUser ? currentUser.split('@')[0] : 'Jogador');

    // Cartão de identidade
    const avatarEl = document.getElementById('profile-avatar-big');
    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const levelEl = document.getElementById('profile-level-badge');
    const xpLabelEl = document.getElementById('profile-xp-label');
    const xpNextEl = document.getElementById('profile-xp-next');
    const xpFillEl = document.getElementById('profile-xp-fill');
    const coinsEl = document.getElementById('profile-coins');

    if (avatarEl) {
        // Usa cosméticos combinados se existirem (Melhoria 6)
        avatarEl.innerHTML = getAvatarDisplay(myUsername);
    }
    if (usernameEl) usernameEl.textContent = myUsername;
    if (emailEl) emailEl.textContent = currentUser || '';
    if (levelEl) levelEl.textContent = `Nível ${info.level}`;
    if (xpLabelEl) xpLabelEl.textContent = `${userStats.xp || 0} XP`;
    if (xpNextEl) xpNextEl.textContent = `/ ${info.nextLevelXP} XP`;
    if (xpFillEl) {
        const pct = Math.min(100, (info.progressXP / info.neededXP) * 100);
        xpFillEl.style.width = `${pct}%`;
    }
    if (coinsEl) coinsEl.textContent = (userStats.coins || 0).toLocaleString('pt-BR');

    // Estatísticas do modo atual
    renderProfileStats(currentProfileMode);

    // Inventário
    renderInventory();
}

function switchProfileMode(mode, btn) {
    currentProfileMode = mode;
    document.querySelectorAll('.profile-mode-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderProfileStats(mode);
}

function renderProfileStats(mode) {
    const grid = document.getElementById('profile-stats-grid');
    if (!grid) return;

    const modeStats = userStats[mode] || { wins: 0, losses: 0 };
    const totalGames = (modeStats.wins || 0) + (modeStats.losses || 0);
    const winRate = totalGames > 0 ? Math.round((modeStats.wins / totalGames) * 100) : 0;

    const extraStats = [];
    
    // Adicionar stats extras por modo
    if (mode === 'SURVIVAL') {
        extraStats.push({ label: 'Melhor Rodada', value: userStats.bestSurvivalRound || 0, icon: '🛡️' });
        extraStats.push({ label: 'Melhor Score', value: userStats.bestSurvivalScore || 0, icon: '⭐' });
    }
    if (mode === 'AVALANCHE') {
        extraStats.push({ label: 'Melhor Fase', value: userStats.bestAvalanchePhase || 0, icon: '🏔️' });
        extraStats.push({ label: 'Melhor Score', value: userStats.bestAvalancheScore || 0, icon: '⭐' });
    }

    // Nova ordem: Vitórias -> Vitórias Perfeitas -> Derrotas -> Partidas -> Taxa -> Sequência -> Sequência Máxima
    const allStats = [
        { label: 'Vitórias', value: modeStats.wins || 0, icon: '🏆' },
        { label: 'Vitórias Perfeitas', value: (mode === '5_LETTERS' ? userStats.perfectGames5L : mode === '7_LETTERS' ? userStats.perfectGames7L : 0) || 0, icon: '💫' },
        { label: 'Derrotas', value: modeStats.losses || 0, icon: '💨' },
        { label: 'Partidas', value: totalGames, icon: '🎮' },
        { label: 'Taxa de Vitória', value: `${winRate}%`, icon: '📊' },
        { label: 'Sequência', value: userStats.winStreak || 0, icon: '🔥' },
        { label: 'Sequência Máxima', value: userStats.maxWinStreak || 0, icon: '🔥🔥' },
        ...extraStats
    ];

    grid.innerHTML = allStats.map(s => `
        <div class="profile-stat-card">
            <div class="profile-stat-icon">${s.icon}</div>
            <div class="profile-stat-value">${s.value}</div>
            <div class="profile-stat-label">${s.label}</div>
        </div>
    `).join('');
}

function renderInventory() {
    const themesGrid   = document.getElementById('inventory-themes');
    const avatarsGrid  = document.getElementById('inventory-avatars');
    const cosmeticsGrid = document.getElementById('inventory-cosmetics');
    const emptyMsg     = document.getElementById('inventory-empty');
    if (!themesGrid || !avatarsGrid || !cosmeticsGrid) return;

    const ownedItems = userStats.ownedItems || [];
    const activeCosmetics = userStats.activeCosmetics || {};

    const themes  = SHOP_ITEMS.filter(i => i.type === 'theme' && (ownedItems.includes(i.id) || i.isDefault));
    const avatarVariants = SHOP_ITEMS.filter(i => i.type === 'avatar_variant' && ownedItems.includes(i.id));
    const cosmetics = SHOP_ITEMS.filter(i => i.type === 'cosmetic' && ownedItems.includes(i.id));

    const hasItems = themes.length > 0 || avatarVariants.length > 0 || cosmetics.length > 0;
    if (emptyMsg) emptyMsg.style.display = hasItems ? 'none' : 'flex';

    // Renderizar temas
    themesGrid.innerHTML = themes.map(item => {
        const isActive = userStats.activeTheme === item.id;
        return `
            <div class="inventory-item${isActive ? ' inventory-item-active' : ''}">
                <div class="inventory-item-icon">${item.icon}</div>
                <div class="inventory-item-name">${item.name}</div>
                ${isActive
                    ? `<button class="inv-btn inv-btn-unequip" onclick="unequipItem('theme')">Desequipar</button>`
                    : `<button class="inv-btn inv-btn-equip" onclick="equipInventoryItem('${item.id}')">Equipar</button>`
                }
            </div>`;
    }).join('');
    if (themes.length === 0) themesGrid.innerHTML = '<p class="inv-none">Nenhum tema adquirido.</p>';

    // Renderizar avatares (Agrupados por categoria no Inventário)
    if (avatarVariants.length > 0) {
        const categoryMap = { 
            "toon-head": "Toon Head", 
            "croodles": "Croodles", 
            "big-ears": "Big Ears", 
            "bottts": "Boots" 
        };
        
        const groupedAvatars = {};
        avatarVariants.forEach(av => {
            const catName = categoryMap[av.category] || 'Outros';
            if (!groupedAvatars[catName]) groupedAvatars[catName] = [];
            groupedAvatars[catName].push(av);
        });

        avatarsGrid.innerHTML = Object.keys(groupedAvatars).map(catName => `
            <div class="inventory-category-group">
                <div class="inv-category-title">🎭 ${catName}</div>
                <div class="inv-category-items">
                    ${groupedAvatars[catName].map(item => {
                        const isActive = userStats.activeAvatarVariant === item.id;
                        const avatarHtml = item.avatarUrl 
                            ? `<img src="${item.avatarUrl}" alt="${item.name}" class="inventory-avatar-img">`
                            : `<div class="inventory-item-icon">🎭</div>`;
                        
                        return `
                            <div class="inventory-item${isActive ? ' inventory-item-active' : ''}">
                                <div class="inventory-item-preview">${avatarHtml}</div>
                                <div class="inventory-item-name">${item.name}</div>
                                ${isActive
                                    ? `<button class="inv-btn inv-btn-unequip" onclick="unequipItem('avatar_variant')">Desequipar</button>`
                                    : `<button class="inv-btn inv-btn-equip" onclick="equipInventoryItem('${item.id}')">Equipar</button>`
                                }
                            </div>`;
                    }).join('')}
                </div>
            </div>
        `).join('');
    } else {
        avatarsGrid.innerHTML = '<p class="inv-none">Nenhum avatar adquirido.</p>';
    }

    // Renderizar cosméticos
    cosmeticsGrid.innerHTML = cosmetics.map(item => {
        const isActive = activeCosmetics[item.category] === item.id;
        return `
            <div class="inventory-item${isActive ? ' inventory-item-active' : ''}">
                <div class="inventory-item-icon">${item.icon}</div>
                <div class="inventory-item-name">${item.name}</div>
                <div class="inventory-item-cat">${item.category.toUpperCase()}</div>
                ${isActive
                    ? `<button class="inv-btn inv-btn-unequip" onclick="unequipCosmetic('${item.category}')">Desequipar</button>`
                    : `<button class="inv-btn inv-btn-equip" onclick="equipInventoryItem('${item.id}')">Equipar</button>`
                }
            </div>`;
    }).join('');
    if (cosmetics.length === 0) cosmeticsGrid.innerHTML = '<p class="inv-none">Nenhum cosmético adquirido.</p>';
}

async function equipInventoryItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'theme') {
        // Desativar tema antigo no banco
        if (currentUserSupabaseId && userStats.activeTheme) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, userStats.activeTheme, false);
        }
        userStats.activeTheme = itemId;
        applyTheme(itemId);
    } else if (item.type === "avatar_variant") {
        // Desativar variante antiga no banco
        if (currentUserSupabaseId && userStats.activeAvatarVariant) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, userStats.activeAvatarVariant, false);
        }
        userStats.activeAvatarVariant = itemId;
    } else if (item.type === 'cosmetic') {
        // Desativar cosmético antigo da mesma categoria no banco
        if (currentUserSupabaseId && userStats.activeCosmetics && userStats.activeCosmetics[item.category]) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, userStats.activeCosmetics[item.category], false);
        }
        if (!userStats.activeCosmetics) userStats.activeCosmetics = {};
        userStats.activeCosmetics[item.category] = itemId;
    }

    if (currentUserSupabaseId) {
        await updateActiveShopItemToSupabase(currentUserSupabaseId, itemId, true);
    }

    await saveUserStats();
    updateSidebar();
    renderInventory();
    renderShop();
    
    // Atualizar perfil se estiver aberto
    const profileScreen = document.getElementById('screen-profile');
    if (profileScreen && profileScreen.classList.contains('active')) {
        renderProfile();
    }
    
    showToast(`✅ ${item.name} equipado!`, 'success');
}

async function unequipCosmetic(category) {
    if (userStats.activeCosmetics && userStats.activeCosmetics[category]) {
        const prevId = userStats.activeCosmetics[category];
        delete userStats.activeCosmetics[category];
        
        if (currentUserSupabaseId) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, prevId, false);
        }
        
        await saveUserStats();
        updateSidebar();
        renderInventory();
        renderShop();
        
        // Atualizar perfil se estiver aberto
        const profileScreen = document.getElementById('screen-profile');
        if (profileScreen && profileScreen.classList.contains('active')) {
            renderProfile();
        }
        
        showToast('Cosmético removido.', 'info');
    }
}

async function unequipItem(type) {
    if (type === 'theme') {
        const prev = userStats.activeTheme;
        userStats.activeTheme = 'theme_default';
        applyTheme('theme_default');
        if (currentUserSupabaseId && prev) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, prev, false);
        }
        showToast('Tema padrão restaurado.', 'info');
    } else if (type === 'avatar_variant') {
        const prev = userStats.activeAvatarVariant;
        userStats.activeAvatarVariant = null;
        if (currentUserSupabaseId && prev) {
            await updateActiveShopItemToSupabase(currentUserSupabaseId, prev, false);
        }
        showToast('Avatar padrão restaurado.', 'info');
    }

    await saveUserStats();
    updateSidebar();
    renderInventory();
    renderShop();
    applyAvatarCosmetics();
    
    // Atualizar perfil se estiver aberto
    const profileScreen = document.getElementById('screen-profile');
    if (profileScreen && profileScreen.classList.contains('active')) {
        renderProfile();
    }
}

// ============================================================
//  UTILITÁRIOS
// ============================================================
function normalizeWord(word) {
    if (!word) return '';
    return word.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isValidWord(word) {
    const normalized = normalizeWord(word);
    const custom = JSON.parse(localStorage.getItem('termo_user_words') || '[]');
    if (custom.includes(normalized)) return true;
    
    if (typeof BANCO_DE_PALAVRAS === 'object') {
        const allWords = [];
        for (const lenKey in BANCO_DE_PALAVRAS) {
            const categories = BANCO_DE_PALAVRAS[lenKey];
            if (typeof categories === 'object') {
                for (const diff in categories) {
                    if (Array.isArray(categories[diff])) {
                        allWords.push(...categories[diff]);
                    }
                }
            }
        }
        if (allWords.some(w => normalizeWord(w) === normalized)) return true;
    }
    return true; 
}

function showToast(msg, type = 'info') {
    const existing = document.querySelectorAll('.toast-container');
    existing.forEach(e => e.remove());

    const container = document.createElement('div');
    container.className = `toast-container ${type}`;
    const icon = type === 'success' ? '🎉' : (type === 'error' ? '⚠️' : 'ℹ️');
    container.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-message">${msg}</div><div class="toast-progress"></div>`;
    document.body.appendChild(container);
    setTimeout(() => {
        container.classList.add('fade-out');
        setTimeout(() => container.remove(), 500);
    }, 3000);
}

function shakeBoards() {
    const boards = document.querySelectorAll('.grid-container');
    boards.forEach(b => {
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 500);
    });
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'correct') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'victory') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'lose') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
    } catch(e) {}
}

function resetDatabase() {
    if (!confirm('Tem certeza? Isso vai deletar TODOS os dados LOCAIS! Se você estiver logado, seus dados no servidor não serão afetados.')) return;
    
    // Em vez de clear(), removemos apenas as chaves do jogo
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('termo_') || key === 'users' || key === 'STORY_MODE_DATA') {
            localStorage.removeItem(key);
        }
    });

    const allUsers = { 'admin': { pin: '0000' } };
    localStorage.setItem('users', JSON.stringify(allUsers));
    const adminStats = createEmptyStats(true);
    localStorage.setItem('termo_user_admin', JSON.stringify(adminStats));
    
    showToast('✅ Dados locais resetados!', 'success');
    setTimeout(() => location.reload(), 1000);
}


// ============================================================
//  INTEGRAÇÃO COM MODO HISTÓRIA
// ============================================================
function startStoryMode() {
    if (gameInProgress) return;
    closeMobileSidebar();

    if (isGuest) {
        showGuestIncentiveModal();
        return;
    }
    
    // Inicializar o Modo História com callbacks
    const callbacks = {
        startStoryGame: startStoryGame,
        addRewards: addStoryRewards,
        getCurrentWords: () => currentGame ? currentGame.words : []
    };
    
    initStoryMode(callbacks);
    
    // Mostrar tab
    showMainTab('story-mode');
}

function showGuestIncentiveModal() {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;

    body.innerHTML = `
        <div class="modal-premium-content">
            <div class="modal-emoji">🔒</div>
            <h2 class="modal-title-premium">MODO JORNADA BLOQUEADO</h2>
            <p class="modal-mode-msg">O Modo Jornada é exclusivo para jogadores registrados.</p>
            <div class="modal-rewards-box">
                <p style="margin-bottom: 15px; color: rgba(255,255,255,0.8);">Ao criar uma conta agora, você:</p>
                <div class="reward-item">
                    <span class="reward-label">💰 Bônus Inicial</span>
                    <span class="reward-value" style="color: #fbbf24;">+500 Moedas</span>
                </div>
                <div class="reward-item">
                    <span class="reward-label">✨ Progresso</span>
                    <span class="reward-value" style="color: var(--correct);">Mantém seu XP atual</span>
                </div>
                <div class="reward-item">
                    <span class="reward-label">📖 Campanha</span>
                    <span class="reward-value" style="color: #a855f7;">Acesso a 40 Fases</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px; width: 100%;">
                <button onclick="closeModal(); showScreen('login'); if(authMode==='login') toggleAuthMode();" class="btn-primary" style="flex: 1;">CRIAR CONTA</button>
                <button onclick="closeModal()" class="btn-ghost" style="flex: 1;">DEPOIS</button>
            </div>
        </div>
    `;
    overlay.classList.remove('hidden');
}

function startStoryGame(phaseConfig) {
    // REMOVIDO: disableDifficultyButtons(); -> Permitir que o jogador mude ou veja a dificuldade
    
    // Preparar configuração do jogo
    const gameConfig = {
        mode: 'STORY_MODE_PHASE',
        wordLength: phaseConfig.wordLength,
        difficulty: globalDifficulty, // USAR globalDifficulty em vez da predefinida na fase
        numBoards: phaseConfig.numBoards,
        maxAttempts: phaseConfig.maxAttempts,
        anomalies: phaseConfig.anomalies,
        timeLimit: phaseConfig.timeLimit,
        forbiddenLetters: phaseConfig.forbiddenLetters,
        isBoss: phaseConfig.isBoss,
        phaseId: phaseConfig.phaseId,
        phaseName: phaseConfig.phaseName,
        onPhaseComplete: phaseConfig.onPhaseComplete
    };
    
    // Sincronizar dificuldade global com a da fase para o sorteio de palavras
    if (gameConfig.difficulty) {
        globalDifficulty = gameConfig.difficulty;
        updateDifficultyUI();
    }

    // Inicializar jogo com configuração do Modo História
    currentGame = {
        mode: gameConfig.mode,
        modeName: gameConfig.phaseName,
        wordLength: gameConfig.wordLength,
        maxAttempts: gameConfig.maxAttempts,
        currentRow: 0,
        currentInputArr: new Array(gameConfig.wordLength).fill(''),
        selectedFieldIndex: 0,
        words: [],
        attempts: [],
        score: 0,
        stage: 0,
        round: 1,
        phase: 1,
        lives: 3,
        usedHints: [],
        isAnimating: false,
        hintsUsedThisRound: 0,
        survivalLivesBought: 0,
        isPerfectGame: true,
        stageScores: [],
        usedWordsMemory: new Set(),
        // Campos específicos do Modo História
        storyConfig: gameConfig,
        timeRemaining: gameConfig.timeLimit,
        blockedCells: [],
        forbiddenLetters: gameConfig.forbiddenLetters || []
    };
    
    // Aplicar anomalias (Usando a função renomeada para evitar recursão)
    if (gameConfig.anomalies && gameConfig.anomalies.length > 0) {
        gameConfig.anomalies.forEach(anomaly => {
            if (typeof applyStoryAnomaly === 'function') {
                const anomalyConfig = applyStoryAnomaly(anomaly, gameConfig);
                if (anomalyConfig) {
                    currentGame.activeAnomalies = currentGame.activeAnomalies || {};
                    currentGame.activeAnomalies[anomaly] = anomalyConfig;
                    
                    // Tratamento específico para anomalias que mudam o estado inicial
                    if (anomaly === 'BLOCKED_CELLS' && anomalyConfig.cells) {
                        currentGame.blockedCells = anomalyConfig.cells;
                    }
                }
            }
        });
    }
    
    // Gerar palavras
    for (let i = 0; i < gameConfig.numBoards; i++) {
        currentGame.words.push(getRandomWordByDifficulty(gameConfig.wordLength));
        currentGame.attempts.push(new Array(gameConfig.maxAttempts).fill(null));
    }
    
    gameInProgress = true;
    showMainTab('game');
    renderGame();
    
    // Iniciar cronômetro se houver limite de tempo
    if (gameConfig.timeLimit) {
        startStoryTimer(gameConfig.timeLimit);
    }
}

function startStoryTimer(timeLimit) {
    currentGame.timeRemaining = timeLimit;
    const startTime = Date.now();
    const duration = timeLimit * 1000;

    // Limpar qualquer intervalo anterior por segurança
    if (currentGame.timerInterval) clearInterval(currentGame.timerInterval);

    currentGame.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        
        // Só atualiza se o valor mudar para evitar oscilação visual
        if (remaining !== currentGame.timeRemaining) {
            currentGame.timeRemaining = remaining;
            
            // Atualizar display do tempo
            const statusBar = document.getElementById('game-status-bar');
            if (statusBar) {
                const timeDisplay = statusBar.querySelector('[data-time]');
                if (timeDisplay) {
                    timeDisplay.textContent = currentGame.timeRemaining;
                }
            }
        }
        
        if (currentGame.timeRemaining <= 0) {
            clearInterval(currentGame.timerInterval);
            currentGame.timerInterval = null; // Garantir que está limpo
            handleStoryTimeUp();
        }
    }, 100); // Checagem mais frequente para maior precisão, mas decremento visual de 1s
}

function handleStoryTimeUp() {
    if (!gameInProgress) return; // Evita múltiplas chamadas
    gameInProgress = false;
    
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    const coinsEarned = 0;
    const xpEarned = 0;
    
    // Notificar falha ANTES do toast para abrir o modal de recompensa
    if (currentGame.storyConfig && currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(false, 0, coinsEarned, xpEarned);
    }
    
    showToast('⏰ Tempo esgotado! Fase falhada.', 'error');
}

function addStoryRewards(rewards) {
    userStats.coins += rewards.coins || 0;
    userStats.xp += rewards.xp || 0;
    
    if (rewards.item && !userStats.ownedItems.includes(rewards.item)) {
        userStats.ownedItems.push(rewards.item);
    }
    
    if (rewards.skin && !userStats.ownedItems.includes(rewards.skin)) {
        userStats.ownedItems.push(rewards.skin);
    }
    
    saveUserStats();
    updateSidebar();
}

// Função auxiliar para aplicar anomalias (chama a função do story_mode.js)
function applyAnomaly(anomalyType, config) {
    if (typeof window.applyStoryAnomaly === 'function') {
        return window.applyStoryAnomaly(anomalyType, config);
    }
    return null;
}

// Modificar submitAttempt para suportar anomalias do Modo História
const originalSubmitAttempt = submitAttempt;
submitAttempt = function() {
    if (!gameInProgress || !currentGame) return;

    const input = currentGame.currentInputArr.join('').trim();
    if (input.length !== currentGame.wordLength) {
        showToast('Preencha todas as letras', 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    // Verificar letras proibidas (anomalia do Modo História)
    if (currentGame.forbiddenLetters && currentGame.forbiddenLetters.length > 0) {
        const inputNormalized = normalizeWord(input);
        const forbiddenNormalized = currentGame.forbiddenLetters.map(l => normalizeWord(l));
        
        for (let letter of inputNormalized) {
            if (forbiddenNormalized.includes(letter)) {
                showToast(`❌ Letra "${letter}" está bloqueada pelo Firewall!`, 'error');
                playSound('error');
                return;
            }
        }
    }

    const word = input.toUpperCase();
    if (!isValidWord(word)) {
        if (!confirm(`"${word}" não está no dicionário. Deseja usar assim mesmo?`)) return;
    }

    currentGame.words.forEach((secret, idx) => {
        if (!isBoardWon(idx)) {
            currentGame.attempts[idx][currentGame.currentRow] = word.split('');
        }
    });

    currentGame.currentRow++;
    currentGame.isAnimating = true;
    renderGame();

    // RESTAURAÇÃO: Sincronização Online (v1.0.9)
    if (currentGame.mode === 'ONLINE_1V1' && typeof OnlineManager !== 'undefined') {
        const lastRow = currentGame.currentRow - 1;
        const lastAttempt = currentGame.attempts[0][lastRow];
        const secret = currentGame.words[0];
        const result = lastAttempt.map((letter, i) => getLetterState(letter, i, secret, lastAttempt));
        OnlineManager.sendProgress(lastAttempt.join(''), result);
    }

    setTimeout(() => {
        currentGame.isAnimating = false;
        checkGameStatus();
    }, 1000);
};

// Modificar renderGame para mostrar informações do Modo História
const originalRenderGame = renderGame;
renderGame = function() {
    updateGameTopbar();
    renderBoards();
    renderKeyboard();
    
    // Adicionar informações do Modo História ou Online se ativo
    if (currentGame) {
        const statusBar = document.getElementById('game-status-bar');
        if (!statusBar) return;

        if (currentGame.storyConfig && currentGame.storyConfig.timeLimit) {
            const timeChip = document.createElement('div');
            timeChip.className = 'status-chip';
            timeChip.innerHTML = `⏱️ <span data-time>${currentGame.timeRemaining || currentGame.storyConfig.timeLimit}</span>s`;
            statusBar.appendChild(timeChip);
        } else if (currentGame.mode === 'ONLINE_1V1') {
            const timeChip = document.createElement('div');
            timeChip.className = 'status-chip';
            const mins = Math.floor((currentGame.timeRemaining || 180) / 60);
            const secs = (currentGame.timeRemaining || 180) % 60;
            timeChip.innerHTML = `⏱️ <span data-time>${mins}:${secs.toString().padStart(2, '0')}</span>`;
            statusBar.appendChild(timeChip);
        }
    }
};

// Modificar checkGameStatus para suportar Modo História
const originalCheckGameStatus = checkGameStatus;
checkGameStatus = function() {
    const allWon = currentGame.words.every((_, idx) => isBoardWon(idx));
    const outOfAttempts = currentGame.currentRow >= currentGame.maxAttempts;

        if (allWon) {
        if (currentGame.mode === 'ONLINE_1V1') {
            OnlineManager.finishMatch(true);
            // Não chama handleStageWon aqui para evitar conflito com o modal de resultado online
        } else if (currentGame.storyConfig) {
            handleStoryPhaseWon();
        } else {
            handleStageWon();
        }
    } else if (outOfAttempts) {
        if (currentGame.mode === 'ONLINE_1V1') {
            OnlineManager.finishMatch(false);
            // Não chama handleStageLost aqui para evitar conflito com o modal de resultado online
        } else if (currentGame.storyConfig) {
            handleStoryPhaseLost();
        } else {
            handleStageLost();
        }
    } else {
        currentGame.currentInputArr = new Array(currentGame.wordLength).fill('');
        currentGame.selectedFieldIndex = 0;
        renderGame();
    }
};

function handleStoryPhaseWon() {
    playSound('victory');
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    const mult = getDifficultyMultiplier();
    const attemptUsed = currentGame.currentRow - 1;
    const baseScore = Math.max(0, (currentGame.maxAttempts - attemptUsed) * 50);
    const boardBonus = currentGame.words.length * 100;
    const stageScore = Math.round((baseScore + boardBonus) * mult);
    
    currentGame.score += stageScore;
    
    // Calcular estrelas
    let starsEarned = 1;
    if (attemptUsed <= 2) starsEarned = 3;
    else if (attemptUsed <= 4) starsEarned = 2;
    
    const coinsEarned = currentGame.storyConfig.rewardCoins || 50;
    const xpEarned = currentGame.storyConfig.rewardXP || 10;
    
    userStats.coins += coinsEarned;
    userStats.xp += xpEarned;
    saveUserStats();
    
    gameInProgress = false;
    
    if (currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(true, starsEarned, coinsEarned, xpEarned);
    }
}

function handleStoryPhaseLost() {
    if (!gameInProgress) return;
    gameInProgress = false;

    playSound('lose');
    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }
    
    // Notificar falha ANTES do toast para abrir o modal de recompensa
    if (currentGame.storyConfig && currentGame.storyConfig.onPhaseComplete) {
        currentGame.storyConfig.onPhaseComplete(false, 0, 0, 0);
    }

    showToast('❌ Fase falhada! Tente novamente.', 'error');
}

console.log('✅ Integração com Modo História carregada');

/**
 * SISTEMA DE CONVERSÃO DE VISITANTE (IN-GAME)
 */
function openConversionModal() {
    const modal = document.getElementById('conversion-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Preencher email se já tiver algo no localStorage (opcional)
    }
}

function closeConversionModal() {
    const modal = document.getElementById('conversion-modal');
    if (modal) modal.classList.add('hidden');
}

async function handleInGameConversion(event) {
    event.preventDefault();
    const username = document.getElementById('conv-username').value.trim();
    const email = document.getElementById('conv-email').value.trim();
    const password = document.getElementById('conv-password').value;
    const btn = document.getElementById('conv-submit-btn');
    
    if (!username || !email || !password) return;
    
    btn.disabled = true;
    btn.textContent = "MIGRANDO DADOS...";
    
    const client = getSupabaseClient();
    const oldVisitorId = currentUserSupabaseId;
    const oldStats = { ...userStats }; // Copia os dados atuais do visitante
    
    try {
        // 1. LIMPEZA PRÉVIA: Deletar o visitante ANTES de logar na conta nova
        // Fazemos isso enquanto o token de autenticação ainda pertence ao visitante.
        console.log('🧹 Limpando dados de visitante antigo...');
        const { error: deleteError } = await client.from('users').delete().eq('id', oldVisitorId);
        if (deleteError) {
            console.warn('⚠️ Erro ao deletar visitante (pode ser RLS):', deleteError.message);
        } else {
            console.log('✅ Visitante removido com sucesso antes da migração.');
        }

        // 2. Criar uma nova conta real (Sign Up)
        const { data: signUpData, error: signUpError } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { 
                    username: username,
                    is_guest: false 
                }
            }
        });

        if (signUpError) throw signUpError;

        const newUserId = signUpData.user.id;
        
        // 2. Criar o perfil na tabela public.users
        const { error: userError } = await client
            .from('users')
            .insert({
                id: newUserId,
                username: username,
                email: email,
                role: 'user'
            });
            
        if (userError) throw userError;

        // 3. Transferir as estatísticas e dar o bônus de migração
        // IMPORTANTE: O Supabase espera colunas achatadas (snake_case), não o objeto JS aninhado.
        const statsToInsert = {
            user_id: newUserId,
            xp: (oldStats.xp || 0) + 100,
            coins: (oldStats.coins || 0) + 500,
            total_games: oldStats.totalGames || 0,
            win_streak: oldStats.winStreak || 0,
            max_win_streak: oldStats.maxWinStreak || 0,
            five_letters_wins: (oldStats['5_LETTERS'] ? oldStats['5_LETTERS'].wins : 0),
            five_letters_losses: (oldStats['5_LETTERS'] ? oldStats['5_LETTERS'].losses : 0),
            perfect_games_5l: oldStats.perfectGames5L || 0,
            seven_letters_wins: (oldStats['7_LETTERS'] ? oldStats['7_LETTERS'].wins : 0),
            seven_letters_losses: (oldStats['7_LETTERS'] ? oldStats['7_LETTERS'].losses : 0),
            perfect_games_7l: oldStats.perfectGames7L || 0,
            survival_wins: (oldStats['SURVIVAL'] ? oldStats['SURVIVAL'].wins : 0),
            survival_losses: (oldStats['SURVIVAL'] ? oldStats['SURVIVAL'].losses : 0),
            best_survival_round: oldStats.bestSurvivalRound || 0,
            best_survival_score: oldStats.bestSurvivalScore || 0,
            survival_lives_bought: oldStats.survivalLivesBought || 0,
            avalanche_wins: (oldStats['AVALANCHE'] ? oldStats['AVALANCHE'].wins : 0),
            avalanche_losses: (oldStats['AVALANCHE'] ? oldStats['AVALANCHE'].losses : 0),
            best_avalanche_phase: oldStats.bestAvalanchePhase || 0,
            best_avalanche_score: oldStats.bestAvalancheScore || 0,
            updated_at: new Date().toISOString()
        };
        
        const { error: statsError } = await client
            .from('game_stats')
            .upsert(statsToInsert);
            
        if (statsError) throw new Error("Falha ao salvar estatísticas: " + statsError.message);

        // 4. Transferir progresso da jornada (se houver)
        if (oldStats.storyProgress && oldStats.storyProgress.progress) {
            const journeyId = 'jornada_1';
            const progress = oldStats.storyProgress.progress[journeyId];
            if (progress) {
                await client.from('journey_progress').upsert({
                    user_id: newUserId,
                    journey_id: journeyId,
                    current_phase: progress.currentPhase || 1,
                    intro_seen: progress.introSeen || false,
                    stars: progress.stars || {},
                    completed_phases: progress.completedPhases || [],
                    claimed_chests: progress.claimedChests || {},
                    updated_at: new Date().toISOString()
                });
            }
        }

        // 5. LIMPEZA FINAL: Logout da sessão de visitante e Auth antigo
        // O signUp do Supabase pode ou não logar automaticamente.
        // Para garantir, vamos sinalizar que a migração foi um sucesso.
        console.log('✨ Migração técnica concluída.');

        // 6. Atualizar estado local e interface
        currentUserSupabaseId = newUserId;
        currentUser = email;
        
        // Reconstruir o objeto userStats no formato do jogo para o estado local
        userStats = {
            ...oldStats,
            xp: statsToInsert.xp,
            coins: statsToInsert.coins,
            unlockedTrophies: oldStats.unlockedTrophies || [],
            ownedItems: oldStats.ownedItems || []
        };
        
        isGuest = false;
        isAdmin = false;
        
        // Forçar salvamento local para garantir consistência imediata
        localStorage.setItem('termo_user_stats', JSON.stringify(userStats));
        
        updateSidebar();
        closeConversionModal();
        
        showToast(`🚀 Bem-vindo, ${username}! Migração concluída!`, "success");
        
        // Criar notificação de resgate para o bônus de migração
        await createNotification(
            "Recompensa de Migração! ✨",
            `Sua conta foi criada e seus dados foram migrados. Resgate seu bônus de boas-vindas agora!`,
            "success",
            "claim_reward",
            { coins: 500, xp: 100 }
        );
        
        if (typeof renderStoryMap === 'function') renderStoryMap();
        
    } catch (error) {
        console.error("Erro na migração:", error);
        showToast("❌ " + (error.message || "Erro ao migrar conta"), "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "CRIAR MINHA CONTA AGORA";
    }
}

/**
 * LÓGICA SOCIAL (v1.1.0)
 */
let currentSocialTab = 'friends';

async function handleSendFriendRequest() {
    const input = document.getElementById('social-search-input');
    const username = input.value.trim();
    if (!username) return;

    if (isGuest) {
        showToast('Apenas usuários registrados podem adicionar amigos.', 'error');
        return;
    }

    showToast('Enviando solicitação...', 'info');
    const result = await sendFriendRequest(currentUserSupabaseId, username);

    if (result.error) {
        showToast(result.error, 'error');
    } else {
        showToast('Solicitação enviada!', 'success');
        input.value = '';
        renderSocial();
    }
}

async function renderSocial() {
    if (isGuest) {
        document.getElementById('social-empty-msg').innerHTML = `
            <span class="empty-icon">🔒</span>
            <p>Faça login para usar o sistema social e competir com amigos!</p>
        `;
        return;
    }

    let friends = await loadFriends(currentUserSupabaseId);
    
    // Limpeza de duplicatas na interface (v1.1.2)
    // Se houver mais de uma entrada para o mesmo par de amigos, consideramos apenas a primeira
    const seenPairs = new Set();
    friends = friends.filter(f => {
        const pairId = [f.user_id, f.friend_id].sort().join(':');
        if (seenPairs.has(pairId)) return false;
        seenPairs.add(pairId);
        return true;
    });

    const pendingList = friends.filter(f => f.status === 'pending' && f.friend_id === currentUserSupabaseId);
    const acceptedList = friends.filter(f => f.status === 'accepted');

    // Atualizar badge
    const badge = document.getElementById('pending-count');
    if (pendingList.length > 0) {
        badge.textContent = pendingList.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const friendsContainer = document.getElementById('social-list-friends');
    const pendingContainer = document.getElementById('social-list-pending');
    const emptyMsg = document.getElementById('social-empty-msg');

    friendsContainer.innerHTML = '';
    pendingContainer.innerHTML = '';

    if (acceptedList.length === 0 && pendingList.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
    }

    // Renderizar Amigos
    acceptedList.forEach(f => {
        const isSender = f.user_id === currentUserSupabaseId;
        const friendInfo = isSender ? f.receiver : f.sender;
        const friendStats = isSender ? f.receiver_stats : f.sender_stats;
        
        if (!friendInfo) return; // Pular se dados do usuário estiverem corrompidos

        const item = document.createElement('div');
        item.className = 'friend-item';
        item.onclick = () => showFriendComparison(friendInfo.id, friendInfo.username);
        item.innerHTML = `
            <div class="friend-avatar">${getFriendAvatarDisplay(friendInfo.username, friendStats?.active_avatar_variant, friendStats?.active_cosmetics)}</div>
            <div class="friend-info">
                <div class="friend-name">${friendInfo.username}</div>
                <div class="friend-status">Amigo</div>
            </div>
            <div class="friend-actions">
                <button onclick="handleRemoveFriend('${f.id}', event)" class="btn-icon" title="Remover">❌</button>
            </div>
        `;
        friendsContainer.appendChild(item);
    });

    // Renderizar Pendentes
    pendingList.forEach(f => {
        const item = document.createElement('div');
        item.className = 'friend-item';
        item.innerHTML = `
            <div class="friend-avatar">${getFriendAvatarDisplay(f.sender.username, f.sender_stats?.active_avatar_variant, f.sender_stats?.active_cosmetics)}</div>
            <div class="friend-info">
                <div class="friend-name">${f.sender.username}</div>
                <div class="friend-status">Solicitação pendente</div>
            </div>
            <div class="friend-actions">
                <button onclick="handleAcceptFriend('${f.id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.7rem;">Aceitar</button>
                <button onclick="handleRemoveFriend('${f.id}', event)" class="btn-ghost" style="padding: 5px 10px; font-size: 0.7rem;">Recusar</button>
            </div>
        `;
        pendingContainer.appendChild(item);
    });

    switchSocialTab(currentSocialTab);
}

function switchSocialTab(tab, btn) {
    currentSocialTab = tab;
    document.querySelectorAll('.social-menu-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.getElementById('social-list-friends').classList.toggle('hidden', tab !== 'friends');
    document.getElementById('social-list-pending').classList.toggle('hidden', tab !== 'pending');
}

async function handleAcceptFriend(id) {
    const ok = await acceptFriendRequest(id);
    if (ok) {
        showToast('Amizade aceita!', 'success');
        renderSocial();
    }
}

async function handleRemoveFriend(id, event) {
    event.stopPropagation();
    if (!confirm('Tem certeza?')) return;
    const ok = await removeFriend(id);
    if (ok) {
        showToast('Removido.', 'info');
        renderSocial();
    }
}

async function showFriendComparison(friendId, friendUsername) {
    const friendStats = await getFriendStats(friendId);
    if (!friendStats) {
        showToast('Não foi possível carregar os status do amigo.', 'error');
        return;
    }

    const myUsername = await getUserUsername() || "Você";
    const myLevel = getLevelInfo(userStats.xp || 0).level;
    const friendLevel = getLevelInfo(friendStats.xp || 0).level;

    // FIX #4: Buscar dados de cosmético do amigo para renderizar o avatar correto
    const friendCosmetics = {
        activeAvatarVariant: friendStats.active_avatar_variant || null,
        frame: friendStats.active_cosmetics?.frame || null
    };

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card compare-modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>DUELO DE STATUS</h3>
                <button class="btn-close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="compare-grid">
                <div class="compare-user">
                    <div class="friend-avatar" style="width: 70px; height: 70px;">${getAvatarDisplay(myUsername)}</div>
                    <strong>${myUsername}</strong>
                    <span class="badge">Nível ${myLevel}</span>
                </div>
                <div class="compare-vs">VS</div>
                <div class="compare-user">
                    <div class="friend-avatar" style="width: 70px; height: 70px;">${getAvatarDisplay(friendUsername, friendCosmetics)}</div>
                    <strong>${friendUsername}</strong>
                    <span class="badge">Nível ${friendLevel}</span>
                </div>
            </div>

            <table class="compare-stats-table">
                <tr>
                    <td class="${userStats.xp > friendStats.xp ? 'stat-winner' : ''}">${userStats.xp}</td>
                    <td class="stat-label">XP TOTAL</td>
                    <td class="${friendStats.xp > userStats.xp ? 'stat-winner' : ''}">${friendStats.xp}</td>
                </tr>
                <tr>
                    <td class="${userStats['5_LETTERS'].wins > friendStats.five_letters_wins ? 'stat-winner' : ''}">${userStats['5_LETTERS'].wins}</td>
                    <td class="stat-label">VITÓRIAS 5L</td>
                    <td class="${friendStats.five_letters_wins > userStats['5_LETTERS'].wins ? 'stat-winner' : ''}">${friendStats.five_letters_wins}</td>
                </tr>
                <tr>
                    <td class="${userStats['7_LETTERS'].wins > friendStats.seven_letters_wins ? 'stat-winner' : ''}">${userStats['7_LETTERS'].wins}</td>
                    <td class="stat-label">VITÓRIAS 7L</td>
                    <td class="${friendStats.seven_letters_wins > userStats['7_LETTERS'].wins ? 'stat-winner' : ''}">${friendStats.seven_letters_wins}</td>
                </tr>
                <tr>
                    <td class="${userStats.bestSurvivalRound > friendStats.best_survival_round ? 'stat-winner' : ''}">${userStats.bestSurvivalRound}</td>
                    <td class="stat-label">RECORDE SOBREV.</td>
                    <td class="${friendStats.best_survival_round > userStats.bestSurvivalRound ? 'stat-winner' : ''}">${friendStats.best_survival_round}</td>
                </tr>
                <tr>
                    <td class="${userStats.bestAvalanchePhase > friendStats.best_avalanche_phase ? 'stat-winner' : ''}">${userStats.bestAvalanchePhase}</td>
                    <td class="stat-label">RECORDE AVAL.</td>
                    <td class="${friendStats.best_avalanche_phase > userStats.bestAvalanchePhase ? 'stat-winner' : ''}">${friendStats.best_avalanche_phase}</td>
                </tr>
            </table>
            
            <button class="btn-primary btn-full" style="margin-top: 20px;" onclick="this.closest('.modal-overlay').remove()">FECHAR</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * NOTIFICAÇÕES DE AMIZADE (v1.1.0)
 */
let lastPendingCount = 0;

async function checkFriendNotifications() {
    if (isGuest || !currentUserSupabaseId) return;

    const friends = await loadFriends(currentUserSupabaseId);
    const pendingRequests = friends.filter(f => f.status === 'pending' && f.friend_id === currentUserSupabaseId);
    
    // Se o número de solicitações aumentou, criar notificação
    if (pendingRequests.length > lastPendingCount) {
        const newRequest = pendingRequests[pendingRequests.length - 1];
        const senderName = newRequest.sender.username;

        createNotification(
            "Nova Solicitação de Amizade! 👥",
            `${senderName} quer ser seu amigo no TermoCore.`,
            "info",
            "open_social" // action_type atualizado para o novo padrão
        );
    }
    
    lastPendingCount = pendingRequests.length;
    
    // Atualizar interface social se estiver aberta
    const socialTab = document.getElementById('tab-social');
    if (socialTab && socialTab.classList.contains('active')) {
        renderSocial();
    }
}

/**
 * Renderiza o avatar de um amigo baseado em seus dados salvos (v1.1.1)
 */
function getFriendAvatarDisplay(username, activeVariantId, cosmetics) {
    const frameItem = (cosmetics && cosmetics.frame) ? SHOP_ITEMS.find(i => i.id === cosmetics.frame) : null;
    const variantItem = activeVariantId ? SHOP_ITEMS.find(i => i.id === activeVariantId) : null;
    
    // Se o amigo tem uma variante equipada
    if (variantItem && variantItem.avatarUrl) {
        const frameClass = frameItem ? frameItem.frameClass : '';
        return `
            <div class="profile-avatar-wrapper">
                <div class="avatar-composite">
                    <img src="${variantItem.avatarUrl}" 
                         class="dicebear-img" 
                         alt="Avatar">
                </div>
                ${frameClass ? `<div class="profile-frame ${frameClass}"></div>` : ''}
            </div>
        `;
    }

    // Caso contrário, usa o avatar padrão de usuário (robô azul)
    return `
        <div class="profile-avatar-wrapper">
            <div class="avatar-composite">
                <img src="https://api.dicebear.com/10.x/bottts-neutral/svg?seed=tdunppc5" 
                     class="dicebear-img" 
                     alt="Avatar Padrão">
            </div>
            ${frameItem ? `<div class="profile-frame ${frameItem.frameClass}"></div>` : ''}
        </div>
    `;
}


// ============================================================
//  ROLETA DA SORTE (v1.0.6)
// ============================================================

// IDs reais dos itens da loja (confirmados em SHOP_ITEMS)
const ROLETA_SEGMENTS = [
    { id: 'coins_50',              label: '50 Moedas',      type: 'coins',  value: 50,                    weight: 19, color: '#2d1b69', textColor: '#ffd700', icon: '🪙' },
    { id: 'coins_250',             label: '250 Moedas',     type: 'coins',  value: 250,                   weight: 18, color: '#1a237e', textColor: '#ffd700', icon: '💰' },
    { id: 'coins_500',             label: '500 Moedas',     type: 'coins',  value: 500,                   weight: 15, color: '#4a148c', textColor: '#ffd700', icon: '💰' },
    { id: 'coins_1500',            label: '1500 Moedas',    type: 'coins',  value: 1500,                  weight: 7, color: '#1565c0', textColor: '#ffd700', icon: '💎' },
    { id: 'cosmetic_frame_neon',   label: 'Moldura Neon',   type: 'item',   value: 'cosmetic_frame_neon', weight: 5,  color: '#006064', textColor: '#00e5ff', icon: '⭕' },
    { id: 'avatar_croo_5',         label: 'Croodles #5',    type: 'item',   value: 'avatar_croo_5',       weight: 5,  color: '#1b5e20', textColor: '#69ff47', icon: '🎭' },
    { id: 'avatar_boots_1',        label: 'Boots #1',       type: 'item',   value: 'avatar_boots_1',      weight: 5,  color: '#0d47a1', textColor: '#40c4ff', icon: '🤖' },
    { id: 'theme_neon',            label: 'Tema Neon Night', type: 'item',  value: 'theme_neon',          weight: 5,  color: '#4a0072', textColor: '#ea80fc', icon: '🌀' },
];

// Ticket da loja (item especial — não é cosmético, é consumível)
const TICKET_SHOP_ITEM = {
    id: 'spin_ticket',
    type: 'ticket',
    name: 'Ticket da Roleta',
    desc: 'Use para girar a Roleta da Sorte e ganhar recompensas!',
    price: 1000,
    icon: '🎟️'
};

let roletaSpinning = false;
let roletaWheelInstance = null;
let roletaResult = null;

// ---- Ticket diário ----
function checkDailyTicket() {
    if (isGuest) return; // Visitantes não ganham ticket diário
    const last = userStats.lastDailyTicket ? new Date(userStats.lastDailyTicket) : null;
    const now = new Date();
    if (!last || (now - last) >= 86400000) {
        userStats.spinTickets = (userStats.spinTickets || 0) + 1;
        userStats.lastDailyTicket = now.toISOString();
        saveUserStats();
        showToast('🎟️ Ticket diário recebido! Acesse a Roleta da Sorte!', 'success');
    }
}

// ---- Sorteio ponderado ----
function sortearSegmento() {
    const total = ROLETA_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * total;
    for (const seg of ROLETA_SEGMENTS) {
        rand -= seg.weight;
        if (rand <= 0) return seg;
    }
    return ROLETA_SEGMENTS[0];
}

// ---- Calcular ângulo da fatia sorteada ----
function calcularAnguloFatia(segIndex) {
    const totalSegments = ROLETA_SEGMENTS.length;
    const grausPorFatia = 360 / totalSegments;
    // Centro da fatia + múltiplas voltas para animação
    const centroFatia = segIndex * grausPorFatia + grausPorFatia / 2;
    const voltas = 5; // 5 voltas completas antes de parar
    return voltas * 360 + (360 - centroFatia);
}

// ---- Renderizar a aba da Roleta ----
function renderRoleta() {
    const container = document.getElementById('tab-roleta');
    if (!container) return;

    // Verificar ticket diário ao abrir a aba
    checkDailyTicket();

    const tickets = userStats.spinTickets || 0;
    const totalSegments = ROLETA_SEGMENTS.length;
    const grausPorFatia = 360 / totalSegments;

    // Gerar fatias SVG da roda
    const svgFatias = ROLETA_SEGMENTS.map((seg, i) => {
        const startAngle = i * grausPorFatia;
        const endAngle = startAngle + grausPorFatia;
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const r = 180;
        const cx = 200, cy = 200;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        // Texto da fatia
        const midAngle = (startAngle + grausPorFatia / 2 - 90) * Math.PI / 180;
        const textR = 120;
        const tx = cx + textR * Math.cos(midAngle);
        const ty = cy + textR * Math.sin(midAngle);
        const textRotation = startAngle + grausPorFatia / 2;

        return `
            <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z"
                  fill="${seg.color}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
            <text transform="translate(${tx},${ty}) rotate(${textRotation})"
                  text-anchor="middle" dominant-baseline="middle"
                  font-size="13" font-weight="bold" fill="${seg.textColor}"
                  style="font-family: Inter, sans-serif; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                ${seg.icon}
            </text>
            <text transform="translate(${tx + Math.cos(midAngle) * 18},${ty + Math.sin(midAngle) * 18}) rotate(${textRotation})"
                  text-anchor="middle" dominant-baseline="middle"
                  font-size="9" font-weight="700" fill="${seg.textColor}"
                  style="font-family: Inter, sans-serif;">
                ${seg.label}
            </text>
        `;
    }).join('');

    container.innerHTML = `
        <div class="roleta-wrapper">
            <div class="roleta-header">
                <h2 class="roleta-title">🎡 ROLETA DA SORTE</h2>
                <div class="roleta-ticket-badge">
                    <span class="ticket-icon">🎟️</span>
                    <span class="ticket-count" id="roleta-ticket-count">${tickets}</span>
                    <span class="ticket-label">Tickets</span>
                </div>
            </div>

            <div class="roleta-arena">
                <!-- Ponteiro -->
                <div class="roleta-pointer">▼</div>

                <!-- Roda SVG -->
                <div class="roleta-wheel-container" id="roleta-wheel-container">
                    <svg id="roleta-svg" viewBox="0 0 400 400" width="320" height="320"
                         style="filter: drop-shadow(0 0 20px rgba(99,102,241,0.6)); transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);">
                        <!-- Anel externo decorativo -->
                        <circle cx="200" cy="200" r="195" fill="none" stroke="rgba(99,102,241,0.8)" stroke-width="4"/>
                        <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(168,85,247,0.4)" stroke-width="2"/>
                        <!-- Fatias -->
                        ${svgFatias}
                        <!-- Hub central -->
                        <circle cx="200" cy="200" r="28" fill="#1a1a2e" stroke="rgba(99,102,241,0.9)" stroke-width="4"/>
                        <circle cx="200" cy="200" r="18" fill="url(#hubGrad)" stroke="rgba(168,85,247,0.6)" stroke-width="2"/>
                        <defs>
                            <radialGradient id="hubGrad" cx="40%" cy="35%">
                                <stop offset="0%" stop-color="#a78bfa"/>
                                <stop offset="100%" stop-color="#4c1d95"/>
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <!-- Botão Mostrar Recompensas -->
            <button class="btn-ghost" onclick="toggleRoletaRewards(event)" style="margin: 10px auto; display: block; font-size: 0.8rem; padding: 8px 16px;">
                🎁 MOSTRAR RECOMPENSAS ▼
            </button>

            <!-- Legenda das fatias (Colapsável) -->
            <div id="roleta-rewards-container" class="roleta-legend-horizontal hidden" style="margin-bottom: 15px;">
                ${ROLETA_SEGMENTS.map(seg => `
                    <div class="legend-card">
                        <div class="legend-card-icon" style="background:${seg.color};">${seg.icon}</div>
                        <div class="legend-card-name">${seg.label}</div>
                        <div class="legend-card-chance">${seg.weight}%</div>
                    </div>
                `).join('')}
            </div>

            <!-- Botão girar -->
            <div class="roleta-actions">
                <button id="btn-girar-roleta" class="btn-girar ${tickets === 0 ? 'disabled' : ''}"
                        onclick="girarRoleta()" ${tickets === 0 ? 'disabled' : ''}>
                    🎟️ GIRAR (1 Ticket)
                </button>
                ${isGuest ? '' : `
                <button class="btn-comprar-ticket" onclick="comprarTicket()">
                    💰 Comprar Ticket (1.000 moedas)
                </button>`}
            </div>

            ${tickets === 0 && !isGuest ? `
            <div class="roleta-sem-ticket">
                <p>Sem tickets! Volte amanhã para ganhar 1 ticket grátis,<br>ou compre por 1.000 moedas.</p>
            </div>` : ''}
            ${isGuest ? `
            <div class="roleta-sem-ticket">
                <p>Crie uma conta para participar da Roleta da Sorte!</p>
            </div>` : ''}
        </div>
    `;
}

// ---- Alternar visibilidade das recompensas ----
function toggleRoletaRewards(event) {
    const container = document.getElementById('roleta-rewards-container');
    // Usa event.currentTarget se disponível, senão busca o botão pelo onclick
    const btn = event ? event.currentTarget : document.querySelector('button[onclick*="toggleRoletaRewards"]');
    if (!container || !btn) return;
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        btn.innerHTML = '🎁 OCULTAR RECOMPENSAS ▲';
    } else {
        container.classList.add('hidden');
        btn.innerHTML = '🎁 MOSTRAR RECOMPENSAS ▼';
    }
}

// ---- Girar a roleta ----
async function girarRoleta() {
    if (roletaSpinning) return;
    if (isGuest) { showToast('Crie uma conta para usar a Roleta!', 'error'); return; }
    if ((userStats.spinTickets || 0) <= 0) { showToast('Sem tickets! Compre ou aguarde o ticket diário.', 'error'); return; }

    roletaSpinning = true;

    // Consumir ticket
    userStats.spinTickets = (userStats.spinTickets || 1) - 1;
    await saveUserStats();

    // Atualizar contador na UI
    const countEl = document.getElementById('roleta-ticket-count');
    if (countEl) countEl.textContent = userStats.spinTickets;

    // Desabilitar botão
    const btn = document.getElementById('btn-girar-roleta');
    if (btn) { btn.disabled = true; btn.textContent = '🌀 Girando...'; }

    // Sortear resultado
    roletaResult = sortearSegmento();
    const segIndex = ROLETA_SEGMENTS.indexOf(roletaResult);
    const anguloFinal = calcularAnguloFatia(segIndex);

    // Animar a roda
    const svg = document.getElementById('roleta-svg');
    if (svg) {
        svg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        svg.style.transformOrigin = 'center';
        svg.style.transform = `rotate(${anguloFinal}deg)`;
    }

    // Aguardar animação terminar (4s)
    setTimeout(() => {
        roletaSpinning = false;
        mostrarCardRecompensa(roletaResult);
    }, 4200);
}

// ---- Comprar ticket na loja ----
async function comprarTicket() {
    if (isGuest) { showToast('Crie uma conta para comprar tickets!', 'error'); return; }
    if ((userStats.coins || 0) < 1000) {
        showToast('💰 Moedas insuficientes! Você precisa de 1.000 moedas.', 'error');
        return;
    }
    userStats.coins -= 1000;
    userStats.spinTickets = (userStats.spinTickets || 0) + 1;
    await saveUserStats();
    updateSidebar();
    showToast('🎟️ Ticket comprado! Boa sorte na Roleta!', 'success');
    renderRoleta(); // Re-renderizar para atualizar contador
}

// ---- Card de recompensa ----
function mostrarCardRecompensa(seg) {
    // Verificar se item já é possuído (para itens da loja)
    let rewardTitle = seg.label;
    let rewardDesc = '';
    let isDuplicate = false;

    if (seg.type === 'item') {
        const jaTemItem = userStats.ownedItems && userStats.ownedItems.includes(seg.value);
        if (jaTemItem) {
            isDuplicate = true;
            rewardTitle = '1.000 Moedas';
            rewardDesc = `<p class="reward-duplicate-msg">Você já possui <strong>${seg.label}</strong>!<br>Convertido em 1.000 moedas como compensação.</p>`;
        }
    }

    const raridade = seg.weight <= 5 ? 'RARO' : seg.weight <= 10 ? 'INCOMUM' : 'COMUM';
    const raridadeCor = seg.weight <= 5 ? '#ea80fc' : seg.weight <= 10 ? '#ffd700' : '#a0a0b0';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active roleta-reward-overlay';
    overlay.innerHTML = `
        <div class="roleta-reward-card">
            <div class="reward-particles" id="reward-particles"></div>
            <div class="reward-rarity" style="color: ${raridadeCor};">✦ ${raridade} ✦</div>
            <div class="reward-chest-icon">🎁</div>
            <h2 class="reward-title">PARABÉNS!</h2>
            <div class="reward-icon-big">${isDuplicate ? '💰' : seg.icon}</div>
            <div class="reward-name">${rewardTitle}</div>
            ${rewardDesc}
            <button class="btn-resgatar" onclick="resgatarRecompensa('${seg.id}', ${isDuplicate})">
                ✨ RESGATAR RECOMPENSA
            </button>
            <p class="reward-footer">Adicionado ao seu inventário</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Criar partículas de confete
    const particlesEl = document.getElementById('reward-particles');
    if (particlesEl) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'reward-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 2 + 's';
            p.style.background = ['#ffd700','#ea80fc','#40c4ff','#69ff47','#ff6b6b'][Math.floor(Math.random()*5)];
            particlesEl.appendChild(p);
        }
    }
}

// ---- Resgatar recompensa ----
async function resgatarRecompensa(segId, isDuplicate) {
    const seg = ROLETA_SEGMENTS.find(s => s.id === segId);
    if (!seg) return;

    // Fechar card
    document.querySelector('.roleta-reward-overlay')?.remove();

    if (isDuplicate || seg.type === 'coins') {
        // Dar moedas
        const moedas = isDuplicate ? 1000 : seg.value;
        userStats.coins = (userStats.coins || 0) + moedas;
        await saveUserStats();
        updateSidebar();
        showToast(`💰 +${moedas} moedas adicionadas!`, 'success');
    } else if (seg.type === 'item') {
        // Adicionar item ao inventário
        if (!userStats.ownedItems) userStats.ownedItems = [];
        if (!userStats.ownedItems.includes(seg.value)) {
            userStats.ownedItems.push(seg.value);
            if (currentUserSupabaseId) {
                await saveShopItemToSupabase(currentUserSupabaseId, seg.value, false);
            }
        }
        await saveUserStats();
        showToast(`🎉 ${seg.label} adicionado ao inventário!`, 'success');
    }

    // Re-renderizar roleta para atualizar botão
    renderRoleta();
}


// ============================================================
//  MODO PALAVRA DIÁRIA (v1.0.9 - CORRIGIDO)
// ============================================================
//  Correções aplicadas:
//   1. Bloco único (removida duplicação que causava comportamento imprevisível)
//   2. isValidWordDaily() agora também aceita palavras de PALAVRAS_SECRETAS
//   3. Palavra inválida apenas exibe aviso e bloqueia o envio (sem "prosseguir mesmo assim")
//   4. Card de recompensas usa a função real showGameEndModalPremium()
//  Todas as alterações são exclusivas do modo DAILY_WORD; os demais
//  modos (5L, 7L, Sobrevivência, Avalanche, Jornada) permanecem intactos.
// ============================================================

// ---- Estado da Palavra Diária ----
let dailyWordState = null;

// ---- Gerar/Verificar Palavra Diária (Determinística) ----
async function generateDailyWord() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC
    let dailyState = JSON.parse(localStorage.getItem('DAILY_WORD_STATE') || '{}');

    // Se é um novo dia, gerar nova palavra (determinística - mesma para todos)
    if (dailyState.date !== today) {
        // Gerar índice determinístico baseado na data
        const dateHash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const wordIndex = Math.abs(dateHash) % PALAVRAS_SECRETAS.length;
        const word = PALAVRAS_SECRETAS[wordIndex];

        dailyState = {
            date: today,
            word: word,
            played: false,
            won: false,
            score: 0,
            attempts: 0,
            timeUsed: 0,
            rewardsClaimed: false
        };

        localStorage.setItem('DAILY_WORD_STATE', JSON.stringify(dailyState));

        // Criar notificação para o usuário
        if (currentUserSupabaseId && !isGuest) {
            await createNotification(
                "📅 Palavra Diária Disponível!",
                `Uma palavra única para todos os jogadores. Você tem 3 minutos para resolver!`,
                "info",
                "open_daily_word",
                {}
            );
        }
    }

    dailyWordState = dailyState;
    return dailyState;
}

// ---- Validar Palavra no Modo Diário ----
// CORREÇÃO 2: além de LISTA_VALIDACAO e BANCO_DE_PALAVRAS, também aceita
// qualquer palavra presente em PALAVRAS_SECRETAS (inclui a palavra do dia).
function isValidWordDaily(word) {
    const normalized = normalizeWord(word);

    // 1. Verificar em LISTA_VALIDACAO (dicionário de palavras aceitas)
    if (typeof LISTA_VALIDACAO !== 'undefined' && Array.isArray(LISTA_VALIDACAO)) {
        if (LISTA_VALIDACAO.some(w => normalizeWord(w) === normalized)) return true;
    }

    // 2. Verificar em PALAVRAS_SECRETAS (banco das palavras secretas/diárias)
    if (typeof PALAVRAS_SECRETAS !== 'undefined' && Array.isArray(PALAVRAS_SECRETAS)) {
        if (PALAVRAS_SECRETAS.some(w => normalizeWord(w) === normalized)) return true;
    }

    // 3. Fallback: aceitar se estiver em BANCO_DE_PALAVRAS (compatibilidade)
    if (typeof BANCO_DE_PALAVRAS === 'object') {
        const allWords = [];
        for (const lenKey in BANCO_DE_PALAVRAS) {
            const categories = BANCO_DE_PALAVRAS[lenKey];
            if (typeof categories === 'object') {
                for (const diff in categories) {
                    if (Array.isArray(categories[diff])) {
                        allWords.push(...categories[diff]);
                    }
                }
            }
        }
        if (allWords.some(w => normalizeWord(w) === normalized)) return true;
    }

    return false;
}

// ---- Iniciar Modo Palavra Diária ----
async function startDailyWordMode() {
    const dailyState = await generateDailyWord();

    if (dailyState.played) {
        showToast('Você já jogou a palavra de hoje! Volte amanhã.', 'info');
        return;
    }

    // Desabilitar seleção de dificuldade para modo diário
    closeMobileSidebar();
    disableDifficultyButtons();

    currentGame = {
        mode: 'DAILY_WORD',
        modeName: 'PALAVRA DIÁRIA',
        words: [dailyState.word],
        wordLength: 5,
        maxAttempts: 6,
        currentRow: 0,
        currentInputArr: new Array(5).fill(''),
        selectedFieldIndex: 0,
        attempts: [[]],
        score: 0,
        stageScores: [],
        isPerfectGame: true,
        usedWordsMemory: new Set(),

        // Campos específicos do modo diário
        startTime: Date.now(),
        timeRemaining: 180,  // 3 minutos
        timerInterval: null,
        isDailyMode: true
    };

    gameInProgress = true;
    showMainTab('game');
    renderGame();
    startDailyWordTimer();
}

// ---- Timer da Palavra Diária ----
function startDailyWordTimer() {
    if (currentGame.mode !== 'DAILY_WORD') return;

    currentGame.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentGame.startTime) / 1000);
        currentGame.timeRemaining = Math.max(0, 180 - elapsed);

        // Atualizar UI do timer (no game-status-bar)
        const statusBar = document.getElementById('game-status-bar');
        if (statusBar) {
            const timerEl = statusBar.querySelector('[data-time]');
            if (timerEl) {
                const mins = Math.floor(currentGame.timeRemaining / 60);
                const secs = currentGame.timeRemaining % 60;
                timerEl.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;

                // Mudar cor se tempo está acabando
                if (currentGame.timeRemaining <= 30) {
                    timerEl.style.color = '#ff6b6b';
                } else if (currentGame.timeRemaining <= 60) {
                    timerEl.style.color = '#ffa500';
                } else {
                    timerEl.style.color = 'var(--accent)';
                }
            }
        }

        if (currentGame.timeRemaining <= 0) {
            clearInterval(currentGame.timerInterval);
            handleDailyWordTimeUp();
        }
    }, 100);
}

// ---- Lidar com Tempo Esgotado no Modo Diário ----
function handleDailyWordTimeUp() {
    if (!gameInProgress || currentGame.mode !== 'DAILY_WORD') return;
    gameInProgress = false;

    if (currentGame.timerInterval) {
        clearInterval(currentGame.timerInterval);
        currentGame.timerInterval = null;
    }

    // Marcar como jogado mesmo que tenha perdido
    dailyWordState.played = true;
    dailyWordState.won = false;
    dailyWordState.attempts = currentGame.currentRow;
    localStorage.setItem('DAILY_WORD_STATE', JSON.stringify(dailyWordState));

    showToast('⏰ Tempo esgotado! Palavra Diária falhada.', 'error');

    // CORREÇÃO 4: usar a função real de modal de fim de jogo
    setTimeout(() => {
        showGameEndModalPremium(false, 0, 0);
    }, 500);
}

// ---- Calcular Score da Palavra Diária ----
function calculateDailyWordScore() {
    const attemptUsed = currentGame.currentRow;
    const timeUsed = 180 - currentGame.timeRemaining;

    // Tabela de scores por tentativa
    const attemptScores = [1000, 800, 600, 400, 200, 100];
    const baseScore = attemptScores[Math.min(attemptUsed - 1, 5)] || 100;

    // Bônus de tempo (quanto mais rápido, mais bônus)
    const timeBonus = Math.round(((180 - timeUsed) / 180) * 200);

    // Score final
    const finalScore = Math.round(baseScore + timeBonus);

    return {
        baseScore,
        timeBonus,
        finalScore,
        attemptUsed,
        timeUsed
    };
}

// ---- Patch para submitAttempt - Validação do Modo Diário ----
// CORREÇÃO 3: no modo diário, palavra inválida apenas exibe aviso e bloqueia
// o envio (sem opção de "prosseguir mesmo assim"). Os demais modos mantêm
// o comportamento original (isValidWord + confirm).
const _originalSubmitAttemptDaily = submitAttempt;
submitAttempt = function() {
    if (currentGame.mode !== 'DAILY_WORD') {
        // Outros modos: comportamento original intacto
        return _originalSubmitAttemptDaily.apply(this, arguments);
    }

    if (!gameInProgress || !currentGame) return;

    const input = currentGame.currentInputArr.join('').trim();
    if (input.length !== currentGame.wordLength) {
        showToast('Preencha todas as letras', 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    const word = input.toUpperCase();

    // Validação específica do modo diário: bloqueia palavra inexistente
    if (!isValidWordDaily(word)) {
        showToast(`"${word}" não existe no dicionário.`, 'error');
        shakeBoards();
        playSound('error');
        return;
    }

    currentGame.words.forEach((secret, idx) => {
        if (!isBoardWon(idx)) {
            currentGame.attempts[idx][currentGame.currentRow] = word.split('');
        }
    });

    const currentRowBefore = currentGame.currentRow;
    currentGame.currentRow++;
    currentGame.isAnimating = true;
    renderGame();

    // Sincronização Online (v1.0.9)
    if (currentGame.mode === 'ONLINE_1V1') {
        const attempt = word.split('');
        const secret = currentGame.words[0];
        const result = attempt.map((l, i) => getLetterState(l, i, secret, attempt));
        OnlineManager.sendProgress(word, result);
    }

    setTimeout(() => {
        currentGame.isAnimating = false;
        checkGameStatus();
    }, 1000);
};

// ---- Patch para updateGameTopbar - Ocultar Dificuldade no Modo Diário ----
const _originalUpdateGameTopbarDaily = updateGameTopbar;
updateGameTopbar = function() {
    const mode = currentGame.mode;

    if (mode !== 'DAILY_WORD') {
        // Outros modos: comportamento original intacto
        return _originalUpdateGameTopbarDaily.apply(this, arguments);
    }

    const titleBar = document.getElementById('game-title-bar');
    if (titleBar) titleBar.textContent = currentGame.modeName;

    // Ocultar badge de dificuldade no modo diário
    const badge = document.getElementById('game-diff-badge');
    if (badge) badge.style.display = 'none';

    // Mostrar timer para modo diário
    const statusBar = document.getElementById('game-status-bar');
    if (statusBar) {
        let timerEl = statusBar.querySelector('[data-time]');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.setAttribute('data-time', 'true');
            timerEl.style.cssText = 'font-size: 16px; font-weight: bold; color: var(--accent); margin-left: 10px;';
            statusBar.appendChild(timerEl);
        }
    }
};

// ---- Patch para renderKeyboard - Ocultar Dicas no Modo Diário ----
const _originalRenderKeyboardDaily = renderKeyboard;
renderKeyboard = function() {
    // Renderizar teclado normalmente (base intacta)
    _originalRenderKeyboardDaily.apply(this, arguments);

    const hintBtn = document.getElementById('btn-hint');
    if (!hintBtn) return;

    // Ocultar botão de dica somente no modo diário
    if (currentGame && currentGame.mode === 'DAILY_WORD') {
        hintBtn.style.display = 'none';
    } else {
        hintBtn.style.display = 'block';
    }
};

// ---- Patch para checkGameStatus - Vitória/Derrota no Modo Diário ----
// CORREÇÃO 4: usa showGameEndModalPremium() (função real) para exibir o card.
const _originalCheckGameStatusDaily = checkGameStatus;
checkGameStatus = function() {
    if (currentGame.mode !== 'DAILY_WORD') {
        // Outros modos: comportamento original intacto
        return _originalCheckGameStatusDaily.apply(this, arguments);
    }

    // Verificar se ganhou (todos os tabuleiros resolvidos)
    let allWon = true;
    for (let b = 0; b < currentGame.words.length; b++) {
        if (!isBoardWon(b)) {
            allWon = false;
            break;
        }
    }

    if (allWon) {
        // VITÓRIA
        const scoreData = calculateDailyWordScore();

        dailyWordState.played = true;
        dailyWordState.won = true;
        dailyWordState.attempts = currentGame.currentRow;
        dailyWordState.score = scoreData.finalScore;
        dailyWordState.timeUsed = scoreData.timeUsed;
        localStorage.setItem('DAILY_WORD_STATE', JSON.stringify(dailyWordState));

        // Recompensas (XP e moedas)
        const xpGain = scoreData.finalScore;
        const coinsGain = Math.round(scoreData.finalScore / 2);

        currentGame.score = scoreData.finalScore;
        userStats.xp = (userStats.xp || 0) + xpGain;
        userStats.coins = (userStats.coins || 0) + coinsGain;

        // Parar timer
        if (currentGame.timerInterval) {
            clearInterval(currentGame.timerInterval);
            currentGame.timerInterval = null;
        }

        saveUserStats();
        gameInProgress = false;

        // Card de recompensas (vitória)
        setTimeout(() => {
            showGameEndModalPremium(true, xpGain, coinsGain);
        }, 800);

    } else if (currentGame.currentRow >= currentGame.maxAttempts) {
        // DERROTA (esgotou as tentativas)
        dailyWordState.played = true;
        dailyWordState.won = false;
        dailyWordState.attempts = currentGame.currentRow;
        localStorage.setItem('DAILY_WORD_STATE', JSON.stringify(dailyWordState));

        // Parar timer
        if (currentGame.timerInterval) {
            clearInterval(currentGame.timerInterval);
            currentGame.timerInterval = null;
        }

        saveUserStats();
        gameInProgress = false;

        // Card de fim de jogo (derrota)
        setTimeout(() => {
            showGameEndModalPremium(false, 0, 0);
        }, 800);
    }
};


// ============================================================
// FUNÇÃO PARA RETORNAR À PLATAFORMA
// ============================================================
/**
 * Retornar à plataforma Core Games
 */
function returnToPlatform() {
    if (confirm('Deseja retornar à plataforma Core Games?')) {
        // Salvar dados antes de sair
        saveUserStats().then(() => {
            // Limpar localStorage do jogo
            localStorage.removeItem('core_games_current_game');
            
            // Redirecionar para a plataforma
            window.location.href = '../..';
        });
    }
}

// ============================================================
// RETORNO À PLATAFORMA COM MODAL BONITO
// ============================================================
function returnToPlatform() {
    // Salvar stats antes de sair
    saveUserStats();
    
    // Criar modal de retorno
    const modal = document.createElement('div');
    modal.className = 'return-platform-modal-overlay';
    modal.innerHTML = `
        <div class="return-platform-modal-card">
            <div class="return-platform-header">
                <h2>Voltar à Plataforma?</h2>
                <p>Seus progresso foi salvo automaticamente</p>
            </div>
            
            <div class="return-platform-content">
                <div class="return-platform-icon">🎮</div>
                <p>Você será redirecionado para a biblioteca de jogos Core Games</p>
                <div class="return-platform-stats">
                    <div class="stat-item">
                        <span class="stat-label">Nível</span>
                        <span class="stat-value">${getLevelInfo(userStats.xp || 0).level}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Moedas</span>
                        <span class="stat-value">${userStats.coins || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Vitórias</span>
                        <span class="stat-value">${(userStats['5_LETTERS']?.wins || 0) + (userStats['7_LETTERS']?.wins || 0)}</span>
                    </div>
                </div>
            </div>
            
            <div class="return-platform-actions">
                <button class="btn-return-cancel" onclick="this.closest('.return-platform-modal-overlay').remove()">
                    Continuar Jogando
                </button>
                <button class="btn-return-confirm" onclick="confirmReturnToPlatform()">
                    Voltar à Plataforma
                </button>
            </div>
        </div>
    `;
    
    // Adicionar estilos do modal
    if (!document.getElementById('return-platform-styles')) {
        const styles = document.createElement('style');
        styles.id = 'return-platform-styles';
        styles.textContent = `
            .return-platform-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeInOverlay 0.3s ease;
            }
            
            @keyframes fadeInOverlay {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .return-platform-modal-card {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #00d4ff;
                border-radius: 16px;
                padding: 32px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
                animation: slideUpModal 0.4s ease;
            }
            
            @keyframes slideUpModal {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .return-platform-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .return-platform-header h2 {
                color: #00d4ff;
                font-size: 24px;
                margin: 0 0 8px 0;
                font-weight: 700;
            }
            
            .return-platform-header p {
                color: #a0aec0;
                font-size: 14px;
                margin: 0;
            }
            
            .return-platform-content {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .return-platform-icon {
                font-size: 48px;
                margin-bottom: 16px;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .return-platform-content p {
                color: #cbd5e0;
                font-size: 14px;
                margin: 0 0 20px 0;
            }
            
            .return-platform-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }
            
            .stat-item {
                background: rgba(0, 212, 255, 0.1);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .stat-label {
                color: #a0aec0;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            
            .stat-value {
                color: #00d4ff;
                font-size: 18px;
                font-weight: 700;
            }
            
            .return-platform-actions {
                display: flex;
                gap: 12px;
                flex-direction: column;
            }
            
            .btn-return-cancel,
            .btn-return-confirm {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }
            
            .btn-return-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: #cbd5e0;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-return-cancel:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .btn-return-confirm {
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                color: #000;
                font-weight: 700;
            }
            
            .btn-return-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
            }
            
            .btn-return-confirm:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}

function confirmReturnToPlatform() {
    // Limpar localStorage
    localStorage.removeItem('cg_current_game');
    
    // Redirecionar
    window.location.href = '../..';
}
