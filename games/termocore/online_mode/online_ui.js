/**
 * ONLINE MODE UI
 * Interface do Lobby e Telas de Duelo
 * Versão 1.0.9
 */

const OnlineUI = {
    async renderLobby() {
        const container = document.getElementById('online-lobby-container');
        if (!container) return;
        
        container.innerHTML = `
            <header class="main-header">
                <div class="header-logo">🌐 <span>MODO ONLINE</span></div>
                <div class="header-right">v1.0.9 Beta</div>
            </header>
            
            <div class="online-container">
                <div class="online-actions">
                    <button class="btn-primary" onclick="OnlineManager.quickPlay()">⚡ JOGAR AGORA</button>
                    <button class="btn-secondary" onclick="OnlineUI.showCreateRoomModal()">➕ CRIAR SALA</button>
                </div>
                
                <div class="rooms-section">
                    <h3 style="margin-bottom: 15px; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Salas Disponíveis</h3>
                    <div id="online-rooms-list" class="rooms-grid">
                        <div class="room-card loading">Carregando salas...</div>
                    </div>
                </div>
            </div>
        `;
        this.updateRoomsList();
    },

    async updateRoomsList() {
        const client = getSupabaseClient();
        if (!client) return;

        try {
            const { data: rooms, error } = await client
                .from('online_rooms')
                .select('*, users(username)')
                .eq('status', 'WAITING')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const listContainer = document.getElementById('online-rooms-list');
            if (!listContainer) return;

            if (rooms.length === 0) {
                listContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--surface2); border-radius: 12px; border: 1px dashed var(--border);">
                        <p style="color: var(--text-muted);">Nenhuma sala disponível no momento.</p>
                        <button class="btn-ghost" style="margin-top: 10px;" onclick="OnlineUI.updateRoomsList()">🔄 Atualizar</button>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = rooms.map(room => `
                <div class="room-card">
                    <div class="room-info">
                        <div class="room-name">${room.name}</div>
                        <div class="room-meta">Dono: ${room.users?.username || 'Desconhecido'} • ${room.difficulty}</div>
                    </div>
                    <button class="btn-apply" onclick="OnlineManager.joinRoom('${room.id}')">ENTRAR</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
        }
    },
    
    async     renderWaitingLobby(roomId) {
        // v1.1.0: Garantir que o container esteja visível e o jogo esteja parado
        const container = document.getElementById('online-lobby-container');
        if (!container) return;

        // Garantir que o container esteja visível
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Remover qualquer overlay ou modal de resultado que possa estar bloqueando
        const resultModal = document.querySelector('.online-result-overlay');
        if (resultModal) resultModal.remove();
        
        const rematchNotif = document.getElementById('rematch-notification');
        if (rematchNotif) rematchNotif.remove();

        container.innerHTML = `
            <header class="main-header">
                <div class="header-logo">🌐 <span>AGUARDANDO JOGADORES</span></div>
                <button class="btn-ghost" onclick="showConfirmModal(() => OnlineManager.leaveRoom().then(() => OnlineUI.renderLobby()), 'SAIR DA SALA?', 'Deseja realmente sair da sala online?', '🚪')">← Sair</button>
            </header>
            
            <div class="online-container">
                <div class="lobby-card">
                    <div class="lobby-status">Esperando oponente...</div>
                    <div id="online-players-list" class="players-list">
                        <div class="player-slot loading">Buscando jogadores...</div>
                    </div>
                    
                    <div class="lobby-actions">
                        <button id="start-online-game-btn" class="btn-primary hidden" onclick="OnlineManager.requestStartGame()">INICIAR PARTIDA</button>
                        <button id="ready-online-game-btn" class="btn-secondary hidden" onclick="OnlineManager.setPlayerReady()">ESTOU PRONTO</button>
                        <p class="lobby-hint" id="lobby-hint-text">Apenas o dono da sala pode iniciar o jogo.</p>
                    </div>
                </div>
            </div>
        `;
        this.updatePlayersList(roomId);
    },

    async updatePlayersList(roomId) {
        const client = getSupabaseClient();
        if (!client) return;

        try {
            const { data: players, error } = await client
                .from('room_players')
                .select('user_id, status, users(username)')
                .eq('room_id', roomId);

            if (error) throw error;

            const listContainer = document.getElementById('online-players-list');
            if (!listContainer) return;

            listContainer.innerHTML = players.map(p => `
                <div class="player-item">
                    <div class="player-avatar">👤</div>
                    <div class="player-info">
                        <span class="player-name">${p.users?.username || 'Jogador'}</span>
                        <span class="player-status-badge ${p.status.toLowerCase()}">${p.status}</span>
                    </div>
                </div>
            `).join('');

            // Verificar se o usuário atual é o dono da sala
            const { data: room } = await client
                .from('online_rooms')
                .select('created_by')
                .eq('id', roomId)
                .single();

            const isRoomCreator = room && room.created_by === currentUserSupabaseId;
            const startBtn = document.getElementById('start-online-game-btn');
            const readyBtn = document.getElementById('ready-online-game-btn');
            const hintText = document.getElementById('lobby-hint-text');

            // Mostrar botão INICIAR apenas para o dono se houver 2+ jogadores
            if (startBtn) {
                if (isRoomCreator && players.length >= 2) {
                    startBtn.classList.remove('hidden');
                } else {
                    startBtn.classList.add('hidden');
                }
            }

            // Mostrar botão ESTOU PRONTO apenas para convidados em WAITING
            if (readyBtn) {
                const currentPlayer = players.find(p => p.user_id === currentUserSupabaseId);
                if (!isRoomCreator && currentPlayer && currentPlayer.status === 'WAITING') {
                    readyBtn.classList.remove('hidden');
                } else {
                    readyBtn.classList.add('hidden');
                }
            }

            // Atualizar hint de acordo com o status
            if (hintText) {
                if (isRoomCreator) {
                    hintText.textContent = players.length >= 2 ? 'Clique em INICIAR PARTIDA para começar!' : 'Aguardando mais jogadores...';
                } else {
                    hintText.textContent = 'Clique em ESTOU PRONTO para avisar que está pronto!';
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar lista de jogadores:', error);
        }
    },

    showCreateRoomModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h3>CRIAR SALA ONLINE</h3>
                    <button class="btn-close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>NOME DA SALA</label>
                        <input type="text" id="new-room-name" placeholder="Ex: Duelo de Gigantes" maxlength="20">
                    </div>
                    <div class="input-group">
                        <label>DIFICULDADE</label>
                        <select id="new-room-diff" class="online-select">
                            <option value="EASY">🟢 Fácil (0.5x)</option>
                            <option value="NORMAL" selected>🟡 Normal (1.0x)</option>
                            <option value="HARD">🔴 Difícil (1.5x)</option>
                        </select>
                    </div>
                    <button class="btn-primary btn-full" style="margin-top: 20px;" onclick="OnlineUI.handleCreateRoom()">CRIAR E ENTRAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async handleCreateRoom() {
        const nameInput = document.getElementById('new-room-name');
        const diffInput = document.getElementById('new-room-diff');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const diff = diffInput ? diffInput.value : 'NORMAL';

        if (!name) {
            showToast('Dê um nome para a sala!', 'error');
            return;
        }

        // Remover o modal antes de iniciar a criação para feedback imediato
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) modal.remove();

        try {
            await OnlineManager.createRoom(name, diff);
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            showToast('Falha ao criar sala. Tente novamente.', 'error');
        }
    },

    renderOpponentProgress(progress) {
        const grid = document.getElementById('opponent-mini-grid');
        if (!grid) return;
        
        // Só faz log e processa se houver progresso real (mais de 0 tentativas)
        if (!progress || !Array.isArray(progress) || progress.length === 0) {
            return;
        }

        const rows = grid.querySelectorAll('.mini-row');
        rows.forEach((row, rowIndex) => {
            const attempt = progress[rowIndex];
            const tiles = row.querySelectorAll('.mini-tile');
            
            if (attempt && attempt.result) {
                attempt.result.forEach((state, colIndex) => {
                    if (tiles[colIndex]) {
                        // Forçar a aplicação das classes IMEDIATAMENTE
                        tiles[colIndex].classList.remove('correct', 'present', 'absent');
                        tiles[colIndex].classList.add(state);
                        tiles[colIndex].style.backgroundColor = ''; 

                        // v1.1.0: Revelar letras se o jogador atual já terminou a partida
                        if (currentGame && currentGame.isFinished && attempt.word) {
                            tiles[colIndex].textContent = attempt.word[colIndex] || '';
                            tiles[colIndex].classList.add('revealed');
                        } else {
                            tiles[colIndex].textContent = '';
                            tiles[colIndex].classList.remove('revealed');
                        }
                    }
                });
            }
        });
    },

    showOnlineResultModal(isWinner, xp, coins, players) {
        // v1.1.1: Garantir que a notificação de espera seja removida
        if (typeof OnlineManager !== 'undefined') {
            OnlineManager.stopWaitingNotification();
        }

        // Remover qualquer modal anterior
        const oldModal = document.querySelector('.online-result-overlay');
        if (oldModal) oldModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active online-result-overlay';
        
        const myResult = players.find(p => p.user_id === currentUserSupabaseId);
        const opponent = players.find(p => p.user_id !== currentUserSupabaseId);

        // v1.1.0: Calcular tempo de cada um
        const getSeconds = (p) => {
            if (!p || !p.finished_at) return 9999;
            const start = new Date(p.joined_at).getTime();
            const end = new Date(p.finished_at).getTime();
            return Math.floor((end - start) / 1000);
        };

        const formatTime = (p) => {
            const diff = getSeconds(p);
            if (diff === 9999) return '--:--';
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // v1.1.0: Calcular diferença de tempo para o subtexto com todas as situações
        let defeatSubtext = isWinner ? 'Você superou seu oponente!' : 'Não foi dessa vez...';
        if (opponent && opponent.users?.username) {
            const myTime = getSeconds(myResult);
            const oppTime = getSeconds(opponent);
            const timeDiff = Math.abs(myTime - oppTime);
            const oppName = opponent.users.username;
            
            // Se ambos acertaram, mostrar quem foi mais rápido
            if (myResult.won && opponent.won) {
                if (oppTime < myTime) {
                    defeatSubtext = `${oppName} acertou a palavra ${timeDiff}s mais rápido que você.`;
                } else {
                    defeatSubtext = `Você acertou a palavra ${timeDiff}s mais rápido que ${oppName}.`;
                }
            }
            // Se só o oponente acertou
            else if (!myResult.won && opponent.won) {
                defeatSubtext = `${oppName} acertou a palavra e você não conseguiu.`;
            }
            // Se só você acertou
            else if (myResult.won && !opponent.won) {
                defeatSubtext = `Você acertou a palavra e ${oppName} não conseguiu.`;
            }
            // Se ninguém acertou
            else if (!myResult.won && !opponent.won) {
                defeatSubtext = `Nenhum de vocês conseguiu acertar a palavra.`;
            }
        }

        overlay.innerHTML = `
            <div class="modal-card result-card ${isWinner ? 'winner' : 'loser'}" style="max-width: 450px; width: 90%; animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div class="result-header">
                    <div class="result-emoji-wrapper">
                        <span class="result-emoji">${isWinner ? '🏆' : '💀'}</span>
                    </div>
                    <h2 style="font-size: 2rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">${isWinner ? 'VITÓRIA!' : 'DERROTA'}</h2>
                    <p class="result-subtitle" style="font-size: 0.9rem; opacity: 0.8; line-height: 1.4;">${defeatSubtext}</p>
                </div>

                <div class="result-comparison" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; margin: 25px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div class="result-user" style="flex: 1; text-align: center;">
                        <div class="res-name" style="font-size: 0.65rem; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 5px;">VOCÊ</div>
                        <div class="res-status ${myResult.won ? 'win' : 'fail'}" style="font-size: 1rem; font-weight: 800;">${myResult.won ? 'ACERTOU' : 'ERROU'}</div>
                        <div class="res-time" style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">⏱️ ${formatTime(myResult)}</div>
                    </div>
                    
                    <div class="result-vs" style="font-weight: 900; font-size: 1.2rem; color: var(--accent); opacity: 0.4; padding: 0 15px;">VS</div>
                    
                    <div class="result-user" style="flex: 1; text-align: center;">
                        <div class="res-name" style="font-size: 0.65rem; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 5px;">${opponent?.users?.username || 'OPONENTE'}</div>
                        <div class="res-status ${opponent?.won ? 'win' : 'fail'}" style="font-size: 1rem; font-weight: 800;">${opponent?.won ? 'ACERTOU' : 'ERROU'}</div>
                        <div class="res-time" style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">⏱️ ${formatTime(opponent)}</div>
                    </div>
                </div>

                <div class="result-rewards" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                    <div class="reward-item" style="background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <span class="reward-icon" style="font-size: 1.2rem;">✨</span>
                        <span class="reward-label" style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">XP GANHO</span>
                        <span class="reward-val" style="font-weight: 800; color: var(--correct);">+${xp}</span>
                    </div>
                    <div class="reward-item" style="background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <span class="reward-icon" style="font-size: 1.2rem;">💰</span>
                        <span class="reward-label" style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">MOEDAS</span>
                        <span class="reward-val" style="font-weight: 800; color: #fbbf24;">+${coins}</span>
                    </div>
                </div>

                <div class="result-actions" style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn-primary btn-full" onclick="OnlineManager.requestRematch()" style="padding: 16px; font-size: 1rem; box-shadow: 0 4px 15px var(--accent-glow);">SOLICITAR REVANCHE</button>
                    <button class="btn-ghost btn-full" onclick="location.reload()" style="padding: 12px; font-size: 0.85rem; border: 1px solid var(--border); background: rgba(255,255,255,0.02);">VOLTAR AO MENU</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        playSound(isWinner ? 'victory' : 'lose');
    }
};

if (typeof window !== 'undefined') {
    window.OnlineUI = OnlineUI;
}
