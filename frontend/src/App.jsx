import { useState, useEffect } from 'react';
import {
  Content,
  Theme,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  InlineNotification,
  Loading
} from '@carbon/react';
import {
  Home,
  ChartLine,
  Idea,
  Settings,
  Notification,
  UserAvatar,
  Integration,
  Receipt,
  WarningAlt,
  Document,
  ChartBubble,
  Inventory,
  Package,
  UserMultiple
} from '@carbon/icons-react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import KPIDashboard from './components/KPIDashboard';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import ForecastView from './components/ForecastView';
import ReportsView from './components/ReportsView';
import NotificationsPanel from './components/NotificationsPanel';
import BankConnection from './components/BankConnection';
import ProductManagement from './components/ProductManagement';
import SellerManagement from './components/SellerManagement';
import InventoryManagement from './components/InventoryManagement';
import { transactionService, kpiService } from './services/api';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Carregar transações
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAll();
      // Sort by date string (YYYY-MM-DD format) - more recent first
      setTransactions(data.sort((a, b) => b.date.localeCompare(a.date)));
      setError(null);
    } catch (err) {
      setError('Erro ao carregar transações: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar KPIs
  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await kpiService.getKPIs();
      setKpis(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar KPIs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadTransactions();
    loadKPIs();
  }, []);

  // Adicionar transação
  const handleAddTransaction = async (formData) => {
    try {
      setLoading(true);
      await transactionService.create(formData);
      setSuccess('Transação adicionada com sucesso!');
      await loadTransactions();
      await loadKPIs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao adicionar transação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar transação
  const handleUpdateTransaction = async (formData) => {
    try {
      setLoading(true);
      await transactionService.update(editingTransaction.id, formData);
      setSuccess('Transação atualizada com sucesso!');
      setEditingTransaction(null);
      await loadTransactions();
      await loadKPIs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao atualizar transação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar transação
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      setLoading(true);
      await transactionService.delete(id);
      setSuccess('Transação excluída com sucesso!');
      await loadTransactions();
      await loadKPIs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao excluir transação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Editar transação
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setActiveView('transactions');
  };

  return (
    <Theme theme="g10">
      <div className="apptio-app">
        {/* Header */}
        <Header aria-label="Financial Management System" className="apptio-header">
          <HeaderName prefix="">
            <div className="apptio-logo">
              <div className="apptio-logo-icon">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L2 9l14 7 14-7-14-7z" fill="#0f62fe"/>
                  <path d="M2 23l14 7 14-7M2 16l14 7 14-7" stroke="#0f62fe" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="apptio-logo-text">Financial Management System</span>
            </div>
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
              <Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="User Profile" tooltipAlignment="end">
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>

        {/* Sidebar */}
        <SideNav
          aria-label="Side navigation"
          expanded={true}
          isFixedNav
          className="apptio-sidenav"
        >
          <SideNavItems>
            <SideNavLink
              renderIcon={Home}
              onClick={() => setActiveView('home')}
              isActive={activeView === 'home'}
            >
              Home
            </SideNavLink>
            <SideNavLink
              renderIcon={ChartLine}
              onClick={() => setActiveView('plan')}
              isActive={activeView === 'plan'}
            >
              Plan
            </SideNavLink>
            <SideNavMenu
              renderIcon={Idea}
              title="Insights"
              defaultExpanded={activeView === 'analytics' || activeView === 'alerts' || activeView === 'reports'}
            >
              <SideNavMenuItem
                onClick={() => setActiveView('analytics')}
                isActive={activeView === 'analytics'}
              >
                <ChartBubble style={{ marginRight: '8px' }} />
                Analytics
              </SideNavMenuItem>
              <SideNavMenuItem
                onClick={() => setActiveView('alerts')}
                isActive={activeView === 'alerts'}
              >
                <WarningAlt style={{ marginRight: '8px' }} />
                Alertas
              </SideNavMenuItem>
              <SideNavMenuItem
                onClick={() => setActiveView('reports')}
                isActive={activeView === 'reports'}
              >
                <Document style={{ marginRight: '8px' }} />
                Relatórios
              </SideNavMenuItem>
            </SideNavMenu>
            <SideNavMenu
              renderIcon={Inventory}
              title="Estoque"
              defaultExpanded={activeView === 'inventory' || activeView === 'products' || activeView === 'sellers'}
            >
              <SideNavMenuItem
                onClick={() => setActiveView('inventory')}
                isActive={activeView === 'inventory'}
              >
                <Inventory style={{ marginRight: '8px' }} />
                Controle de Estoque
              </SideNavMenuItem>
              <SideNavMenuItem
                onClick={() => setActiveView('products')}
                isActive={activeView === 'products'}
              >
                <Package style={{ marginRight: '8px' }} />
                Produtos
              </SideNavMenuItem>
              <SideNavMenuItem
                onClick={() => setActiveView('sellers')}
                isActive={activeView === 'sellers'}
              >
                <UserMultiple style={{ marginRight: '8px' }} />
                Vendedores
              </SideNavMenuItem>
            </SideNavMenu>
            <SideNavMenu
              renderIcon={Settings}
              title="Settings"
              defaultExpanded={activeView === 'integrations' || activeView === 'transactions'}
            >
              <SideNavMenuItem
                onClick={() => setActiveView('integrations')}
                isActive={activeView === 'integrations'}
              >
                <Integration style={{ marginRight: '8px' }} />
                Integrações
              </SideNavMenuItem>
              <SideNavMenuItem
                onClick={() => setActiveView('transactions')}
                isActive={activeView === 'transactions'}
              >
                <Receipt style={{ marginRight: '8px' }} />
                Transações
              </SideNavMenuItem>
            </SideNavMenu>
          </SideNavItems>
        </SideNav>

        {/* Main Content */}
        <Content className="apptio-content">
          <div className="apptio-container">
            {/* Page Header */}
            <div className="apptio-page-header">
              <div>
                <h1 className="apptio-page-title">
                  {activeView === 'home' && 'Home'}
                  {activeView === 'plan' && 'Plan'}
                  {activeView === 'analytics' && 'Analytics'}
                  {activeView === 'alerts' && 'Alertas'}
                  {activeView === 'reports' && 'Relatórios'}
                  {activeView === 'inventory' && 'Controle de Estoque'}
                  {activeView === 'products' && 'Produtos'}
                  {activeView === 'sellers' && 'Vendedores'}
                  {activeView === 'integrations' && 'Integrações'}
                  {activeView === 'transactions' && 'Transações'}
                </h1>
                <p className="apptio-page-subtitle">
                  {activeView === 'home' && 'Visão geral do desempenho financeiro'}
                  {activeView === 'plan' && 'Previsões e projeções financeiras'}
                  {activeView === 'analytics' && 'Análises avançadas e visualizações de dados'}
                  {activeView === 'alerts' && 'Notificações e alertas inteligentes'}
                  {activeView === 'reports' && 'Relatórios detalhados e exportações'}
                  {activeView === 'inventory' && 'Gerencie o estoque de produtos por vendedor'}
                  {activeView === 'products' && 'Cadastro e gerenciamento de produtos'}
                  {activeView === 'sellers' && 'Cadastro e gerenciamento de vendedores'}
                  {activeView === 'integrations' && 'Conecte suas contas bancárias via Open Finance'}
                  {activeView === 'transactions' && 'Gerencie suas transações manualmente'}
                </p>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <InlineNotification
                kind="error"
                title="Erro"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              />
            )}
            {success && (
              <InlineNotification
                kind="success"
                title="Sucesso"
                subtitle={success}
                onCloseButtonClick={() => setSuccess(null)}
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              />
            )}

            {/* Home View - Dashboard */}
            {activeView === 'home' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando KPIs..." withOverlay={false} />
                  </div>
                )}
                {!loading && <KPIDashboard kpis={kpis} />}
              </div>
            )}

            {/* Plan View - Forecast */}
            {activeView === 'plan' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Gerando previsões..." withOverlay={false} />
                  </div>
                )}
                {!loading && <ForecastView transactions={transactions} kpis={kpis} />}
              </div>
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando analytics..." withOverlay={false} />
                  </div>
                )}
                {!loading && <AdvancedAnalytics transactions={transactions} kpis={kpis} />}
              </div>
            )}

            {/* Alerts View */}
            {activeView === 'alerts' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando alertas..." withOverlay={false} />
                  </div>
                )}
                {!loading && <NotificationsPanel transactions={transactions} kpis={kpis} />}
              </div>
            )}

            {/* Reports View */}
            {activeView === 'reports' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando relatórios..." withOverlay={false} />
                  </div>
                )}
                {!loading && <ReportsView transactions={transactions} />}
              </div>
            )}

            {/* Inventory View - Stock Control */}
            {activeView === 'inventory' && (
              <div className="apptio-view">
                <InventoryManagement />
              </div>
            )}

            {/* Products View */}
            {activeView === 'products' && (
              <div className="apptio-view">
                <ProductManagement />
              </div>
            )}

            {/* Sellers View */}
            {activeView === 'sellers' && (
              <div className="apptio-view">
                <SellerManagement />
              </div>
            )}

            {/* Integrations View - Open Finance */}
            {activeView === 'integrations' && (
              <div className="apptio-view">
                <BankConnection
                  onTransactionsImported={async () => {
                    await loadTransactions();
                    await loadKPIs();
                  }}
                />
              </div>
            )}

            {/* Transactions View - Manual Entry & List */}
            {activeView === 'transactions' && (
              <div className="apptio-view">
                {/* Manual Transaction Entry */}
                <div className="apptio-widget">
                  <div className="apptio-widget-header">
                    <h3 className="apptio-widget-title">
                      ✏️ {editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}
                    </h3>
                  </div>
                  <div className="apptio-widget-content">
                    <TransactionForm
                      onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                      onCancel={editingTransaction ? () => setEditingTransaction(null) : null}
                      initialData={editingTransaction}
                    />
                  </div>
                </div>
                
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando..." withOverlay={false} />
                  </div>
                )}
                
                {/* Transaction List */}
                <div style={{ marginTop: '2rem' }}>
                  <TransactionList
                    transactions={transactions}
                    onDelete={handleDeleteTransaction}
                    onEdit={handleEditTransaction}
                  />
                </div>
              </div>
            )}
          </div>
        </Content>
      </div>
    </Theme>
  );
}

export default App;

// Made with Bob - Apptio Cloudability Style
