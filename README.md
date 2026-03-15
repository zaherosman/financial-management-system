# 💰 Sistema de Gestão Financeira

Sistema profissional de gestão financeira com análises avançadas, previsões e alertas inteligentes. Desenvolvido com React, Node.js e Carbon Design System.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Funcionalidades

### 📊 Dashboard Interativo
- KPIs em tempo real (Entradas, Saídas, Saldo, Transações)
- Widgets personalizáveis e removíveis
- Gráficos interativos com Carbon Charts
- Indicadores financeiros avançados

### 💳 Gestão de Transações
- Adicionar, editar e excluir transações
- Categorização automática
- Filtros por data e tipo
- Histórico completo

### 📈 Análises Avançadas
- **ROI** (Return on Investment)
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)
- **Taxa de Crescimento**
- **Margem de Lucro**
- **Taxa de Churn**
- Gráficos de distribuição e eficiência
- Insights automáticos

### 🔮 Forecast & Projeções
- Previsões financeiras baseadas em dados históricos
- Configurável: 3, 6, 12 ou 24 meses
- Opção de sazonalidade
- Cenários otimista e pessimista
- Indicador de confiança
- Recomendações estratégicas

### 🔔 Alertas Inteligentes
- Monitoramento de saldo negativo
- Alertas de margem baixa
- Runway crítico
- Receita em declínio
- Despesas crescentes
- Concentração de receita
- Notificações personalizáveis

### 📑 Relatórios
- Exportação em CSV e TXT
- Filtros por período
- Análise por categoria
- Resumo executivo

### 💾 Banco de Dados
- Suporte a PostgreSQL
- Fallback para armazenamento em memória
- Migração automática
- Backups disponíveis

## 🚀 Tecnologias

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Carbon Design System** - UI Components
- **Carbon Charts** - Visualização de dados
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Banco de dados (opcional)
- **CORS** - Cross-origin support

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- PostgreSQL (opcional)

### 1. Clonar Repositório
```bash
git clone https://github.com/zaherosman/financial-management-system.git
cd financial-management-system
```

### 2. Instalar Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configurar Variáveis de Ambiente

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/financial_db  # Opcional
FRONTEND_URL=http://localhost:5173
```

### 4. Iniciar Aplicação

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:5173

## 🌐 Deploy

### Opção 1: Render (Gratuito e Permanente)

Siga o guia completo: [DEPLOY_GRATUITO_PERMANENTE.md](DEPLOY_GRATUITO_PERMANENTE.md)

**Resumo:**
1. Backend no Render (Web Service)
2. Frontend no Render (Static Site)
3. PostgreSQL no Render (Database)

### Opção 2: Vercel + Render

1. Frontend no Vercel
2. Backend no Render
3. PostgreSQL no Render

Veja: [PASSO_A_PASSO.md](PASSO_A_PASSO.md)

## 📚 Documentação

- **[GUIA_INSTALACAO.md](GUIA_INSTALACAO.md)** - Instalação detalhada
- **[DEPLOY_GRATUITO_PERMANENTE.md](DEPLOY_GRATUITO_PERMANENTE.md)** - Deploy gratuito
- **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** - Configuração do PostgreSQL
- **[CARBON_MIGRATION.md](CARBON_MIGRATION.md)** - Migração para Carbon Design
- **[CLOUDABILITY_STYLE.md](CLOUDABILITY_STYLE.md)** - Guia de estilo

## 🎯 Estrutura do Projeto

```
financial-management-system/
├── backend/
│   ├── server.js           # Servidor Express
│   ├── db.js              # Configuração PostgreSQL
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KPIDashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── AdvancedAnalytics.jsx
│   │   │   ├── ForecastView.jsx
│   │   │   ├── NotificationsPanel.jsx
│   │   │   └── ReportsView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Transações
- `GET /api/transactions` - Listar todas
- `POST /api/transactions` - Criar nova
- `GET /api/transactions/:id` - Buscar por ID
- `PUT /api/transactions/:id` - Atualizar
- `DELETE /api/transactions/:id` - Deletar

### KPIs
- `GET /api/kpis` - Obter KPIs
  - Query params: `startDate`, `endDate`, `grouping`

### Health Check
- `GET /api/health` - Status da API

## 📊 Indicadores Disponíveis

### Financeiros
- Total de Entradas
- Total de Saídas
- Saldo Líquido
- Número de Transações

### Performance
- Margem Operacional
- Burn Rate
- Runway
- Ticket Médio

### Avançados
- ROI (Return on Investment)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Taxa de Crescimento
- Taxa de Churn
- Eficiência Operacional

## 🎨 Design System

Baseado no **IBM Carbon Design System** com tema personalizado Apptio Cloudability:

- **Cores Primárias**: Laranja (#ff6b35), Azul (#4a90e2)
- **Tipografia**: IBM Plex Sans
- **Componentes**: Carbon React
- **Gráficos**: Carbon Charts

## 🔐 Segurança

- CORS configurado
- Validação de dados no backend
- Sanitização de inputs
- SSL/HTTPS em produção
- Variáveis de ambiente para secrets

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📈 Roadmap

- [x] Dashboard básico
- [x] Gestão de transações
- [x] KPIs financeiros
- [x] Análises avançadas
- [x] Forecast e projeções
- [x] Alertas inteligentes
- [x] Relatórios e exportação
- [x] PostgreSQL
- [ ] Autenticação de usuários
- [ ] Multi-tenancy
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Mobile app

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Zaher Osman**
- GitHub: [@zaherosman](https://github.com/zaherosman)
- Repositório: [financial-management-system](https://github.com/zaherosman/financial-management-system)

## 🙏 Agradecimentos

- IBM Carbon Design System
- Render.com
- Vercel
- Comunidade Open Source

---

**Made with ❤️ and Bob**

Para suporte e dúvidas, abra uma [issue](https://github.com/zaherosman/financial-management-system/issues).