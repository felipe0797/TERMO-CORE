# Proposta de Arquitetura e Melhorias para o Modo História do TermoPro

Com base na documentação fornecida para o "Modo Jornadas" (Modo História), apresento uma proposta de arquitetura modular e algumas melhorias para garantir uma implementação limpa, expansível e que minimize o impacto no código base existente do TermoPro.

## 1. Princípios Arquiteturais para Modularidade

Para garantir que o Modo História funcione de forma "separada" e seja facilmente expansível, adotaremos os seguintes princípios:

*   **Encapsulamento Completo:** Toda a lógica, dados e renderização específicos do Modo História serão contidos em arquivos dedicados, minimizando a necessidade de modificar `script.js`, `index.html` ou `styles.css` existentes.
*   **Injeção de Dependências:** O Modo História interagirá com o jogo base (ex: `userStats`, `showToast`, `playSound`) através de uma interface bem definida, em vez de acessar diretamente variáveis globais do `script.js`. Isso pode ser feito passando referências de funções e objetos necessários durante a inicialização do Modo História.
*   **Estrutura de Dados Dedicada:** O estado do Modo História (progresso, estrelas, jornadas ativas) será armazenado em um objeto `STORY_MODE_DATA` separado no `localStorage`, evitando conflitos com `userStats`.
*   **Carregamento Condicional:** Os arquivos JavaScript e CSS do Modo História serão carregados apenas quando o usuário selecionar esse modo, otimizando o desempenho do jogo base.

## 2. Estrutura de Arquivos Proposta

Para organizar o novo modo, sugiro a seguinte estrutura de arquivos:

```
TermoPro - Funcional/
├── index.html
├── styles.css
├── script.js
├── palavras.js
├── words_db.js
├── dict_data.js
├── story_mode/                     # Novo diretório para o Modo História
│   ├── story_mode.html             # Estrutura HTML para o mapa e briefing
│   ├── story_mode.css              # Estilos específicos do Modo História
│   ├── story_mode.js               # Lógica principal do Modo História
│   ├── story_data.js               # Definição das jornadas, capítulos, fases, anomalias e chefes
│   └── assets/                     # Ativos visuais e sonoros do Modo História
│       ├── sfx/                    # Sons específicos
│       └── backgrounds/            # Imagens de fundo temáticas
└── ...
```

### Detalhamento dos Novos Arquivos:

*   **`story_mode/story_mode.html`:** Conterá a estrutura HTML para a tela do mapa de jornadas, os modais de briefing das fases e os pop-ups de recompensa (baús). Este HTML será injetado dinamicamente no `index.html` quando o Modo História for ativado, ou carregado via `fetch` e inserido em um elemento placeholder.
*   **`story_mode/story_mode.css`:** Conterá todos os estilos visuais descritos na documentação (fundo, nós do mapa, animações de faíscas, glitch, etc.). Será carregado dinamicamente.
*   **`story_mode/story_mode.js`:** Este será o controlador principal do Modo História. Ele gerenciará:
    *   Carregamento e salvamento do `STORY_MODE_DATA` no `localStorage`.
    *   Renderização do mapa de jornadas e atualização visual dos nós.
    *   Exibição dos briefings das fases.
    *   Início das fases do jogo, passando as configurações específicas (comprimento da palavra, anomalias, tentativas) para uma função `startGame` modificada no `script.js`.
    *   Processamento do resultado de cada fase (vitória/derrota, estrelas).
    *   Gerenciamento do sistema de recompensas (baús).
    *   Integração com `playSound` e `showToast` do jogo base.
*   **`story_mode/story_data.js`:** Este arquivo será o "banco de dados" das jornadas. Ele exportará um objeto `JORNADAS_DEFINITIONS` que conterá a estrutura completa de cada jornada, seus capítulos, fases, palavras-chave para ambientação, anomalias e mecânicas de chefes. Isso permitirá adicionar novas jornadas simplesmente estendendo este objeto.

## 3. Integração com o Jogo Base (`script.js`)

Para uma integração mínima e limpa, as seguintes modificações serão necessárias no `script.js`:

1.  **Botão "Modo História":** Adicionar um novo botão no `index.html` (e uma função `startStoryMode()` no `script.js`) que, ao ser clicado:
    *   Carregue dinamicamente `story_mode.html`, `story_mode.css` e `story_mode.js`.
    *   Inicialize o `story_mode.js`, passando referências para funções essenciais do jogo base (ex: `startGame`, `showToast`, `playSound`, `getDifficultyMultiplier`, `normalizeWord`, `isValidWord`).
    *   Exiba a tela do mapa de jornadas.
2.  **Função `startGame` Modificada:** A função `startMode` existente no `script.js` será adaptada ou uma nova função `startStoryGame(config)` será criada. Esta função receberá um objeto de configuração detalhado do `story_mode.js` que incluirá:
    *   `mode`: Um novo tipo de modo, ex: `'STORY_MODE_PHASE'`.
    *   `wordLength`: Comprimento da palavra.
    *   `difficulty`: Dificuldade da palavra (para `getRandomWordByDifficulty`).
    *   `numBoards`: Número de tabuleiros.
    *   `maxAttempts`: Número de tentativas.
    *   `anomalies`: Um array de anomalias ativas para a fase (ex: `['THERMAL_OVERLOAD', 'BLOCKED_CELLS']`).
    *   `bossMechanic`: Objeto com detalhes da mecânica de chefe, se aplicável.
    *   `onPhaseComplete`: Um callback para `story_mode.js` notificar o resultado da fase.
3.  **Lógica de Anomalias:** O `script.js` precisará de um sistema para aplicar as anomalias recebidas na configuração da fase. Isso pode ser feito com funções condicionais dentro de `submitAttempt()`, `renderGame()`, `handleInput()`, etc., que verificam `currentGame.activeAnomalies`.
4.  **Sistema de Sons:** A função `playSound()` já existe e será utilizada pelo Modo História.

## 4. Melhorias e Expansões da Ideia Original

A documentação fornecida é rica e detalhada. Aqui estão algumas sugestões para aprimorar ainda mais a experiência e a arquitetura:

### 4.1. Estrutura de `story_data.js` (JORNADAS_DEFINITIONS)

Para a expansibilidade, o `JORNADAS_DEFINITIONS` pode ser estruturado da seguinte forma:

```javascript
const JORNADAS_DEFINITIONS = {
    'jornada_1': {
        id: 'jornada_1',
        name: 'Operação Código Primário',
        description: 'Decodifique as chaves de segurança para purgar o vírus.',
        chapters: [
            {
                id: 'cap_1_subestacao',
                name: 'A Subestação de Energia',
                visualAmbientation: { background: 'url(./story_mode/assets/backgrounds/subestacao.webp)', sparks: true },
                phases: [
                    // Fases 1-9
                    {
                        id: 'fase_1',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        rewardCoins: 50,
                        briefing: 'SETOR 01: INJEÇÃO DE CÓDIGO. Anomalia: Nenhuma. Recompensa: 50 Moedas.',
                    },
                    // ... outras fases
                    // Fase 10 (Chefe)
                    {
                        id: 'fase_10_chefe',
                        name: 'O DISJUNTOR MESTRE',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 3,
                        maxAttempts: 8,
                        anomalies: ['AVALANCHE_ACCELERATED'], // Nova anomalia para chefes
                        isBoss: true,
                        rewardCoins: 200,
                        rewardXP: 50,
                        briefing: 'SETOR 10: O DISJUNTOR MESTRE. Anomalia: Avalanche Acelerada. Recompensa: 200 Moedas, 50 XP.',
                    }
                ]
            },
            // ... Capítulo 2, 3, 4
        ]
    }
    // 'jornada_2': { ... }
};
```

**Melhorias na Estrutura:**

*   **`anomalies` como Array:** Permite que uma fase tenha múltiplas anomalias ativas, como visto na Fase 30 (Chefe) e Fase 40 (Chefe Final).
*   **`isBoss` Flag:** Facilita a identificação de fases de chefe para lógica específica de UI ou mecânicas.
*   **`rewardCoins`, `rewardXP`:** Recompensas por fase podem ser definidas diretamente na fase, além dos baús de capítulo.
*   **`briefing` String:** A string de briefing pode ser definida aqui para facilitar a exibição no pop-up.

### 4.2. Implementação de Anomalias e Chefes

As anomalias e mecânicas de chefes podem ser implementadas como funções separadas no `story_mode.js` que modificam o comportamento do jogo base. Por exemplo:

*   **`applyAnomaly_ThermalOverload(timeLimit)`:** Ativa um cronômetro, e uma função de callback é registrada para `script.js` que verifica o tempo ao `submitAttempt` ou ao final da rodada.
*   **`applyAnomaly_BlockedCells(count)`:** Gera posições aleatórias no tabuleiro que são marcadas como bloqueadas. A função `handleInput` no `script.js` precisaria ser modificada para pular essas posições.
*   **`applyAnomaly_ForbiddenLetters(letters)`:** Registra as letras proibidas. A função `isValidWord` ou `submitAttempt` no `script.js` verificaria se a palavra contém essas letras antes de permitir a submissão.

Para os chefes, as mecânicas seriam combinações e intensificações dessas anomalias, ou novas lógicas específicas (ex: `boss_ConveyorBelt()` para adicionar tabuleiros em erro).

### 4.3. Sistema de Estrelas e Recompensas (Baús)

*   **Cálculo de Estrelas:** A lógica para conceder 1, 2 ou 3 estrelas pode ser uma função no `story_mode.js` que recebe o número de tentativas (`currentGame.currentRow`) e o tempo restante (se houver anomalia de tempo).
*   **Baús de Capítulo:** O `story_mode.js` manterá o controle das estrelas acumuladas por capítulo. Ao atingir os limites (1/3, 2/3, todas), a UI do mapa de jornadas exibirá os baús clicáveis. A função de resgate (`claimChest(chapterId, type)`) adicionaria as recompensas (`userStats.coins`, `userStats.xp`, `userStats.ownedItems` para skins/emblemas) e marcaria o baú como resgatado.

### 4.4. Experiência Sensorial (Áudio e Visual)

*   **Áudio:** A função `playSound()` no `script.js` pode ser estendida para aceitar novos tipos de sons específicos do Modo História (ex: `'glitch'`, `'spark'`). Os arquivos de áudio (`.mp3` ou gerados via Web Audio API) seriam carregados sob demanda pelo `story_mode.js`.
*   **Visual:** As animações de fundo e efeitos visuais seriam controladas pelo `story_mode.css` e `story_mode.js`, que adicionaria/removeria classes CSS ou manipularia elementos DOM para criar os efeitos de faíscas, glitch, etc.

### 4.5. Interface de Briefing

O modal de briefing seria renderizado pelo `story_mode.js` usando os dados da fase (`briefing`, `rewardCoins`, `rewardXP`, `recordes anteriores` - estrelas já obtidas) do `JORNADAS_DEFINITIONS`.

## 5. Próximos Passos

1.  **Criação da Estrutura de Arquivos:** Criar o diretório `story_mode/` e os arquivos `story_mode.html`, `story_mode.css`, `story_mode.js` e `story_data.js`.
2.  **Definição de `JORNADAS_DEFINITIONS`:** Popular `story_data.js` com a estrutura detalhada da "Jornada 1: Operação Código Primário", incluindo todos os capítulos, fases, anomalias e chefes.
3.  **Adaptação do `script.js`:** Implementar o carregamento dinâmico do Modo História e a função `startStoryGame(config)` que permite ao Modo História iniciar fases com configurações personalizadas.
4.  **Desenvolvimento da UI do Mapa:** Criar a interface do mapa de jornadas em `story_mode.html` e `story_mode.css`, com a lógica de renderização e interação em `story_mode.js`.
5.  **Implementação das Anomalias:** Desenvolver a lógica para cada anomalia e mecânica de chefe, integrando-as com o motor do jogo.

Esta abordagem garantirá que o Modo História seja uma adição robusta e bem organizada ao TermoPro, pronta para futuras expansões.
