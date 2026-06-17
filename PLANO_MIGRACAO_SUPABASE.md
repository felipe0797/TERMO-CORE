# TermoCore Online - Plano de Migração para Supabase

## Objetivo
Migrar o jogo TermoCore existente (vanilla JS) para usar Supabase como banco de dados e autenticação, preservando integralmente o motor de jogo e mantendo a estrutura de arquivos atual.

## Estrutura de Tabelas Supabase

### 1. Tabela: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabela: `game_stats`
```sql
CREATE TABLE game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  
  -- Modo 5 Letras
  five_letters_wins INTEGER DEFAULT 0,
  five_letters_losses INTEGER DEFAULT 0,
  perfect_games_5l INTEGER DEFAULT 0,
  
  -- Modo 7 Letras
  seven_letters_wins INTEGER DEFAULT 0,
  seven_letters_losses INTEGER DEFAULT 0,
  perfect_games_7l INTEGER DEFAULT 0,
  
  -- Modo Sobrevivência
  survival_wins INTEGER DEFAULT 0,
  survival_losses INTEGER DEFAULT 0,
  best_survival_round INTEGER DEFAULT 0,
  survival_lives_bought INTEGER DEFAULT 0,
  
  -- Modo Avalanche
  avalanche_wins INTEGER DEFAULT 0,
  avalanche_losses INTEGER DEFAULT 0,
  best_avalanche_phase INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

### 3. Tabela: `journey_progress`
```sql
CREATE TABLE journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id VARCHAR(50) NOT NULL,
  current_phase INTEGER DEFAULT 1,
  intro_seen BOOLEAN DEFAULT FALSE,
  
  -- JSON para flexibilidade: { "fase_1": 3, "fase_2": 2, ... }
  stars JSONB DEFAULT '{}',
  
  -- JSON para fases completas: ["fase_1", "fase_2", ...]
  completed_phases JSONB DEFAULT '[]',
  
  -- JSON para baús resgatados: { "cap_1": ["bronze", "silver"], ... }
  claimed_chests JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, journey_id)
);
```

### 4. Tabela: `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
```

### 5. Tabela: `shop_items`
```sql
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, item_id)
);
```

## Fluxo de Implementação

### Fase 1: Configuração Supabase
- [ ] Criar projeto no Supabase
- [ ] Executar scripts SQL para criar as tabelas
- [ ] Habilitar autenticação por email/senha
- [ ] Obter `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### Fase 2: Integração de Autenticação
- [ ] Criar `supabase-client.js` com inicialização do cliente
- [ ] Adaptar tela de login para usar Supabase Auth
- [ ] Adaptar tela de registro para usar Supabase Auth
- [ ] Implementar logout com Supabase

### Fase 3: Migração de Dados
- [ ] Criar funções de sincronização: `loadUserStats()`, `saveUserStats()`
- [ ] Adaptar `handleStageWon()` para salvar no Supabase
- [ ] Adaptar `handleGameWon()` para salvar no Supabase
- [ ] Adaptar troféus para salvar no Supabase
- [ ] Adaptar loja para salvar itens comprados
- [ ] Adaptar Modo Jornada para salvar progresso

### Fase 4: Ranking Global
- [ ] Criar função `loadGlobalRanking()` para consultar Supabase
- [ ] Atualizar UI de ranking com dados globais
- [ ] Implementar paginação se necessário

### Fase 5: Deploy
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Fazer commit no GitHub
- [ ] Deploy automático via Vercel

## Arquivos a Modificar
- `index.html` - Adicionar script do Supabase
- `script.js` - Adaptar autenticação e persistência
- `story_mode/story_mode.js` - Adaptar persistência da jornada
- Criar `supabase-client.js` - Cliente Supabase
- Criar `supabase-sync.js` - Funções de sincronização

## Preservar Integralmente
- Motor de jogo (Wordle logic)
- Todos os modos (5L, 7L, Sobrevivência, Avalanche)
- Banco de 3.000 palavras (palavras.js)
- Design Glassmorphism (styles.css)
- Anomalias do Modo Jornada
