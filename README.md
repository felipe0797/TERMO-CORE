# TermoCore Online - Jogo de Palavras Multiplayer

Uma plataforma online de jogo de palavras tipo Termo com múltiplos modos, ranking global e sistema de conquistas.

## 🎮 Modos de Jogo

- **5 Letras**: Adivinhe a palavra em 3 tentativas progressivas
- **7 Letras**: Adivinhe a palavra em 2 tentativas
- **Sobrevivência**: Acerte o máximo de palavras com vidas limitadas
- **Avalanche**: Ciclo de fases com dificuldade progressiva
- **Modo Jornada**: Campanha narrativa com fases, anomalias e recompensas

## 🚀 Setup

### Pré-requisitos
- Node.js 16+ (opcional, para desenvolvimento local)
- Conta no Supabase
- Conta no Vercel

### Instalação Local

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/TERMO-CORE.git
cd TERMO-CORE

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais Supabase
# VITE_SUPABASE_URL=sua_url
# VITE_SUPABASE_ANON_KEY=sua_chave
```

### Executar Localmente

Para testar localmente, basta abrir `index.html` no navegador. O jogo funciona completamente no cliente.

Para usar com um servidor local (Python):
```bash
python3 -m http.server 8000
# Acesse http://localhost:8000
```

## 📊 Banco de Dados (Supabase)

### Tabelas Criadas

1. **users** - Perfis de usuários
2. **game_stats** - Estatísticas de jogo por usuário
3. **journey_progress** - Progresso no Modo Jornada
4. **achievements** - Troféus desbloqueados
5. **shop_items** - Itens cosméticos comprados

### Setup do Supabase

1. Criar projeto no Supabase
2. Executar os scripts SQL em `supabase/migrations/`
3. Habilitar autenticação por email/senha
4. Copiar URL e chave anônima para `.env`

## 🔐 Autenticação

- Email e senha via Supabase Auth
- Sessão persistida automaticamente
- Logout seguro

## 🌐 Deploy no Vercel

1. Fazer push para GitHub
2. Conectar repositório ao Vercel
3. Adicionar variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático

## 📝 Estrutura de Arquivos

```
├── index.html                 # HTML principal
├── script.js                  # Motor de jogo + UI
├── styles.css                 # Glassmorphism design
├── palavras.js                # Banco de 3.000 palavras
├── supabase-client.js         # Cliente Supabase
├── supabase-sync.js           # Sincronização de dados
├── story_mode/
│   ├── story_mode.js          # Controlador da jornada
│   ├── story_data.js          # Dados das jornadas
│   └── story_mode.css         # Estilos da jornada
└── .env                       # Variáveis de ambiente
```

## 🎯 Funcionalidades

- ✅ Autenticação com email/senha
- ✅ Persistência de dados no Supabase
- ✅ Ranking global de jogadores
- ✅ Sistema de conquistas (troféus)
- ✅ Loja de cosméticos (temas e avatares)
- ✅ Modo Jornada com anomalias
- ✅ Sincronização em tempo real

## 🐛 Troubleshooting

### Erro de autenticação
- Verificar se Supabase Auth está habilitado
- Confirmar credenciais em `.env`
- Verificar CORS no Supabase

### Dados não sincronizam
- Verificar conexão com Supabase
- Abrir console do navegador para ver erros
- Confirmar que as tabelas foram criadas

### Ranking não carrega
- Verificar se há dados em `game_stats`
- Confirmar permissões de leitura no Supabase

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no GitHub.

## 📄 Licença

MIT

---

**Desenvolvido por**: Felpz  
**Versão**: 5.0 (Online)
