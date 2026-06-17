# Documentação: Modo História (Sistema de Jornadas)

## 📋 Visão Geral

O **Modo História** foi implementado como um sistema modular e totalmente separado do código base do TermoPro. Ele permite que os jogadores embarquem em campanhas com narrativa, progredindo através de fases desafiadoras com anomalias únicas e mecânicas especiais.

## 🗂️ Estrutura de Arquivos

```
TermoPro - Funcional/
├── story_mode/
│   ├── story_data.js           # Banco de dados das jornadas (40 fases)
│   ├── story_mode.js           # Controlador principal e lógica
│   ├── story_mode.html         # Estrutura HTML dos modais
│   ├── story_mode.css          # Estilos visuais
│   └── assets/
│       ├── sfx/                # Sons específicos (para futuro)
│       └── backgrounds/        # Imagens de fundo temáticas (para futuro)
├── index.html                  # Atualizado com botão do Modo História
├── script.js                   # Atualizado com funções de integração
└── ...
```

## 🎮 Como Usar

### 1. Acessar o Modo História

Após fazer login no TermoPro, você verá um novo botão **"📖 JORNADAS"** no menu principal ou na sidebar. Clique nele para acessar o Modo História.

### 2. Navegar pelo Mapa

O mapa exibe todos os 4 capítulos da **Jornada 1: Operação Código Primário**:
- **Capítulo 1:** A Subestação de Energia (Fases 1-10)
- **Capítulo 2:** A Linha de Montagem Automatizada (Fases 11-20)
- **Capítulo 3:** A Central de Dados e Redes (Fases 21-30)
- **Capítulo 4:** O Núcleo do Sistema (Fases 31-40)

Cada capítulo mostra:
- Progresso de estrelas coletadas
- Nós de fases (🟢 completa, 🔵 atual, 🔒 bloqueada, ⚔️ chefe)
- Baús de recompensa (Bronze, Prata, Ouro)

### 3. Jogar uma Fase

Clique em um nó de fase desbloqueado para ver o **briefing** com:
- Nome e número da fase
- Anomalias ativas
- Limite de tempo (se houver)
- Recompensas (moedas e XP)
- Recordes anteriores (estrelas já obtidas)

Clique em **"INJETAR CÓDIGO DE PURGA"** para iniciar a fase.

### 4. Sistema de Estrelas

Cada fase concede de 1 a 3 estrelas baseado no desempenho:
- **3 ⭐:** Resolvido até a 3ª tentativa
- **2 ⭐:** Resolvido até a 5ª tentativa
- **1 ⭐:** Resolvido na 6ª tentativa ou nos segundos finais

### 5. Baús de Capítulo

Ao acumular estrelas em um capítulo, você desbloqueia baús:
- **Baú de Bronze:** 1/3 das estrelas → Moedas
- **Baú de Prata:** 2/3 das estrelas → Moedas + Emblema
- **Baú de Ouro:** Todas as estrelas → Moedas + XP + Skin exclusiva

Clique no baú para reivindicar as recompensas!

## 🔧 Arquitetura Técnica

### Modularidade

O Modo História foi projetado para ser **completamente modular**:

1. **Carregamento Dinâmico:** Os arquivos do Modo História são carregados apenas quando o usuário clica no botão "Jornadas".
2. **Sem Modificações Invasivas:** O código base (`script.js`, `index.html`) foi minimamente modificado.
3. **Callbacks de Integração:** O Modo História se comunica com o jogo base através de callbacks bem definidos.

### Fluxo de Dados

```
story_mode.js (UI)
    ↓
    Clica em fase
    ↓
showPhaseBriefing()
    ↓
    Clica "INJETAR CÓDIGO"
    ↓
startStoryPhase()
    ↓
startStoryGame() (script.js)
    ↓
    Jogo executa com config do Modo História
    ↓
handleStoryPhaseWon/Lost()
    ↓
handleStoryPhaseComplete() (story_mode.js)
    ↓
    Atualiza progresso e mostra recompensas
```

### Persistência de Dados

O progresso do Modo História é salvo em `localStorage` sob a chave `STORY_MODE_DATA`:

```javascript
{
    activeJourney: 'jornada_1',
    progress: {
        jornada_1: {
            currentPhase: 1,
            completedPhases: [],
            stars: {},
            claimedChests: {}
        }
    }
}
```

## 🎯 Anomalias Implementadas

O Modo História introduz anomalias que modificam a mecânica do jogo:

### 1. **THERMAL_OVERLOAD** (Sobrecarga Térmica)
- Cronômetro regressivo ativo
- Fase falha se o tempo acabar
- Bônus de tempo em algumas fases

### 2. **BLOCKED_CELLS** (Trilhas Queimadas)
- 1-2 células do tabuleiro ficam bloqueadas
- Jogador não pode digitar nessas posições
- Força adivinhar a palavra com menos informações

### 3. **FORBIDDEN_LETTERS** (Frequência Bloqueada)
- Certas letras são proibidas
- Tentar submeter uma palavra com essas letras resulta em erro
- Força criatividade na escolha de palavras

### 4. **DELAYED_FEEDBACK** (Código Fantasma)
- Cores das letras (verde/amarelo) não aparecem até o 4º palpite
- Aumenta a dificuldade ao remover feedback visual imediato

### 5. **AVALANCHE_ACCELERATED** (Avalanche Acelerada)
- Múltiplos tabuleiros simultâneos desde o início
- Mecânica de chefe

### 6. **CONVEYOR_CHAOS** (Caos de Esteira)
- Novos tabuleiros aparecem a cada 2 erros
- Aumenta progressivamente a dificuldade
- Mecânica de chefe

### 7. **TIME_BONUS** (Bônus de Tempo)
- Cada letra verde descoberta concede +10 segundos
- Combina com cronômetro para recompensar acertos

## 📊 Estrutura de Dados (story_data.js)

Cada fase contém:

```javascript
{
    id: 'fase_1',
    number: 1,
    name: 'Injeção de Código',
    wordLength: 5,
    difficulty: 'EASY',
    numBoards: 1,
    maxAttempts: 6,
    anomalies: [],
    isBoss: false,
    rewardCoins: 50,
    rewardXP: 10,
    briefing: '...'
}
```

## 🚀 Expandindo para Novas Jornadas

Para adicionar uma **Jornada 2**, siga estes passos:

### 1. Adicionar em `story_data.js`

```javascript
const JORNADAS_DEFINITIONS = {
    'jornada_1': { ... },
    'jornada_2': {
        id: 'jornada_2',
        name: 'Sua Nova Jornada',
        description: '...',
        chapters: [
            // Defina seus capítulos aqui
        ]
    }
};
```

### 2. Atualizar o Seletor em `story_mode.html`

```html
<button class="journey-btn" onclick="switchJourney('jornada_2')">
    <span class="journey-icon">🔥</span>
    <span class="journey-name">Sua Nova Jornada</span>
</button>
```

### 3. Pronto!

O Modo História carregará automaticamente a nova jornada sem necessidade de modificar nenhum outro arquivo.

## 🎨 Personalizando Visuais

### Temas de Capítulo

Cada capítulo tem um tema visual em `story_data.js`:

```javascript
visualTheme: {
    background: 'linear-gradient(...)',
    accentColor: '#ffa500',
    particleEffect: 'sparks',
    particleColor: '#ffa500'
}
```

Modifique essas propriedades em `story_mode.css` para criar novos visuais.

### Adicionar Sons

Os sons são gerenciados pela função `playSound()` do jogo base. Para adicionar sons específicos do Modo História:

1. Adicione arquivos `.mp3` em `story_mode/assets/sfx/`
2. Estenda a função `playSound()` em `script.js` para reconhecer novos tipos
3. Chame `playSound('novo_som')` quando necessário

## 📝 Notas Técnicas

### Compatibilidade

- ✅ Funciona em todos os navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Responsivo para mobile
- ✅ Salva progresso em `localStorage`
- ✅ Sem dependências externas

### Performance

- Carregamento dinâmico reduz tamanho inicial
- CSS modular não afeta o jogo base
- Sem vazamento de memória em callbacks

### Segurança

- Dados salvos localmente (sem servidor)
- Validação de palavras reutiliza lógica do jogo base
- Sem acesso a dados sensíveis do usuário

## 🐛 Troubleshooting

### Modo História não aparece

1. Verifique se `story_mode/` existe na pasta do projeto
2. Verifique o console do navegador (F12) para erros
3. Limpe o cache do navegador

### Fases não desbloqueiam

1. Verifique `localStorage` em DevTools → Application
2. Confirme que `STORY_MODE_DATA` está sendo salvo
3. Teste com um novo usuário

### Anomalias não funcionam

1. Verifique se a anomalia está definida em `story_data.js`
2. Confirme que `applyAnomaly()` é chamada em `script.js`
3. Verifique o console para mensagens de erro

## 📞 Suporte

Para questões ou sugestões sobre o Modo História, consulte:
- Código comentado em `story_mode.js`
- Proposta de arquitetura em `proposta_modo_historia.md`
- Relatório de arquitetura em `relatorio_arquitetura.md`

---

**Versão:** 1.0  
**Data:** 15 de Junho de 2026  
**Desenvolvido por:** Manus AI
