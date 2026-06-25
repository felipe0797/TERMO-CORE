# 📐 Arquitetura da Plataforma Core Games v2.0.0

**Data:** 25 de Junho de 2026  
**Versão:** 2.0.0  
**Desenvolvido por:** Manus AI  

---

## 📋 Visão Geral

O **Core Games** é uma plataforma de biblioteca de jogos que mantém o **TermoCore** como primeiro jogo. A arquitetura foi projetada para:

✅ Manter TermoCore 100% intacto e funcional  
✅ Implementar autenticação unificada  
✅ Criar um seletor de jogos estilo Netflix  
✅ Permitir fácil adição de novos jogos no futuro  

---

## 🏗️ Estrutura de Diretórios

```
TermoCore/ (raiz da plataforma)
│
├── index.html                          (Plataforma - Login + Game Selector)
├── script.js                           (Lógica principal da plataforma)
├── supabase-client.js                  (Autenticação compartilhada)
│
├── games/
│   └── termocore/                      (TermoCore original - 100% intacto)
│       ├── index.html                  (SPA do TermoCore)
│       ├── script.js                   (Motor do jogo + returnToPlatform())
│       ├── styles.css                  (Estilos do jogo)
│       ├── supabase-sync.js            (Sync específico do TermoCore)
│       ├── palavras.js
│       ├── notifications.js
│       ├── validacao-palavras.js
│       ├── palavras-secretas-tt.js
│       ├── story_mode/                 (Modo Jornada)
│       ├── online_mode/                (Modo Online)
│       ├── assets/
│       ├── data/
│       └── DOCUMENTACAO/
│
├── platform/
│   ├── auth/
│   │   ├── auth-manager.js             (Gerenciador de autenticação)
│   │   ├── auth-ui.js                  (Interface de login/registro)
│   │   └── auth-styles.css             (Estilos de autenticação)
│   │
│   ├── games-selector/
│   │   ├── game-selector.js            (Lógica do seletor)
│   │   └── game-selector.css           (Estilos Netflix-like)
│   │
│   ├── profile/                        (Futuro)
│   ├── social/                         (Futuro)
│   ├── achievements/                   (Futuro)
│   ├── shop/                           (Futuro)
│   │
│   └── platform-styles.css             (Estilos adicionais)
│
├── shared/
│   ├── constants.js                    (Constantes globais)
│   ├── utils.js                        (Funções utilitárias)
│   └── styles-shared.css               (Estilos base)
│
└── DOCUMENTACAO/
    ├── DOC_01_MESTRE_ATUALIZADA.md
    ├── DOC_02_MODO_ONLINE.md
    ├── DOC_03_BANCO_DE_DADOS.md
    ├── DOC_04_ATUALIZACOES_RECENTES.md
    └── DOC_05_ARQUITETURA_PLATAFORMA.md (Este arquivo)
```

---

## 🔄 Fluxo de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE GAMES v2.0.0                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    TELA DE LOGIN                            │
│  - Email/Username + Senha                                   │
│  - Criar conta                                              │
│  - Jogar como visitante                                     │
│  (Usa: AuthManager + AuthUI)                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              GAME SELECTOR (Netflix-like)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Jogos] [Perfil] [Social] [Conquistas] [Loja]      │   │
│  │ (Abas: Jogos com funcionalidade, outros design)    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ┌──────────────┐  ┌──────────────┐                 │   │
│  │ │  TERMOCORE   │  │  [FUTURO]    │                 │   │
│  │ │   📝         │  │   Game 2     │                 │   │
│  │ │  [JOGAR]     │  │  [JOGAR]     │                 │   │
│  │ └──────────────┘  └──────────────┘                 │   │
│  │ (Usa: GameSelector)                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│           TERMOCORE (Completamente Intacto)                 │
│  - Todos os 4 modos (5L, 7L, Sobrevivência, Avalanche)     │
│  - Modo Jornada                                             │
│  - Modo Online                                              │
│  - Loja de cosméticos                                       │
│  - Ranking                                                  │
│  - Todas as abas originais                                  │
│  - Botão "← Voltar" para Game Selector                      │
│  (Usa: returnToPlatform())                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticação Unificada (Core Auth)

### Arquivo: `platform/auth/auth-manager.js`

**Classe:** `AuthManager`

**Métodos Principais:**
- `initSupabase()` - Inicializa cliente Supabase
- `registerUser(email, password, username)` - Registra novo usuário
- `loginUser(emailOrUsername, password)` - Faz login
- `loginAsGuest()` - Cria conta de visitante
- `logoutUser()` - Faz logout
- `getCurrentUser()` - Obtém usuário atual
- `isAuthenticated()` - Verifica se está autenticado

**Características:**
- ✅ Mantém a autenticação original do TermoCore
- ✅ Suporta login por email ou username
- ✅ Suporta contas de visitante
- ✅ Sessão persistida em cookie
- ✅ Integração com Supabase

---

## 🎮 Game Selector

### Arquivo: `platform/games-selector/game-selector.js`

**Classe:** `GameSelector`

**Métodos Principais:**
- `renderGameSelector()` - Renderiza o seletor
- `renderGameCards()` - Renderiza cards dos jogos
- `switchTab(tabName)` - Alterna entre abas
- `playGame(gameId)` - Abre um jogo
- `handleLogout()` - Faz logout

**Características:**
- ✅ Layout estilo Netflix com cards de jogos
- ✅ Abas: Jogos, Perfil, Social, Conquistas, Loja
- ✅ Abas de design (Perfil, Social, etc) sem funcionalidade
- ✅ Responsive (mobile-first)
- ✅ Animações suaves

**Dados de Jogos:**
```javascript
const GAMES_CATALOG = [
    {
        id: 'termocore',
        name: 'TermoCore',
        description: 'Jogo de palavras tipo Wordle',
        icon: '📝',
        color: '#6366f1',
        url: 'games/termocore/index.html',
        status: 'available',
        version: 'v1.1.1'
    }
    // Futuros jogos aqui
];
```

---

## 🔗 Integração TermoCore

### Mudanças Mínimas no TermoCore

1. **Arquivo:** `games/termocore/index.html`
   - Adicionado botão "← Voltar" na sidebar

2. **Arquivo:** `games/termocore/script.js`
   - Adicionada função `returnToPlatform()`

3. **Todos os outros arquivos:** 100% intactos

### Função: `returnToPlatform()`

```javascript
function returnToPlatform() {
    if (confirm('Deseja retornar à plataforma Core Games?')) {
        saveUserStats().then(() => {
            localStorage.removeItem('core_games_current_game');
            window.location.href = '../..';
        });
    }
}
```

---

## 📦 Módulos Compartilhados

### `shared/constants.js`

Constantes globais usadas por toda a plataforma:

```javascript
const SUPABASE_URL = '...';
const SUPABASE_ANON_KEY = '...';
const GAMES_CATALOG = [...];
const SCREENS = { LOGIN, GAMES_SELECTOR, GAME_PLAYING };
const STORAGE_KEYS = { CURRENT_USER, CURRENT_GAME, ... };
```

### `shared/utils.js`

Funções utilitárias:

```javascript
showScreen(screenId)              // Mostrar tela
hideScreen(screenId)              // Esconder tela
showToast(message, type)          // Notificação
saveToLocalStorage(key, data)     // Salvar localStorage
getFromLocalStorage(key)          // Recuperar localStorage
isValidEmail(email)               // Validar email
isValidUsername(username)         // Validar username
isValidPassword(password)         // Validar senha
getGameUrl(gameId)                // Obter URL do jogo
getGameInfo(gameId)               // Obter info do jogo
// ... e muitas outras
```

### `shared/styles-shared.css`

Estilos base compartilhados:

- Reset CSS
- Buttons (primary, secondary, ghost)
- Inputs
- Cards
- Toast notifications
- Modals
- Flexbox utilities
- Grid utilities
- Spacing utilities
- Text utilities
- Responsive

---

## 🎨 Estilos

### Hierarquia de Estilos

1. **`shared/styles-shared.css`** - Estilos base (reset, buttons, inputs, etc)
2. **`platform/auth/auth-styles.css`** - Estilos de autenticação
3. **`platform/games-selector/game-selector.css`** - Estilos do seletor
4. **`platform/platform-styles.css`** - Estilos adicionais da plataforma
5. **`games/termocore/styles.css`** - Estilos do TermoCore (intactos)

### Paleta de Cores (Plataforma)

```css
--bg: #0f0f1e
--surface: #1a1a2e
--border: rgba(255, 255, 255, 0.1)
--text: #e0e0e0
--accent: #6366f1
--accent-hover: #8b5cf6
--accent-glow: rgba(99, 102, 241, 0.3)
```

---

## 🚀 Fluxo de Inicialização

```javascript
// 1. DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    // 2. Inicializar Supabase
    await authManager.initSupabase();
    
    // 3. Verificar autenticação
    const user = await authManager.getCurrentUser();
    
    if (user) {
        // 4a. Usuário logado → Game Selector
        showScreen('screen-games-selector');
        await gameSelector.renderGameSelector();
    } else {
        // 4b. Não logado → Login
        showScreen('screen-login');
        authUI.renderLoginScreen();
    }
});
```

---

## 🔄 Fluxo de Jogo

### Ao Clicar em "JOGAR" (TermoCore)

```javascript
playGame('termocore') {
    // 1. Salvar jogo atual
    saveToLocalStorage(STORAGE_KEYS.CURRENT_GAME, 'termocore');
    
    // 2. Redirecionar
    window.location.href = 'games/termocore/index.html';
}
```

### Ao Clicar em "← Voltar" (TermoCore)

```javascript
returnToPlatform() {
    // 1. Confirmar
    if (confirm('Retornar à plataforma?')) {
        // 2. Salvar dados
        await saveUserStats();
        
        // 3. Limpar localStorage
        localStorage.removeItem('core_games_current_game');
        
        // 4. Redirecionar
        window.location.href = '../..';
    }
}
```

### Ao Retornar da Aba do Jogo

```javascript
window.addEventListener('focus', async () => {
    const currentGame = getFromLocalStorage(STORAGE_KEYS.CURRENT_GAME);
    
    if (currentGame) {
        // Usuário voltou do jogo
        removeFromLocalStorage(STORAGE_KEYS.CURRENT_GAME);
        
        // Recarregar Game Selector
        showScreen('screen-games-selector');
        await gameSelector.renderGameSelector();
    }
});
```

---

## 🎯 Adicionando Novos Jogos

### Passo 1: Criar Pasta do Jogo

```
games/
├── termocore/
└── novo_jogo/
    ├── index.html
    ├── script.js
    ├── styles.css
    └── ...
```

### Passo 2: Adicionar ao Catálogo

```javascript
// shared/constants.js
const GAMES_CATALOG = [
    {
        id: 'termocore',
        name: 'TermoCore',
        // ...
    },
    {
        id: 'novo_jogo',
        name: 'Novo Jogo',
        description: 'Descrição do novo jogo',
        icon: '🎮',
        color: '#ec4899',
        url: 'games/novo_jogo/index.html',
        status: 'available',
        version: 'v1.0.0'
    }
];
```

### Passo 3: Implementar Botão Voltar

```javascript
// games/novo_jogo/script.js
function returnToPlatform() {
    if (confirm('Retornar à plataforma?')) {
        saveGameData().then(() => {
            localStorage.removeItem('core_games_current_game');
            window.location.href = '../..';
        });
    }
}
```

---

## 📊 Banco de Dados (Supabase)

### Tabelas Compartilhadas

- `users` - Perfil do usuário (compartilhado)
- `game_stats` - Estatísticas (compartilhado)
- `achievements` - Troféus (compartilhado)
- `shop_items` - Itens cosméticos (compartilhado)

### Tabelas Específicas do TermoCore

- `journey_progress` - Progresso do Modo Jornada
- `online_rooms` - Salas de jogo online
- `room_players` - Jogadores em salas

---

## ✅ Checklist de Validação

### TermoCore Intacto

- [x] Todos os 4 modos funcionam
- [x] Modo Jornada funciona
- [x] Modo Online funciona
- [x] Loja de cosméticos funciona
- [x] Ranking funciona
- [x] XP, moedas, troféus salvos
- [x] Temas e avatares salvos
- [x] Autenticação funciona
- [x] Botão "← Voltar" adicionado

### Plataforma Funciona

- [x] Login unificado funciona
- [x] Game Selector renderiza
- [x] Navegação para TermoCore funciona
- [x] Botão "Voltar" retorna ao Game Selector
- [x] Abas de design renderizam
- [x] Responsivo em mobile
- [x] Logout funciona

---

## 🔧 Troubleshooting

### Problema: Usuário não consegue fazer login

**Solução:**
1. Verificar se Supabase está inicializado
2. Verificar credenciais em `shared/constants.js`
3. Verificar conexão de internet
4. Limpar cache do navegador

### Problema: Game Selector não renderiza

**Solução:**
1. Verificar se `gameSelector.renderGameSelector()` foi chamado
2. Verificar se `screen-games-selector` existe no HTML
3. Verificar console para erros

### Problema: Botão "Voltar" não funciona

**Solução:**
1. Verificar se `returnToPlatform()` está definida
2. Verificar se `saveUserStats()` funciona
3. Verificar caminho relativo `../..`

### Problema: Dados não são salvos ao retornar

**Solução:**
1. Verificar se `saveUserStats()` é chamada
2. Verificar se Supabase está conectado
3. Verificar RLS policies no Supabase

---

## 📞 Próximos Passos

1. **Deploy no Vercel** - Testar em produção
2. **Adicionar novos jogos** - Seguir padrão de integração
3. **Melhorar UI/UX** - Adicionar animações e efeitos
4. **Implementar Social** - Amigos, mensagens, etc
5. **Implementar Achievements Globais** - Troféus compartilhados

---

**Documento criado por Manus AI - v2.0.0**
