# 🎮 Core Games Platform v2.1.0

**Uma plataforma moderna de biblioteca de jogos com autenticação unificada, perfil global, social, conquistas, loja e roleta.**

![Status](https://img.shields.io/badge/Status-Production-brightgreen)
![Version](https://img.shields.io/badge/Version-2.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Tecnologias](#tecnologias)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Visão Geral

Core Games é uma plataforma de biblioteca de jogos que oferece:

- **Autenticação Unificada**: Um login para todos os jogos
- **Perfil Global**: Nível, XP, Moedas e Fichas compartilhadas entre jogos
- **Sistema Social**: Adicionar amigos, enviar convites
- **Conquistas Globais**: Desbloquear troféus e ganhar recompensas
- **Loja Universal**: Comprar itens cosméticos (temas, avatares, molduras)
- **Roleta da Plataforma**: Girar e ganhar prêmios aleatórios
- **Game Selector**: Interface Netflix-like para escolher jogos
- **Suporte a Múltiplos Jogos**: Arquitetura modular para adicionar novos jogos facilmente

### Primeiro Jogo: TermoCore
Um jogo de palavras tipo Wordle com 4 modos de jogo:
- **5 Letras**: 3 etapas progressivas
- **7 Letras**: 2 etapas com palavras mais longas
- **Sobrevivência**: Rodadas infinitas com limite de vidas
- **Avalanche**: 5 fases com dificuldade exponencial

---

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Registro de nova conta
- ✅ Login com email/senha
- ✅ Recuperação de senha
- ✅ Sincronização com Supabase
- ✅ Persistência de sessão
- ✅ Logout seguro

### 👤 Perfil Global
- ✅ Nível Universal (CG)
- ✅ XP com progressão exponencial
- ✅ Moedas Universais
- ✅ Fichas para Roleta
- ✅ Inventário com filtros
- ✅ Sistema de equipar itens

### 👥 Social Global
- ✅ Adicionar amigos por username
- ✅ Aceitar/Rejeitar convites
- ✅ Remover amigos
- ✅ Bloquear/Desbloquear usuários
- ✅ Convidar para jogar

### 🏆 Conquistas Globais
- ✅ Conquistas globais (Nível, Moedas, Amigos)
- ✅ Conquistas específicas por jogo
- ✅ Filtro por tipo
- ✅ Recompensas (XP, Moedas)
- ✅ Barra de progresso

### 🛒 Loja Universal
- ✅ Temas globais
- ✅ Molduras globais
- ✅ Temas específicos por jogo
- ✅ Avatares específicos por jogo
- ✅ Filtro por escopo e tipo
- ✅ Sistema de compra com moedas

### 🎡 Roleta da Plataforma
- ✅ Roleta visual com 8 segmentos
- ✅ Fichas como moeda
- ✅ Prêmios variados (Moedas, XP, Fichas, Items)
- ✅ Probabilidades configuráveis
- ✅ Animação de rotação
- ✅ Histórico de giros

### 🎮 Game Selector
- ✅ Interface Netflix-like
- ✅ Card em destaque (Featured Game)
- ✅ Grid de jogos responsiva
- ✅ Estatísticas de jogos
- ✅ Status de disponibilidade
- ✅ Animações suaves

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Backend | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Realtime | Supabase Realtime |
| Deploy | Vercel |
| CI/CD | GitHub Actions (automático) |

### Estrutura Modular

```
Platform
├── Auth (Autenticação Unificada)
├── Profile (Perfil Global)
├── Social (Sistema Social)
├── Achievements (Conquistas)
├── Shop (Loja Universal)
├── Roulette (Roleta)
└── Games Selector (Seletor de Jogos)

Games
├── TermoCore (Jogo de Palavras)
├── [Jogo 2] (Em breve)
└── [Jogo 3] (Em breve)
```

---

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- Git
- Conta Supabase
- Conta Vercel

### Passos

1. **Clonar Repositório**
```bash
git clone https://github.com/seu-usuario/termocore.git
cd termocore
```

2. **Configurar Variáveis de Ambiente**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

3. **Instalar Dependências**
```bash
npm install
```

4. **Inicializar Banco de Dados**
```bash
# Executar migrations do Supabase
supabase migration up
```

5. **Iniciar Servidor Local**
```bash
npm run dev
```

Acessar em `http://localhost:5173`

---

## 🚀 Uso

### Primeiro Acesso

1. Acessar https://termocore.vercel.app
2. Clicar em "Registrar"
3. Preencher dados (Email, Username, Senha)
4. Confirmar email
5. Fazer login
6. Ver Game Selector
7. Clicar em TermoCore para jogar

### Ganhar Prêmios

- **Jogar TermoCore**: +50 XP, +10 Moedas por vitória
- **Completar Desafios**: +100 XP, +50 Moedas, +1 Ficha
- **Desbloquear Conquistas**: Recompensas variadas
- **Girar Roleta**: Prêmios aleatórios

### Usar a Loja

1. Ir para aba "Loja"
2. Escolher escopo (Global / TermoCore)
3. Escolher tipo (Tema / Avatar / Moldura)
4. Clicar "Comprar"
5. Item vai para inventário
6. Equipar item (se aplicável)

### Girar a Roleta

1. Ir para aba "Roleta"
2. Verificar fichas disponíveis
3. Clicar "Girar Roleta"
4. Ganhar prêmio aleatório
5. Prêmio é adicionado automaticamente

---

## 📁 Estrutura de Pastas

```
TermoCore/
├── index.html                    # Plataforma Principal
├── script.js                     # Lógica da Plataforma
├── supabase-client.js            # Cliente Supabase
├── .env.example                  # Variáveis de Ambiente
│
├── games/
│   └── termocore/               # TermoCore Original
│       ├── index.html
│       ├── script.js
│       ├── styles.css
│       ├── story_mode/
│       ├── online_mode/
│       ├── assets/
│       └── data/
│
├── platform/
│   ├── auth/                    # Autenticação
│   ├── profile/                 # Perfil Global
│   ├── social/                  # Social Global
│   ├── achievements/            # Conquistas
│   ├── shop/                    # Loja
│   ├── roulette/                # Roleta
│   └── games-selector/          # Seletor de Jogos
│
├── shared/                      # Código Compartilhado
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
    └── DOC_06_IMPLEMENTACAO_V2.1.md
```

---

## 🛠️ Tecnologias

### Frontend
- **HTML5**: Markup semântico
- **CSS3**: Glassmorphism, Gradientes, Animações
- **JavaScript Vanilla**: Sem frameworks, máxima performance
- **Responsive Design**: Mobile-first

### Backend
- **Supabase**: PostgreSQL + Auth + Realtime
- **PostgreSQL**: Banco de dados relacional
- **RLS Policies**: Segurança em nível de linha

### Deploy
- **Vercel**: Hospedagem e CI/CD
- **GitHub**: Versionamento
- **GitHub Actions**: Automação

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Criar branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Padrões de Código

- Usar comentários em português
- Seguir estrutura de pastas existente
- Documentar funções públicas
- Testar em desktop, tablet e mobile

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

- 📧 Email: support@coregames.com
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

---

## 🎉 Agradecimentos

Obrigado a todos que contribuem para melhorar Core Games!

---

**Desenvolvido com ❤️ por Felipe**

**Versão:** 2.1.0 | **Última Atualização:** Junho 2026 | **Status:** ✅ Produção
