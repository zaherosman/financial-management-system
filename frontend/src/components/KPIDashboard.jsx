import { useState, useEffect } from 'react';
import { Grid, Column, ButtonSet, Button, Modal } from '@carbon/react';
import { LineChart, SimpleBarChart } from '@carbon/charts-react';
import { ArrowUp, ArrowDown, Add, Close } from '@carbon/icons-react';
import { kpiService } from '../services/api';
import '@carbon/charts-react/styles.css';

const KPIDashboard = ({ kpis: initialKpis }) => {
  const [timeGrouping, setTimeGrouping] = useState('mensal');
  const [kpis, setKpis] = useState(initialKpis);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load widgets from localStorage on mount
  const loadWidgetsFromStorage = () => {
    try {
      const saved = localStorage.getItem('dashboard-widgets');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar widgets do localStorage:', error);
      return [];
    }
  };
  
  // Array of active widgets with unique IDs
  const [activeWidgets, setActiveWidgets] = useState(loadWidgetsFromStorage);

  // Available widget types
  const availableWidgets = [
    { 
      id: 'kpi-cards', 
      name: 'KPI Cards', 
      icon: '📊',
      description: 'Cards com métricas principais (Entradas, Saídas, Saldo, Transações)'
    },
    { 
      id: 'indicators', 
      name: 'Indicadores Financeiros', 
      icon: '📈',
      description: 'Margem Operacional, Burn Rate, Runway, Ticket Médio'
    },
    { 
      id: 'transactions-chart', 
      name: 'Gráfico de Transações', 
      icon: '💸',
      description: 'Evolução de entradas, saídas e saldo ao longo do tempo'
    },
    { 
      id: 'patrimonio-chart', 
      name: 'Gráfico de Patrimônio', 
      icon: '💰',
      description: 'Evolução do patrimônio acumulado'
    },
    { 
      id: 'category-chart', 
      name: 'Gráfico por Categoria', 
      icon: '📊',
      description: 'Comparação de entradas e saídas por categoria'
    },
    { 
      id: 'category-details', 
      name: 'Detalhes por Categoria', 
      icon: '📋',
      description: 'Cards detalhados com valores por categoria'
    },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        const data = await kpiService.getKPIs(null, null, timeGrouping);
        setKpis(data);
      } catch (err) {
        console.error('Erro ao carregar KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [timeGrouping]);

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-widgets', JSON.stringify(activeWidgets));
    } catch (error) {
      console.error('Erro ao salvar widgets no localStorage:', error);
    }
  }, [activeWidgets]);

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      addedAt: new Date().toISOString()
    };
    setActiveWidgets([...activeWidgets, newWidget]);
    setIsModalOpen(false);
  };

  const removeWidget = (widgetId) => {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  };

  const isWidgetTypeActive = (widgetType) => {
    return activeWidgets.some(w => w.type === widgetType);
  };

  if (!kpis) {
    return (
      <div className="apptio-loading">
        <p>Carregando KPIs...</p>
      </div>
    );
  }

  // Prepare chart data
  const transactionsData = Object.entries(kpis.tendenciaMensal || {}).flatMap(([period, data]) => [
    { group: 'Entradas', key: period, value: parseFloat(data.entradas) },
    { group: 'Saídas', key: period, value: parseFloat(data.saidas) },
    { group: 'Saldo', key: period, value: parseFloat(data.saldo) }
  ]);

  const patrimonioData = Object.entries(kpis.tendenciaMensal || {}).map(([period, data]) => ({
    group: 'Patrimônio Acumulado',
    key: period,
    value: parseFloat(data.patrimonio || 0)
  }));

  const categoryData = Object.entries(kpis.porCategoria || {}).flatMap(([category, data]) => [
    { group: 'Entradas', key: category, value: parseFloat(data.entradas) },
    { group: 'Saídas', key: category, value: parseFloat(data.saidas) }
  ]);

  const getTimeLabel = () => {
    switch(timeGrouping) {
      case 'diario': return 'Dia';
      case 'semanal': return 'Semana';
      case 'mensal': return 'Mês';
      case 'quartil': return 'Trimestre';
      case 'anual': return 'Ano';
      default: return 'Período';
    }
  };

  const getTitleLabel = () => {
    switch(timeGrouping) {
      case 'diario': return 'Diária';
      case 'semanal': return 'Semanal';
      case 'mensal': return 'Mensal';
      case 'quartil': return 'Trimestral';
      case 'anual': return 'Anual';
      default: return 'Mensal';
    }
  };

  const transactionsChartOptions = {
    title: `Fluxo de Transações - ${getTitleLabel()}`,
    axes: {
      bottom: { title: getTimeLabel(), mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Valor (R$)', scaleType: 'linear' }
    },
    curve: 'curveMonotoneX',
    height: '400px',
    theme: 'white',
    color: {
      scale: {
        'Entradas': '#28a745',
        'Saídas': '#d73a49',
        'Saldo': '#4a90e2'
      }
    },
    grid: { x: { enabled: false }, y: { enabled: true } }
  };

  const patrimonioChartOptions = {
    title: `Evolução do Patrimônio - ${getTitleLabel()}`,
    axes: {
      bottom: { title: getTimeLabel(), mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Patrimônio Acumulado (R$)', scaleType: 'linear' }
    },
    curve: 'curveMonotoneX',
    height: '400px',
    theme: 'white',
    color: { scale: { 'Patrimônio Acumulado': '#8b5cf6' } },
    grid: { x: { enabled: false }, y: { enabled: true } }
  };

  const barChartOptions = {
    title: 'Análise por Categoria',
    axes: {
      bottom: { title: 'Categoria', mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Valor (R$)', scaleType: 'linear' }
    },
    height: '400px',
    theme: 'white',
    color: { scale: { 'Entradas': '#28a745', 'Saídas': '#d73a49' } }
  };

  const saldoLiquido = parseFloat(kpis.resumo.saldoLiquido);
  const isPositive = saldoLiquido >= 0;

  // Render widget based on type
  const renderWidget = (widget) => {
    const widgetStyle = {
      marginBottom: '1.5rem',
      position: 'relative'
    };

    const closeButtonStyle = {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'white',
      border: '1px solid var(--apptio-border)',
      borderRadius: '4px',
      padding: '0.5rem',
      cursor: 'pointer',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    switch (widget.type) {
      case 'kpi-cards':
        return (
          <div key={widget.id} style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <div className="apptio-grid apptio-grid-4">
              <div className="apptio-kpi-card success">
                <div className="apptio-kpi-label">Total de Entradas</div>
                <div className="apptio-kpi-value">{formatCurrency(kpis.resumo.totalEntradas)}</div>
                <div className="apptio-kpi-change positive">
                  <ArrowUp size={16} />
                  <span>Receitas</span>
                </div>
              </div>
              <div className="apptio-kpi-card danger">
                <div className="apptio-kpi-label">Total de Saídas</div>
                <div className="apptio-kpi-value">{formatCurrency(kpis.resumo.totalSaidas)}</div>
                <div className="apptio-kpi-change negative">
                  <ArrowDown size={16} />
                  <span>Despesas</span>
                </div>
              </div>
              <div className={`apptio-kpi-card ${isPositive ? 'info' : 'danger'}`}>
                <div className="apptio-kpi-label">Saldo Líquido</div>
                <div className="apptio-kpi-value">{formatCurrency(kpis.resumo.saldoLiquido)}</div>
                <div className={`apptio-kpi-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  <span>{isPositive ? 'Superávit' : 'Déficit'}</span>
                </div>
              </div>
              <div className="apptio-kpi-card warning">
                <div className="apptio-kpi-label">Transações</div>
                <div className="apptio-kpi-value">{kpis.resumo.numeroTransacoes}</div>
                <div className="apptio-kpi-change neutral">
                  <span>Total registrado</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'indicators':
        return (
          <div key={widget.id} style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--apptio-text-primary)', marginBottom: '1rem' }}>
              📈 Indicadores Financeiros
            </h2>
            <div className="apptio-grid apptio-grid-4">
              <div className="apptio-kpi-card">
                <div className="apptio-kpi-label">Margem Operacional</div>
                <div className="apptio-kpi-value" style={{ fontSize: '1.75rem' }}>
                  {kpis.indicadores.margemOperacional}
                </div>
                <div className="apptio-kpi-change neutral"><span>Percentual</span></div>
              </div>
              <div className="apptio-kpi-card">
                <div className="apptio-kpi-label">Burn Rate Mensal</div>
                <div className="apptio-kpi-value" style={{ fontSize: '1.5rem' }}>
                  {formatCurrency(kpis.indicadores.burnRate)}
                </div>
                <div className="apptio-kpi-change neutral"><span>Por mês</span></div>
              </div>
              <div className="apptio-kpi-card">
                <div className="apptio-kpi-label">Runway</div>
                <div className="apptio-kpi-value" style={{ fontSize: '1.5rem' }}>
                  {kpis.indicadores.runway}
                </div>
                <div className="apptio-kpi-change neutral"><span>Meses restantes</span></div>
              </div>
              <div className="apptio-kpi-card">
                <div className="apptio-kpi-label">Ticket Médio</div>
                <div className="apptio-kpi-value" style={{ fontSize: '1.5rem' }}>
                  {formatCurrency(kpis.indicadores.ticketMedioEntrada)}
                </div>
                <div className="apptio-kpi-change neutral"><span>Por entrada</span></div>
              </div>
            </div>
          </div>
        );

      case 'transactions-chart':
        return transactionsData.length > 0 ? (
          <div key={widget.id} className="apptio-chart-widget" style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <div className="apptio-chart-header">
              <div>
                <h3 className="apptio-chart-title">💸 Fluxo de Transações</h3>
                <p className="apptio-chart-subtitle">Entradas, saídas e saldo por período</p>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
            ) : (
              <LineChart 
                key={`transactions-${timeGrouping}`}
                data={transactionsData} 
                options={transactionsChartOptions} 
              />
            )}
          </div>
        ) : null;

      case 'patrimonio-chart':
        return patrimonioData.length > 0 ? (
          <div key={widget.id} className="apptio-chart-widget" style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <div className="apptio-chart-header">
              <div>
                <h3 className="apptio-chart-title">💰 Evolução do Patrimônio</h3>
                <p className="apptio-chart-subtitle">Patrimônio acumulado ao longo do tempo</p>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
            ) : (
              <LineChart 
                key={`patrimonio-${timeGrouping}`}
                data={patrimonioData} 
                options={patrimonioChartOptions} 
              />
            )}
          </div>
        ) : null;

      case 'category-chart':
        return categoryData.length > 0 ? (
          <div key={widget.id} className="apptio-chart-widget" style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <div className="apptio-chart-header">
              <div>
                <h3 className="apptio-chart-title">📊 Análise por Categoria</h3>
                <p className="apptio-chart-subtitle">Comparação de entradas e saídas por categoria</p>
              </div>
            </div>
            <SimpleBarChart data={categoryData} options={barChartOptions} />
          </div>
        ) : null;

      case 'category-details':
        return (
          <div key={widget.id} style={widgetStyle}>
            <button 
              onClick={() => removeWidget(widget.id)}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee';
                e.currentTarget.style.borderColor = '#d73a49';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--apptio-border)';
              }}
            >
              <Close size={16} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--apptio-text-primary)', marginBottom: '1rem' }}>
              📋 Detalhamento por Categoria
            </h2>
            <div className="apptio-grid apptio-grid-3">
              {Object.entries(kpis.porCategoria || {}).map(([category, data]) => {
                const saldo = data.entradas - data.saidas;
                const isPositiveSaldo = saldo >= 0;
                
                return (
                  <div key={category} className="apptio-widget">
                    <div className="apptio-widget-header">
                      <h4 className="apptio-widget-title">{category}</h4>
                    </div>
                    <div className="apptio-widget-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        <span style={{ color: 'var(--apptio-text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Entradas</span>
                        <span style={{ color: 'var(--apptio-green)', fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(data.entradas)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                        <span style={{ color: 'var(--apptio-text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Saídas</span>
                        <span style={{ color: 'var(--apptio-red)', fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(data.saidas)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--apptio-border)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--apptio-text-primary)', fontSize: '0.875rem' }}>Saldo</span>
                        <span style={{ color: isPositiveSaldo ? 'var(--apptio-green)' : 'var(--apptio-red)', fontWeight: '700', fontSize: '1.25rem' }}>{formatCurrency(saldo)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasChartWidgets = activeWidgets.some(w => 
    ['transactions-chart', 'patrimonio-chart'].includes(w.type)
  );

  return (
    <div>
      {/* Header with Add Widget Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid var(--apptio-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--apptio-text-primary)', marginBottom: '0.25rem' }}>
            Dashboard Financeiro
          </h1>
          <p style={{ color: 'var(--apptio-text-secondary)', fontSize: '0.875rem' }}>
            {activeWidgets.length === 0 
              ? 'Clique em "Adicionar Widget" para começar a personalizar seu dashboard' 
              : `${activeWidgets.length} widget${activeWidgets.length > 1 ? 's' : ''} ativo${activeWidgets.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => setIsModalOpen(true)}
        >
          Adicionar Widget
        </Button>
      </div>

      {/* Time Grouping Filters (only show if there are chart widgets) */}
      {hasChartWidgets && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ButtonSet>
            <Button kind={timeGrouping === 'diario' ? 'primary' : 'secondary'} size="sm" onClick={() => setTimeGrouping('diario')} disabled={loading}>Diário</Button>
            <Button kind={timeGrouping === 'semanal' ? 'primary' : 'secondary'} size="sm" onClick={() => setTimeGrouping('semanal')} disabled={loading}>Semanal</Button>
            <Button kind={timeGrouping === 'mensal' ? 'primary' : 'secondary'} size="sm" onClick={() => setTimeGrouping('mensal')} disabled={loading}>Mensal</Button>
            <Button kind={timeGrouping === 'quartil' ? 'primary' : 'secondary'} size="sm" onClick={() => setTimeGrouping('quartil')} disabled={loading}>Trimestral</Button>
            <Button kind={timeGrouping === 'anual' ? 'primary' : 'secondary'} size="sm" onClick={() => setTimeGrouping('anual')} disabled={loading}>Anual</Button>
          </ButtonSet>
        </div>
      )}

      {/* Active Widgets */}
      {activeWidgets.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'white',
          borderRadius: '8px',
          border: '2px dashed var(--apptio-border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--apptio-text-primary)', marginBottom: '0.5rem' }}>
            Dashboard em Branco
          </h3>
          <p style={{ color: 'var(--apptio-text-secondary)', marginBottom: '1.5rem' }}>
            Comece adicionando widgets para visualizar suas métricas financeiras
          </p>
          <Button kind="primary" renderIcon={Add} onClick={() => setIsModalOpen(true)}>
            Adicionar Primeiro Widget
          </Button>
        </div>
      ) : (
        <div>
          {activeWidgets.map(widget => renderWidget(widget))}
        </div>
      )}

      {/* Add Widget Modal */}
      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalHeading="Adicionar Widget"
        primaryButtonText="Cancelar"
        onRequestSubmit={() => setIsModalOpen(false)}
        size="lg"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--apptio-text-secondary)' }}>
            Selecione um widget para adicionar ao seu dashboard
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {availableWidgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => addWidget(widget.id)}
                disabled={isWidgetTypeActive(widget.id)}
                style={{
                  padding: '1.5rem',
                  background: isWidgetTypeActive(widget.id) ? '#f5f5f5' : 'white',
                  border: '1px solid var(--apptio-border)',
                  borderRadius: '8px',
                  cursor: isWidgetTypeActive(widget.id) ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: isWidgetTypeActive(widget.id) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isWidgetTypeActive(widget.id)) {
                    e.currentTarget.style.borderColor = 'var(--apptio-orange)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--apptio-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{widget.icon}</div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--apptio-text-primary)', marginBottom: '0.5rem' }}>
                  {widget.name}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--apptio-text-secondary)', lineHeight: '1.4' }}>
                  {widget.description}
                </p>
                {isWidgetTypeActive(widget.id) && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--apptio-orange)', fontWeight: '600' }}>
                    ✓ JÁ ADICIONADO
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KPIDashboard;

// Made with Bob - Apptio Cloudability Style - Blank Dashboard with Add Widget
