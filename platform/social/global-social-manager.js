/**
 * GLOBAL SOCIAL MANAGER - Core Games Platform
 * Gerencia sistema de amigos e convites globais
 */

class GlobalSocialManager {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.friends = [];
        this.friendRequests = [];
        this.blockedUsers = [];
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ GlobalSocialManager inicializado');
    }

    async setCurrentUser(userId) {
        this.currentUserId = userId;
        await this.loadSocialData();
    }

    // ============================================================
    // CARREGAR DADOS SOCIAIS
    // ============================================================
    async loadSocialData() {
        if (!this.currentUserId || !this.supabase) return;

        try {
            // Carregar amigos
            const { data: friendsData } = await this.supabase
                .from('global_friends')
                .select('friend_id, friend_info:global_users(username, avatar)')
                .eq('user_id', this.currentUserId)
                .eq('status', 'accepted');

            this.friends = friendsData || [];

            // Carregar convites pendentes
            const { data: requestsData } = await this.supabase
                .from('global_friend_requests')
                .select('from_user_id, user_info:global_users(username, avatar)')
                .eq('to_user_id', this.currentUserId)
                .eq('status', 'pending');

            this.friendRequests = requestsData || [];

            // Carregar usuários bloqueados
            const { data: blockedData } = await this.supabase
                .from('global_blocked_users')
                .select('blocked_user_id')
                .eq('user_id', this.currentUserId);

            this.blockedUsers = blockedData || [];

            console.log('✅ Dados sociais carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados sociais:', error);
        }
    }

    // ============================================================
    // ADICIONAR AMIGO
    // ============================================================
    async sendFriendRequest(targetUsername) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Buscar usuário por username
            const { data: targetUser, error: searchError } = await this.supabase
                .from('global_users')
                .select('id')
                .eq('username', targetUsername)
                .single();

            if (searchError || !targetUser) {
                showToast('Usuário não encontrado', 'error');
                return false;
            }

            const targetUserId = targetUser.id;

            // Verificar se já é amigo
            const { data: existing } = await this.supabase
                .from('global_friends')
                .select('*')
                .eq('user_id', this.currentUserId)
                .eq('friend_id', targetUserId)
                .single();

            if (existing) {
                showToast('Você já é amigo deste usuário', 'warning');
                return false;
            }

            // Verificar se já existe convite
            const { data: existingRequest } = await this.supabase
                .from('global_friend_requests')
                .select('*')
                .eq('from_user_id', this.currentUserId)
                .eq('to_user_id', targetUserId)
                .eq('status', 'pending')
                .single();

            if (existingRequest) {
                showToast('Convite já enviado', 'warning');
                return false;
            }

            // Enviar convite
            const { error } = await this.supabase
                .from('global_friend_requests')
                .insert([{
                    from_user_id: this.currentUserId,
                    to_user_id: targetUserId,
                    status: 'pending',
                    sent_at: new Date().toISOString()
                }]);

            if (error) throw error;

            showToast(`✅ Convite enviado para ${targetUsername}!`, 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar convite:', error);
            showToast('Erro ao enviar convite', 'error');
            return false;
        }
    }

    // ============================================================
    // ACEITAR CONVITE
    // ============================================================
    async acceptFriendRequest(fromUserId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Atualizar status do convite
            await this.supabase
                .from('global_friend_requests')
                .update({ status: 'accepted' })
                .eq('from_user_id', fromUserId)
                .eq('to_user_id', this.currentUserId);

            // Adicionar amizade bidirecional
            await this.supabase
                .from('global_friends')
                .insert([
                    {
                        user_id: this.currentUserId,
                        friend_id: fromUserId,
                        status: 'accepted',
                        added_at: new Date().toISOString()
                    },
                    {
                        user_id: fromUserId,
                        friend_id: this.currentUserId,
                        status: 'accepted',
                        added_at: new Date().toISOString()
                    }
                ]);

            showToast('✅ Amizade aceita!', 'success');
            await this.loadSocialData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao aceitar convite:', error);
            showToast('Erro ao aceitar convite', 'error');
            return false;
        }
    }

    // ============================================================
    // REJEITAR CONVITE
    // ============================================================
    async rejectFriendRequest(fromUserId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            await this.supabase
                .from('global_friend_requests')
                .update({ status: 'rejected' })
                .eq('from_user_id', fromUserId)
                .eq('to_user_id', this.currentUserId);

            showToast('Convite rejeitado', 'info');
            await this.loadSocialData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao rejeitar convite:', error);
            return false;
        }
    }

    // ============================================================
    // REMOVER AMIGO
    // ============================================================
    async removeFriend(friendId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Remover amizade bidirecional
            await this.supabase
                .from('global_friends')
                .delete()
                .eq('user_id', this.currentUserId)
                .eq('friend_id', friendId);

            await this.supabase
                .from('global_friends')
                .delete()
                .eq('user_id', friendId)
                .eq('friend_id', this.currentUserId);

            showToast('Amigo removido', 'info');
            await this.loadSocialData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover amigo:', error);
            return false;
        }
    }

    // ============================================================
    // BLOQUEAR USUÁRIO
    // ============================================================
    async blockUser(userId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Remover amizade se existir
            await this.removeFriend(userId);

            // Bloquear usuário
            const { error } = await this.supabase
                .from('global_blocked_users')
                .insert([{
                    user_id: this.currentUserId,
                    blocked_user_id: userId,
                    blocked_at: new Date().toISOString()
                }]);

            if (error) throw error;

            showToast('Usuário bloqueado', 'info');
            await this.loadSocialData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao bloquear usuário:', error);
            return false;
        }
    }

    // ============================================================
    // DESBLOQUEAR USUÁRIO
    // ============================================================
    async unblockUser(userId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            await this.supabase
                .from('global_blocked_users')
                .delete()
                .eq('user_id', this.currentUserId)
                .eq('blocked_user_id', userId);

            showToast('Usuário desbloqueado', 'info');
            await this.loadSocialData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao desbloquear usuário:', error);
            return false;
        }
    }

    // ============================================================
    // CONVIDAR PARA JOGAR
    // ============================================================
    async inviteToGame(friendId, gameId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            const { error } = await this.supabase
                .from('global_game_invites')
                .insert([{
                    from_user_id: this.currentUserId,
                    to_user_id: friendId,
                    game_id: gameId,
                    status: 'pending',
                    sent_at: new Date().toISOString()
                }]);

            if (error) throw error;

            showToast('✅ Convite para jogar enviado!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar convite de jogo:', error);
            showToast('Erro ao enviar convite', 'error');
            return false;
        }
    }

    // ============================================================
    // GETTERS
    // ============================================================
    getFriendsCount() {
        return this.friends.length;
    }

    getFriendRequests() {
        return this.friendRequests;
    }

    getPendingRequestsCount() {
        return this.friendRequests.length;
    }

    isFriend(userId) {
        return this.friends.some(f => f.friend_id === userId);
    }

    isBlocked(userId) {
        return this.blockedUsers.some(b => b.blocked_user_id === userId);
    }
}

// Instância global
const globalSocialManager = new GlobalSocialManager();
