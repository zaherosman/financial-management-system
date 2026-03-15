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
  InlineNotification,
  Loading
} from '@carbon/react';
import {
  Dashboard,
  Receipt,
  ChartLine,
  Analytics,
  Report,
  Notification,
  UserAvatar
} from '@carbon/icons-react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import KPIDashboard from './components/KPIDashboard';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import ForecastView from './components/ForecastView';
import ReportsView from './components/ReportsView';
import { transactionService, kpiService } from './services/api';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
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
    <Theme theme="white">
      <div className="apptio-app">
        {/* Header */}
        <Header aria-label="Financial Management System" className="apptio-header">
          <HeaderName prefix="">
            <div className="apptio-logo">
              <div className="apptio-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#ff6b35"/>
                  <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="apptio-logo-text">Financial Management</span>
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
              renderIcon={Dashboard}
              onClick={() => setActiveView('dashboard')}
              isActive={activeView === 'dashboard'}
            >
              Dashboard
            </SideNavLink>
            <SideNavLink
              renderIcon={Receipt}
              onClick={() => setActiveView('transactions')}
              isActive={activeView === 'transactions'}
            >
              Transações
            </SideNavLink>
            <SideNavLink
              renderIcon={Analytics}
              onClick={() => setActiveView('analytics')}
              isActive={activeView === 'analytics'}
            >
              Análises
            </SideNavLink>
            <SideNavLink
              renderIcon={ChartLine}
              onClick={() => setActiveView('forecast')}
              isActive={activeView === 'forecast'}
            >
              Forecast
            </SideNavLink>
            <SideNavLink
              renderIcon={Report}
              onClick={() => setActiveView('reports')}
              isActive={activeView === 'reports'}
            >
              Relatórios
            </SideNavLink>
          </SideNavItems>
        </SideNav>

        {/* Main Content */}
        <Content className="apptio-content">
          <div className="apptio-container">
            {/* Page Header */}
            <div className="apptio-page-header">
              <div>
                <h1 className="apptio-page-title">
                  {activeView === 'dashboard' && 'Dashboard'}
                  {activeView === 'transactions' && 'Transações'}
                  {activeView === 'analytics' && 'Análises Avançadas'}
                  {activeView === 'forecast' && 'Forecast & Projeções'}
                  {activeView === 'reports' && 'Relatórios'}
                </h1>
                <p className="apptio-page-subtitle">
                  {activeView === 'dashboard' && 'Visão geral do desempenho financeiro'}
                  {activeView === 'transactions' && 'Gerencie suas entradas e saídas financeiras'}
                  {activeView === 'analytics' && 'Análises detalhadas e indicadores avançados'}
                  {activeView === 'forecast' && 'Previsões e projeções financeiras baseadas em dados históricos'}
                  {activeView === 'reports' && 'Relatórios personalizados e exportação de dados'}
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

            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando KPIs..." withOverlay={false} />
                  </div>
                )}
                {!loading && <KPIDashboard kpis={kpis} />}
              </div>
            )}

            {/* Transactions View */}
            {activeView === 'transactions' && (
              <div className="apptio-view">
                <div className="apptio-widget">
                  <div className="apptio-widget-header">
                    <h3 className="apptio-widget-title">
                      {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
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
                
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleEditTransaction}
                />
              </div>
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Carregando análises..." withOverlay={false} />
                  </div>
                )}
                {!loading && <AdvancedAnalytics transactions={transactions} kpis={kpis} />}
              </div>
            )}

            {/* Forecast View */}
            {activeView === 'forecast' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Gerando previsões..." withOverlay={false} />
                  </div>
                )}
                {!loading && <ForecastView transactions={transactions} kpis={kpis} />}
              </div>
            )}

            {/* Reports View */}
            {activeView === 'reports' && (
              <div className="apptio-view">
                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Loading description="Gerando relatórios..." withOverlay={false} />
                  </div>
                )}
                {!loading && <ReportsView transactions={transactions} />}
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
