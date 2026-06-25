# Implementação da Lógica do Jogo

Para criar um clone do "Termo" com a lógica de palavra do dia e validação, siga as instruções abaixo:

## 1. Seleção da Palavra do Dia

A lógica para selecionar a palavra do dia deve ser baseada em uma data fixa (época) para garantir que todos os usuários tenham a mesma palavra no mesmo dia.

```javascript
import { PALAVRAS_SECRETAS } from './respostas.js';

function getPalavraDoDia() {
    // Data de início do jogo (pode ser qualquer data no passado)
    const dataInicio = new Date('2024-01-01').getTime();
    const agora = new Date().getTime();
    
    // Diferença em dias
    const diffDias = Math.floor((agora - dataInicio) / (1000 * 60 * 60 * 24));
    
    // Usa o resto da divisão para ciclar pela lista caso ela acabe
    const index = diffDias % PALAVRAS_SECRETAS.length;
    
    return PALAVRAS_SECRETAS[index].toLowerCase();
}

const palavraSecreta = getPalavraDoDia();
console.log("A palavra de hoje é:", palavraSecreta);
```

## 2. Validação de Tentativas

Antes de processar uma tentativa, você deve verificar se a palavra existe no dicionário amplo.

```javascript
import { LISTA_VALIDACAO } from './validacao.js';
import { PALAVRAS_SECRETAS } from './respostas.js';

// Unimos as duas listas para garantir que respostas também sejam válidas como chute
// Unimos as duas listas para garantir que respostas também sejam válidas como chute
const dicionarioCompleto = [...LISTA_VALIDACAO, ...PALAVRAS_SECRETAS];

function validarPalavra(tentativa) {
    if (!tentativa || tentativa.length !== 5) return false;

    // 1. Normalizar a tentativa do usuário (remover acentos e colocar em minúsculo)
    const tentativaNorm = tentativa.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    
    // 2. Procurar no dicionário completo
    // O Termo aceita a palavra se a versão "limpa" (sem acento) da tentativa
    // coincidir com a versão "limpa" de qualquer palavra na nossa lista.
    return dicionarioCompleto.some(palavraLista => {
        const palavraListaNorm = palavraLista.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        return palavraListaNorm === tentativaNorm;
    });
}

// Exemplo de uso:
if (validarPalavra("TERMO")) {
    console.log("Palavra válida! Processando tentativa...");
} else {
    alert("Palavra não reconhecida no dicionário.");
}
```

## 3. Dica sobre Acentos

O "Termo" original armazena as palavras com acentos nas listas, mas a comparação durante o jogo geralmente ignora os acentos para facilitar a digitação do usuário. Quando o usuário acerta a palavra, o jogo exibe a versão acentuada correta.

Ao implementar a lógica de cores (Verde, Amarelo, Cinza), lembre-se de normalizar ambas as strings (secreta e tentativa) para evitar que "AVIAO" não seja reconhecido como "AVIÃO".
