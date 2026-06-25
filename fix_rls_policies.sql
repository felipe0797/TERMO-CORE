-- ============================================================
-- FIX: Adicionar políticas de INSERT para RLS
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Permitir que usuários autenticados insiram seu próprio perfil
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que usuários autenticados leiam todos os usuários (para ranking)
CREATE POLICY "Anyone can read users for ranking" ON users
  FOR SELECT USING (true);

-- Permitir leitura pública de game_stats para ranking
CREATE POLICY "Anyone can read game stats for ranking" ON game_stats
  FOR SELECT USING (true);

-- Pronto! Agora o signup funcionará.
