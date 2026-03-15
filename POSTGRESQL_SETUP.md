# 🐘 Configuração do PostgreSQL no Render

Este guia explica como adicionar e configurar o banco de dados PostgreSQL no Render para sua aplicação.

## 📋 Índice
1. [Por que usar PostgreSQL?](#por-que-usar-postgresql)
2. [Criar Banco de Dados no Render](#criar-banco-de-dados-no-render)
3. [Conectar ao Backend](#conectar-ao-backend)
4. [Verificar Conexão](#verificar-conexão)
5. [Migração de Dados](#migração-de-dados)
6. [Backup e Restauração](#backup-e-restauração)

---

## 🎯 Por que usar PostgreSQL?

### Vantagens:
- ✅ **Persistência**: Dados não são perdidos quando o servidor reinicia
- ✅ **Escalabilidade**: Suporta milhares de transações
- ✅ **Confiabilidade**: Banco de dados robusto e testado
- ✅ **Gratuito**: 256MB grátis no Render
- ✅ **Backups**: Backups automáticos disponíveis

### Sem PostgreSQL (Memória):
- ⚠️ Dados perdidos a cada reinicialização
- ⚠️ Limitado pela RAM do servidor
- ⚠️ Não recomendado para produção

---

## 🚀 Criar Banco de Dados no Render

### Passo 1: Acessar o Dashboard
1. Acesse: https://dashboard.render.com
2. Faça login com sua conta

### Passo 2: Criar PostgreSQL
1. Clique em **"New +"** no topo
2. Selecione **"PostgreSQL"**

### Passo 3: Configurar o Banco
Preencha os campos:

**Name**: `financial-db`
- Nome do banco de dados

**Database**: `financial`
- Nome do schema

**User**: `financial_user`
- Usuário do banco

**Region**: `Oregon (US West)`
- Escolha a região mais próxima

**PostgreSQL Version**: `15` (ou mais recente)
- Versão do PostgreSQL

**Instance Type**: **Free**
- Plano gratuito (256 MB)

### Passo 4: Criar
1. Clique em **"Create Database"**
2. Aguarde 1-2 minutos para provisionar

---

## 🔗 Conectar ao Backend

### Passo 1: Copiar URL de Conexão

No dashboard do PostgreSQL:
1. Vá na aba **"Info"**
2. Procure por **"Internal Database URL"**
3. Clique em **"Copy"** para copiar a URL

A URL terá este formato:
```
postgresql://financial_user:senha@dpg-xxxxx.oregon-postgres.render.com/financial
```

### Passo 2: Adicionar ao Backend

1. Vá para o seu serviço de **Backend** no Render
2. Clique em **"Environment"** no menu lateral
3. Clique em **"Add Environment Variable"**
4. Adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a URL copiada
5. Clique em **"Save Changes"**

### Passo 3: Redeploy Automático

O Render fará redeploy automaticamente. Aguarde 1-2 minutos.

---

## ✅ Verificar Conexão

### Método 1: Logs do Backend

1. Vá para o serviço de Backend
2. Clique em **"Logs"** no menu lateral
3. Procure por:
```
✅ Banco de dados inicializado com sucesso
💾 Armazenamento: PostgreSQL
```

### Método 2: Health Check

Acesse a URL do seu backend + `/api/health`:
```
https://seu-backend.onrender.com/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "message": "API funcionando",
  "database": "PostgreSQL",
  "timestamp": "2026-03-15T15:00:00.000Z"
}
```

Se aparecer `"database": "Memory"`, a conexão falhou.

---

## 📊 Estrutura do Banco de Dados

### Tabela: transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('entrada', 'saida')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices

```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
```

---

## 🔄 Migração de Dados

### Se você já tem dados em memória:

1. **Exportar dados atuais**:
   - Vá em "Relatórios"
   - Clique em "Exportar CSV"
   - Salve o arquivo

2. **Ativar PostgreSQL**:
   - Siga os passos acima para conectar

3. **Importar dados**:
   - Adicione as transações manualmente
   - Ou use um script de importação

### Script de Importação (Opcional)

Criar arquivo `backend/import-csv.js`:

```javascript
const fs = require('fs');
const { db } = require('./db');

async function importCSV(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n').slice(1); // Pular header
  
  for (const line of lines) {
    const [date, type, category, amount, description] = line.split(',');
    
    await db.createTransaction({
      type: type.replace(/"/g, ''),
      category: category.replace(/"/g, ''),
      amount: parseFloat(amount),
      description: description?.replace(/"/g, '') || '',
      date: date.replace(/"/g, '')
    });
  }
  
  console.log('Importação concluída!');
}

// Uso: node import-csv.js dados.csv
importCSV(process.argv[2]);
```

---

## 💾 Backup e Restauração

### Backup Manual

1. Acesse o PostgreSQL no Render
2. Vá em **"Backups"**
3. Clique em **"Create Backup"**
4. Aguarde a conclusão

### Backup Automático

O Render faz backups automáticos diários no plano gratuito.

### Restaurar Backup

1. Vá em **"Backups"**
2. Encontre o backup desejado
3. Clique em **"Restore"**
4. Confirme a restauração

---

## 🔧 Troubleshooting

### Erro: "Connection refused"

**Causa**: URL de conexão incorreta

**Solução**:
1. Verifique se copiou a **Internal Database URL**
2. Confirme que não há espaços extras
3. Redeploy o backend

### Erro: "SSL required"

**Causa**: Configuração SSL incorreta

**Solução**:
O código já está configurado para usar SSL em produção:
```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

### Erro: "Table does not exist"

**Causa**: Banco não foi inicializado

**Solução**:
1. Verifique os logs do backend
2. A tabela é criada automaticamente no primeiro acesso
3. Se persistir, conecte via psql e crie manualmente

### Conectar via psql (Avançado)

```bash
# Instalar psql (se necessário)
brew install postgresql  # macOS
sudo apt install postgresql-client  # Linux

# Conectar
psql "postgresql://user:pass@host/database"

# Verificar tabelas
\dt

# Ver dados
SELECT * FROM transactions;
```

---

## 📈 Monitoramento

### Métricas Disponíveis

No dashboard do PostgreSQL:
- **Connections**: Número de conexões ativas
- **Storage**: Espaço usado (máx 256MB no free)
- **CPU**: Uso de CPU
- **Memory**: Uso de memória

### Alertas

Configure alertas para:
- Espaço em disco > 80%
- Muitas conexões abertas
- Erros de conexão

---

## 💡 Dicas de Performance

### 1. Use Índices
Os índices já estão criados automaticamente:
- `date`: Para filtros por período
- `type`: Para separar entradas/saídas
- `category`: Para análises por categoria

### 2. Limite Resultados
Use LIMIT em queries grandes:
```sql
SELECT * FROM transactions ORDER BY date DESC LIMIT 100;
```

### 3. Connection Pooling
O código já usa connection pooling via `pg.Pool`.

### 4. Monitore o Tamanho
Verifique regularmente o espaço usado:
```sql
SELECT pg_size_pretty(pg_database_size('financial'));
```

---

## 🔐 Segurança

### Boas Práticas:

1. **Nunca compartilhe a DATABASE_URL**
   - É como uma senha do banco

2. **Use variáveis de ambiente**
   - Nunca coloque a URL no código

3. **Backups regulares**
   - Faça backup antes de mudanças grandes

4. **Monitore acessos**
   - Verifique logs de conexão

---

## 📚 Recursos Adicionais

### Documentação Oficial:
- **Render PostgreSQL**: https://render.com/docs/databases
- **PostgreSQL**: https://www.postgresql.org/docs/

### Ferramentas Úteis:
- **pgAdmin**: Interface gráfica para PostgreSQL
- **DBeaver**: Cliente universal de banco de dados
- **TablePlus**: Cliente moderno e elegante

---

## ✅ Checklist de Configuração

- [ ] PostgreSQL criado no Render
- [ ] DATABASE_URL adicionada ao backend
- [ ] Backend redployado
- [ ] Conexão verificada via /api/health
- [ ] Primeira transação criada com sucesso
- [ ] Dados persistem após redeploy
- [ ] Backup configurado

---

## 🎉 Pronto!

Seu banco de dados PostgreSQL está configurado e funcionando!

Agora seus dados estão seguros e persistentes. 🚀

**Precisa de ajuda?** Verifique os logs ou entre em contato com o suporte do Render.