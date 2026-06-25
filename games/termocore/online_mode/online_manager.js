/**
 * ONLINE MODE MANAGER
 * Gerenciamento de salas, matchmaking e Realtime Supabase
 * Versão 1.0.9
 */

const OnlineManager = {
    currentRoom: null,
    channel: null,
    opponentProgress: [], 
    pollingInterval: null,
    
    init() {
        console.log("🌐 OnlineManager inicializado");
    },
    
    async createRoom(roomName, difficulty = 'NORMAL') {
        const client = getSupabaseClient();
        if (!client || !currentUserSupabaseId) return;

        try {
            showToast('Criando sala...', 'info');
            const { data, error } = await client
                .from('online_rooms')
                .insert([{
                    name: roomName,
                    created_by: currentUserSupabaseId,
                    difficulty: difficulty,
                    status: 'WAITING'
                }])
                .select()
                .single();

            if (error) throw error;
            
            await this.joinRoom(data.id);
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            showToast('Erro ao criar sala', 'error');
        }
    },
    
    async joinRoom(roomId) {
        const client = getSupabaseClient();
        if (!client || !currentUserSupabaseId) return;

        try {
            // Verificar se já está na sala para evitar erro de chave duplicada
            const { data: existing } = await client
                .from('room_players')
                .select('*')
                .eq('room_id', roomId)
                .eq('user_id', currentUserSupabaseId)
                .single();

            // MELHORIA v1.1.1: Verificar se eh o criador da sala
            const { data: room } = await client
                .from('online_rooms')
                .select('created_by')
                .eq('id', roomId)
                .single();
            
            const isRoomCreator = room && room.created_by === currentUserSupabaseId;
            const initialStatus = isRoomCreator ? 'READY' : 'WAITING';

            if (!existing) {
                const { error } = await client
                    .from('room_players')
                    .insert([{
                        room_id: roomId,
                        user_id: currentUserSupabaseId,
                        status: initialStatus
                    }]);
                if (error) throw error;
            }
            
            this.currentRoom = roomId;
            this.subscribeToRoom(roomId);
            OnlineUI.renderWaitingLobby(roomId);

            // v1.1.6: Iniciar Polling de segurança no lobby para detectar saídas/entradas se o Realtime falhar
            this.startLobbyPolling(roomId);
        } catch (error) {
            console.error('Erro ao entrar na sala:', error);
            showToast('Erro ao entrar na sala', 'error');
        }
    },

    async setPlayerReady() {
        const client = getSupabaseClient();
        if (!client || !this.currentRoom || !currentUserSupabaseId) return;

        try {
            showToast('Marcando como pronto...', 'info');
            const { error } = await client
                .from('room_players')
                .update({ status: 'READY' })
                .eq('room_id', this.currentRoom)
                .eq('user_id', currentUserSupabaseId);

            if (error) throw error;
            showToast('Pronto! Aguardando o dono iniciar...', 'success');
            OnlineUI.updatePlayersList(this.currentRoom);
        } catch (error) {
            console.error('Erro ao marcar como pronto:', error);
            showToast('Erro ao marcar como pronto', 'error');
        }
    },

    async requestStartGame() {
        const client = getSupabaseClient();
        if (!client || !this.currentRoom) return;

        try {
            // MELHORIA v1.1.1: Validar que todos os jogadores estão READY
            const { data: players, error: playersError } = await client
                .from('room_players')
                .select('status')
                .eq('room_id', this.currentRoom);

            if (playersError) throw playersError;
            
            // Verificar se todos estão READY
            const allReady = players.every(p => p.status === 'READY');
            if (!allReady) {
                showToast('Aguardando todos os jogadores ficarem prontos!', 'warning');
                return;
            }

            if (players.length < 2) {
                showToast('Precisa de 2 jogadores para iniciar!', 'warning');
                return;
            }

            showToast('Iniciando partida...', 'info');
            
            // 1. Sortear palavra (mesma para ambos)
            const secretWord = getRandomWordByDifficulty(5); // Padrão 5 letras para 1v1
            
            // 2. Atualizar status da sala
            const { error } = await client
                .from('online_rooms')
                .update({ 
                    status: 'PLAYING',
                    secret_word: secretWord
                })
                .eq('id', this.currentRoom);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
            showToast('Erro ao iniciar jogo', 'error');
        }
    },
    
    async quickPlay() {
        const client = getSupabaseClient();
        if (!client) return;

        try {
            showToast('Buscando partida...', 'info');
            const { data, error } = await client
                .from('online_rooms')
                .select('*')
                .eq('status', 'WAITING')
                .limit(1)
                .single();

            if (data) {
                await this.joinRoom(data.id);
            } else {
                const username = await getUserUsername(currentUserSupabaseId);
                await this.createRoom(`Sala de ${username || 'Jogador'}`);
            }
        } catch (error) {
            // Se não achar sala, cria uma
            const username = await getUserUsername(currentUserSupabaseId);
            await this.createRoom(`Sala de ${username || 'Jogador'}`);
        }
    },

    subscribeToRoom(roomId) {
        console.log(`📡 [REALTIME] Tentando se inscrever na sala: ${roomId}`);
        const client = getSupabaseClient();
        this.channel = client.channel(`room:${roomId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'online_rooms', filter: `id=eq.${roomId}` }, payload => {
                console.log('Mudança na sala:', payload);
                if (payload.new.status === 'PLAYING') {
                    this.startOnlineMatch(payload.new);
                } else if (payload.new.status === 'WAITING') {
                    // v1.1.0: A sala resetou para WAITING. 
                    // NÃO voltamos automaticamente para não interromper a visão do card de resultados do oponente.
                    console.log('🔄 [REVANCHE] A sala agora está em modo de espera (WAITING)');
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` }, payload => {
                console.log('Mudança nos jogadores (Realtime):', payload.eventType, payload);
                // v1.1.5: Forçar atualização em qualquer mudança (INSERT, UPDATE, DELETE)
                OnlineUI.updatePlayersList(roomId);
            })
            .on('broadcast', { event: 'player_left' }, payload => {
                console.log("📡 [REALTIME] Jogador saiu via Broadcast:", payload);
                // v1.1.7: Se estivermos em jogo e o oponente sair, encerrar a partida
                if (gameInProgress && currentGame && currentGame.mode === 'ONLINE_1V1') {
                    this.handleOpponentDisconnect();
                } else {
                    OnlineUI.updatePlayersList(roomId);
                }
            })
            .on('broadcast', { event: 'rematch_requested' }, payload => {
                console.log("📡 [REALTIME] Revanche solicitada via Broadcast:", payload);
                if (payload.user_id !== currentUserSupabaseId) {
                    console.log(`🔄 [REVANCHE] ${payload.username} solicitou revanche`);
                    
                    // v1.1.0: Notificação interativa de revanche
                    this.showRematchNotification(payload.username, payload.room_id);
                }
            })
            .on('broadcast', { event: 'progress' }, payload => {
                console.log("📡 [REALTIME] Broadcast recebido:", payload);
                if (payload.user_id !== currentUserSupabaseId) {
                    console.log("📡 [REALTIME] Progresso do oponente via Broadcast:", payload.progress);
                    this.opponentProgress = payload.progress;
                    OnlineUI.renderOpponentProgress(payload.progress);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'room_players' }, payload => {
                // Filtro manual para garantir que pegamos a mudança correta
                if (payload.new.room_id === roomId && payload.new.user_id !== currentUserSupabaseId) {
                    const newProgress = payload.new.progress || [];
                    console.log("💾 Recebido progresso via Banco:", newProgress);
                    this.opponentProgress = newProgress;
                    OnlineUI.renderOpponentProgress(this.opponentProgress);
                }
            })
            .on('broadcast', { event: 'match_finished' }, payload => {
                if (payload.user_id !== currentUserSupabaseId) {
                    // v1.1.2: Se o oponente terminou e eu ainda estou jogando, mostrar banner de pressão
                    if (gameInProgress && currentGame && !currentGame.isFinished) {
                        this.startWaitingNotification('opponent_finished');
                    }
                    this.checkMatchEnd();
                }
            })
            .subscribe();
    },

    async startOnlineMatch(roomData) {
        if (gameInProgress) return;
        
        showToast('🚀 Partida Iniciada!', 'success');
        this.opponentProgress = []; 
        
        // 1. Configurar o jogo atual com os dados da sala
        currentGame = {
            mode: 'ONLINE_1V1',
            modeName: 'DUELO ONLINE',
            wordLength: 5,
            maxAttempts: 6,
            currentRow: 0,
            currentInputArr: new Array(5).fill(''),
            selectedFieldIndex: 0,
            words: [roomData.secret_word],
            attempts: [new Array(6).fill(null)],
            score: 0,
            isAnimating: false,
            room_id: roomData.id,
            difficulty: roomData.difficulty,
            startTime: Date.now(),
            timeLimit: 180, // 3 minutos
            timeRemaining: 180,
            usedWordsMemory: new Set()
        };

        gameInProgress = true;
        showMainTab('game');
        renderGame();
        
        // Iniciar Timer do Jogo
        this.startMatchTimer();
        
        // Iniciar busca ativa de progresso (Polling) como backup do Realtime
        this.startPolling();
        
        // 2. Atualizar status do jogador para PLAYING
        const client = getSupabaseClient();
        await client
            .from('room_players')
            .update({ status: 'PLAYING' })
            .eq('room_id', roomData.id)
            .eq('user_id', currentUserSupabaseId);
    },
    
    startPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.fetchOpponentProgress(); // Busca imediata
        this.pollingInterval = setInterval(() => {
            if (gameInProgress && currentGame && currentGame.mode === 'ONLINE_1V1') {
                this.fetchOpponentProgress();
            } else {
                this.stopPolling();
            }
        }, 1500); // A cada 1.5 segundos (mais rápido)
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    startMatchTimer() {
        if (this.matchTimer) clearInterval(this.matchTimer);
        this.matchTimer = setInterval(() => {
            if (gameInProgress && currentGame && currentGame.mode === 'ONLINE_1V1') {
                const elapsed = Math.floor((Date.now() - currentGame.startTime) / 1000);
                currentGame.timeRemaining = Math.max(0, currentGame.timeLimit - elapsed);
                
                // Atualizar UI do Timer no topo (se existir)
                const timerEl = document.querySelector('[data-time]');
                if (timerEl) {
                    const mins = Math.floor(currentGame.timeRemaining / 60);
                    const secs = currentGame.timeRemaining % 60;
                    timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                    
                    if (currentGame.timeRemaining <= 30) {
                        timerEl.style.color = 'var(--error)';
                        timerEl.classList.add('pulse');
                    }
                }

                // v1.1.1: Atualizar o Banner Persistente de espera (se estiver ativo)
                const bannerTimer = document.getElementById('online-waiting-timer');
                if (bannerTimer) {
                    const mins = Math.floor(currentGame.timeRemaining / 60);
                    const secs = currentGame.timeRemaining % 60;
                    bannerTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }

                if (currentGame.timeRemaining <= 0 && !currentGame.isFinished) {
                    this.stopMatchTimer();
                    this.finishMatch(false); // Derrota por tempo
                } else if (currentGame.timeRemaining <= 0 && currentGame.isFinished) {
                    this.stopMatchTimer();
                }
            } else {
                this.stopMatchTimer();
            }
        }, 1000);
    },

    stopMatchTimer() {
        if (this.matchTimer) {
            clearInterval(this.matchTimer);
            this.matchTimer = null;
        }
    },
    
    async fetchOpponentProgress() {
        if (!this.currentRoom || !currentUserSupabaseId) return;
        const client = getSupabaseClient();
        
        try {
            const { data, error } = await client
                .from('room_players')
                .select('user_id, progress')
                .eq('room_id', this.currentRoom)
                .neq('user_id', currentUserSupabaseId);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                const newProgress = data[0].progress || [];
                // Para depuração: sempre atualizar o objeto de memória, mas renderizar apenas se houver algo
                this.opponentProgress = newProgress;
                if (newProgress.length > 0) {
                    console.log("📥 Atualizando progresso do oponente (Polling):", newProgress);
                    OnlineUI.renderOpponentProgress(newProgress);
                }
            }
        } catch (e) {
            console.error("Erro ao buscar progresso do oponente:", e);
        }
    },

    async sendProgress(attempt, result) {
        if (!this.currentRoom || !currentUserSupabaseId || !currentGame) return;
        
        const client = getSupabaseClient();
        
        // Reconstrói o progresso atual do jogador baseado nos attempts reais
        const currentProgress = [];
        for (let i = 0; i < currentGame.currentRow; i++) {
            const wordArr = currentGame.attempts[0][i];
            if (wordArr && Array.isArray(wordArr)) {
                const wordStr = wordArr.join('');
                // Recalcula o estado de cada letra para garantir precisão
                const res = wordArr.map((l, idx) => getLetterState(l, idx, currentGame.words[0], wordArr));
                // v1.1.0: Inclui a palavra real para revelação ao oponente após finalizar
                currentProgress.push({ word: wordStr, result: res });
            }
        }

        console.log("📤 [DUELO] Enviando progresso atualizado:", currentProgress);

        try {
            // 1. Atualizar banco de dados
            const { error } = await client
                .from('room_players')
                .update({ progress: currentProgress })
                .eq('room_id', this.currentRoom)
                .eq('user_id', currentUserSupabaseId);
                
            if (error) {
                console.error("❌ [DUELO] Erro ao salvar no banco:", error);
            } else {
                console.log("✅ [DUELO] Banco atualizado com sucesso");
            }
                
            // 2. Broadcast via Realtime (Canal de alta velocidade)
            if (this.channel) {
                this.channel.send({
                    type: 'broadcast',
                    event: 'progress',
                    payload: { 
                        user_id: currentUserSupabaseId, 
                        progress: currentProgress 
                    }
                }).then(resp => {
                    console.log("📡 [DUELO] Broadcast enviado:", resp);
                });
            }
        } catch (e) {
            console.error("❌ [DUELO] Falha crítica no envio:", e);
        }
    },

    async finishMatch(won) {
        if (!this.currentRoom || !currentUserSupabaseId || currentGame.isFinished) return;
        currentGame.isFinished = true; // Evitar chamadas duplicadas
        
        const timeUsed = Math.floor((Date.now() - currentGame.startTime) / 1000);
        const client = getSupabaseClient();
        
        try {
            // 1. Salvar resultado no banco
            await client
                .from('room_players')
                .update({ 
                    status: 'FINISHED',
                    won: won,
                    finished_at: new Date().toISOString()
                })
                .eq('room_id', this.currentRoom)
                .eq('user_id', currentUserSupabaseId);

            // 2. Notificar oponente
            this.channel.send({
                type: 'broadcast',
                event: 'match_finished',
                payload: { 
                    user_id: currentUserSupabaseId, 
                    username: await getUserUsername(currentUserSupabaseId),
                    won: won, 
                    time: timeUsed, 
                    attempts: currentGame.currentRow 
                }
            });

            // Parar busca ativa
            this.stopPolling();

            // 3. Aguardar um pouco para garantir que ambos terminaram ou mostrar resultado parcial
            this.checkMatchEnd(won, timeUsed);
        } catch (error) {
            console.error("Erro ao finalizar partida:", error);
        }
    },

    async checkMatchEnd(myWon, myTime) {
        const client = getSupabaseClient();
        const { data: players } = await client
            .from('room_players')
            .select('user_id, status, won, finished_at, joined_at, users(username)')
            .eq('room_id', this.currentRoom);

        const allFinished = players.every(p => p.status === 'FINISHED');
        
        if (allFinished) {
            // Calcular quem ganhou de verdade (comparativo)
            const p1 = players[0];
            const p2 = players[1];
            
            let winnerId = null;
            if (p1.won && !p2.won) winnerId = p1.user_id;
            else if (!p1.won && p2.won) winnerId = p2.user_id;
            else if (p1.won && p2.won) {
                winnerId = p1.finished_at < p2.finished_at ? p1.user_id : p2.user_id;
            }

            const isWinner = winnerId === currentUserSupabaseId;
            const xpGain = isWinner ? 100 : 20;
            const coinsGain = isWinner ? 50 : 10;

            userStats.xp += xpGain;
            userStats.coins += coinsGain;
            saveUserStats();

            OnlineUI.showOnlineResultModal(isWinner, xpGain, coinsGain, players);
        } else {
            // v1.1.2: Lógica diferenciada de notificação
            const me = players.find(p => p.user_id === currentUserSupabaseId);
            const opponent = players.find(p => p.user_id !== currentUserSupabaseId);

            if (me.status === 'FINISHED') {
                // Eu terminei, aguardo o oponente
                this.startWaitingNotification('waiting_opponent');
            } else if (opponent.status === 'FINISHED') {
                // Oponente terminou, eu corro!
                this.startWaitingNotification('opponent_finished');
            }
        }
    },

    startWaitingNotification(type = 'waiting_opponent') {
        // v1.1.2: Criar Banner Persistente com texto diferenciado
        let banner = document.getElementById('online-waiting-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'online-waiting-banner';
            banner.className = 'online-waiting-banner';
            document.body.appendChild(banner);
        }

        const text = type === 'waiting_opponent' 
            ? 'Aguardando oponente finalizar...' 
            : '⚠️ Oponente já finalizou! Corra!';
        
        banner.innerHTML = `
            <div class="spinner"></div>
            <div class="text">${text}</div>
            <div id="online-waiting-timer" class="timer">--:--</div>
        `;
        
        if (type === 'opponent_finished') {
            banner.style.border = '1px solid var(--error)';
            banner.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.3)';
        }
    },

    stopWaitingNotification() {
        const banner = document.getElementById('online-waiting-banner');
        if (banner) banner.remove();
    },

    async leaveRoom() {
        // v1.1.6: Reforço na limpeza e notificação de saída
        const roomId = this.currentRoom;
        const userId = currentUserSupabaseId;

        console.log("🚪 Iniciando processo de saída da sala:", roomId);

        // Parar polling do lobby imediatamente
        this.stopLobbyPolling();

        try {
            const client = getSupabaseClient();
            
            // v1.1.5: Enviar broadcast de saída ANTES de deletar e desinscrever
            if (this.channel && roomId) {
                await this.channel.send({
                    type: 'broadcast',
                    event: 'player_left',
                    payload: { user_id: userId, room_id: roomId }
                });
                console.log("📡 Broadcast de saída enviado");
                // Pequena pausa para garantir o envio do broadcast antes da desconexão
                await new Promise(r => setTimeout(r, 100));
            }

            if (client && roomId && userId) {
                // 1. Remover o jogador da tabela room_players IMEDIATAMENTE no banco
                const { error } = await client
                    .from('room_players')
                    .delete()
                    .eq('room_id', roomId)
                    .eq('user_id', userId);

                if (error) {
                    console.error("❌ Erro ao deletar jogador do banco:", error.message);
                } else {
                    console.log("✅ Jogador removido do banco.");
                    
                    // v1.1.7: Verificar se a sala ficou vazia e deletá-la se necessário
                    const { data: remainingPlayers } = await client
                        .from('room_players')
                        .select('id')
                        .eq('room_id', roomId);
                    
                    if (!remainingPlayers || remainingPlayers.length === 0) {
                        console.log("🧹 Sala vazia detectada. Deletando sala:", roomId);
                        // Tentamos deletar. Se falhar por RLS, o ideal seria uma RPC,
                        // mas vamos tentar diretamente.
                        const { error: deleteRoomError } = await client.from('online_rooms').delete().eq('id', roomId);
                        if (deleteRoomError) {
                            console.error("❌ Erro RLS ao deletar sala vazia:", deleteRoomError.message);
                            // Fallback: se não pode deletar, pelo menos marca como finalizada para não aparecer na lista
                            await client.from('online_rooms').update({ status: 'FINISHED' }).eq('id', roomId);
                        }
                    }
                }
            }

            // 2. Desinscrever do canal Realtime
            if (this.channel) {
                console.log("📡 Desinscrevendo do canal Realtime...");
                await this.channel.unsubscribe();
                this.channel = null;
            }

            // 4. Limpar estado local (Sempre executado, mesmo se o banco falhar)
            this.currentRoom = null;
            this.opponentProgress = [];
            this.stopPolling();
            this.stopMatchTimer();
            this.stopWaitingNotification();
            
            // Se estiver em jogo, resetar flags globais
            if (gameInProgress) {
                gameInProgress = false;
                currentGame = null;
            }

            console.log("✅ Saída da sala concluída localmente.");
        } catch (error) {
            console.error("❌ Erro inesperado ao sair da sala:", error);
            this.currentRoom = null;
            gameInProgress = false;
            currentGame = null;
        }
    },

    // v1.1.6: Polling de segurança para o Lobby
    lobbyPollingInterval: null,
    startLobbyPolling(roomId) {
        this.stopLobbyPolling();
        console.log("🔄 Iniciando Polling de segurança do Lobby");
        this.lobbyPollingInterval = setInterval(() => {
            if (this.currentRoom === roomId && !gameInProgress) {
                OnlineUI.updatePlayersList(roomId);
            } else {
                this.stopLobbyPolling();
            }
        }, 3000); // Verifica a cada 3 segundos
    },

    stopLobbyPolling() {
        if (this.lobbyPollingInterval) {
            clearInterval(this.lobbyPollingInterval);
            this.lobbyPollingInterval = null;
            console.log("🛑 Polling do Lobby parado");
        }
    },

    // v1.1.7: Lógica para lidar com abandono do oponente
    async handleOpponentDisconnect() {
        if (!gameInProgress || !currentGame) return;

        console.warn("⚠️ Oponente abandonou a partida!");
        
        // Parar timers e polling
        this.stopMatchTimer();
        this.stopPolling();
        this.stopWaitingNotification();

        // Mostrar aviso e voltar ao menu
        showToast('O oponente abandonou a partida. Duelo encerrado.', 'error');
        
        // Sair da sala (remove o jogador atual do banco e deleta a sala se ficar vazia)
        const roomId = this.currentRoom;
        if (roomId) {
            await this.leaveRoom();
        }
        
        // Pequeno delay para o jogador ler o toast
        setTimeout(() => {
            gameInProgress = false;
            currentGame = null;
            showMainTab('online');
            OnlineUI.renderLobby();
        }, 3000);
    },

    // v1.1.0: Mostrar notificação informativa de revanche para o oponente
    showRematchNotification(opponentUsername, roomId) {
        // Remover notificação anterior se existir
        const existingNotif = document.getElementById('rematch-notification');
        if (existingNotif) existingNotif.remove();

        const notif = document.createElement('div');
        notif.id = 'rematch-notification';
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideDown 0.3s ease-out;
            max-width: 90vw;
            font-family: 'Inter', sans-serif;
            border: 1px solid rgba(255,255,255,0.2);
        `;

        notif.innerHTML = `
            <div style="font-size: 24px;">🔄</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 15px;">REVANCHE SOLICITADA</div>
                <div style="font-size: 13px; opacity: 0.9;"><b>${opponentUsername}</b> já voltou para a sala e está te esperando!</div>
            </div>
        `;

        document.body.appendChild(notif);

        // Auto-remover após 6 segundos
        setTimeout(() => {
            if (notif.parentElement) {
                notif.style.opacity = '0';
                notif.style.transform = 'translateX(-50%) translateY(-20px)';
                notif.style.transition = 'all 0.5s ease';
                setTimeout(() => notif.remove(), 500);
            }
        }, 6000);
    },

    // v1.1.0: Lógica de Revanche - Corrigida para garantir que o jogador volte para a sala
    async requestRematch() {
        const client = getSupabaseClient();
        if (!client || !this.currentRoom) return;

        try {
            console.log('🔄 [REVANCHE] Jogador solicitou revanche');
            showToast('Solicitando revanche...', 'info');

            // 1. Resetar o status do jogador atual para READY e limpar progresso
            const { error: updatePlayerError } = await client
                .from('room_players')
                .update({ 
                    status: 'READY',
                    progress: [],
                    won: false,
                    finished_at: null
                })
                .eq('room_id', this.currentRoom)
                .eq('user_id', currentUserSupabaseId);

            if (updatePlayerError) {
                console.error('❌ Erro ao atualizar status do jogador:', updatePlayerError);
                throw updatePlayerError;
            }
            console.log('✅ Status do jogador resetado para READY');

            // 2. SEMPRE resetar o status da sala para WAITING (não apenas se for dono)
            // Isso garante que a sala volte ao estado de espera para revanche
            const { error: updateRoomError } = await client
                .from('online_rooms')
                .update({ 
                    status: 'WAITING',
                    secret_word: null 
                })
                .eq('id', this.currentRoom);

            if (updateRoomError) {
                console.error('❌ Erro ao resetar sala para WAITING:', updateRoomError);
                // Não falhar completamente, continuar mesmo se houver erro aqui
            } else {
                console.log('✅ Sala resetada para WAITING');
            }

            // 3. Notificar oponente via Broadcast
            if (this.channel) {
                const username = await getUserUsername(currentUserSupabaseId);
                console.log('📡 [REVANCHE] Enviando broadcast de revanche para oponente');
                await this.channel.send({
                    type: 'broadcast',
                    event: 'rematch_requested',
                    payload: { 
                        user_id: currentUserSupabaseId,
                        username: username,
                        room_id: this.currentRoom
                    }
                });
            }

            // 4. UI Local: Remover modal de resultado e voltar ao lobby de espera
            const resultModal = document.querySelector('.online-result-overlay');
            if (resultModal) resultModal.remove();
            
            gameInProgress = false;
            currentGame = null;
            
            console.log('🔄 [REVANCHE] Voltando para o lobby de espera');
            if (typeof forceShowMainTab === 'function') {
                forceShowMainTab('online');
            }
            OnlineUI.renderWaitingLobby(this.currentRoom);
            this.startLobbyPolling(this.currentRoom);
            
            showToast('✅ Revanche solicitada! Aguardando oponente...', 'success');

        } catch (error) {
            console.error('❌ Erro ao solicitar revanche:', error);
            showToast('Erro ao solicitar revanche. Tente novamente.', 'error');
        }
    }
};

// Adicionar estilos CSS para a notificacao de revanche
if (typeof document !== 'undefined' && !document.getElementById('rematch-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'rematch-notification-styles';
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        #rematch-notification button:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
    window.OnlineManager = OnlineManager;
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof OnlineManager !== 'undefined' && OnlineManager.init) {
        OnlineManager.init();
    }
});

// Limpar sala se o usuário fechar a aba ou recarregar a página
window.addEventListener('beforeunload', () => {
    if (typeof OnlineManager !== 'undefined' && OnlineManager.currentRoom) {
        // Tenta remover o jogador da sala (pode não completar devido ao fechamento, mas tentamos)
        OnlineManager.leaveRoom();
    }
});
