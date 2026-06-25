# 🎮 Core Games Platform v2.0.0

**Biblioteca de Jogos com TermoCore como Primeiro Jogo**

---

## 📋 Visão Geral

O **Core Games** é uma plataforma de biblioteca de jogos que permite:

✅ **Autenticação Unificada** - Um login para todos os jogos  
✅ **Game Selector Netflix-like** - Seletor visual de jogos  
✅ **TermoCore Intacto** - Jogo original 100% funcional  
✅ **Escalável** - Fácil adicionar novos jogos  
✅ **Modular** - Cada jogo em sua pasta  

---

## 🚀 Como Usar

### 1. Acessar a Plataforma

```
https://termo-core.vercel.app
```

### 2. Fazer Login

- **Email/Username:** seu@email.com ou seu_username
- **Senha:** mínimo 6 caracteres
- **Ou:** Jogar como visitante

### 3. Selecionar um Jogo

- Clicar em "JOGAR" no card do jogo
- O jogo abrirá em tela cheia

### 4. Retornar à Plataforma

- Clicar em "← Voltar" na sidebar do jogo
- Confirmar retorno

---

## 📁 Estrutura de Pastas

```
TermoCore/
├── index.html                    (Plataforma)
├── script.js                     (Lógica da plataforma)
├── supabase-client.js            (Autenticação compartilhada)
│
├── games/
│   └── termocore/               (TermoCore original)
│
├── platform/
│   ├── auth/                    (Autenticação)
│   ├── games-selector/          (Seletor de jogos)
│   └── ...
│
├── shared/                      (Código compartilhado)
│
└── DOCUMENTACAO/                (Documentação)
```

---

## 🔐 Autenticação

### Registro

1. Clicar em "Criar conta"
2. Preencher email, username e senha
3. Confirmar senha
4. Clicar em "CADASTRAR"

### Login

1. Preencher email/username e senha
2. Clicar em "ENTRAR"

### Visitante

1. Clicar em "JOGAR COMO VISITANTE"
2. Conta temporária será criada
3. Dados serão deletados ao fazer logout

---

## 🎮 Jogos Disponíveis

### TermoCore v1.1.1

Jogo de palavras tipo Wordle com 4 modos:

- **5 Letras** - 3 etapas progressivas
- **7 Letras** - 2 etapas com palavras longas
- **Sobrevivência** - Rodadas infinitas com vidas
- **Avalanche** - 5 fases progressivas

**Recursos:**
- Modo Jornada com campanhas narrativas
- Modo Online 1v1 em tempo real
- Loja de cosméticos (temas, avatares, molduras)
- Ranking global
- Sistema de troféus
- XP e moedas

---

## 🛠️ Desenvolvimento

### Adicionar Novo Jogo

1. **Criar pasta:**
   ```
   games/novo_jogo/
   ├── index.html
   ├── script.js
   ├── styles.css
   └── ...
   ```

2. **Adicionar ao catálogo:**
   ```javascript
   // shared/constants.js
   const GAMES_CATALOG = [
       // ... TermoCore
       {
           id: 'novo_jogo',
           name: 'Novo Jogo',
           description: 'Descrição',
           icon: '🎮',
           color: '#ec4899',
           url: 'games/novo_jogo/index.html',
           status: 'available',
           version: 'v1.0.0'
       }
   ];
   ```

3. **Implementar botão voltar:**
   ```javascript
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

## 📚 Documentação

- **DOC_01_MESTRE_ATUALIZADA.md** - Funcionamento geral do TermoCore
- **DOC_02_MODO_ONLINE.md** - Detalhes do multiplayer
- **DOC_03_BANCO_DE_DADOS.md** - Dicionário de tabelas
- **DOC_04_ATUALIZACOES_RECENTES.md** - Mudanças recentes
- **DOC_05_ARQUITETURA_PLATAFORMA.md** - Arquitetura da plataforma

---

## 🔧 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Deploy:** Vercel (CI/CD automático)
- **Autenticação:** Supabase Auth

---

## 📊 Banco de Dados

### Tabelas Compartilhadas

- `users` - Perfil do usuário
- `game_stats` - Estatísticas globais
- `achievements` - Troféus
- `shop_items` - Itens cosméticos

### Tabelas Específicas do TermoCore

- `journey_progress` - Progresso da jornada
- `online_rooms` - Salas online
- `room_players` - Jogadores em salas

---

## 🚀 Deploy

### Vercel

1. **Conectar repositório GitHub**
2. **Configurar variáveis de ambiente:**
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```
3. **Deploy automático** ao fazer push para `main`

---

## ✅ Checklist

### TermoCore

- [x] Todos os 4 modos funcionam
- [x] Modo Jornada funciona
- [x] Modo Online funciona
- [x] Loja de cosméticos funciona
- [x] Ranking funciona
- [x] XP, moedas, troféus salvos
- [x] Botão "← Voltar" adicionado

### Plataforma

- [x] Login unificado
- [x] Game Selector renderiza
- [x] Navegação funciona
- [x] Responsivo em mobile
- [x] Logout funciona

---

## 🐛 Troubleshooting

### Login não funciona

- Verificar credenciais Supabase
- Limpar cache do navegador
- Verificar conexão de internet

### Game Selector não renderiza

- Verificar console para erros
- Verificar se `screen-games-selector` existe
- Recarregar página

### Botão "Voltar" não funciona

- Verificar se `returnToPlatform()` está definida
- Verificar caminho relativo
- Verificar console para erros

---

## 📞 Suporte

Para dúvidas ou sugestões, consulte a documentação em `DOCUMENTACAO/`.

---

## 📝 Changelog

### v2.0.0 (25 de Junho de 2026)

- ✨ Plataforma Core Games criada
- ✨ Autenticação unificada
- ✨ Game Selector estilo Netflix
- ✨ TermoCore integrado como primeiro jogo
- 📚 Documentação completa

---

**Desenvolvido por Manus AI - v2.0.0**
