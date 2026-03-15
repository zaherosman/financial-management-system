import { useState, useEffect } from 'react';
import { 
  InlineNotification,
  Button,
  Toggle
} from '@carbon/react';
import { 
  Warning, 
  CheckmarkFilled, 
  ErrorFilled,
  Information
} from '@carbon/icons-react';

const NotificationsPanel = ({ transactions, kpis }) => {
  const [notifications, setNotifications] = useState([]);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    if (!transactions || !kpis) return;
    
    const alerts = generateAlerts(transactions, kpis);
    setNotifications(alerts);
  }, [transactions, kpis]);

  const generateAlerts = (transactions, kpis) => {
    const alerts = [];
    let alertId = 0;

    // 1. Alerta de Saldo Negativo
    const saldoLiquido = parseFloat(kpis?.resumo?.saldoLiquido || 0);
    if (saldoLiquido < 0) {
      alerts.push({
        id: alertId++,
        type: 'error',
        title: '🚨 Saldo Negativo',
        subtitle: `Seu saldo está negativo em ${formatCurrency(Math.abs(saldoLiquido))}. Ação imediata necessária!`,
        priority: 'high',
        category: 'financial'
      });
    }

    // 2. Alerta de Margem Baixa
    const margemOperacional = parseFloat(kpis?.indicadores?.margemOperacional || 0);
    if (margemOperacional < 10 && margemOperacional > 0) {
      alerts.push({
        id: alertId++,
        type: 'warning',
        title: '⚠️ Margem Operacional Baixa',
        subtitle: `Sua margem está em ${margemOperacional}%. Considere reduzir custos ou aumentar receitas.`,
        priority: 'medium',
        category: 'performance'
      });
    }

    // 3. Alerta de Runway Curto
    const runway = kpis?.indicadores?.runway;
    if (runway && runway !== 'Infinito') {
      const meses = parseFloat(runway);
      if (meses < 3) {
        alerts.push({
          id: alertId++,
          type: 'error',
          title: '🔴 Runway Crítico',
          subtitle: `Você tem apenas ${runway} de runway. Busque novas fontes de receita urgentemente!`,
          priority: 'high',
          category: 'financial'
        });
      } else if (meses < 6) {
        alerts.push({
          id: alertId++,
          type: 'warning',
          title: '⚠️ Runway Baixo',
          subtitle: `Você tem ${runway} de runway. Planeje ações para aumentar receitas.`,
          priority: 'medium',
          category: 'financial'
        });
      }
    }

    // 4. Alerta de Crescimento Negativo
    if (transactions.length >= 4) {
      const firstHalf = transactions.slice(0, Math.floor(transactions.length / 2));
      const secondHalf = transactions.slice(Math.floor(transactions.length / 2));
      
      const firstRevenue = firstHalf.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
      const secondRevenue = secondHalf.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
      
      if (secondRevenue < firstRevenue) {
        const decline = ((firstRevenue - secondRevenue) / firstRevenue * 100).toFixed(1);
        alerts.push({
          id: alertId++,
          type: 'warning',
          title: '📉 Receita em Declínio',
          subtitle: `Suas receitas caíram ${decline}% no período recente. Revise sua estratégia.`,
          priority: 'medium',
          category: 'performance'
        });
      }
    }

    // 5. Alerta de Despesas Crescentes
    if (transactions.length >= 4) {
      const recentExpenses = transactions.slice(0, Math.floor(transactions.length / 4))
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const olderExpenses = transactions.slice(Math.floor(transactions.length / 4), Math.floor(transactions.length / 2))
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (recentExpenses > olderExpenses * 1.2) {
        const increase = ((recentExpenses - olderExpenses) / olderExpenses * 100).toFixed(1);
        alerts.push({
          id: alertId++,
          type: 'warning',
          title: '💸 Despesas Aumentando',
          subtitle: `Suas despesas aumentaram ${increase}% recentemente. Revise seus gastos.`,
          priority: 'medium',
          category: 'spending'
        });
      }
    }

    // 6. Alerta de Concentração de Receita
    const categorias = {};
    transactions.filter(t => t.type === 'entrada').forEach(t => {
      categorias[t.category] = (categorias[t.category] || 0) + t.amount;
    });
    
    const totalReceita = Object.values(categorias).reduce((sum, val) => sum + val, 0);
    const maxCategoria = Math.max(...Object.values(categorias));
    
    if (totalReceita > 0 && (maxCategoria / totalReceita) > 0.7) {
      const percentage = ((maxCategoria / totalReceita) * 100).toFixed(0);
      alerts.push({
        id: alertId++,
        type: 'info',
        title: 'ℹ️ Concentração de Receita',
        subtitle: `${percentage}% da sua receita vem de uma única categoria. Considere diversificar.`,
        priority: 'low',
        category: 'strategy'
      });
    }

    // 7. Alertas Positivos
    if (saldoLiquido > 0 && margemOperacional > 20) {
      alerts.push({
        id: alertId++,
        type: 'success',
        title: '✅ Saúde Financeira Excelente',
        subtitle: `Parabéns! Seu saldo é positivo e sua margem está em ${margemOperacional}%.`,
        priority: 'low',
        category: 'success'
      });
    }

    // 8. Alerta de Poucas Transações
    if (transactions.length < 5) {
      alerts.push({
        id: alertId++,
        type: 'info',
        title: 'ℹ️ Dados Limitados',
        subtitle: 'Adicione mais transações para obter análises e previsões mais precisas.',
        priority: 'low',
        category: 'data'
      });
    }

    // Ordenar por prioridade
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDismiss = (id) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const getNotificationKind = (type) => {
    switch(type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'error': return <ErrorFilled size={20} />;
      case 'warning': return <Warning size={20} />;
      case 'success': return <CheckmarkFilled size={20} />;
      case 'info': return <Information size={20} />;
      default: return <Information size={20} />;
    }
  };

  const filteredNotifications = showOnlyActive 
    ? notifications.filter(n => !dismissedIds.includes(n.id))
    : notifications;

  const activeCount = notifications.filter(n => !dismissedIds.includes(n.id)).length;
  const criticalCount = notifications.filter(n => n.priority === 'high' && !dismissedIds.includes(n.id)).length;

  return (
    <div>
      {/* Header com Estatísticas */}
      <div className="apptio-widget" style={{ marginBottom: '1.5rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">🔔 Central de Notificações</h3>
        </div>
        <div className="apptio-widget-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Notificações Ativas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#495057' }}>{activeCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Críticas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d73a49' }}>{criticalCount}</div>
              </div>
            </div>
            <Toggle
              id="show-dismissed"
              labelText="Mostrar dispensadas"
              labelA="Não"
              labelB="Sim"
              toggled={!showOnlyActive}
              onToggle={(checked) => setShowOnlyActive(!checked)}
              size="sm"
            />
          </div>

          {dismissedIds.length > 0 && (
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setDismissedIds([])}
            >
              Restaurar todas ({dismissedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Notificações */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredNotifications.length === 0 ? (
          <div className="apptio-widget">
            <div className="apptio-widget-content" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ color: '#495057', marginBottom: '0.5rem' }}>Tudo Certo!</h3>
              <p style={{ color: '#6c757d' }}>
                Não há notificações no momento. Continue monitorando suas finanças!
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              style={{ 
                opacity: dismissedIds.includes(notification.id) ? 0.5 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              <InlineNotification
                kind={getNotificationKind(notification.type)}
                title={notification.title}
                subtitle={notification.subtitle}
                onCloseButtonClick={() => handleDismiss(notification.id)}
                lowContrast
                hideCloseButton={dismissedIds.includes(notification.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Resumo por Categoria */}
      {filteredNotifications.length > 0 && (
        <div className="apptio-widget" style={{ marginTop: '1.5rem' }}>
          <div className="apptio-widget-header">
            <h3 className="apptio-widget-title">📊 Resumo de Alertas</h3>
          </div>
          <div className="apptio-widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {['financial', 'performance', 'spending', 'strategy', 'success', 'data'].map(category => {
                const count = filteredNotifications.filter(n => n.category === category).length;
                if (count === 0) return null;
                
                const categoryNames = {
                  financial: 'Financeiro',
                  performance: 'Performance',
                  spending: 'Gastos',
                  strategy: 'Estratégia',
                  success: 'Sucesso',
                  data: 'Dados'
                };

                const categoryIcons = {
                  financial: '💰',
                  performance: '📈',
                  spending: '💸',
                  strategy: '🎯',
                  success: '✅',
                  data: '📊'
                };

                return (
                  <div 
                    key={category}
                    style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {categoryIcons[category]}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#495057' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      {categoryNames[category]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

// Made with Bob - Notifications Panel