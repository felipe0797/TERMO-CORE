/**
 * GLOBAL SOCIAL UI - Core Games Platform
 * Interface de social global (amigos e convites)
 */

class GlobalSocialUI {
    constructor() {
        this.socialManager = null;
    }

    async init(socialManager) {
        this.socialManager = socialManager;
        console.log('✅ GlobalSocialUI inicializado');
    }

    // ============================================================
    // RENDERIZAR SOCIAL
    // ============================================================
    async renderGlobalSocial() {
        const container = document.querySelector('[data-tab="social"]');
        if (!container) return;

        container.innerHTML = `
            <div class="social-container">
                <!-- HEADER -->
                <div class="social-header">
                    <h2>👥 Social Global</h2>
                    <button class="btn-add-friend" onclick="globalSocialUI.showAddFriendModal()">
                        ➕ Adicionar Amigo
                    </button>
                </div>

                <!-- TABS -->
                <div class="social-tabs">
                    <button class="social-tab-btn active" onclick="globalSocialUI.switchTab('friends')">
                        Amigos (${this.socialManager.getFriendsCount()})
                    </button>
                    <button class="social-tab-btn" onclick="globalSocialUI.switchTab('requests')">
                        Convites (${this.socialManager.getPendingRequestsCount()})
                    </button>
                </div>

                <!-- CONTEÚDO DAS ABAS -->
                <div id="friends-tab" class="social-tab-content active">
                    <div id="friends-list" class="friends-list">
                        <p class="loading">Carregando amigos...</p>
                    </div>
                </div>

                <div id="requests-tab" class="social-tab-content">
                    <div id="requests-list" class="requests-list">
                        <p class="loading">Carregando convites...</p>
                    </div>
                </div>
            </div>

            <!-- MODAL ADICIONAR AMIGO -->
            <div id="modal-add-friend" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Adicionar Amigo</h3>
                        <button class="btn-close" onclick="globalSocialUI.closeAddFriendModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <input 
                            type="text" 
                            id="friend-username-input" 
                            class="input-field" 
                            placeholder="Digite o username do amigo"
                        >
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="globalSocialUI.closeAddFriendModal()">Cancelar</button>
                        <button class="btn-primary" onclick="globalSocialUI.addFriend()">Enviar Convite</button>
                    </div>
                </div>
            </div>
        `;

        // Carregar dados
        await this.loadFriends();
        await this.loadRequests();
    }

    // ============================================================
    // CARREGAR AMIGOS
    // ============================================================
    async loadFriends() {
        const container = document.getElementById('friends-list');
        if (!container) return;

        const friends = this.socialManager.friends;

        if (friends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Você ainda não tem amigos</p>
                    <p class="empty-description">Adicione amigos para ver aqui</p>
                </div>
            `;
            return;
        }

        container.innerHTML = friends.map(friend => `
            <div class="friend-card">
                <div class="friend-avatar">👤</div>
                <div class="friend-info">
                    <p class="friend-name">${friend.friend_info?.username || 'Usuário'}</p>
                    <p class="friend-status">Online</p>
                </div>
                <div class="friend-actions">
                    <button class="btn-icon" title="Convidar para jogar" onclick="globalSocialUI.showInviteModal('${friend.friend_id}')">
                        🎮
                    </button>
                    <button class="btn-icon" title="Remover amigo" onclick="globalSocialUI.removeFriend('${friend.friend_id}')">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================================
    // CARREGAR CONVITES
    // ============================================================
    async loadRequests() {
        const container = document.getElementById('requests-list');
        if (!container) return;

        const requests = this.socialManager.getFriendRequests();

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum convite pendente</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(request => `
            <div class="request-card">
                <div class="request-avatar">👤</div>
                <div class="request-info">
                    <p class="request-name">${request.user_info?.username || 'Usuário'}</p>
                    <p class="request-text">quer ser seu amigo</p>
                </div>
                <div class="request-actions">
                    <button class="btn-accept" onclick="globalSocialUI.acceptRequest('${request.from_user_id}')">
                        ✓ Aceitar
                    </button>
                    <button class="btn-reject" onclick="globalSocialUI.rejectRequest('${request.from_user_id}')">
                        ✕ Rejeitar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ============================================================
    // ALTERNAR ABAS
    // ============================================================
    switchTab(tabName) {
        // Remover active de todos
        document.querySelectorAll('.social-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.social-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Adicionar active ao selecionado
        event.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // ============================================================
    // ADICIONAR AMIGO
    // ============================================================
    async addFriend() {
        const input = document.getElementById('friend-username-input');
        const username = input.value.trim();

        if (!username) {
            showToast('Digite um username', 'warning');
            return;
        }

        const success = await this.socialManager.sendFriendRequest(username);
        if (success) {
            input.value = '';
            this.closeAddFriendModal();
            await this.renderGlobalSocial();
        }
    }

    // ============================================================
    // ACEITAR CONVITE
    // ============================================================
    async acceptRequest(fromUserId) {
        const success = await this.socialManager.acceptFriendRequest(fromUserId);
        if (success) {
            await this.renderGlobalSocial();
        }
    }

    // ============================================================
    // REJEITAR CONVITE
    // ============================================================
    async rejectRequest(fromUserId) {
        const success = await this.socialManager.rejectFriendRequest(fromUserId);
        if (success) {
            await this.renderGlobalSocial();
        }
    }

    // ============================================================
    // REMOVER AMIGO
    // ============================================================
    async removeFriend(friendId) {
        if (confirm('Tem certeza que deseja remover este amigo?')) {
            const success = await this.socialManager.removeFriend(friendId);
            if (success) {
                await this.renderGlobalSocial();
            }
        }
    }

    // ============================================================
    // MODAIS
    // ============================================================
    showAddFriendModal() {
        document.getElementById('modal-add-friend').classList.remove('hidden');
        document.getElementById('friend-username-input').focus();
    }

    closeAddFriendModal() {
        document.getElementById('modal-add-friend').classList.add('hidden');
    }

    showInviteModal(friendId) {
        showToast('🎮 Convidar para jogar (em desenvolvimento)', 'info');
    }
}

// Instância global
const globalSocialUI = new GlobalSocialUI();
