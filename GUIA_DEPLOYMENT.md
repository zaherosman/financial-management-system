# 🚀 Guia de Deployment - Sistema de Gestão Financeira

Este guia apresenta várias opções para hospedar sua aplicação e torná-la acessível para outras pessoas.

## 📋 Índice
1. [Opções Gratuitas (Recomendadas)](#opções-gratuitas)
2. [Opções Pagas](#opções-pagas)
3. [Preparação para Deploy](#preparação-para-deploy)
4. [Deploy Passo a Passo](#deploy-passo-a-passo)

---

## 🆓 Opções Gratuitas (Recomendadas)

### 1. **Vercel + Railway (RECOMENDADO)**
- ✅ **Frontend (Vercel)**: Gratuito, ilimitado
- ✅ **Backend (Railway)**: $5 de crédito grátis/mês
- ✅ **Banco de Dados**: PostgreSQL gratuito no Railway
- ✅ **SSL/HTTPS**: Automático
- ✅ **Deploy automático**: Via GitHub

**Melhor para**: Projetos pequenos a médios, fácil de configurar

### 2. **Render (Tudo em um)**
- ✅ **Frontend + Backend**: Gratuito
- ✅ **Banco de Dados**: PostgreSQL gratuito (500MB)
- ✅ **SSL/HTTPS**: Automático
- ⚠️ **Limitação**: Serviço "dorme" após 15 min de inatividade

**Melhor para**: Projetos de demonstração, protótipos

### 3. **Netlify + Heroku**
- ✅ **Frontend (Netlify)**: Gratuito
- ✅ **Backend (Heroku)**: Gratuito (com limitações)
- ⚠️ **Heroku**: Dorme após 30 min de inatividade

---

## 💰 Opções Pagas (Produção)

### 1. **DigitalOcean App Platform**
- 💵 **Custo**: ~$12/mês
- ✅ **Escalável**
- ✅ **Banco de dados gerenciado**
- ✅ **Backups automáticos**

### 2. **AWS (Amazon Web Services)**
- 💵 **Custo**: Variável (~$10-50/mês)
- ✅ **Altamente escalável**
- ✅ **Muitos serviços disponíveis**
- ⚠️ **Complexo de configurar**

### 3. **Google Cloud Platform**
- 💵 **Custo**: Variável (~$10-40/mês)
- ✅ **$300 de crédito grátis (90 dias)**
- ✅ **Escalável**

---

## 🔧 Preparação para Deploy

### Passo 1: Adicionar Banco de Dados

Atualmente, o sistema usa armazenamento em memória. Para produção, precisamos adicionar um banco de dados real.

**Opções de Banco de Dados:**
- PostgreSQL (Recomendado)
- MongoDB
- MySQL

### Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env` para produção:

```env
# Backend
PORT=3001
NODE_ENV=production
DATABASE_URL=sua_url_do_banco_de_dados
FRONTEND_URL=https://seu-frontend.vercel.app

# Frontend
VITE_API_URL=https://seu-backend.railway.app/api
```

### Passo 3: Adicionar Scripts de Build

Já estão configurados no `package.json`, mas verifique:

**Backend:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Frontend:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🚀 Deploy Passo a Passo

### Opção 1: Vercel + Railway (RECOMENDADO)

#### A. Deploy do Backend no Railway

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Configurar variáveis de ambiente**
   ```
   PORT=3001
   NODE_ENV=production
   ```

4. **Adicionar PostgreSQL (Opcional)**
   - No projeto, clique em "+ New"
   - Selecione "Database" → "PostgreSQL"
   - Railway criará automaticamente a `DATABASE_URL`

5. **Deploy**
   - Railway fará deploy automaticamente
   - Anote a URL do backend (ex: `https://seu-app.railway.app`)

#### B. Deploy do Frontend no Vercel

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub

2. **Importar projeto**
   - Clique em "Add New..." → "Project"
   - Selecione seu repositório
   - Configure o diretório raiz: `frontend`

3. **Configurar variáveis de ambiente**
   ```
   VITE_API_URL=https://seu-backend.railway.app/api
   ```

4. **Configurar Build**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Deploy**
   - Clique em "Deploy"
   - Vercel fará deploy automaticamente
   - Sua aplicação estará disponível em: `https://seu-app.vercel.app`

#### C. Atualizar CORS no Backend

Edite `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://seu-app.vercel.app'  // Adicione sua URL do Vercel
  ],
  credentials: true
}));
```

---

### Opção 2: Render (Tudo em um)

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Deploy do Backend**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório
   - Configure:
     - Name: `financial-backend`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Adicione variáveis de ambiente

3. **Deploy do Frontend**
   - Clique em "New +" → "Static Site"
   - Conecte seu repositório
   - Configure:
     - Name: `financial-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Adicione variáveis de ambiente

4. **Adicionar PostgreSQL**
   - Clique em "New +" → "PostgreSQL"
   - Conecte ao backend usando a `DATABASE_URL`

---

## 📊 Adicionar Banco de Dados PostgreSQL

### 1. Instalar dependências

```bash
cd backend
npm install pg
```

### 2. Criar arquivo de configuração do banco

Criar `backend/db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

### 3. Criar tabela de transações

Criar `backend/init-db.sql`:

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('entrada', 'saida')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
```

### 4. Atualizar server.js para usar PostgreSQL

Substituir o armazenamento em memória por queries SQL.

---

## 🔒 Segurança para Produção

### 1. Adicionar autenticação
- Implementar login/registro de usuários
- Usar JWT para autenticação
- Proteger rotas da API

### 2. Validação de dados
- Validar todos os inputs
- Sanitizar dados antes de salvar

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

### 4. HTTPS
- Vercel e Railway fornecem SSL automático
- Sempre use HTTPS em produção

---

## 📱 Domínio Personalizado

### Vercel
1. Vá em Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Railway
1. Vá em Settings → Domains
2. Adicione domínio personalizado
3. Configure DNS

---

## 🔄 Deploy Automático

Ambas as plataformas suportam deploy automático via GitHub:

1. **Conecte seu repositório GitHub**
2. **Cada push para `main` fará deploy automático**
3. **Pull Requests criam ambientes de preview**

---

## 📈 Monitoramento

### Logs
- **Vercel**: Dashboard → Logs
- **Railway**: Dashboard → Deployments → Logs
- **Render**: Dashboard → Logs

### Analytics
- Adicione Google Analytics
- Use Vercel Analytics (gratuito)

---

## 💡 Dicas Importantes

1. **Sempre teste localmente antes de fazer deploy**
2. **Use variáveis de ambiente para configurações sensíveis**
3. **Faça backup do banco de dados regularmente**
4. **Monitore os logs para identificar erros**
5. **Configure alertas para downtime**
6. **Use Git branches para desenvolvimento**

---

## 🆘 Troubleshooting

### Erro de CORS
- Verifique se a URL do frontend está no array `cors.origin`
- Certifique-se de que as URLs não têm `/` no final

### Erro 404 no Frontend
- Verifique se `VITE_API_URL` está correto
- Confirme que o backend está rodando

### Banco de dados não conecta
- Verifique `DATABASE_URL`
- Confirme que o banco está ativo
- Verifique configurações de SSL

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique a documentação da plataforma
2. Consulte os logs de erro
3. Procure no Stack Overflow
4. Entre em contato com o suporte da plataforma

---

## ✅ Checklist de Deploy

- [ ] Código commitado no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e configurado
- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo
- [ ] Domínio personalizado configurado (opcional)
- [ ] Monitoramento configurado
- [ ] Backup do banco de dados configurado

---

**Boa sorte com seu deploy! 🚀**

Se precisar de ajuda específica com alguma plataforma, me avise!