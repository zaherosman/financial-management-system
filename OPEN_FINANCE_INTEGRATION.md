# 🏦 Integração com Open Finance Brasil

## O que é Open Finance?

Open Finance Brasil é o sistema que permite compartilhar dados financeiros entre instituições autorizadas pelo Banco Central, com consentimento do cliente. Você pode importar automaticamente suas transações bancárias!

## Benefícios da Integração

✅ **Importação Automática** - Transações bancárias sincronizadas automaticamente
✅ **Categorização Inteligente** - IA para categorizar transações
✅ **Múltiplas Contas** - Conecte várias contas bancárias
✅ **Dados em Tempo Real** - Saldo e transações atualizados
✅ **Segurança** - Padrão do Banco Central do Brasil

## Provedores de API Open Finance

### 1. **Pluggy** (Recomendado para começar)
- 🆓 Plano gratuito disponível
- 📚 Documentação em português
- 🇧🇷 Focado no mercado brasileiro
- 🔗 https://pluggy.ai

**Recursos:**
- 200+ instituições financeiras
- Sandbox para testes
- SDK em Node.js
- Webhooks para atualizações

### 2. **Belvo**
- 🌎 América Latina
- 💰 Plano gratuito limitado
- 🔗 https://belvo.com

### 3. **Yapily**
- 🌍 Global
- 💼 Mais voltado para empresas
- 🔗 https://yapily.com

### 4. **Banco Central - Diretório Open Finance**
- 📋 Lista oficial de participantes
- 🔗 https://openbankingbrasil.org.br

## Arquitetura da Integração

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│  (Express API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Pluggy API     │◄────►│  Banco Central   │
│  (Open Finance) │      │  (Regulador)     │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Bancos         │
│  (Itaú, BB,     │
│   Nubank, etc)  │
└─────────────────┘
```

## Implementação com Pluggy

### Passo 1: Criar Conta no Pluggy

1. Acesse https://dashboard.pluggy.ai/signup
2. Crie uma conta gratuita
3. Obtenha suas credenciais:
   - `CLIENT_ID`
   - `CLIENT_SECRET`

### Passo 2: Instalar Dependências

```bash
cd backend
npm install pluggy-sdk axios
```

### Passo 3: Configurar Variáveis de Ambiente

Adicione ao `backend/.env`:

```env
# Open Finance - Pluggy
PLUGGY_CLIENT_ID=seu_client_id_aqui
PLUGGY_CLIENT_SECRET=seu_client_secret_aqui
PLUGGY_ENVIRONMENT=sandbox  # ou 'production'
```

### Passo 4: Estrutura de Arquivos

```
backend/
├── services/
│   ├── openFinance.js      # Serviço principal
│   └── transactionSync.js  # Sincronização
├── routes/
│   └── openFinance.js      # Rotas da API
└── models/
    └── BankConnection.js   # Modelo de conexão
```

## Fluxo de Integração

### 1. Conectar Banco (Frontend)

```javascript
// Usuário clica em "Conectar Banco"
// Abre widget do Pluggy
// Usuário faz login no banco
// Pluggy retorna itemId (conexão estabelecida)
```

### 2. Sincronizar Transações (Backend)

```javascript
// Backend recebe itemId
// Busca transações do Pluggy
// Converte para formato da aplicação
// Salva no banco de dados local
```

### 3. Atualização Automática

```javascript
// Webhook do Pluggy notifica novas transações
// Backend sincroniza automaticamente
// Frontend atualiza em tempo real
```

## Exemplo de Código

### Backend - Serviço Open Finance

```javascript
// backend/services/openFinance.js
const { PluggyClient } = require('pluggy-sdk');

class OpenFinanceService {
  constructor() {
    this.client = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      environment: process.env.PLUGGY_ENVIRONMENT || 'sandbox'
    });
  }

  async getConnectToken() {
    // Gera token para conectar banco
    return await this.client.createConnectToken();
  }

  async getTransactions(itemId, from, to) {
    // Busca transações de uma conexão
    const accounts = await this.client.fetchAccounts(itemId);
    
    const allTransactions = [];
    for (const account of accounts) {
      const transactions = await this.client.fetchTransactions(
        account.id,
        { from, to }
      );
      allTransactions.push(...transactions);
    }
    
    return this.convertToAppFormat(allTransactions);
  }

  convertToAppFormat(pluggyTransactions) {
    return pluggyTransactions.map(t => ({
      type: t.amount > 0 ? 'entrada' : 'saida',
      category: this.categorizeTransaction(t.description),
      amount: Math.abs(t.amount),
      description: t.description,
      date: t.date,
      source: 'open_finance',
      externalId: t.id,
      bankName: t.account?.bankName
    }));
  }

  categorizeTransaction(description) {
    // IA simples para categorizar
    const desc = description.toLowerCase();
    
    if (desc.includes('salario') || desc.includes('salary')) {
      return 'Salário';
    }
    if (desc.includes('aluguel') || desc.includes('rent')) {
      return 'Moradia';
    }
    if (desc.includes('mercado') || desc.includes('supermercado')) {
      return 'Alimentação';
    }
    // ... mais regras
    
    return 'Outros';
  }
}

module.exports = new OpenFinanceService();
```

### Backend - Rotas

```javascript
// backend/routes/openFinance.js
const express = require('express');
const router = express.Router();
const openFinanceService = require('../services/openFinance');

// Gerar token para conectar banco
router.post('/connect-token', async (req, res) => {
  try {
    const token = await openFinanceService.getConnectToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sincronizar transações
router.post('/sync/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { from, to } = req.query;
    
    const transactions = await openFinanceService.getTransactions(
      itemId,
      from,
      to
    );
    
    // Salvar transações no banco local
    // ... código para salvar
    
    res.json({ 
      success: true, 
      count: transactions.length,
      transactions 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Frontend - Componente de Conexão

```javascript
// frontend/src/components/BankConnection.jsx
import { useState } from 'react';
import { Button, Modal } from '@carbon/react';
import { Connect } from '@carbon/icons-react';

const BankConnection = () => {
  const [showModal, setShowModal] = useState(false);

  const connectBank = async () => {
    try {
      // 1. Obter token do backend
      const response = await fetch('/api/open-finance/connect-token', {
        method: 'POST'
      });
      const { token } = await response.json();

      // 2. Abrir widget do Pluggy
      const pluggyConnect = new window.PluggyConnect({
        connectToken: token,
        onSuccess: (itemData) => {
          console.log('Banco conectado:', itemData);
          syncTransactions(itemData.item.id);
        },
        onError: (error) => {
          console.error('Erro ao conectar:', error);
        }
      });

      pluggyConnect.open();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const syncTransactions = async (itemId) => {
    try {
      const response = await fetch(`/api/open-finance/sync/${itemId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      alert(`${data.count} transações sincronizadas!`);
      // Recarregar lista de transações
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  return (
    <div>
      <Button
        renderIcon={Connect}
        onClick={connectBank}
      >
        Conectar Banco
      </Button>
    </div>
  );
};

export default BankConnection;
```

## Custos e Limites

### Pluggy - Plano Gratuito
- ✅ 100 conexões/mês
- ✅ Sandbox ilimitado
- ✅ Suporte por email

### Pluggy - Plano Pago
- 💰 A partir de $99/mês
- ✅ Conexões ilimitadas
- ✅ Webhooks
- ✅ Suporte prioritário

## Segurança e Compliance

### ✅ Requisitos Atendidos
- 🔐 OAuth 2.0 / OpenID Connect
- 🔒 Criptografia TLS 1.2+
- 📝 Consentimento explícito do usuário
- ⏰ Tokens com expiração
- 🔄 Refresh tokens seguros

### ⚠️ Importante
- Nunca armazene credenciais bancárias
- Use apenas tokens fornecidos pelo Pluggy
- Implemente rate limiting
- Registre todas as operações (audit log)
- Respeite LGPD

## Roadmap de Implementação

### Fase 1 - MVP (1-2 semanas)
- [ ] Criar conta no Pluggy
- [ ] Implementar serviço básico
- [ ] Adicionar botão "Conectar Banco"
- [ ] Sincronização manual

### Fase 2 - Automação (2-3 semanas)
- [ ] Webhooks para sync automático
- [ ] Categorização inteligente
- [ ] Múltiplas contas
- [ ] Histórico de sincronizações

### Fase 3 - Avançado (1 mês)
- [ ] Machine Learning para categorização
- [ ] Detecção de duplicatas
- [ ] Reconciliação automática
- [ ] Dashboard de conexões

## Alternativas sem API Paga

### 1. **Import CSV/OFX**
- Usuário baixa extrato do banco
- Upload manual no sistema
- Parsing automático

### 2. **Web Scraping** (Não recomendado)
- ⚠️ Viola termos de serviço
- ⚠️ Inseguro (requer credenciais)
- ⚠️ Quebra facilmente

### 3. **Email Parsing**
- Conectar email do usuário
- Extrair notificações bancárias
- Parsing de transações

## Recursos Adicionais

### Documentação
- 📚 Pluggy Docs: https://docs.pluggy.ai
- 📚 Open Finance Brasil: https://openfinancebrasil.org.br
- 📚 Banco Central: https://www.bcb.gov.br/estabilidadefinanceira/openbanking

### Comunidade
- 💬 Slack Open Finance Brasil
- 🐦 Twitter: @openfinancebr
- 📧 Suporte Pluggy: support@pluggy.ai

## Próximos Passos

1. **Decidir**: Quer implementar agora ou deixar para depois?
2. **Criar conta**: Pluggy (gratuito para começar)
3. **Testar**: Sandbox com bancos fictícios
4. **Implementar**: Seguir este guia passo a passo

---

**Quer que eu implemente a integração básica agora?** 🚀

Posso criar:
- ✅ Serviço de Open Finance
- ✅ Rotas da API
- ✅ Componente de conexão no frontend
- ✅ Sincronização de transações