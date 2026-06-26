# 📜 Histórico de Melhorias e Guia Técnico (v2.1.0)

Este documento serve como um guia para desenvolvedores e IAs que trabalharem no projeto após a grande atualização da plataforma **Core Games**.

---

## 🎯 Resumo da Atualização
A plataforma foi transformada de um jogo único (**TermoCore**) para uma biblioteca de jogos (**Core Games**), com um sistema de plataforma centralizado que gerencia autenticação, perfil global, social, conquistas e loja.

---

## 🛠️ Mudanças na Estrutura de Arquivos
- **Raiz (`/`):** Contém agora os arquivos da plataforma central.
  - `index.html`: Layout principal com sistema de abas e login centralizado.
  - `script.js`: Lógica principal da plataforma (Navegação, Autenticação, Inicialização).
  - `supabase-client.js`: Cliente Supabase compartilhado.
- **Jogos (`/games/`):** Cada jogo agora reside em sua própria subpasta.
  - `/games/termocore/`: Contém todos os arquivos originais do TermoCore.
- **Plataforma (`/platform/`):** Componentes modulares da plataforma.
  - `/auth/`: Gerenciamento de login unificado.
  - `/profile/`, `/social/`, `/achievements/`, `/shop/`, `/roulette/`: Lógica e UI de cada aba.

---

## 📍 Localização de Funcionalidades no Código

### 1. Autenticação Unificada
- **Local:** `script.js` (Funções `handleAuth`, `handleRegister`, `handleGuestLogin`).
- **Lógica:** A plataforma chama diretamente as funções do `supabase-client.js` do TermoCore para garantir que as validações de Moedas/XP/Stats sejam executadas.
- **Sincronização:** Os dados são salvos no `localStorage` sob as chaves `cg_auth_token` e `cg_current_user`.

### 2. Perfil e Sincronização de Dados
- **Local:** `platform/platform-data-sync.js` e `platform/profile/platform-profile-enhanced.js`.
- **Lógica:** O arquivo de sincronização busca dados reais da tabela `game_stats` do Supabase e atualiza o estado global da plataforma a cada 30 segundos.

### 3. Sistema de Abas
- **Local:** `script.js` (Função `attachTabListeners`).
- **UI:** As abas são definidas no `index.html` usando o atributo `data-tab`.
- **Estilos:** `platform/platform-tabs-styles.css`.

### 4. Loja e Inventário
- **Local:** `platform/shop/platform-shop-enhanced.js` e `platform/profile/platform-profile-enhanced.js`.
- **Lógica:** O inventário filtra itens por `scope` (global ou jogo específico). O sistema de temas da plataforma altera variáveis CSS globais.

### 5. Notificações (Toasts)
- **Local:** `script.js` (Função `showToast`).
- **Design:** Glassmorphism com ícones dinâmicos e gradientes.

### 6. Spinner de Carregamento
- **Local:** `index.html` (HTML/CSS inicial) e `script.js` (Função `hideLoadingSpinner`).

---

## ⚠️ Notas para Futuras IAs
1. **Evite Conflitos de Escopo:** Muitas funções são globais para facilitar a integração. Sempre verifique se uma função (ex: `loginUser`) já existe no `window` antes de redeclará-la.
2. **Ordem de Carregamento:** O `index.html` segue uma ordem rigorosa: `supabase-client.js` -> `constants.js` -> `platform components` -> `script.js`. Não altere esta ordem sem testar a autenticação.
3. **Sincronização com Jogos:** Quando um jogo é aberto, ele deve verificar o `localStorage` da plataforma para pular o login. Veja o exemplo implementado em `games/termocore/script.js`.
4. **CSS do Login:** O login é centralizado usando Flexbox. Qualquer alteração no `.screen.active` deve levar em conta que o login precisa de `display: flex` enquanto as outras telas usam `display: block`.

---

## ✅ Checklist de Validação
- [ ] O login funciona e redireciona para a aba de Jogos?
- [ ] O perfil mostra as moedas e XP reais do Supabase?
- [ ] Ao entrar no TermoCore, o login é pulado automaticamente?
- [ ] O botão "Voltar para Plataforma" no jogo funciona?
- [ ] O tema da plataforma muda ao comprar/equipar na loja?

---
**Versão do Documento:** 1.0
**Última Atualização:** 26/06/2026
**Autor:** Manus AI
