# 🚀 Guia de Instalação e Execução

## Passo a Passo para Rodar o Sistema

### 1️⃣ Instalar Dependências do Backend

Abra um terminal e execute:

```bash
cd /Users/zaherosman/Desktop/financial-management-system/backend
npm install
```

### 2️⃣ Iniciar o Backend

No mesmo terminal do backend:

```bash
npm start
```

Você verá a mensagem:
```
🚀 Servidor rodando na porta 3001
📊 API disponível em http://localhost:3001/api
```

**Mantenha este terminal aberto!**

### 3️⃣ Instalar Dependências do Frontend

Abra um **NOVO terminal** e execute:

```bash
cd /Users/zaherosman/Desktop/financial-management-system/frontend
npm install
```

### 4️⃣ Iniciar o Frontend

No mesmo terminal do frontend:

```bash
npm run dev
```

Você verá algo como:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5️⃣ Acessar o Sistema

Abra seu navegador e acesse:
```
http://localhost:3000
```

## ✅ Verificação

Se tudo estiver funcionando, você verá:
- ✅ Backend rodando na porta 3001
- ✅ Frontend rodando na porta 3000
- ✅ Interface web carregada no navegador

## 🎯 Testando o Sistema

### Teste 1: Adicionar uma Entrada
1. Na aba "📝 Transações"
2. Preencha o formulário:
   - Tipo: Entrada
   - Categoria: Vendas
   - Valor: 5000
   - Data: Hoje
   - Descrição: Venda de produtos
3. Clique em "Adicionar Transação"

### Teste 2: Adicionar uma Saída
1. Preencha outro formulário:
   - Tipo: Saída
   - Categoria: Salários
   - Valor: 3000
   - Data: Hoje
   - Descrição: Pagamento de salários
2. Clique em "Adicionar Transação"

### Teste 3: Ver KPIs
1. Clique na aba "📊 KPIs & Dashboard"
2. Você verá:
   - Total de Entradas: R$ 5.000,00
   - Total de Saídas: R$ 3.000,00
   - Saldo Líquido: R$ 2.000,00
   - Margem Operacional: 40%
   - Gráficos e análises

## 🛠️ Comandos Úteis

### Backend
```bash
# Iniciar servidor
npm start

# Iniciar com auto-reload (desenvolvimento)
npm run dev
```

### Frontend
```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## ❌ Problemas Comuns

### Porta 3001 já está em uso
```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar o processo (substitua PID pelo número mostrado)
kill -9 PID
```

### Porta 3000 já está em uso
```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar o processo
kill -9 PID
```

### Erro "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
Certifique-se de que:
1. Backend está rodando na porta 3001
2. Frontend está rodando na porta 3000
3. Ambos os servidores estão ativos

## 📱 Acessando de Outros Dispositivos

Para acessar de outro dispositivo na mesma rede:

1. Descubra seu IP local:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. No frontend, inicie com:
```bash
npm run dev -- --host
```

3. Acesse de outro dispositivo:
```
http://SEU_IP:3000
```

## 🔄 Reiniciando o Sistema

Se precisar reiniciar tudo:

1. Pare ambos os terminais (Ctrl+C)
2. Inicie o backend novamente
3. Inicie o frontend novamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se npm está instalado: `npm --version`
3. Certifique-se de estar nos diretórios corretos
4. Verifique os logs de erro nos terminais

## 🎉 Pronto!

Agora você tem um sistema completo de gestão financeira rodando!

Explore as funcionalidades:
- ✅ Adicione transações
- ✅ Edite e exclua registros
- ✅ Visualize KPIs em tempo real
- ✅ Analise gráficos e tendências