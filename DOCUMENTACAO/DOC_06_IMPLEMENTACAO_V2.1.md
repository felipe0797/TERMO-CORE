# 📋 Documentação de Implementação - Core Games v2.1.0

**Versão:** 2.1.0  
**Data:** Junho 2026  
**Status:** ✅ Completo

---

## 📌 Resumo Executivo

A plataforma Core Games foi completamente refatorada para suportar múltiplos jogos com um sistema unificado de autenticação, perfil global, social, conquistas, loja e roleta.

### Principais Mudanças

| Aspecto | Antes | Depois |
|--------|-------|--------|
| Autenticação | Por jogo | Unificada (Plataforma) |
| Perfil | Específico do jogo | Global + Específico |
| Moedas | Apenas TermoCore | Global (CG) |
| Nível | Apenas TermoCore | Global (CG) |
| Loja | Apenas TermoCore | Universal + Por Jogo |
| Arquitetura | Monolítica | Modular |

---

## 🏗️ Arquitetura da Plataforma

### Estrutura de Pastas

```
TermoCore/ (raiz)
├── index.html                    ← Plataforma Principal
├── script.js                     ← Lógica da Plataforma
├── supabase-client.js            ← Cliente Supabase Compartilhado
│
├── games/
│   └── termocore/               ← TermoCore Original
│       ├── index.html
│       ├── script.js
│       ├── styles.css
│       ├── story_mode/
│       ├── online_mode/
│       ├── assets/
│       └── data/
│
├── platform/                     ← Componentes da Plataforma
│   ├── auth/
│   │   ├── unified-auth-manager.js
│   │   ├── unified-auth-ui.js
│   │   └── unified-auth-styles.css
│   ├── profile/
│   │   ├── global-profile-manager.js
│   │   ├── global-profile-ui.js
│   │   └── global-profile-styles.css
│   ├── social/
│   │   ├── global-social-manager.js
│   │   ├── global-social-ui.js
│   │   └── global-social-styles.css
│   ├── achievements/
│   │   ├── global-achievements-manager.js
│   │   ├── global-achievements-ui.js
│   │   └── global-achievements-styles.css
│   ├── shop/
│   │   ├── universal-shop-manager.js
│   │   ├── universal-shop-ui.js
│   │   └── universal-shop-styles.css
│   ├── roulette/
│   │   ├── platform-roulette-manager.js
│   │   ├── platform-roulette-ui.js
│   │   └── platform-roulette-styles.css
│   └── games-selector/
│       ├── game-selector-ui.js
│       └── game-selector-styles.css
│
├── shared/                       ← Código Compartilhado
│   ├── constants.js
│   ├── utils.js
│   └── styles-shared.css
│
└── DOCUMENTACAO/
    ├── DOC_01_MESTRE_ATUALIZADA.md
    ├── DOC_02_MODO_ONLINE.md
    ├── DOC_03_BANCO_DE_DADOS.md
    ├── DOC_04_ATUALIZACOES_RECENTES.md
    ├── DOC_05_ARQUITETURA_PLATAFORMA.md
    └── DOC_06_IMPLEMENTACAO_V2.1.md (este arquivo)
```

---

## 🔐 Sistema de Autenticação Unificada

### Fluxo de Login

```
1. Usuário acessa https://termocore.vercel.app
   ↓
2. Verifica se existe sessão (localStorage)
   ├─ SIM → Vai para Game Selector
   └─ NÃO → Mostra tela de Login
   ↓
3. Usuário faz login/registro
   ↓
4. Supabase valida credenciais
   ↓
5. Salva token em localStorage
   ↓
6. Inicializa managers globais
   ↓
7. Redireciona para Game Selector
```

### Sincronização com Jogos

```
Plataforma → TermoCore
├─ Salva token em localStorage
├─ Salva usuário em localStorage
├─ Redireciona para games/termocore/index.html
└─ TermoCore lê dados do localStorage
```

### Retorno para Plataforma

```
TermoCore → Plataforma
├─ Usuário clica "Voltar"
├─ Limpa localStorage (CURRENT_GAME)
├─ Redireciona para index.html
└─ Plataforma recarrega Game Selector
```

---

## 💾 Sistema de Banco de Dados

### Tabelas Principais

#### `global_users`
```sql
- id (UUID, PK)
- email (VARCHAR)
- username (VARCHAR)
- avatar (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `global_user_stats`
```sql
- user_id (UUID, FK)
- global_level (INT)
- global_xp (INT)
- global_xp_next_level (INT)
- global_coins (INT)
- global_tickets (INT)
- games_played (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `global_friends`
```sql
- user_id (UUID, FK)
- friend_id (UUID, FK)
- status (VARCHAR: accepted, blocked)
- added_at (TIMESTAMP)
```

#### `global_friend_requests`
```sql
- from_user_id (UUID, FK)
- to_user_id (UUID, FK)
- status (VARCHAR: pending, accepted, rejected)
- sent_at (TIMESTAMP)
```

#### `user_achievements`
```sql
- user_id (UUID, FK)
- achievement_id (VARCHAR, FK)
- unlocked_at (TIMESTAMP)
```

#### `global_achievements_catalog`
```sql
- id (VARCHAR, PK)
- name (VARCHAR)
- description (VARCHAR)
- type (VARCHAR: global, termocore)
- game_id (VARCHAR)
- icon (VARCHAR)
- reward_xp (INT)
- reward_coins (INT)
```

#### `shop_items_catalog`
```sql
- id (VARCHAR, PK)
- name (VARCHAR)
- description (VARCHAR)
- item_type (VARCHAR: theme, avatar, frame)
- scope (VARCHAR: global, game)
- game_id (VARCHAR)
- price (INT)
- icon (VARCHAR)
- is_default (BOOLEAN)
```

#### `user_shop_purchases`
```sql
- user_id (UUID, FK)
- item_id (VARCHAR, FK)
- purchased_at (TIMESTAMP)
```

#### `global_inventory`
```sql
- user_id (UUID, FK)
- item_id (VARCHAR, FK)
- game_id (VARCHAR)
- item_type (VARCHAR)
- equipped (BOOLEAN)
- acquired_at (TIMESTAMP)
```

#### `platform_roulette_config`
```sql
- id (VARCHAR, PK)
- name (VARCHAR)
- scope (VARCHAR)
- tickets_required (INT)
- rewards (JSON)
```

#### `platform_roulette_spins`
```sql
- user_id (UUID, FK)
- reward_type (VARCHAR)
- reward_amount (VARCHAR)
- spun_at (TIMESTAMP)
```

---

## 🎮 Fluxo de Uso

### 1. Primeiro Acesso

```
1. Usuário acessa https://termocore.vercel.app
2. Vê tela de Login/Registro
3. Registra nova conta
4. Confirma email
5. Faz login
6. Vê Game Selector
7. Clica em TermoCore
8. Joga TermoCore
```

### 2. Ganhar Prêmios

```
Jogar TermoCore
├─ Vencer partida
│  ├─ +50 XP Global
│  ├─ +10 Moedas Global
│  └─ Desbloqueia conquista (se aplicável)
├─ Completar desafio
│  ├─ +100 XP Global
│  ├─ +50 Moedas Global
│  └─ +1 Ficha Global
└─ Atingir nível
   └─ Notificação de Level Up
```

### 3. Usar a Loja

```
1. Ir para aba "Loja"
2. Filtrar por escopo (Global / TermoCore)
3. Filtrar por tipo (Tema / Avatar / Moldura)
4. Clicar em "Comprar"
5. Descontar moedas
6. Item vai para inventário
7. Equipar item (se aplicável)
```

### 4. Girar a Roleta

```
1. Ir para aba "Roleta"
2. Ver fichas disponíveis
3. Clicar "Girar Roleta"
4. Roleta gira
5. Ganhar prêmio (Moedas / XP / Fichas / Item)
6. Prêmio é adicionado automaticamente
```

---

## 📊 Checklist de Testes

### Autenticação
- [ ] Registrar nova conta
- [ ] Fazer login com email/senha
- [ ] Fazer logout
- [ ] Recuperar senha
- [ ] Sessão persiste após refresh
- [ ] Sessão expira após logout

### Perfil Global
- [ ] Nível aumenta com XP
- [ ] Moedas aumentam
- [ ] Fichas aumentam
- [ ] Inventário mostra itens
- [ ] Pode equipar/desequipar itens

### Social
- [ ] Adicionar amigo por username
- [ ] Aceitar convite de amigo
- [ ] Rejeitar convite de amigo
- [ ] Remover amigo
- [ ] Bloquear usuário
- [ ] Desbloquear usuário

### Conquistas
- [ ] Desbloquear conquista
- [ ] Ganhar recompensas (XP/Moedas)
- [ ] Filtrar por tipo (Global/TermoCore)
- [ ] Barra de progresso atualiza

### Loja
- [ ] Comprar item com moedas
- [ ] Item aparece no inventário
- [ ] Não pode comprar item sem moedas
- [ ] Não pode comprar item já possuído
- [ ] Filtros funcionam (Escopo/Tipo)

### Roleta
- [ ] Girar com fichas
- [ ] Ganhar prêmios
- [ ] Não pode girar sem fichas
- [ ] Animação funciona
- [ ] Histórico de giros

### Game Selector
- [ ] Cards de jogos aparecem
- [ ] Pode clicar em TermoCore
- [ ] Redireciona para jogo
- [ ] Status "Coming Soon" para outros jogos

### TermoCore
- [ ] Abre com autenticação da plataforma
- [ ] Botão "Voltar" funciona
- [ ] Dados do usuário sincronizam
- [ ] Prêmios são salvos na plataforma
- [ ] Volta para Game Selector corretamente

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Todos os elementos redimensionam

---

## 🚀 Deploy no Vercel

### Pré-requisitos
- [ ] Repositório GitHub sincronizado
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase projeto criado
- [ ] RLS policies configuradas

### Passos

1. **Fazer Push para GitHub**
```bash
git add .
git commit -m "feat: Core Games Platform v2.1.0"
git push origin main
```

2. **Deploy Automático**
- Vercel detecta push automaticamente
- Deploy começa em ~1 minuto
- Acesso em https://termo-core.vercel.app

3. **Verificar Deploy**
- [ ] Tela de login carrega
- [ ] Pode fazer login
- [ ] Game Selector funciona
- [ ] TermoCore abre
- [ ] Dados sincronizam

---

## 🔧 Troubleshooting

### Problema: "Supabase não inicializado"
**Solução:** Verificar se `supabase-client.js` está sendo carregado antes de outros scripts

### Problema: "Dados não sincronizam entre plataforma e jogo"
**Solução:** Verificar localStorage e token de autenticação

### Problema: "Usuário faz logout ao entrar no jogo"
**Solução:** Verificar se token está sendo salvo corretamente no localStorage

### Problema: "Roleta não gira"
**Solução:** Verificar se fichas estão disponíveis e se CSS de animação está carregado

### Problema: "Loja não mostra itens"
**Solução:** Verificar se catálogo foi inicializado no Supabase

---

## 📝 Notas Importantes

### Segurança
- ✅ Tokens salvos em localStorage (considerar usar sessionStorage em produção)
- ✅ RLS policies devem estar configuradas no Supabase
- ✅ Validação de entrada em todos os formulários

### Performance
- ✅ Lazy loading de componentes
- ✅ Cache de dados globais
- ✅ Otimização de queries Supabase

### Escalabilidade
- ✅ Estrutura modular permite adicionar novos jogos facilmente
- ✅ Sistema de managers globais é extensível
- ✅ Banco de dados normalizado

---

## 🎯 Próximas Melhorias

1. **Notificações em Tempo Real**
   - Usar Supabase Realtime para amigos online
   - Notificações de convites

2. **Ranking Global**
   - Leaderboard por nível
   - Leaderboard por jogo

3. **Eventos Especiais**
   - Eventos temáticos
   - Prêmios limitados

4. **Integração com Redes Sociais**
   - Login com Google/Discord
   - Compartilhar conquistas

5. **Mobile App**
   - React Native
   - Sincronização offline

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- `DOC_01_MESTRE_ATUALIZADA.md` - Documentação geral
- `DOC_05_ARQUITETURA_PLATAFORMA.md` - Arquitetura técnica
- Código comentado nos managers

---

**Última Atualização:** Junho 2026  
**Versão:** 2.1.0  
**Status:** ✅ Produção
