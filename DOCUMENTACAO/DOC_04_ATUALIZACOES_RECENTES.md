# 📋 Relatório de Atualizações Recentes (v1.1.1)

Este documento detalha todas as melhorias, correções e novas funcionalidades implementadas no **TermoCore** durante a sessão de desenvolvimento atual.

---

## 🛠️ 1. Melhorias de UI/UX e Design

### **Avatares e Perfil**
- **Formato Circular:** Corrigido o bug que deixava os avatares ovais. Agora, todos os avatares (Perfil, Rankings, Social) são perfeitamente circulares.
- **Dimensionamento Fixo:** O container do avatar agora possui tamanho fixo (68px), garantindo que a aplicação de molduras não empurre outros elementos da interface.
- **Limpeza de Código:** Removidos estilos inline (`border-radius: 8px`) que conflitavam com o design circular.

### **Roleta de Prêmios**
- **Layout Horizontal:** A legenda de itens da roleta foi redesenhada para um formato horizontal mais moderno, exibindo ícone, nome e chance de forma compacta.
- **Menu Colapsável:** Adicionado o botão **"🎁 MOSTRAR RECOMPENSAS"**. As informações de prêmios agora começam ocultas para economizar espaço na tela, sendo exibidas apenas sob demanda.
- **Cores Dinâmicas:** Removidas cores fixas (hardcoded). Agora a roleta adapta suas cores e brilhos automaticamente de acordo com o tema selecionado.

### **Customização Global**
- **Scrollbars Personalizadas:** Implementada uma scrollbar fina e elegante que segue as cores do tema ativo (funciona em Chrome, Edge e Firefox).
- **Modais:** Adicionado botão de fechamento ("X") padronizado em todos os modais para melhor navegação.

---

## 🌐 2. Modo Online (Multiplayer 1v1)

### **Sistema de "Pronto" (Ready Check)**
- **Validação de Início:** O criador da sala agora só pode iniciar a partida se o convidado tiver clicado no botão **"ESTOU PRONTO"**.
- **Interface de Espera:** Adicionada sinalização visual clara de quem está pronto e quem ainda está aguardando.

### **Estabilidade e Desconexão**
- **Abandono de Partida:** Corrigida a lógica de desconexão. Se um jogador sair no meio do duelo, **ambos** são removidos da sala no banco de dados e a sala é encerrada corretamente, evitando registros órfãos.
- **Auto-Limpeza:** Adicionado evento que tenta remover o jogador da sala automaticamente se ele fechar a aba ou recarregar a página.

---

## 💾 3. Persistência e Banco de Dados (Supabase)

### **Gestão de Temas**
- **Salvamento Real:** O tema selecionado agora é salvo na coluna `active_theme` da tabela `game_stats`. Isso garante que, ao deslogar e logar novamente, o tema escolhido permaneça ativo.
- **Troca de Itens:** Corrigida a função de equipar itens para garantir que apenas um tema/avatar esteja marcado como "ativo" no banco por vez.

### **Limpeza de Dados (Data Hygiene)**
- **Salas Vazias:** Implementada lógica para deletar automaticamente registros da tabela `online_rooms` quando o último jogador sai da sala.
- **Visitantes Temporários:** Ao clicar em "Sair" em uma conta de visitante, o sistema agora apaga completamente os registros das tabelas `users` e `game_stats`, mantendo o banco de dados limpo.

---

## 🎨 4. Novos Temas da Loja

O catálogo de temas foi renovado para oferecer mais variedade visual:
- **Remoção:** O tema "Deep Dark" foi descontinuado devido a bugs de legibilidade.
- **Novos Temas:**
  - 🌅 **Sunset Horizon:** Tons quentes de laranja e marrom.
  - 🌲 **Emerald Forest:** Visual elegante em verde esmeralda.
  - 🤖 **Cyberpunk 2077:** Amarelo vibrante com alto contraste.

---

## 📂 5. Documentação Consolidada

Foram criados 4 documentos mestres na pasta `/DOCUMENTACAO` para referência futura:
1. `DOC_01_MESTRE_ATUALIZADA.md`: Funcionamento geral do jogo.
2. `DOC_02_MODO_ONLINE.md`: Detalhes técnicos do multiplayer.
3. `DOC_03_BANCO_DE_DADOS.md`: Dicionário de tabelas e campos.
4. `DOC_04_ATUALIZACOES_RECENTES.md`: Este relatório de mudanças.

---
**Versão Atual:** 1.1.1
**Desenvolvedor:** Manus AI
**Data:** Junho de 2026
