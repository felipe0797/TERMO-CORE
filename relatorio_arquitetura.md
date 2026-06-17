# Relatório de Arquitetura do Projeto TermoPro

Este documento apresenta a análise técnica do projeto **TermoPro**, detalhando sua arquitetura de frontend, organização de estado, modos de jogo, sistema de economia, loja de cosméticos e motor inteligente de sorteio.

## 1. Visão Geral da Arquitetura

O TermoPro é uma aplicação web de página única (SPA) baseada inteiramente em Vanilla JavaScript, HTML5 e CSS3, sem uso de frameworks como React ou Vue. A persistência de dados é feita exclusivamente no lado do cliente utilizando o `localStorage` do navegador.

A arquitetura do projeto está centralizada nos seguintes arquivos:
*   **`index.html`**: Define a estrutura da interface, dividida em telas (Login e Principal) e abas (Menu, Loja, Ranking, Conquistas, Jogo). Também contém modais e o overlay de Level Up.
*   **`styles.css`**: Folha de estilos abrangente com uso de variáveis CSS para temas, além de animações de feedback visual (como shake e flip das letras).
*   **`script.js`**: O "cérebro" do jogo. Concentra toda a lógica de negócio, incluindo gerenciamento de estado (`currentUser`, `userStats`, `currentGame`), transições de tela, motor do jogo (Wordle logic), economia e loja.
*   **`palavras.js`**: O dicionário principal, exportando a constante `BANCO_DE_PALAVRAS` dividida por tamanho (ex: `letras5`) e dificuldade (`facil`, `medio`, `dificil`).
*   **`words_db.js` e `dict_data.js`**: Dicionários secundários/alternativos ou legados. O `words_db.js` também inclui a funcionalidade de adição de palavras pelo usuário (`termo_user_words`).

## 2. Modos de Jogo

O jogo implementa quatro modos principais, gerenciados pelas funções `startMode(mode)` e `initStage()` no `script.js`. O objeto global `currentGame` armazena o estado dinâmico da partida atual.

### 5 Letras
Um modo progressivo com palavras de 5 letras dividido em 3 etapas de dificuldade crescente:
*   **Etapa 1:** 1 tabuleiro, 6 tentativas.
*   **Etapa 2:** 3 tabuleiros simultâneos, 8 tentativas.
*   **Etapa 3:** 5 tabuleiros simultâneos, 10 tentativas.

### 7 Letras
Modo avançado focado em palavras longas (7 letras), com 2 etapas:
*   **Etapa 1:** 1 tabuleiro, 6 tentativas.
*   **Etapa 2:** 2 tabuleiros simultâneos, 7 tentativas.

### Sobrevivência
Modo infinito (endless) com palavras de 5 letras:
*   O jogador possui 3 vidas iniciais (`currentGame.lives = 3`).
*   Cada rodada consiste em 1 tabuleiro e 6 tentativas.
*   Se falhar, perde uma vida. O jogo continua até as vidas esgotarem.
*   Há marcos de rodada (5, 15, 30, 50) que acionam a Loja de Vidas (`checkSurvivalShop()`).

### Avalanche
Modo de progressão cíclica e crescente:
*   A quantidade de palavras cresce a cada fase, de 1 até 5 simultâneas.
*   A fórmula é: `(Fase - 1) % 5 + 1` tabuleiros.
*   O número de tentativas é igual ao número de tabuleiros + 5.
*   Após a fase 5 (com 5 palavras), o ciclo reinicia com 1 palavra, mas a contagem da fase continua aumentando.

## 3. Sistema de Economia, XP e Conquistas

O TermoPro utiliza um sistema de progressão contínua armazenado no objeto `userStats` (salvo em `termo_user_{username}` no localStorage).

### Economia (Moedas)
As moedas são ganhas ao vencer etapas ou partidas. O cálculo (`handleStageWon` e `handleGameWon`) é baseado na pontuação da etapa (que considera tentativas não usadas e bônus por quantidade de tabuleiros) multiplicada pelo multiplicador de dificuldade global (Fácil: 0.5x, Normal: 1.0x, Difícil: 1.5x). As moedas são usadas para:
*   Comprar dicas durante a partida (`buyHint()`).
*   Comprar vidas extras no modo Sobrevivência (`buySurvivalLife()`).
*   Comprar itens cosméticos na Loja.

### Progressão (XP e Nível)
A experiência (XP) é concedida ao final de uma partida vitoriosa (base de 100 XP * multiplicador de dificuldade) e ao desbloquear conquistas. A função `getLevelInfo(xp)` calcula o nível atual do jogador usando uma curva exponencial (`Math.pow(xp / 100, 1/1.5)`).

### Conquistas
O sistema de troféus é definido no array `TROPHIES_DEF`. Cada conquista possui uma função `check(stats, level, coins)` que avalia o progresso do usuário. Se o requisito for atingido e o troféu não estiver em `unlockedTrophies`, o jogador pode resgatá-lo para ganhar um bônus de XP.

## 4. Loja e Cosméticos

A loja (`renderShop()` e `handleShopAction()`) permite gastar as moedas acumuladas em dois tipos de itens, definidos em `SHOP_ITEMS`:
*   **Temas (`type: 'theme'`):** Alteram as variáveis CSS globais (`--accent`, `--surface`), modificando o visual do jogo inteiro. Exemplo: "Neon Night" e "Deep Dark".
*   **Avatares (`type: 'avatar'`):** Substituem a inicial do nome do usuário por um emoji especial na barra lateral.

Itens comprados são adicionados ao array `ownedItems` do `userStats`, permitindo que o jogador alterne entre eles sem custo adicional.

## 5. Motor de Sorteio e Anti-Repetição

A escolha da palavra secreta é realizada pela função `getRandomWordByDifficulty(length)`. Este motor possui as seguintes características:

1.  **Seleção por Dificuldade:** Lê do objeto `BANCO_DE_PALAVRAS` (em `palavras.js`). Se a dificuldade global for Fácil ou Difícil, tenta buscar apenas na respectiva categoria. Se for Normal, utiliza um sorteio probabilístico: 25% Fácil, 50% Médio, 25% Difícil.
2.  **Filtro Anti-Repetição (Intra-Partida):** O objeto `currentGame` possui um Set chamado `usedWordsMemory`. Antes de retornar uma palavra sorteada, a função a normaliza e verifica se ela já está no Set. Isso impede que a mesma palavra apareça duas vezes na mesma partida (vital para os modos com múltiplos tabuleiros ou rodadas sucessivas).
3.  **Fallback Seguro:** Caso a categoria desejada esteja vazia ou todas as palavras já tenham sido usadas, o sistema busca em outras categorias ou ignora o filtro anti-repetição, garantindo que o jogo não trave (retornando a palavra "TERMO" em último caso).

## 6. Lógica de Validação Wordle

A função `getLetterState(letter, position, secretWord, attempt)` implementa a regra oficial do Wordle para colorir as letras (Verde, Amarelo, Cinza). Ela resolve o clássico problema de letras repetidas contando as ocorrências da letra na palavra secreta e deduzindo as letras já marcadas como "Corretas" e as já avaliadas em posições anteriores da tentativa, garantindo que uma letra amarela só apareça se houver cópias não encontradas suficientes na palavra secreta.

---
*Relatório gerado por Manus AI após inspeção do código-fonte do TermoPro.*
