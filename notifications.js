/**
 * SISTEMA DE NOTIFICAÇÕES IN-GAME
 * Gerencia notificações do usuário no Supabase e LocalStorage (para visitantes)
 */

const LOCAL_NOTIFICATIONS_KEY = 'termo_local_notifications';

/**
 * Criar uma notificação para o usuário
 */
async function createNotification(title, message, type = 'info', actionType = null, actionData = null) {
    // Se for visitante sem ID (caso raro de falha no login temporário)
    if (isGuest && !currentUserSupabaseId) {
        addLocalNotification(title, message, type);
        return;
    }

    if (!currentUserSupabaseId) {
        console.warn('⚠️ Usuário não autenticado, notificação não criada no banco. Salvando localmente.');
        addLocalNotification(title, message, type);
        return;
    }

    const client = getSupabaseClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('notifications')
            .insert({
                user_id: currentUserSupabaseId,
                title,
                message,
                type,
                action_type: actionType,
                action_data: actionData,
                is_read: false
            });

        if (error) {
            console.error('❌ Erro ao criar notificação no Supabase:', error);
            // Fallback para local se o banco falhar (ex: erro 403)
            addLocalNotification(title, message, type);
            return;
        }

        console.log('✅ Notificação criada no banco:', title);
        
        // Atualizar interface imediatamente
        // Apenas mostramos o toast se o usuário já estiver logado na tela principal
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'screen-main') {
            showNotificationToast(title, message, type);
        }
        updateNotificationBadge();
        
        // Se a aba de notificações estiver aberta, renderiza
        const notificationsTab = document.getElementById('tab-notifications');
        if (notificationsTab && notificationsTab.classList.contains('active')) {
            renderNotifications();
        }
    } catch (error) {
        console.error('❌ Erro inesperado ao criar notificação:', error);
        addLocalNotification(title, message, type);
    }
}

/**
 * Obter notificações não lidas do usuário
 */
async function getUnreadNotifications() {
    let allUnread = [];

    // 1. Notificações locais (fallback)
    const localNotifs = getLocalNotifications().filter(n => !n.is_read);
    allUnread = [...localNotifs];

    // 2. Notificações do Supabase
    if (currentUserSupabaseId) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('notifications')
                    .select('*')
                    .eq('user_id', currentUserSupabaseId)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    allUnread = [...allUnread, ...data];
                } else if (error) {
                    console.error('⚠️ Erro ao buscar notificações não lidas no banco:', error.message);
                }
            } catch (error) {
                console.error('❌ Erro ao obter notificações do banco:', error);
            }
        }
    }

    return allUnread;
}

/**
 * Marcar notificação como lida
 */
async function markNotificationAsRead(notificationId) {
    console.log('📖 Marcando notificação como lida:', notificationId);
    
    if (String(notificationId).startsWith('local_')) {
        const localNotifs = getLocalNotifications();
        const notif = localNotifs.find(n => n.id === notificationId);
        if (notif) {
            notif.is_read = true;
            saveLocalNotifications(localNotifs);
        }
    } else if (currentUserSupabaseId) {
        const client = getSupabaseClient();
        if (!client) return;
        try {
            const { error } = await client
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .eq('user_id', currentUserSupabaseId);
            
            if (error) throw error;
        } catch (error) {
            console.error('❌ Erro ao marcar como lida no banco:', error);
        }
    }
    
    await updateNotificationBadge();
    await renderNotifications();
}

/**
 * Obter todas as notificações
 */
async function getAllNotifications() {
    let allNotifs = getLocalNotifications();

    if (currentUserSupabaseId) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('notifications')
                    .select('*')
                    .eq('user_id', currentUserSupabaseId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Erro ao buscar todas as notificações:', error.message);
                } else if (data) {
                    allNotifs = [...allNotifs, ...data];
                }
            } catch (error) {
                console.error('❌ Erro ao obter notificações do banco:', error);
            }
        }
    }

    // Remover duplicatas por ID
    const uniqueNotifs = Array.from(new Map(allNotifs.map(item => [item.id, item])).values());

    // Ordenar por data (mais recentes primeiro)
    return uniqueNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Renderizar notificações na interface
 */
async function renderNotifications() {
    const notificationsContainer = document.getElementById('notifications-list');
    
    if (!notificationsContainer) {
        console.warn('⚠️ Container #notifications-list não encontrado');
        return;
    }

    const notifications = await getAllNotifications();
    
    if (notifications.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="no-notifications">
                <div class="no-notif-icon">🔔</div>
                <p>Nenhuma notificação por aqui.</p>
                <span>Fique atento aos eventos e conquistas!</span>
            </div>
        `;
        return;
    }

    notificationsContainer.innerHTML = notifications.map(notif => {
        const date = new Date(notif.created_at).toLocaleString('pt-BR');
        const isLocal = String(notif.id).startsWith('local_');
        
        return `
            <div class="notification-item ${notif.is_read ? 'read' : 'unread'}" data-id="${notif.id}">
                <div class="notification-header">
                    <span class="notification-title">${notif.title}</span>
                    <span class="notification-type notification-type-${notif.type}">${notif.type.toUpperCase()}</span>
                </div>
                <p class="notification-message">${notif.message}</p>
                <div class="notification-footer">
                    <span class="notification-date">${date}</span>
                    <div class="notification-actions">
                        ${(notif.action_type && !notif.is_read) ? `<button onclick="handleNotificationAction('${notif.action_type}', '${notif.id}', ${JSON.stringify(notif.action_data || {}).replace(/"/g, '&quot;')})" class="btn-small btn-action">${getActionButtonLabel(notif.action_type)}</button>` : ''}
                        ${!notif.is_read ? `<button onclick="markNotificationAsRead('${notif.id}')" class="btn-small">Marcar como lida</button>` : ''}
                        ${isLocal ? `<button onclick="removeLocalNotification('${notif.id}')" class="btn-small btn-remove">Excluir</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Retorna o texto do botão baseado no tipo de ação
 */
function getActionButtonLabel(actionType) {
    const labels = {
        'create_account': 'CRIAR CONTA AGORA 🚀',
        'claim_reward': 'RESGATAR RECOMPENSA 💰',
        'claim_wheel_ticket': 'RESGATAR TICKET 🎟️',
        'open_shop': 'IR PARA A LOJA 🛒',
        'open_journey': 'VER JORNADAS 📖',
        'open_social': 'VER SOLICITAÇÕES 👥',
        'verify_email': 'VERIFICAR EMAIL 📧'
    };
    return labels[actionType] || 'VER MAIS';
}

/**
 * Trata o clique no botão de ação da notificação
 */
async function handleNotificationAction(actionType, notificationId, actionData) {
    console.log(`🎯 Executando ação: ${actionType}`, actionData);
    
    switch (actionType) {
        case 'create_account':
            if (typeof openConversionModal === 'function') {
                openConversionModal();
            } else {
                logout();
            }
            break;
        case 'claim_reward':
            // 1. Verificar se já foi resgatada (usando is_read como trava)
            const notifEl = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (notifEl && notifEl.classList.contains('read')) {
                showToast('❌ Esta recompensa já foi resgatada!', 'error');
                return;
            }

            if (actionData && actionData.coins) {
                userStats.coins += actionData.coins;
                if (actionData.xp) userStats.xp += actionData.xp;
                
                // 3. Feedback visual (Card/Balão de Recompensas)
                showRewardClaimedModal(actionData);
                
                updateSidebar();
                saveUserStats();
                
                // Marcar como lida após resgatar (isso vai travar novos resgates)
                await markNotificationAsRead(notificationId);
                
                // Atualizar a lista para esconder o botão
                renderNotifications();
            }
            break;
        case 'open_shop':
            showMainTab('shop');
            break;
        case 'open_journey':
            startStoryMode();
            break;
        case 'open_social':
            showMainTab('social');
            break;
        case 'claim_wheel_ticket':
            // FASE 1: Resgatar ticket de roleta
            const wheelNotifEl = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (wheelNotifEl && wheelNotifEl.classList.contains('read')) {
                showToast('❌ Este ticket já foi resgatado!', 'error');
                return;
            }
            
            if (actionData && actionData.tickets) {
                userStats.spinTickets = (userStats.spinTickets || 0) + actionData.tickets;
                await saveUserStats();
                showToast(`🎟️ +${actionData.tickets} ticket(s) adicionado(s)! Vá para a Roleta!`, 'success');
                await markNotificationAsRead(notificationId);
                renderNotifications();
                
                // Redirecionar para a aba da roleta
                setTimeout(() => {
                    showMainTab('roleta');
                }, 500);
            }
            break;
        default:
            console.warn('Ação não implementada:', actionType);
    }
}

/**
 * Mostrar notificação em tempo real (toast)
 */
function showNotificationToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;

    let container = document.getElementById('notification-toasts-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-toasts-container';
        container.className = 'notification-toasts-container';
        document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Auto-remover após 8 segundos
    setTimeout(() => {
        if (toast && toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast && toast.parentElement) toast.remove();
            }, 500);
        }
    }, 8000);
}

/**
 * Mostra um modal de recompensa resgatada
 */
function showRewardClaimedModal(data) {
    const modal = document.createElement('div');
    modal.className = 'reward-claim-modal';
    modal.innerHTML = `
        <div class="reward-modal-content">
            <div class="reward-modal-icon">🎁</div>
            <h2>Recompensa Resgatada!</h2>
            <div class="reward-items">
                ${data.coins ? `<div class="reward-item">💰 <span>+${data.coins} Moedas</span></div>` : ''}
                ${data.xp ? `<div class="reward-item">⭐ <span>+${data.xp} XP</span></div>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-primary">CONTINUAR</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Atualizar o Badge de Notificações
 */
async function updateNotificationBadge() {
    const unread = await getUnreadNotifications();
    const notifBtn = document.getElementById('nav-btn-notifications');
    if (notifBtn) {
        if (unread.length > 0) {
            notifBtn.classList.add('has-unread');
        } else {
            notifBtn.classList.remove('has-unread');
        }
    }
}

/**
 * Inicializar sistema de notificações
 */
async function initNotificationSystem() {
    console.log('🔔 Inicializando sistema de notificações...');
    await updateNotificationBadge();
    
    // Se a aba de notificações estiver ativa, renderiza imediatamente
    const notificationsTab = document.getElementById('tab-notifications');
    if (notificationsTab && notificationsTab.classList.contains('active')) {
        await renderNotifications();
    }

    // Verificar notificações a cada 30 segundos
    if (window.notifInterval) clearInterval(window.notifInterval);
    window.notifInterval = setInterval(updateNotificationBadge, 30000);
}

/**
 * Funções auxiliares para LocalStorage
 */
function getLocalNotifications() {
    try {
        const saved = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Erro ao ler LocalNotifications:', e);
        return [];
    }
}

function saveLocalNotifications(notifications) {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function addLocalNotification(title, message, type = 'info') {
    const localNotifs = getLocalNotifications();
    const newNotif = {
        id: 'local_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
    };
    
    localNotifs.push(newNotif);
    saveLocalNotifications(localNotifs);
    
    updateNotificationBadge();
    
    // Só renderiza se a aba estiver aberta
    const notificationsTab = document.getElementById('tab-notifications');
    if (notificationsTab && notificationsTab.classList.contains('active')) {
        renderNotifications();
    }
    
    showNotificationToast(title, message, type);
}

function removeLocalNotification(id) {
    const localNotifs = getLocalNotifications().filter(n => n.id !== id);
    saveLocalNotifications(localNotifs);
    updateNotificationBadge();
    renderNotifications();
}
