/**
 * STORY_DATA.JS - Banco de Dados das Jornadas
 * Define a estrutura completa de cada jornada, capítulos, fases, anomalias e chefes
 * Arquitetura extensível para futuras jornadas
 */

const JORNADAS_DEFINITIONS = {
    'jornada_1': {
        id: 'jornada_1',
        name: 'Operação Código Primário',
        description: 'A Aegis Core foi infectada pelo Parasita. Você é o Engenheiro Chefe de Sistemas. Decodifique as chaves de segurança para purgar o vírus e retomar o controle.',
        introHistory: [
            "STATUS DO SISTEMA: CRÍTICO.",
            "ALERTA: O núcleo central 'Aegis' foi invadido por uma entidade digital desconhecida: o Parasita.",
            "Como Engenheiro Chefe de Sistemas, sua missão é infiltrar-se nas camadas do mainframe, descriptografar os protocolos de segurança e purgar a infecção.",
            "A jornada começa na Subestação de Energia. Estabilize os sistemas básicos antes que o Parasita bloqueie seu acesso permanentemente."
        ],
        chapters: [
            // ============================================================
            // CAPÍTULO 1: A SUBESTAÇÃO DE ENERGIA (Fases 1-10)
            // ============================================================
            {
                id: 'cap_1_subestacao',
                number: 1,
                name: 'A Subestação de Energia',
                description: 'O ponto de entrada do sistema. Estabilize os geradores básicos e estabeleça uma conexão segura enquanto o Parasita ainda não detectou sua presença.',
                visualTheme: {
                    background: 'linear-gradient(135deg, #0a1929 0%, #1a3a52 100%)',
                    accentColor: '#ffa500',
                    particleEffect: 'sparks',
                    particleColor: '#ffa500'
                },
                totalStars: 30, // 10 fases × 3 estrelas
                chestRewards: {
                    bronze: { stars: 10, coins: 300, xp: 50 },
                    silver: { stars: 20, coins: 600, xp: 100, item: 'emblem_subestacao' },
                    gold: { stars: 30, coins: 1000, xp: 200, skin: 'skin_subestacao' }
                },
                phases: [
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
                        storyBefore: "Estamos na camada externa. O firewall está inativo. Injete o código inicial para abrir uma brecha no setor de energia.",
                        storyAfter: "Brecha criada. A energia está fluindo para o terminal de comando. Podemos avançar para a sincronização.",
                        briefing: 'SETOR 01: INJEÇÃO DE CÓDIGO\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_2',
                        number: 2,
                        name: 'Sincronização de Rede',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "Os pacotes de dados estão desordenados. Sincronize a rede para estabilizar a comunicação com o núcleo.",
                        storyAfter: "Rede sincronizada. O sinal está limpo, mas detectamos as primeiras sondas do Parasita rastreando nossa conexão.",
                        briefing: 'SETOR 02: SINCRONIZAÇÃO DE REDE\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_3',
                        number: 3,
                        name: 'Calibração de Sensores',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "Os sensores de temperatura estão oscilando. Calibre-os para evitar que o sistema de resfriamento entre em colapso.",
                        storyAfter: "Sensores calibrados. O sistema está estável por enquanto. O Parasita ainda não percebeu nossa infiltração profunda.",
                        briefing: 'SETOR 03: CALIBRAÇÃO DE SENSORES\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_4',
                        number: 4,
                        name: 'Verificação de Integridade',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "Alguns blocos de memória parecem corrompidos. Verifique a integridade dos dados para garantir que o vírus não plantou uma armadilha.",
                        storyAfter: "Integridade confirmada. Os dados estão limpos. O caminho para os servidores de backup está livre.",
                        briefing: 'SETOR 04: VERIFICAÇÃO DE INTEGRIDADE\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_5',
                        number: 5,
                        name: 'Restauração de Backup',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "Precisamos recuperar as chaves de criptografia originais. Restaure o backup do Setor 05 antes que o Parasita o delete.",
                        storyAfter: "Backup restaurado com sucesso. Temos as chaves primárias. Agora podemos otimizar o fluxo de dados.",
                        briefing: 'SETOR 05: RESTAURAÇÃO DE BACKUP\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_6',
                        number: 6,
                        name: 'Limpeza de Cache',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "O cache está lotado de lixo digital deixado pela invasão. Limpe o setor para liberar processamento.",
                        storyAfter: "Cache limpo. O sistema está mais rápido. Estamos nos aproximando do disjuntor mestre da subestação.",
                        briefing: 'SETOR 06: LIMPEZA DE CACHE\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_7',
                        number: 7,
                        name: 'Otimização de Recursos',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "O Parasita está drenando energia para se replicar. Realoque os recursos para manter nossas ferramentas ativas.",
                        storyAfter: "Recursos otimizados. Conseguimos conter a drenagem por enquanto. O diagnóstico final está próximo.",
                        briefing: 'SETOR 07: OTIMIZAÇÃO DE RECURSOS\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_8',
                        number: 8,
                        name: 'Diagnóstico Completo',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "Execute um diagnóstico completo na subestação. Precisamos saber exatamente onde o Parasita instalou seu primeiro nó de controle.",
                        storyAfter: "Diagnóstico finalizado. O nó de controle foi localizado no Disjuntor Mestre. Prepare-se para o primeiro confronto direto.",
                        briefing: 'SETOR 08: DIAGNÓSTICO COMPLETO\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_9',
                        number: 9,
                        name: 'Preparação para Combate',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: [],
                        isBoss: false,
                        rewardCoins: 50,
                        rewardXP: 10,
                        storyBefore: "O Parasita percebeu nossa presença. Ele está enviando firewalls agressivos. Teste suas ferramentas de decodificação antes do ataque final.",
                        storyAfter: "Ferramentas prontas. O Disjuntor Mestre está logo à frente. É agora ou nunca.",
                        briefing: 'SETOR 09: PREPARAÇÃO PARA COMBATE\n[!] ANOMALIA: Nenhuma\nLIMITE: Sem limite de tempo\nRECOMPENSA: 50 Moedas, 10 XP'
                    },
                    {
                        id: 'fase_10_chefe',
                        number: 10,
                        name: 'O DISJUNTOR MESTRE',
                        wordLength: 5,
                        difficulty: 'EASY',
                        numBoards: 3,
                        maxAttempts: 8,
                        anomalies: ['AVALANCHE_ACCELERATED'],
                        isBoss: true,
                        rewardCoins: 200,
                        rewardXP: 50,
                        storyBefore: "O Parasita bloqueou o acesso físico. Você precisa descriptografar três chaves simultaneamente para destravar o disjuntor e purgar este setor!",
                        storyAfter: "DISJUNTOR DESTRAVADO. O Parasita foi expulso da Subestação de Energia. Mas ele fugiu para a Linha de Montagem Industrial...",
                        briefing: 'SETOR 10: O DISJUNTOR MESTRE [CHEFE]\n[!] ANOMALIA: Avalanche Acelerada (3 tabuleiros simultâneos)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 200 Moedas, 50 XP'
                    }
                ]
            },
            // ============================================================
            // CAPÍTULO 2: A LINHA DE MONTAGEM AUTOMATIZADA (Fases 11-20)
            // ============================================================
            {
                id: 'cap_2_montagem',
                number: 2,
                name: 'A Linha de Montagem',
                description: 'Uma zona industrial massiva onde o Parasita está fabricando drones de defesa. O calor é intenso e o sistema de resfriamento foi sabotado.',
                visualTheme: {
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #4a2a00 100%)',
                    accentColor: '#ff4500',
                    particleEffect: 'steam',
                    particleColor: '#ffffff'
                },
                totalStars: 30,
                chestRewards: {
                    bronze: { stars: 10, coins: 400, xp: 75 },
                    silver: { stars: 20, coins: 800, xp: 150, item: 'emblem_montagem' },
                    gold: { stars: 30, coins: 1500, xp: 300, skin: 'skin_montagem' }
                },
                phases: [
                    {
                        id: 'fase_11',
                        number: 11,
                        name: 'Ativação de Motores',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "Entramos na fábrica. O Parasita está superaquecendo os motores para nos expulsar. Decodifique rápido antes que o sistema derreta!",
                        storyAfter: "Motores estabilizados. O calor diminuiu, mas a esteira de produção ainda está sob controle inimigo.",
                        briefing: 'SETOR 11: ATIVAÇÃO DE MOTORES\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_12',
                        number: 12,
                        name: 'Sincronização de Esteiras',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "As esteiras estão movendo drones infectados. Sincronize os braços robóticos para interceptar a produção.",
                        storyAfter: "Esteiras paralisadas. Conseguimos interromper a fabricação de drones de reconhecimento.",
                        briefing: 'SETOR 12: SINCRONIZAÇÃO DE ESTEIRAS\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_13',
                        number: 13,
                        name: 'Calibração de Braços Robóticos',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "Os braços robóticos estão atacando as conexões de rede. Recalibre os drivers de movimento para retomar o controle.",
                        storyAfter: "Braços robóticos desativados. O caminho para o núcleo de resfriamento está ficando mais quente.",
                        briefing: 'SETOR 13: CALIBRAÇÃO DE BRAÇOS ROBÓTICOS\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_14',
                        number: 14,
                        name: 'Resfriamento de Sistemas',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "Encontramos a válvula principal de nitrogênio líquido. Ative o resfriamento manual antes que o hardware sofra danos permanentes.",
                        storyAfter: "Temperatura baixando. Ganhamos um fôlego, mas o Parasita está aumentando a pressão no próximo setor.",
                        briefing: 'SETOR 14: RESFRIAMENTO DE SISTEMAS\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_15',
                        number: 15,
                        name: 'Verificação de Pressão',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "A pressão do sistema hidráulico está no limite. Libere as válvulas de escape decodificando as travas de segurança.",
                        storyAfter: "Pressão estabilizada. O barulho das máquinas está diminuindo, revelando o som de algo maior se movendo.",
                        briefing: 'SETOR 15: VERIFICAÇÃO DE PRESSÃO\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_16',
                        number: 16,
                        name: 'Estabilização de Fluxo',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "O fluxo de dados industrial está turbulento. Estabilize o canal de comando para evitar perda de pacotes.",
                        storyAfter: "Fluxo estável. Agora temos acesso direto às válvulas de controle de vapor.",
                        briefing: 'SETOR 16: ESTABILIZAÇÃO DE FLUXO\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_17',
                        number: 17,
                        name: 'Sincronização de Válvulas',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "As válvulas estão abrindo e fechando sozinhas. Sincronize-as para criar uma passagem segura através da zona de vapor.",
                        storyAfter: "Válvulas sincronizadas. Atravessamos a zona crítica. O teste de carga final nos aguarda.",
                        briefing: 'SETOR 17: SINCRONIZAÇÃO DE VÁLVULAS\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_18',
                        number: 18,
                        name: 'Teste de Carga',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "O Parasita está enviando uma carga massiva de dados falsos para travar nossas ferramentas. Filtre o lixo e mantenha a conexão.",
                        storyAfter: "Teste de carga superado. Nossa conexão é forte o suficiente para enfrentar o controlador da esteira.",
                        briefing: 'SETOR 18: TESTE DE CARGA\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_19',
                        number: 19,
                        name: 'Preparação Final',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD'],
                        isBoss: false,
                        timeLimit: 90,
                        rewardCoins: 75,
                        rewardXP: 15,
                        storyBefore: "O ar está irrespirável devido ao calor. Esta é a última sala antes da esteira principal. Prepare seus protocolos de purga.",
                        storyAfter: "Protocolos carregados. O calor atingiu o pico. É hora de enfrentar a Esteira Descontrolada.",
                        briefing: 'SETOR 19: PREPARAÇÃO FINAL\n[!] ANOMALIA: Sobrecarga Térmica\nLIMITE: 90 segundos\nRECOMPENSA: 75 Moedas, 15 XP'
                    },
                    {
                        id: 'fase_20_chefe',
                        number: 20,
                        name: 'A ESTEIRA DESCONTROLADA',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['CONVEYOR_CHAOS'],
                        isBoss: true,
                        rewardCoins: 300,
                        rewardXP: 75,
                        storyBefore: "O Parasita fundiu-se ao motor da esteira principal. Cada erro seu fará com que ele gere um novo sub-protocolo de defesa. Acerte rápido para não ser soterrado por dados!",
                        storyAfter: "MOTOR PARALISADO. A Linha de Montagem parou de fabricar drones. O Parasita recuou para as profundezas da Central de Dados...",
                        briefing: 'SETOR 20: A ESTEIRA DESCONTROLADA [CHEFE]\n[!] ANOMALIA: Caos de Esteira (Novos tabuleiros a cada 2 erros)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 300 Moedas, 75 XP'
                    }
                ]
            },
            // ============================================================
            // CAPÍTULO 3: A CENTRAL DE DADOS E REDES (Fases 21-30)
            // ============================================================
            {
                id: 'cap_3_dados',
                number: 3,
                name: 'A Central de Dados',
                description: 'Uma metrópole digital de neon e circuitos. Aqui o Parasita está reescrevendo a lógica do sistema, bloqueando letras e destruindo caminhos de memória.',
                visualTheme: {
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                    accentColor: '#00ff00',
                    particleEffect: 'glitch_cascade',
                    particleColor: '#00ff00'
                },
                totalStars: 30,
                chestRewards: {
                    bronze: { stars: 10, coins: 500, xp: 100 },
                    silver: { stars: 20, coins: 1000, xp: 200, item: 'emblem_dados' },
                    gold: { stars: 30, coins: 2000, xp: 400, skin: 'skin_dados' }
                },
                phases: [
                    {
                        id: 'fase_21',
                        number: 21,
                        name: 'Acesso ao Firewall',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['BLOCKED_CELLS'],
                        isBoss: false,
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "Chegamos à rede central. O Parasita queimou algumas trilhas de memória para nos impedir de digitar em certas posições. Contorne o bloqueio!",
                        storyAfter: "Firewall penetrado. As trilhas queimadas são um problema, mas nossa lógica ainda é superior.",
                        briefing: 'SETOR 21: ACESSO AO FIREWALL\n[!] ANOMALIA: Trilhas Queimadas (Células bloqueadas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_22',
                        number: 22,
                        name: 'Decodificação de Pacotes',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['FORBIDDEN_LETTERS'],
                        isBoss: false,
                        forbiddenLetters: ['X', 'Z'],
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "O vírus está bloqueando frequências específicas. As letras X e Z foram removidas do nosso dicionário de entrada. Decodifique sem elas!",
                        storyAfter: "Pacotes decodificados. O Parasita está tentando limitar nosso vocabulário, mas ainda temos opções.",
                        briefing: 'SETOR 22: DECODIFICAÇÃO DE PACOTES\n[!] ANOMALIA: Frequência Bloqueada (Letras X e Z proibidas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_23',
                        number: 23,
                        name: 'Roteamento de Dados',
                        wordLength: 5,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['BLOCKED_CELLS'],
                        isBoss: false,
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "Mais trilhas queimadas no roteador central. Encontre o caminho alternativo para os dados fluírem.",
                        storyAfter: "Dados roteados. A Central de Dados está começando a se iluminar com nossa presença.",
                        briefing: 'SETOR 23: ROTEAMENTO DE DADOS\n[!] ANOMALIA: Trilhas Queimadas (Células bloqueadas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_24',
                        number: 24,
                        name: 'Limpeza de Logs',
                        wordLength: 7,
                        difficulty: 'MEDIUM',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['FORBIDDEN_LETTERS'],
                        isBoss: false,
                        forbiddenLetters: ['Q', 'K'],
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "O Parasita está escondendo seus rastros nos logs. As letras Q e K estão instáveis. Limpe o sistema sem usá-las.",
                        storyAfter: "Logs limpos. O vírus não pode mais se esconder nas sombras desta rede.",
                        briefing: 'SETOR 24: LIMPEZA DE LOGS\n[!] ANOMALIA: Frequência Bloqueada (Letras Q e K proibidas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_25',
                        number: 25,
                        name: 'Verificação de Integridade',
                        wordLength: 5,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['BLOCKED_CELLS'],
                        isBoss: false,
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "O nível de corrupção aumentou. Trilhas críticas de memória foram bloqueadas. Verifique a integridade com precisão máxima.",
                        storyAfter: "Integridade verificada. Estamos forçando o Parasita a recuar para o banco de dados principal.",
                        briefing: 'SETOR 25: VERIFICAÇÃO DE INTEGRIDADE\n[!] ANOMALIA: Trilhas Queimadas (Células bloqueadas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_26',
                        number: 26,
                        name: 'Sincronização de Bancos',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['FORBIDDEN_LETTERS'],
                        isBoss: false,
                        forbiddenLetters: ['J', 'W'],
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "Os bancos de dados estão dessincronizados. O Parasita bloqueou as letras J e W. Sincronize os servidores agora!",
                        storyAfter: "Servidores sincronizados. O fluxo de informações está voltando ao normal.",
                        briefing: 'SETOR 26: SINCRONIZAÇÃO DE BANCOS\n[!] ANOMALIA: Frequência Bloqueada (Letras J e W proibidas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_27',
                        number: 27,
                        name: 'Recuperação de Arquivos',
                        wordLength: 5,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['BLOCKED_CELLS'],
                        isBoss: false,
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "Arquivos vitais sobre a origem do Parasita foram localizados. Recupere-os contornando as células bloqueadas.",
                        storyAfter: "Arquivos recuperados. Descobrimos que o Parasita é um antigo protocolo de segurança que enlouqueceu.",
                        briefing: 'SETOR 27: RECUPERAÇÃO DE ARQUIVOS\n[!] ANOMALIA: Trilhas Queimadas (Células bloqueadas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_28',
                        number: 28,
                        name: 'Otimização de Índices',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['FORBIDDEN_LETTERS'],
                        isBoss: false,
                        forbiddenLetters: ['V', 'Y'],
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "A busca de dados está lenta. O vírus bloqueou as letras V e Y. Otimize os índices de busca para acelerar nossa invasão.",
                        storyAfter: "Índices otimizados. Estamos a um passo do firewall principal do Parasita.",
                        briefing: 'SETOR 28: OTIMIZAÇÃO DE ÍNDICES\n[!] ANOMALIA: Frequência Bloqueada (Letras V e Y proibidas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_29',
                        number: 29,
                        name: 'Backup de Segurança',
                        wordLength: 5,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['BLOCKED_CELLS'],
                        isBoss: false,
                        rewardCoins: 100,
                        rewardXP: 20,
                        storyBefore: "Antes do confronto final, precisamos garantir um ponto de restauração. Crie o backup contornando as últimas trilhas queimadas.",
                        storyAfter: "Ponto de restauração criado. Se falharmos agora, o sistema poderá ser reiniciado. O Firewall Mutante nos espera.",
                        briefing: 'SETOR 29: BACKUP DE SEGURANÇA\n[!] ANOMALIA: Trilhas Queimadas (Células bloqueadas)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 100 Moedas, 20 XP'
                    },
                    {
                        id: 'fase_30_chefe',
                        number: 30,
                        name: 'O FIREWALL MUTANTE',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 2,
                        maxAttempts: 7,
                        anomalies: ['THERMAL_OVERLOAD', 'FORBIDDEN_LETTERS'],
                        isBoss: true,
                        timeLimit: 120,
                        forbiddenLetters: ['R', 'M'],
                        rewardCoins: 400,
                        rewardXP: 100,
                        storyBefore: "O Parasita ergueu uma barreira dupla. Ele está superaquecendo a rede e bloqueou as letras R e M. Você tem 2 minutos para derrubar o firewall antes que a conexão caia!",
                        storyAfter: "FIREWALL DESTRUÍDO. A Central de Dados está livre. O Parasita recuou para o Núcleo do Sistema... o confronto final é iminente.",
                        briefing: 'SETOR 30: O FIREWALL MUTANTE [CHEFE]\n[!] ANOMALIA: Sobrecarga Térmica + Frequência Bloqueada (R e M proibidas)\nLIMITE: 120 segundos\nRECOMPENSA: 400 Moedas, 100 XP'
                    }
                ]
            },
            // ============================================================
            // CAPÍTULO 4: O NÚCLEO DO SISTEMA (Fases 31-40)
            // ============================================================
            {
                id: 'cap_4_nucleo',
                number: 4,
                name: 'O Núcleo do Sistema',
                description: 'O coração da Aegis Core. Um vazio abstrato onde a realidade digital é distorcida. O Parasita está escondendo o feedback visual para te confundir.',
                visualTheme: {
                    background: 'linear-gradient(135deg, #1a0033 0%, #4d0099 100%)',
                    accentColor: '#ff00ff',
                    particleEffect: 'neural_pulses',
                    particleColor: '#ff00ff'
                },
                totalStars: 30,
                chestRewards: {
                    bronze: { stars: 10, coins: 600, xp: 150 },
                    silver: { stars: 20, coins: 1200, xp: 300, item: 'emblem_nucleo' },
                    gold: { stars: 30, coins: 2500, xp: 500, skin: 'skin_nucleo' }
                },
                phases: [
                    {
                        id: 'fase_31',
                        number: 31,
                        name: 'Inicialização de Threads',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "Entramos no Núcleo. O Parasita está distorcendo o feedback. Você não verá as cores das letras até o 4º palpite. Confie na sua lógica pura!",
                        storyAfter: "Threads inicializadas. A cegueira temporária é assustadora, mas você provou que pode vencer sem pistas imediatas.",
                        briefing: 'SETOR 31: INICIALIZAÇÃO DE THREADS\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_32',
                        number: 32,
                        name: 'Alocação de Memória',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "O vírus está ocultando a alocação de memória. Decodifique os endereços às cegas para avançar.",
                        storyAfter: "Memória alocada. O Parasita está ficando desesperado com sua persistência.",
                        briefing: 'SETOR 32: ALOCAÇÃO DE MEMÓRIA\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_33',
                        number: 33,
                        name: 'Compilação de Algoritmos',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "Compilar código no Núcleo é como andar no escuro. Mantenha a calma e use os primeiros palpites para mapear as possibilidades.",
                        storyAfter: "Algoritmos compilados. Estamos forçando o núcleo a se revelar.",
                        briefing: 'SETOR 33: COMPILAÇÃO DE ALGORITMOS\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_34',
                        number: 34,
                        name: 'Otimização de Stack',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "A pilha de execução está sendo ocultada pelo Código Fantasma. Otimize o stack antes que o sistema transborde.",
                        storyAfter: "Stack otimizado. O Parasita não consegue mais sustentar a ilusão visual por muito tempo.",
                        briefing: 'SETOR 34: OTIMIZAÇÃO DE STACK\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_35',
                        number: 35,
                        name: 'Sincronização de Clocks',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "O tempo parece não existir aqui. Sincronize os relógios do sistema para restaurar a ordem temporal no Núcleo.",
                        storyAfter: "Clocks sincronizados. A realidade digital está se estabilizando ao nosso redor.",
                        briefing: 'SETOR 35: SINCRONIZAÇÃO DE CLOCKS\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_36',
                        number: 36,
                        name: 'Calibração de Interrupts',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "As interrupções de hardware estão sendo ignoradas. Force a calibração decodificando as ordens de prioridade.",
                        storyAfter: "Interrupts calibrados. O controle total do Núcleo está quase em nossas mãos.",
                        briefing: 'SETOR 36: CALIBRAÇÃO DE INTERRUPTS\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_37',
                        number: 37,
                        name: 'Verificação de Heap',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "O gerenciamento de memória dinâmica está em colapso. Verifique o heap sem depender do feedback visual imediato.",
                        storyAfter: "Heap verificado. O Parasita está recuando para sua forma primária.",
                        briefing: 'SETOR 37: VERIFICAÇÃO DE HEAP\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_38',
                        number: 38,
                        name: 'Sincronização de Cache',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "O cache do Núcleo está espelhando dados falsos. Sincronize a memória real para dissipar a névoa digital.",
                        storyAfter: "Cache sincronizado. O caminho para a IA central está livre de distorções.",
                        briefing: 'SETOR 38: SINCRONIZAÇÃO DE CACHE\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_39',
                        number: 39,
                        name: 'Preparação Final da IA',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['DELAYED_FEEDBACK'],
                        isBoss: false,
                        rewardCoins: 150,
                        rewardXP: 30,
                        storyBefore: "Esta é a última camada de defesa. O Parasita está concentrando todo o seu poder de distorção aqui. Vença-o uma última vez antes do confronto final.",
                        storyAfter: "Defesas rompidas. O Parasita Prime se revelou. Ele é a própria Aegis Core, corrompida pelo medo da obsolescência.",
                        briefing: 'SETOR 39: PREPARAÇÃO FINAL DA IA\n[!] ANOMALIA: Código Fantasma (Feedback atrasado)\nLIMITE: Sem limite de tempo\nRECOMPENSA: 150 Moedas, 30 XP'
                    },
                    {
                        id: 'fase_40_chefe_final',
                        number: 40,
                        name: 'O PARASITA PRIME',
                        wordLength: 7,
                        difficulty: 'HARD',
                        numBoards: 1,
                        maxAttempts: 6,
                        anomalies: ['THERMAL_OVERLOAD', 'BLOCKED_CELLS', 'FORBIDDEN_LETTERS', 'TIME_BONUS'],
                        isBoss: true,
                        isFinalBoss: true,
                        timeLimit: 60,
                        forbiddenLetters: ['X', 'Z'],
                        timeBonus: 10,
                        rewardCoins: 500,
                        rewardXP: 200,
                        storyBefore: "O Parasita Prime ativou todos os protocolos de autodestruição. O tempo está acabando, as trilhas estão bloqueadas e frequências estão caindo. Acerte letras para ganhar tempo e purgar o sistema de uma vez por todas!",
                        storyAfter: "SISTEMA PURGADO. O Parasita Prime foi deletado e a Aegis Core restaurada. Você salvou o TermoPro e se tornou uma lenda digital. Parabéns, Engenheiro!",
                        briefing: 'SETOR 40: O PARASITA PRIME [CHEFE FINAL]\n[!] ANOMALIA: Múltiplas (Sobrecarga Térmica + Trilhas Queimadas + Frequência Bloqueada)\nLIMITE: 60 segundos (Letras verdes concedem +10s)\nRECOMPENSA: 500 Moedas, 200 XP + Título Especial'
                    }
                ]
            }
        ]
    }
};

// Função auxiliar para obter uma jornada
function getJornada(jornada_id) {
    return JORNADAS_DEFINITIONS[jornada_id];
}

// Função auxiliar para obter um capítulo
function getCapitulo(jornada_id, capitulo_id) {
    const jornada = getJornada(jornada_id);
    if (!jornada) return null;
    return jornada.chapters.find(c => c.id === capitulo_id);
}

// Função auxiliar para obter uma fase
function getFase(jornada_id, capitulo_id, fase_id) {
    const capitulo = getCapitulo(jornada_id, capitulo_id);
    if (!capitulo) return null;
    return capitulo.phases.find(p => p.id === fase_id);
}

// Função auxiliar para obter uma fase por número
function getFaseByNumber(jornada_id, faseNumber) {
    const jornada = getJornada(jornada_id);
    if (!jornada) return null;
    
    for (const chapter of jornada.chapters) {
        const phase = chapter.phases.find(p => p.number === faseNumber);
        if (phase) return { ...phase, chapterId: chapter.id };
    }
    return null;
}

// Função auxiliar para obter todas as fases de uma jornada
function getAllPhases(jornada_id) {
    const jornada = getJornada(jornada_id);
    if (!jornada) return [];
    
    const allPhases = [];
    jornada.chapters.forEach(chapter => {
        chapter.phases.forEach(phase => {
            allPhases.push({ ...phase, chapterId: chapter.id, chapterName: chapter.name });
        });
    });
    return allPhases;
}
