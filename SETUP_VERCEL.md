# Deploy no Vercel - TermoCore Online

## 1. Preparar Repositório GitHub

### 1.1 Inicializar Git (se não estiver)
```bash
cd /caminho/para/TermoCore
git init
git add .
git commit -m "Initial commit: TermoCore Online with Supabase integration"
```

### 1.2 Adicionar ao GitHub
```bash
git remote add origin https://github.com/seu-usuario/TERMO-CORE.git
git branch -M main
git push -u origin main
```

## 2. Conectar ao Vercel

### 2.1 Criar Projeto no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione "Import Git Repository"
4. Escolha seu repositório `TERMO-CORE`

### 2.2 Configurar Projeto
1. **Project Name**: `termo-core` (ou seu nome preferido)
2. **Framework Preset**: Selecione "Other" (é um projeto vanilla)
3. **Root Directory**: `.` (raiz do projeto)

### 2.3 Adicionar Variáveis de Ambiente
1. Clique em "Environment Variables"
2. Adicione:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://seu-projeto.supabase.co`
   - Clique em "Add"

3. Adicione novamente:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `sua-chave-publica`
   - Clique em "Add"

### 2.4 Deploy
1. Clique em "Deploy"
2. Aguarde a conclusão (geralmente 1-2 minutos)
3. Você receberá uma URL: `https://seu-projeto.vercel.app`

## 3. Configurar Domínio Customizado (Opcional)

### 3.1 Adicionar Domínio
1. No painel do Vercel, vá para **Settings** > **Domains**
2. Digite seu domínio customizado
3. Siga as instruções de configuração DNS

### 3.2 Configurar CORS no Supabase
1. Vá para Supabase > **Settings** > **API** > **CORS**
2. Adicione seu domínio Vercel:
   - `https://seu-projeto.vercel.app`
   - `https://seu-dominio-customizado.com` (se houver)

## 4. Verificar Deploy

### 4.1 Testar a Aplicação
1. Acesse `https://seu-projeto.vercel.app`
2. Crie uma conta com email e senha
3. Jogue uma partida
4. Verifique se os dados aparecem no Supabase

### 4.2 Verificar Logs
1. No painel do Vercel, clique em **Deployments**
2. Selecione o deployment mais recente
3. Vá para **Logs** para ver erros

## 5. Configurar Deploy Automático

### 5.1 Ativar Auto-Deploy
1. No Vercel, vá para **Settings** > **Git**
2. Certifique-se que "Deploy on push to main" está ativado
3. Agora, cada push para `main` fará deploy automático

### 5.2 Fazer Alterações
```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição da mudança"
git push origin main
```

O Vercel detectará o push e fará deploy automaticamente em ~1 minuto.

## 6. Monitorar Performance

### 6.1 Verificar Métricas
1. No Vercel, vá para **Analytics**
2. Monitore:
   - Requisições
   - Tempo de resposta
   - Erros

### 6.2 Otimizações
- Imagens são servidas via CDN automaticamente
- Cache é gerenciado automaticamente
- Compressão Gzip ativada por padrão

## 7. Troubleshooting

### Erro: "Build failed"
- Verificar logs do Vercel
- Confirmar que `.env` não está no Git
- Verificar se variáveis de ambiente estão corretas

### Erro: "Cannot connect to Supabase"
- Verificar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Confirmar CORS no Supabase
- Verificar se Supabase está online

### Erro: "CORS error"
- Adicionar domínio em Supabase > Settings > API > CORS
- Aguardar 5-10 minutos para propagação

### Aplicação funciona localmente mas não no Vercel
- Verificar variáveis de ambiente
- Limpar cache do navegador
- Fazer novo deployment

## 8. Rollback (Voltar para Versão Anterior)

1. No Vercel, vá para **Deployments**
2. Encontre o deployment anterior
3. Clique nos 3 pontos (...) > **Promote to Production**

## 9. Configurações Recomendadas

### 9.1 Configurar Redirects (opcional)
Se quiser redirecionar `www.seu-dominio.com` para `seu-dominio.com`:

Crie `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://seu-projeto.supabase.co/rest/v1/:path*"
    }
  ]
}
```

### 9.2 Configurar Headers de Segurança
Crie `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 10. Próximos Passos

- ✅ Deploy realizado
- ✅ Domínio configurado
- ✅ Supabase conectado
- 📊 Monitorar métricas
- 🔄 Fazer atualizações via Git

---

**Parabéns!** Seu TermoCore está online! 🚀

**URL**: `https://seu-projeto.vercel.app`

Compartilhe com amigos e comece a jogar!
