# TermoCore - Dicionário de Dados (Supabase)

**Data:** 22 de Junho de 2026  
**Versão:** 1.1.1  
**Desenvolvido por:** Manus AI  

---

## 📋 Visão Geral

Este documento descreve todas as tabelas do banco de dados PostgreSQL (Supabase) do TermoCore, seus campos, tipos, restrições e políticas de segurança.

---

## 🔐 Row Level Security (RLS)

Todas as tabelas possuem RLS ativado. Políticas garantem que:
- Usuários só veem seus próprios dados
- Dados públicos (ranking) são visíveis para todos
- Apenas o Supabase Admin pode atualizar dados sensíveis

---

## 📊 Tabelas

### 1. users

Perfil do usuário autenticado.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de login |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Nome de usuário |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Última atualização |

**Índices:**
- PK em `id`
- UNIQUE em `email`
- UNIQUE em `username`

**RLS Policies:**
- SELECT: Usuários podem ler seu próprio perfil
- UPDATE: Usuários podem atualizar seu próprio perfil

---

### 2. game_stats

Estatísticas de jogo do usuário.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | UUID | gen_random_uuid() | Identificador único |
| `user_id` | UUID | - | FK para users (ON DELETE CASCADE) |
| `xp` | INTEGER | 0 | Experiência total |
| `coins` | INTEGER | 0 | Moedas acumuladas |
| `total_games` | INTEGER | 0 | Total de partidas jogadas |
| `win_streak` | INTEGER | 0 | Sequência de vitórias atual |
| `five_letters_wins` | INTEGER | 0 | Vitórias em 5 Letras |
| `five_letters_losses` | INTEGER | 0 | Derrotas em 5 Letras |
| `perfect_games_5l` | INTEGER | 0 | Partidas perfeitas (sem erros) |
| `seven_letters_wins` | INTEGER | 0 | Vitórias em 7 Letras |
| `seven_letters_losses` | INTEGER | 0 | Derrotas em 7 Letras |
| `perfect_games_7l` | INTEGER | 0 | Partidas perfeitas (sem erros) |
| `survival_wins` | INTEGER | 0 | Vitórias em Sobrevivência |
| `survival_losses` | INTEGER | 0 | Derrotas em Sobrevivência |
| `best_survival_round` | INTEGER | 0 | Melhor rodada em Sobrevivência |
| `survival_lives_bought` | INTEGER | 0 | Vidas compradas total |
| `avalanche_wins` | INTEGER | 0 | Vitórias em Avalanche |
| `avalanche_losses` | INTEGER | 0 | Derrotas em Avalanche |
| `best_avalanche_phase` | INTEGER | 0 | Melhor fase em Avalanche |
| `spin_tickets` | INTEGER | 0 | Tickets da roleta disponíveis |
| `last_daily_ticket` | TIMESTAMP | NULL | Data do último ticket diário |
| `max_win_streak` | INTEGER | 0 | Maior sequência de vitórias |
| `best_survival_score` | INTEGER | 0 | Melhor pontuação em Sobrevivência |
| `best_avalanche_score` | INTEGER | 0 | Melhor pontuação em Avalanche |
| `active_cosmetics` | JSONB | {} | Cosméticos ativos (moldura, olhos, etc) |
| `avatarCategoryPurchases` | JSONB | {} | Contador de compras por categoria |
| `activeTheme` | VARCHAR | 'theme_default' | Tema ativo |
| `activeAvatar` | VARCHAR | NULL | Avatar ativo |
| `activeAvatarVariant` | VARCHAR | NULL | Variante de avatar ativa |
| `ownedItems` | JSONB | [] | Array de IDs de itens possuídos |
| `created_at` | TIMESTAMP | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | CURRENT_TIMESTAMP | Última atualização |

**Restrições:**
- UNIQUE(user_id) - Um registro por usuário

**Índices:**
- PK em `id`
- FK em `user_id`

**RLS Policies:**
- SELECT: Usuários leem suas próprias stats
- INSERT: Usuários inserem suas próprias stats
- UPDATE: Usuários atualizam suas próprias stats

---

### 3. journey_progress

Progresso do Modo Jornada.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | UUID | gen_random_uuid() | Identificador único |
| `user_id` | UUID | - | FK para users (ON DELETE CASCADE) |
| `journey_id` | VARCHAR(50) | - | ID da jornada (ex: 'jornada_1') |
| `current_phase` | INTEGER | 1 | Fase atual |
| `intro_seen` | BOOLEAN | FALSE | Se viu intro |
| `stars` | JSONB | {} | Estrelas por fase (ex: {"fase_1": 3}) |
| `completed_phases` | JSONB | [] | Array de fases completas |
| `claimed_chests` | JSONB | {} | Baús já resgatados |
| `created_at` | TIMESTAMP | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | CURRENT_TIMESTAMP | Última atualização |

**Restrições:**
- UNIQUE(user_id, journey_id) - Um progresso por jornada por usuário

**RLS Policies:**
- SELECT: Usuários leem seu próprio progresso
- INSERT: Usuários inserem seu próprio progresso
- UPDATE: Usuários atualizam seu próprio progresso

---

### 4. achievements

Troféus desbloqueados.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK para users (ON DELETE CASCADE) | ID do usuário |
| `achievement_id` | VARCHAR(100) | NOT NULL | ID do troféu (ex: 'first_win') |
| `unlocked_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de desbloqueio |

**Restrições:**
- UNIQUE(user_id, achievement_id) - Um troféu por usuário

**RLS Policies:**
- SELECT: Usuários leem seus troféus
- INSERT: Usuários inserem seus troféus

---

### 5. shop_items

Itens cosméticos comprados.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK para users (ON DELETE CASCADE) | ID do usuário |
| `item_id` | VARCHAR(100) | NOT NULL | ID do item (ex: 'theme_neon') |
| `purchased_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de compra |
| `is_active` | BOOLEAN | FALSE | Se está ativo |

**Restrições:**
- UNIQUE(user_id, item_id) - Um item por usuário

**RLS Policies:**
- SELECT: Usuários leem seus itens
- INSERT: Usuários inserem seus itens
- UPDATE: Usuários atualizam seus itens

---

### 6. online_rooms

Salas de jogo online.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | UUID | gen_random_uuid() | Identificador único |
| `name` | VARCHAR | - | Nome da sala |
| `created_by` | UUID | - | FK para users (criador) |
| `difficulty` | VARCHAR | 'NORMAL' | EASY, NORMAL, HARD |
| `status` | VARCHAR | 'WAITING' | WAITING, PLAYING, FINISHED |
| `secret_word` | VARCHAR(7) | NULL | Palavra secreta (null até iniciar) |
| `created_at` | TIMESTAMP | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | CURRENT_TIMESTAMP | Última atualização |

**Realtime:** Habilitado para sincronização em tempo real

**RLS Policies:**
- SELECT: Todos podem ver salas
- INSERT: Usuários autenticados podem criar
- UPDATE: Apenas criador pode atualizar
- DELETE: Apenas criador pode deletar

---

### 7. room_players

Jogadores dentro de salas.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | UUID | gen_random_uuid() | Identificador único |
| `room_id` | UUID | - | FK para online_rooms (ON DELETE CASCADE) |
| `user_id` | UUID | - | FK para users |
| `status` | VARCHAR | 'READY' | WAITING, READY, PLAYING, FINISHED |
| `progress` | JSONB | [] | Array de tentativas |
| `won` | BOOLEAN | FALSE | Se venceu |
| `finished_at` | TIMESTAMP | NULL | Quando terminou |
| `joined_at` | TIMESTAMP | CURRENT_TIMESTAMP | Quando entrou |

**Restrições:**
- UNIQUE(room_id, user_id) - Um jogador por sala

**Realtime:** Habilitado com REPLICA IDENTITY FULL

**RLS Policies:**
- SELECT: Todos podem ver jogadores
- INSERT: Usuários inserem a si mesmos
- UPDATE: Usuários atualizam a si mesmos
- DELETE: Usuários deletam a si mesmos

---

## 📈 Views

### public_ranking

View pública para ranking global (sem dados sensíveis).

```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY gs.xp DESC) as rank,
  u.username,
  gs.xp,
  gs.coins,
  gs.five_letters_wins + gs.seven_letters_wins + gs.survival_wins + gs.avalanche_wins as total_wins,
  gs.updated_at
FROM game_stats gs
JOIN users u ON gs.user_id = u.id
ORDER BY gs.xp DESC;
```

**RLS:** Qualquer um pode ler (pública)

---

## 🔧 Funções e Triggers

### update_updated_at_column()

Função que atualiza automaticamente o campo `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

**Triggers:**
- `update_users_updated_at` em users
- `update_game_stats_updated_at` em game_stats
- `update_journey_progress_updated_at` em journey_progress

---

## 📋 Checklist de Manutenção

- [ ] Backup diário do banco
- [ ] Monitorar tamanho das tabelas
- [ ] Verificar performance de queries
- [ ] Validar RLS policies regularmente
- [ ] Atualizar índices conforme necessário
- [ ] Revisar logs de erro

---

## 🚀 Migrações Futuras

- [ ] Tabela de match_history para ranking por período
- [ ] Tabela de notifications para eventos
- [ ] Tabela de leaderboards por categoria
- [ ] Tabela de seasonal_rewards
- [ ] Tabela de user_preferences

---

**Documento criado por Manus AI - v1.1.1**
