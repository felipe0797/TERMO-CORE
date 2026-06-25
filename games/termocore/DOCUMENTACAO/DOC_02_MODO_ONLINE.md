# TermoCore Modo Online - Documentação Técnica

**Data:** 22 de Junho de 2026  
**Versão:** 1.0.9+  
**Desenvolvido por:** Manus AI  

---

## 📋 Visão Geral

O **Modo Online** permite que dois jogadores compitam em tempo real em uma partida de Termo. Utiliza Supabase Realtime para sincronização instantânea de progresso e status.

---

## 🏗️ Arquitetura

### Arquivos Principais
- `online_mode/online_manager.js` - Lógica de salas, matchmaking, Realtime
- `online_mode/online_ui.js` - Interface do lobby e telas de duelo
- Tabelas Supabase: `online_rooms`, `room_players`

### Stack
- **Realtime:** Supabase Realtime (WebSocket)
- **Fallback:** Polling a cada 2 segundos
- **Persistência:** PostgreSQL (Supabase)

---

## 🎮 Fluxo de Partida

### 1. Criação de Sala
```
Jogador A → Clica "CRIAR SALA"
         → Modal com nome + dificuldade
         → Insert em online_rooms (status: WAITING)
         → Insert em room_players (status: READY)
         → Renderiza lobby aguardando
```

### 2. Entrada de Jogador
```
Jogador B → Clica "ENTRAR" em sala
         → Verifica se é criador
         → Insert em room_players (status: WAITING se convidado)
         → Renderiza lobby com botão "ESTOU PRONTO"
```

### 3. Preparação
```
Jogador B → Clica "ESTOU PRONTO"
         → Update room_players (status: READY)
         → UI mostra "Aguardando oponente..."
```

### 4. Início da Partida
```
Jogador A (criador) → Clica "INICIAR PARTIDA"
                   → Verifica se todos estão READY
                   → Sorteia palavra secreta
                   → Update online_rooms (status: PLAYING, secret_word)
                   → Ambos recebem via Realtime
                   → Renderiza grid de jogo
```

### 5. Jogo
```
Ambos jogam simultaneamente
Progresso sincronizado via Realtime
Cada palpite atualiza room_players.progress
```

### 6. Resultado
```
Primeiro a acertar → Vence
Update room_players (status: FINISHED, won: true/false)
Mostra card de resultado
Opção de Revanche
```

### 7. Revanche
```
Ambos clicam "REVANCHE"
Update room_players (status: READY)
Update online_rooms (status: WAITING)
Volta ao passo 4
```

---

## 📊 Modelo de Dados

### Tabela: online_rooms

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | VARCHAR | Nome da sala |
| `created_by` | UUID | ID do criador |
| `difficulty` | VARCHAR | EASY, NORMAL, HARD |
| `status` | VARCHAR | WAITING, PLAYING, FINISHED |
| `secret_word` | VARCHAR(7) | Palavra secreta (null até iniciar) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

### Tabela: room_players

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `room_id` | UUID | FK para online_rooms |
| `user_id` | UUID | FK para users |
| `status` | VARCHAR | WAITING, READY, PLAYING, FINISHED |
| `progress` | JSONB | Array de tentativas |
| `won` | BOOLEAN | Verdadeiro se venceu |
| `finished_at` | TIMESTAMP | Quando terminou |
| `joined_at` | TIMESTAMP | Quando entrou |

### Estrutura de progress (JSONB)
```json
[
  {
    "word": "TERMO",
    "result": ["G", "Y", "C", "C", "C"]
  },
  {
    "word": "TESTA",
    "result": ["G", "Y", "Y", "C", "C"]
  }
]
```

---

## 🔄 Sincronização Realtime

### Subscrição
```javascript
// Ao entrar na sala
channel = client.channel(`room:${roomId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players' }, handlePlayerUpdate)
  .subscribe();
```

### Eventos Monitorados
- **INSERT:** Novo jogador entra
- **UPDATE:** Progresso, status, resultado
- **DELETE:** Jogador sai (se implementado)

### Fallback: Polling
Se Realtime falhar, polling a cada 2 segundos:
```javascript
setInterval(() => {
  fetchRoomState();
  fetchPlayersState();
}, 2000);
```

---

## 🚀 Fluxo de Código

### OnlineManager.createRoom()
1. Insert em online_rooms
2. Chama joinRoom()

### OnlineManager.joinRoom()
1. Verifica se jogador já está na sala
2. **v1.1.1:** Detecta se é criador
3. Define status inicial (READY se criador, WAITING se convidado)
4. Insert em room_players
5. Renderiza lobby
6. Inicia polling

### OnlineUI.renderWaitingLobby()
1. Renderiza lista de jogadores
2. Mostra status de cada um
3. **v1.1.1:** Botão "ESTOU PRONTO" para convidados
4. Botão "INICIAR PARTIDA" apenas para criador (habilitado se todos READY)

### OnlineManager.requestStartGame()
1. Valida que todos estão READY
2. Sorteia palavra secreta
3. Update online_rooms (status: PLAYING, secret_word)
4. Ambos recebem via Realtime

### OnlineManager.startOnlineMatch()
1. Renderiza grid de jogo
2. Inicia sincronização de progresso
3. Monitora quando ambos terminam

---

## 🔐 Row Level Security (RLS)

### Policies

| Tabela | Policy | Condição |
|--------|--------|----------|
| `online_rooms` | SELECT | Todos podem ver (público) |
| `online_rooms` | INSERT | auth.uid() = created_by |
| `online_rooms` | UPDATE | auth.uid() = created_by |
| `online_rooms` | DELETE | auth.uid() = created_by |
| `room_players` | SELECT | Todos podem ver |
| `room_players` | INSERT | auth.uid() = user_id |
| `room_players` | UPDATE | auth.uid() = user_id |
| `room_players` | DELETE | auth.uid() = user_id |

---

## 🐛 Troubleshooting

### Problema: Sala não aparece na lista
- Verificar se status = 'WAITING'
- Verificar se RLS permite SELECT
- Limpar cache do navegador

### Problema: Realtime não sincroniza
- Verificar conexão WebSocket (DevTools > Network)
- Ativar polling manual
- Verificar se REPLICA IDENTITY FULL está ativado

### Problema: Jogador não consegue iniciar partida
- Verificar se todos estão com status = 'READY'
- Verificar se criador está com status = 'READY'
- Testar com novo navegador

### Problema: Progresso não sincroniza
- Verificar se update em room_players está funcionando
- Verificar se Realtime está ativo
- Ativar polling se Realtime falhar

---

## 🎯 Melhorias Futuras

- [ ] Sistema de ranking online
- [ ] Histórico de partidas
- [ ] Matchmaking automático (ELO)
- [ ] Salas privadas com senha
- [ ] Espectadores
- [ ] Chat em tempo real
- [ ] Recompensas de vitória online

---

**Documento criado por Manus AI - v1.1.1**
