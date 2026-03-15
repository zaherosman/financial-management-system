# 🚀 Deploy Rápido - Vercel + Railway (GRATUITO)

## ✅ Pré-requisitos
- Conta no GitHub
- Git instalado no seu computador

---

## 📝 Passo 1: Criar Repositório no GitHub

### 1.1 Inicializar Git (se ainda não fez)
```bash
cd /Users/zaherosman/Desktop/financial-management-system
git init
git add .
git commit -m "Initial commit - Sistema de Gestão Financeira"
```

### 1.2 Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `financial-management-system`
3. Deixe como **Público** (necessário para planos gratuitos)
4. **NÃO** marque "Initialize with README"
5. Clique em "Create repository"

### 1.3 Conectar e fazer push
```bash
git remote add origin https://github.com/SEU_USUARIO/financial-management-system.git
git branch -M main
git push -u origin main
```

---

## 🚂 Passo 2: Deploy do Backend no Railway

### 2.1 Criar conta
1. Acesse: https://railway.app
2. Clique em "Login" → "Login with GitHub"
3. Autorize o Railway a acessar seu GitHub

### 2.2 Criar novo projeto
1. No dashboard, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório `financial-management-system`
4. Railway detectará automaticamente o backend

### 2.3 Configurar o serviço
1. Clique no serviço criado
2. Vá em "Settings"
3. Em "Root Directory", digite: `backend`
4. Em "Start Command", digite: `npm start`

### 2.4 Configurar variáveis de ambiente
1. Vá na aba "Variables"
2. Adicione:
   ```
   PORT=3001
   NODE_ENV=production
   ```

### 2.5 Obter URL do backend
1. Vá na aba "Settings"
2. Em "Domains", clique em "Generate Domain"
3. Copie a URL (exemplo: `https://seu-app.up.railway.app`)
4. **GUARDE ESSA URL** - você vai precisar dela!

---

## ▲ Passo 3: Deploy do Frontend no Vercel

### 3.1 Criar conta
1. Acesse: https://vercel.com
2. Clique em "Sign Up" → "Continue with GitHub"
3. Autorize o Vercel a acessar seu GitHub

### 3.2 Importar projeto
1. No dashboard, clique em "Add New..." → "Project"
2. Encontre e selecione `financial-management-system`
3. Clique em "Import"

### 3.3 Configurar o projeto
1. **Framework Preset**: Vite
2. **Root Directory**: Clique em "Edit" e selecione `frontend`
3. **Build Command**: `npm run build` (já preenchido)
4. **Output Directory**: `dist` (já preenchido)

### 3.4 Adicionar variável de ambiente
1. Clique em "Environment Variables"
2. Adicione:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://seu-app.up.railway.app/api` (URL do Railway + /api)
3. Marque todas as opções (Production, Preview, Development)

### 3.5 Deploy!
1. Clique em "Deploy"
2. Aguarde 1-2 minutos
3. Quando terminar, clique em "Visit" para ver sua aplicação!

---

## 🔧 Passo 4: Atualizar CORS no Backend

### 4.1 Obter URL do Vercel
Após o deploy, sua URL será algo como: `https://seu-app.vercel.app`

### 4.2 Atualizar variável no Railway
1. Volte ao Railway
2. Vá em "Variables"
3. Adicione:
   ```
   FRONTEND_URL=https://seu-app.vercel.app
   ```
4. O Railway fará redeploy automaticamente

---

## ✅ Passo 5: Testar a Aplicação

1. Acesse sua URL do Vercel: `https://seu-app.vercel.app`
2. Tente adicionar uma transação
3. Verifique se aparece na lista
4. Teste os gráficos no dashboard

---

## 🎉 Pronto! Sua aplicação está no ar!

### URLs importantes:
- **Frontend**: https://seu-app.vercel.app
- **Backend**: https://seu-app.up.railway.app
- **API**: https://seu-app.up.railway.app/api

### Compartilhe com outras pessoas:
Basta enviar o link do frontend: `https://seu-app.vercel.app`

---

## 🔄 Como Atualizar a Aplicação

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

O Vercel e Railway farão deploy automático das mudanças!

---

## 🆘 Problemas Comuns

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurado no Railway
- Certifique-se de que a URL não tem `/` no final

### Frontend não conecta ao Backend
- Verifique se `VITE_API_URL` está correto no Vercel
- Confirme que tem `/api` no final da URL

### Erro 404
- Verifique se o Root Directory está correto
- Frontend: `frontend`
- Backend: `backend`

---

## 💰 Custos

- **Vercel**: Totalmente GRATUITO
- **Railway**: $5 de crédito grátis/mês (suficiente para este projeto)

---

## 📱 Domínio Personalizado (Opcional)

### No Vercel:
1. Vá em Settings → Domains
2. Adicione seu domínio (ex: `meuapp.com`)
3. Configure DNS conforme instruções

### No Railway:
1. Vá em Settings → Domains
2. Adicione domínio personalizado
3. Configure DNS

---

## 🎯 Próximos Passos

1. ✅ Adicionar autenticação de usuários
2. ✅ Implementar banco de dados PostgreSQL
3. ✅ Adicionar mais funcionalidades
4. ✅ Melhorar o design

---

**Precisa de ajuda? Me avise!** 🚀