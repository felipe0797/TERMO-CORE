# TermoCore v1.1.1 - Documentação Mestre Atualizada

**Data:** 22 de Junho de 2026  
**Versão:** 1.1.1  
**Desenvolvido por:** Manus AI  

---

## 📋 Visão Geral

O **TermoCore** é um jogo de palavras avançado baseado no conceito "Termo" (Wordle), implementado como uma Single Page Application (SPA) com integração ao Supabase para persistência de dados, autenticação e modo multiplayer online.

---

## 🏗️ Arquitetura Geral

### Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Deploy:** Vercel (CI/CD automático via GitHub)
- **Autenticação:** Supabase Auth (Email/Senha)

### Estrutura de Arquivos Principais

| Arquivo | Propósito |
|---------|-----------|
| `index.html` | SPA com todas as telas (Login, Menu, Loja, Ranking, Jogo, Online) |
| `script.js` | Motor principal do jogo, estado global, economia |
| `styles.css` | Design Glassmorphism, temas, responsividade |
| `palavras.js` | Banco de 3.000 palavras únicas |
| `story_mode/` | Modo Jornada (campanhas narrativas) |
| `online_mode/` | Modo Online 1v1 (salas, multiplayer) |

---

## 🎮 Os 4 Modos Principais

### 1. **5 Letras**
Progressão em 3 etapas com tabuleiros simultâneos:
- **Etapa 1:** 1 tabuleiro (5 palavras)
- **Etapa 2:** 3 tabuleiros (15 palavras)
- **Etapa 3:** 5 tabuleiros (25 palavras)

**Recompensas:** XP + Moedas (aumentam com dificuldade)

### 2. **7 Letras**
Progressão em 2 etapas com palavras mais longas:
- **Etapa 1:** 1 tabuleiro (7 palavras)
- **Etapa 2:** 2 tabuleiros (14 palavras)

**Recompensas:** XP + Moedas (maiores que 5L)

### 3. **Sobrevivência**
Rodadas infinitas com sistema de vidas:
- Começa com **3 vidas**
- Loja integrada para comprar vidas (preço escala exponencialmente)
- Cada rodada vencida = +1 vida (máximo 10)
- Recordes salvos (melhor rodada)

**Recompensas:** XP + Moedas (aumentam com rodadas)

### 4. **Avalanche**
Fases progressivas com múltiplos tabuleiros:
- **Fases 1-5:** Número de tabuleiros cresce (1 → 5)
- Dificuldade aumenta a cada fase
- Recordes salvos (melhor fase)

**Recompensas:** XP + Moedas (exponencial por fase)

---

## 💾 Sistema de Persistência

### Dados Salvos no Supabase

| Tabela | Propósito |
|--------|-----------|
| `users` | Perfil do usuário (email, username) |
| `game_stats` | Estatísticas (XP, coins, vitórias, recordes) |
| `journey_progress` | Progresso do Modo Jornada |
| `achievements` | Troféus desbloqueados |
| `shop_items` | Itens cosméticos comprados |
| `online_rooms` | Salas de jogo online |
| `room_players` | Jogadores dentro de salas |

### Autenticação
- Email/Senha via Supabase Auth
- Sessão mantida em cookie
- Logout limpa a sessão
- Row Level Security (RLS) protege dados por usuário

---

## 🎨 Sistema de Dificuldade

A dificuldade é **global** e afeta o sorteio de palavras em todos os modos:

| Nível | Distribuição | Multiplicador |
|-------|--------------|----------------|
| **FÁCIL** | 70% fáceis, 30% médias | 0.5x |
| **NORMAL** | 50% médias, 25% fáceis, 25% difíceis | 1.0x |
| **DIFÍCIL** | 70% difíceis, 30% médias | 1.5x |

**Nota:** NORMAL é obrigatório na inicialização. O jogador não pode desmarcar a dificuldade ativa.

---

## 💰 Economia e Progressão

### Moedas
- Ganhas ao vencer partidas
- Usadas para comprar dicas (Hints) e cosméticos na loja
- Conversão: Itens duplicados na roleta = 1.000 moedas

### XP e Nível
- Ganho em vitórias e troféus
- Nível = `Math.floor(Math.pow(xp / 100, 1/1.5))`
- Desbloqueia troféus e badges

### Loja de Cosméticos
- **Temas:** Neon Night (500 moedas), Deep Dark (300 moedas)
- **Avatares:** Variantes de estilos (Toon, Croodles, Big Ears, Boots)
- **Molduras:** Neon, Industrial, Glitch
- **Outros:** Acessórios, cores de base, olhos, boca

---

## 🏆 Sistema de Troféus

Desbloqueados automaticamente ao atingir marcos:

| Troféu | Gatilho |
|--------|---------|
| Primeira Vitória | Vencer qualquer modo |
| Perfeição 5L | Sem erros em 5 Letras |
| Perfeição 7L | Sem erros em 7 Letras |
| Sobrevivente | Rodada 20+ em Sobrevivência |
| Mestre da Avalanche | Fase 10+ em Avalanche |
| Nível 10+ | Atingir nível 10 |
| Milionário | Acumular 10.000+ moedas |

---

## 📖 Modo Jornada (Story Mode)

### Estrutura Hierárquica
```
Jornada 1: Operação Código Primário
├── Capítulo 1: Subestação de Energia (Fases 1-10)
├── Capítulo 2: Linha de Montagem (Fases 11-20)
├── Capítulo 3: Central de Dados (Fases 21-30)
└── Capítulo 4: Núcleo do Sistema (Fases 31-40)
```

### Sistema de Estrelas
- **3 ⭐:** Resolvido até 3ª tentativa
- **2 ⭐:** Resolvido até 5ª tentativa
- **1 ⭐:** Resolvido na 6ª tentativa ou nos segundos finais

### Baús de Capítulo
- **Bronze:** 1/3 das estrelas → Moedas
- **Prata:** 2/3 das estrelas → Moedas + Emblema
- **Ouro:** Todas as estrelas → Moedas + XP + Skin exclusiva

### Anomalias (Modificadores)
| Anomalia | Efeito |
|----------|--------|
| **THERMAL_OVERLOAD** | Cronômetro regressivo |
| **BLOCKED_CELLS** | Células do grid travadas |
| **FORBIDDEN_LETTERS** | Letras proibidas no palpite |
| **DELAYED_FEEDBACK** | Cores aparecem após 4º palpite |
| **AVALANCHE_ACCELERATED** | Múltiplos tabuleiros simultâneos |
| **CONVEYOR_CHAOS** | Novos tabuleiros após erros |
| **TIME_BONUS** | +10s por letra verde |

---

## 🌐 Modo Online (v1.0.9+)

### Fluxo de Partida
1. Jogador A cria sala (status: WAITING)
2. Jogador B entra na sala (status: WAITING se convidado, READY se criador)
3. Criador clica "Iniciar Partida" (todos devem estar READY)
4. Ambos recebem mesma palavra secreta
5. Jogam simultaneamente com progresso sincronizado
6. Vencedor é quem acertar primeiro
7. Opção de Revanche (sala volta para WAITING)

### Tabelas Online
- `online_rooms`: Salas com status (WAITING, PLAYING, FINISHED)
- `room_players`: Jogadores com status (WAITING, READY, PLAYING, FINISHED)

### Realtime Supabase
- Sincronização em tempo real de progresso
- Polling de segurança (fallback se Realtime falhar)
- Detecção automática de saídas/entradas

---

## 🎨 Design e Estilo

### Glassmorphism
- Efeito vidro fosco com blur background
- Transparência e camadas visuais

### Paleta de Cores
- **Tema Padrão:** Roxo (#6366f1) com fundo escuro
- **Tema Neon:** Ciano (#00f2ff) com fundo escuro
- **Tema Deep Dark:** Roxo (#a855f7) com fundo preto absoluto

### Tipografia
- **Font:** Inter (Google Fonts)
- **Pesos:** 400, 500, 600, 700, 800, 900

### Responsividade
- Mobile-first
- Breakpoints: 480px, 768px, 1024px, 1440px

---

## 🚀 Fluxo de Desenvolvimento

### Workflow Local
1. Fazer alterações nos arquivos
2. Testar localmente (abrir `index.html` no navegador)
3. Commit no GitHub: `git add . && git commit -m "mensagem" && git push origin main`
4. Vercel detecta push e faz deploy automático (~1 minuto)
5. Testar em https://termo-core.vercel.app

### Versionamento
- Badge de versão no canto inferior direito da tela de login
- Formato: `v1.0.0`, `v1.1.0`, etc.
- Editar em `index.html` (procure por `version-badge`)

---

## ✅ Regras Importantes

### NÃO FAÇA
- ❌ Alterar o motor de sorteio (palavras.js)
- ❌ Mudar o banco de 3.000 palavras
- ❌ Remover os 4 modos principais
- ❌ Alterar design Glassmorphism sem aprovação
- ❌ Criar novas tabelas no Supabase sem documentar
- ❌ Mudar estrutura de autenticação

### FAÇA
- ✅ Adicionar novos modos de jogo
- ✅ Adicionar novas jornadas/capítulos
- ✅ Adicionar novos troféus
- ✅ Adicionar novos itens na loja
- ✅ Melhorar UI/UX
- ✅ Otimizar performance
- ✅ Corrigir bugs

---

## 📞 Próximos Passos

Quando implementar uma melhoria:

1. **Descreva** a melhoria que deseja fazer
2. **Confirme** que não viola as restrições
3. **Leia** a documentação necessária
4. **Implemente** seguindo o workflow

---

**Documento criado por Manus AI - v1.1.1**
