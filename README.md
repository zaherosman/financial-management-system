# 💰 Sistema de Gestão Financeira

Sistema completo de gestão financeira para empresas com registro de entradas/saídas e dashboard de KPIs para CFOs.

## 🚀 Funcionalidades

### Gestão de Transações
- ✅ Registro de entradas e saídas
- ✅ Categorização de transações
- ✅ Edição e exclusão de transações
- ✅ Histórico completo de movimentações

### KPIs para CFOs
- 📊 **Resumo Financeiro**: Total de entradas, saídas e saldo líquido
- 📈 **Margem Operacional**: Percentual de lucro sobre receita
- 🔥 **Burn Rate**: Taxa de queima mensal de recursos
- ⏱️ **Runway**: Projeção de meses até esgotamento de recursos
- 💳 **Ticket Médio**: Valor médio de entradas e saídas
- 📉 **Tendência Mensal**: Gráficos de evolução temporal
- 🏷️ **Análise por Categoria**: Detalhamento de gastos e receitas

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- API REST
- Armazenamento em memória (pode ser migrado para banco de dados)

### Frontend
- React 18
- Vite
- Recharts (gráficos)
- Axios (requisições HTTP)

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm start
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🔌 API Endpoints

### Transações

#### Listar todas as transações
```
GET /api/transactions
```

#### Criar transação
```
POST /api/transactions
Content-Type: application/json

{
  "type": "entrada",
  "category": "Vendas",
  "amount": 5000.00,
  "description": "Venda de produtos",
  "date": "2026-03-15"
}
```

#### Obter transação por ID
```
GET /api/transactions/:id
```

#### Atualizar transação
```
PUT /api/transactions/:id
Content-Type: application/json

{
  "amount": 5500.00,
  "description": "Venda atualizada"
}
```

#### Deletar transação
```
DELETE /api/transactions/:id
```

### KPIs

#### Obter KPIs
```
GET /api/kpis
GET /api/kpis?startDate=2026-01-01&endDate=2026-12-31
```

**Resposta:**
```json
{
  "resumo": {
    "totalEntradas": "50000.00",
    "totalSaidas": "30000.00",
    "saldoLiquido": "20000.00",
    "numeroTransacoes": 25
  },
  "indicadores": {
    "margemOperacional": "40.00%",
    "burnRate": "10000.00",
    "runway": "2.0 meses",
    "ticketMedioEntrada": "2500.00",
    "ticketMedioSaida": "2000.00"
  },
  "porCategoria": {
    "Vendas": {
      "entradas": 50000,
      "saidas": 0
    },
    "Salários": {
      "entradas": 0,
      "saidas": 20000
    }
  },
  "tendenciaMensal": {
    "2026-03": {
      "entradas": 50000,
      "saidas": 30000,
      "saldo": 20000
    }
  }
}
```

## 📊 KPIs Explicados

### Margem Operacional
Percentual de lucro sobre a receita total. Indica a eficiência operacional da empresa.
```
Margem = (Saldo Líquido / Total Entradas) × 100
```

### Burn Rate
Taxa média mensal de gastos. Importante para startups e empresas em crescimento.
```
Burn Rate = Total Saídas / Número de Meses
```

### Runway
Estimativa de quantos meses a empresa pode operar com o saldo atual.
```
Runway = Saldo Líquido / Burn Rate Mensal
```

### Ticket Médio
Valor médio das transações, útil para análise de padrões.
```
Ticket Médio = Total / Número de Transações
```

## 🎨 Interface

### Tela de Transações
- Formulário intuitivo para adicionar/editar transações
- Lista de transações com filtros visuais
- Ações rápidas de edição e exclusão

### Dashboard de KPIs
- Cards com métricas principais
- Gráficos de linha para tendências mensais
- Gráficos de barra para análise por categoria
- Detalhamento completo por categoria

## 🔄 Próximas Melhorias

- [ ] Integração com banco de dados (PostgreSQL/MongoDB)
- [ ] Autenticação e autorização de usuários
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Filtros avançados e busca
- [ ] Múltiplas empresas/projetos
- [ ] Previsões e projeções financeiras
- [ ] Integração com APIs bancárias
- [ ] Notificações e alertas
- [ ] Modo escuro
- [ ] Aplicativo mobile

## 📝 Estrutura do Projeto

```
financial-management-system/
├── backend/
│   ├── server.js           # Servidor Express e rotas
│   ├── package.json        # Dependências do backend
│   └── .env.example        # Variáveis de ambiente
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TransactionForm.jsx    # Formulário de transações
│   │   │   ├── TransactionList.jsx    # Lista de transações
│   │   │   └── KPIDashboard.jsx       # Dashboard de KPIs
│   │   ├── services/
│   │   │   └── api.js                 # Serviços de API
│   │   ├── App.jsx                    # Componente principal
│   │   ├── App.css                    # Estilos
│   │   └── main.jsx                   # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

MIT License - sinta-se livre para usar este projeto.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a gestão financeira empresarial.

---

**Nota**: Este sistema usa armazenamento em memória. Para produção, recomenda-se implementar um banco de dados persistente.