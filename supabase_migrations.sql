-- ============================================================
-- SUPABASE MIGRATIONS - TermoCore Online
-- Execute estes comandos no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de estatísticas de jogo
CREATE TABLE IF NOT EXISTS game_stats (
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

-- 3. Tabela de progresso da jornada
CREATE TABLE IF NOT EXISTS journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id VARCHAR(50) NOT NULL,
  current_phase INTEGER DEFAULT 1,
  intro_seen BOOLEAN DEFAULT FALSE,
  
  -- JSON para flexibilidade
  stars JSONB DEFAULT '{}',
  completed_phases JSONB DEFAULT '[]',
  claimed_chests JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, journey_id)
);

-- 4. Tabela de conquistas (troféus)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- 5. Tabela de itens da loja
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, item_id)
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_progress_user_id ON journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_user_id ON shop_items(user_id);

-- ============================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Políticas para users (usuários podem ler seu próprio perfil)
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Políticas para game_stats (usuários podem ler/escrever suas próprias stats)
CREATE POLICY "Users can read own stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON game_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para journey_progress
CREATE POLICY "Users can read own journey" ON journey_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journey" ON journey_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey" ON journey_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para achievements
CREATE POLICY "Users can read own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para shop_items
CREATE POLICY "Users can read own items" ON shop_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON shop_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON shop_items
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- VIEWS PÚBLICAS PARA RANKING (sem RLS)
-- ============================================================

-- View para ranking global (pública, sem dados sensíveis)
CREATE OR REPLACE VIEW public_ranking AS
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

-- Permitir leitura pública da view de ranking
CREATE POLICY "Anyone can read ranking" ON public_ranking
  FOR SELECT USING (true);

-- ============================================================
-- FUNÇÕES ÚTEIS
-- ============================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_game_stats_updated_at BEFORE UPDATE ON game_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_progress_updated_at BEFORE UPDATE ON journey_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================

-- Você pode adicionar usuários de teste aqui se desejar
-- INSERT INTO users (email, username) VALUES ('teste@exemplo.com', 'teste');

-- ============================================================
-- MIGRATION v1.0.6 — Sistema de Roleta da Sorte
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Adicionar colunas de tickets e controle de giro diário em game_stats
ALTER TABLE game_stats
    ADD COLUMN IF NOT EXISTS spin_tickets INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_daily_ticket TIMESTAMP DEFAULT NULL;

-- Atualizar registros existentes para garantir valor padrão
UPDATE game_stats SET spin_tickets = 0 WHERE spin_tickets IS NULL;
