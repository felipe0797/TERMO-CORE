# Setup do Supabase para TermoCore Online

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha os dados:
   - **Name**: TERMO-CORE
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"

## 2. Executar Migrações SQL

1. Após o projeto ser criado, vá para **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo de `supabase_migrations.sql`
4. Cole no editor
5. Clique em "Run" (ou Ctrl+Enter)

Aguarde a execução completar. Você verá mensagens de sucesso para cada tabela criada.

## 3. Configurar Autenticação

1. Vá para **Authentication** > **Providers**
2. Certifique-se que "Email" está habilitado
3. Em **Email Auth**, configure:
   - **Confirm email**: Desabilitado (para testes) ou Habilitado (produção)
   - **Double confirm change**: Desabilitado

## 4. Obter Credenciais

1. Vá para **Settings** > **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (Publishable Key) → `VITE_SUPABASE_ANON_KEY`
3. Atualize o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

## 5. Configurar CORS (se necessário)

Se o jogo estiver em um domínio diferente:

1. Vá para **Settings** > **API** > **CORS**
2. Adicione seus domínios:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.vercel.app` (produção)
   - `https://seu-dominio-customizado.com` (se houver)

## 6. Testar Conexão

1. Abra o console do navegador (F12)
2. Acesse o jogo
3. Crie uma conta com email e senha
4. Verifique se os dados aparecem em **Supabase** > **Table Editor** > **users**

## 7. Verificar Tabelas

Vá para **Table Editor** e confirme que todas as tabelas foram criadas:
- ✅ users
- ✅ game_stats
- ✅ journey_progress
- ✅ achievements
- ✅ shop_items

## 8. Configurar Vercel (Deploy)

1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Na configuração do projeto, adicione variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático ativado

## ⚠️ Segurança

- **Nunca** compartilhe a chave secreta (`service_role key`)
- Use apenas a chave pública (`anon key`) no frontend
- Mantenha o `.env` fora do Git (use `.env.example`)
- Configure RLS (Row Level Security) para proteção de dados

## 🔍 Troubleshooting

### Erro: "Failed to connect to Supabase"
- Verificar se `VITE_SUPABASE_URL` está correto
- Confirmar se `VITE_SUPABASE_ANON_KEY` é a chave pública (não a secreta)
- Verificar CORS em Settings > API

### Erro: "User already exists"
- Email já registrado
- Tente com outro email

### Dados não sincronizam
- Abrir DevTools (F12) > Console
- Procurar por mensagens de erro
- Verificar se as tabelas foram criadas corretamente

### Ranking não carrega
- Confirmar que há dados em `game_stats`
- Verificar permissões de leitura em RLS

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)

---

**Pronto!** Seu TermoCore está conectado ao Supabase. 🚀
