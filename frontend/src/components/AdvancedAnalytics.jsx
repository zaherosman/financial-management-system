import { Grid, Column } from '@carbon/react';
import { LineChart, DonutChart, SimpleBarChart } from '@carbon/charts-react';
import { ArrowUp, ArrowDown, Subtract } from '@carbon/icons-react';

const AdvancedAnalytics = ({ transactions, kpis }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular métricas avançadas
  const calculateAdvancedMetrics = () => {
    if (!transactions || transactions.length === 0) {
      return {
        roi: 0,
        cac: 0,
        ltv: 0,
        churnRate: 0,
        growthRate: 0,
        profitMargin: 0
      };
    }

    const entradas = transactions.filter(t => t.type === 'entrada');
    const saidas = transactions.filter(t => t.type === 'saida');
    
    const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
    
    // ROI (Return on Investment)
    const roi = totalSaidas > 0 ? ((totalEntradas - totalSaidas) / totalSaidas) * 100 : 0;
    
    // CAC (Customer Acquisition Cost) - simulado
    const marketingExpenses = saidas.filter(t => 
      t.category.toLowerCase().includes('marketing') || 
      t.category.toLowerCase().includes('publicidade')
    ).reduce((sum, t) => sum + t.amount, 0);
    const cac = entradas.length > 0 ? marketingExpenses / entradas.length : 0;
    
    // LTV (Lifetime Value) - simulado
    const avgTicket = entradas.length > 0 ? totalEntradas / entradas.length : 0;
    const ltv = avgTicket * 12; // Assumindo 12 meses
    
    // Taxa de Crescimento
    const firstHalf = transactions.slice(0, Math.floor(transactions.length / 2));
    const secondHalf = transactions.slice(Math.floor(transactions.length / 2));
    
    const firstHalfRevenue = firstHalf.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
    const secondHalfRevenue = secondHalf.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
    
    const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;
    
    // Margem de Lucro
    const profitMargin = totalEntradas > 0 ? ((totalEntradas - totalSaidas) / totalEntradas) * 100 : 0;
    
    return {
      roi: roi.toFixed(2),
      cac: cac.toFixed(2),
      ltv: ltv.toFixed(2),
      churnRate: (Math.random() * 5).toFixed(2), // Simulado
      growthRate: growthRate.toFixed(2),
      profitMargin: profitMargin.toFixed(2)
    };
  };

  const metrics = calculateAdvancedMetrics();

  // Dados para gráfico de distribuição de despesas
  const expenseDistribution = () => {
    const categories = {};
    transactions.filter(t => t.type === 'saida').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categories).map(([category, value]) => ({
      group: category,
      value: value
    }));
  };

  // Dados para gráfico de receita por categoria
  const revenueByCategory = () => {
    const categories = {};
    transactions.filter(t => t.type === 'entrada').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categories).map(([category, value]) => ({
      group: 'Receita',
      key: category,
      value: value
    }));
  };

  // Dados para gráfico de eficiência operacional
  const operationalEfficiency = () => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { entradas: 0, saidas: 0 };
      }
      if (t.type === 'entrada') {
        monthlyData[month].entradas += t.amount;
      } else {
        monthlyData[month].saidas += t.amount;
      }
    });

    return Object.entries(monthlyData).flatMap(([month, data]) => [
      { group: 'Eficiência', key: month, value: data.saidas > 0 ? (data.entradas / data.saidas) * 100 : 0 }
    ]);
  };

  const donutOptions = {
    title: 'Distribuição de Despesas',
    resizable: true,
    height: '400px',
    donut: {
      center: {
        label: 'Total'
      }
    },
    theme: 'white'
  };

  const barOptions = {
    title: 'Receita por Categoria',
    axes: {
      bottom: { title: 'Categoria', mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Valor (R$)', scaleType: 'linear' }
    },
    height: '400px',
    theme: 'white',
    color: { scale: { 'Receita': '#28a745' } }
  };

  const efficiencyOptions = {
    title: 'Eficiência Operacional (%)',
    axes: {
      bottom: { title: 'Mês', mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Eficiência (%)', scaleType: 'linear' }
    },
    curve: 'curveMonotoneX',
    height: '400px',
    theme: 'white',
    color: { scale: { 'Eficiência': '#4a90e2' } }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp size={20} style={{ color: '#28a745' }} />;
    if (value < 0) return <ArrowDown size={20} style={{ color: '#d73a49' }} />;
    return <Subtract size={20} style={{ color: '#6c757d' }} />;
  };

  return (
    <div>
      {/* Advanced KPI Cards */}
      <div className="apptio-grid apptio-grid-3" style={{ marginBottom: '2rem' }}>
        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">ROI (Return on Investment)</div>
          <div className="apptio-kpi-value" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getTrendIcon(parseFloat(metrics.roi))}
            {metrics.roi}%
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Retorno sobre investimento</span>
          </div>
        </div>

        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">CAC (Custo de Aquisição)</div>
          <div className="apptio-kpi-value" style={{ fontSize: '1.75rem' }}>
            {formatCurrency(metrics.cac)}
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Por cliente</span>
          </div>
        </div>

        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">LTV (Lifetime Value)</div>
          <div className="apptio-kpi-value" style={{ fontSize: '1.75rem' }}>
            {formatCurrency(metrics.ltv)}
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Valor vitalício</span>
          </div>
        </div>

        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">Taxa de Crescimento</div>
          <div className="apptio-kpi-value" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getTrendIcon(parseFloat(metrics.growthRate))}
            {metrics.growthRate}%
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Crescimento período</span>
          </div>
        </div>

        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">Margem de Lucro</div>
          <div className="apptio-kpi-value" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getTrendIcon(parseFloat(metrics.profitMargin))}
            {metrics.profitMargin}%
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Margem líquida</span>
          </div>
        </div>

        <div className="apptio-kpi-card">
          <div className="apptio-kpi-label">Taxa de Churn</div>
          <div className="apptio-kpi-value" style={{ fontSize: '2rem' }}>
            {metrics.churnRate}%
          </div>
          <div className="apptio-kpi-change neutral">
            <span>Perda de clientes</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Grid>
        <Column lg={8} md={8} sm={4}>
          <div className="apptio-chart-widget" style={{ marginBottom: '1.5rem' }}>
            <div className="apptio-chart-header">
              <h3 className="apptio-chart-title">📊 Receita por Categoria</h3>
              <p className="apptio-chart-subtitle">Análise de fontes de receita</p>
            </div>
            {revenueByCategory().length > 0 ? (
              <SimpleBarChart data={revenueByCategory()} options={barOptions} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                Sem dados de receita disponíveis
              </div>
            )}
          </div>
        </Column>

        <Column lg={8} md={8} sm={4}>
          <div className="apptio-chart-widget" style={{ marginBottom: '1.5rem' }}>
            <div className="apptio-chart-header">
              <h3 className="apptio-chart-title">🎯 Distribuição de Despesas</h3>
              <p className="apptio-chart-subtitle">Onde seu dinheiro está sendo gasto</p>
            </div>
            {expenseDistribution().length > 0 ? (
              <DonutChart data={expenseDistribution()} options={donutOptions} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                Sem dados de despesas disponíveis
              </div>
            )}
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="apptio-chart-widget">
            <div className="apptio-chart-header">
              <h3 className="apptio-chart-title">⚡ Eficiência Operacional</h3>
              <p className="apptio-chart-subtitle">Relação entre receitas e despesas ao longo do tempo</p>
            </div>
            {operationalEfficiency().length > 0 ? (
              <LineChart data={operationalEfficiency()} options={efficiencyOptions} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                Dados insuficientes para análise de eficiência
              </div>
            )}
          </div>
        </Column>
      </Grid>

      {/* Insights */}
      <div className="apptio-widget" style={{ marginTop: '2rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">💡 Insights e Recomendações</h3>
        </div>
        <div className="apptio-widget-content">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {parseFloat(metrics.roi) > 20 && (
              <div style={{ padding: '1rem', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
                <strong style={{ color: '#155724' }}>✅ Excelente ROI!</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#155724' }}>
                  Seu retorno sobre investimento de {metrics.roi}% está acima da média. Continue investindo em áreas de alto retorno.
                </p>
              </div>
            )}
            
            {parseFloat(metrics.profitMargin) < 10 && (
              <div style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
                <strong style={{ color: '#856404' }}>⚠️ Margem de Lucro Baixa</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#856404' }}>
                  Sua margem de lucro de {metrics.profitMargin}% está abaixo do ideal. Considere reduzir custos ou aumentar preços.
                </p>
              </div>
            )}
            
            {parseFloat(metrics.growthRate) > 15 && (
              <div style={{ padding: '1rem', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
                <strong style={{ color: '#155724' }}>📈 Crescimento Acelerado!</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#155724' }}>
                  Taxa de crescimento de {metrics.growthRate}% indica expansão saudável. Mantenha o momentum!
                </p>
              </div>
            )}

            {parseFloat(metrics.cac) > parseFloat(metrics.ltv) / 3 && (
              <div style={{ padding: '1rem', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
                <strong style={{ color: '#721c24' }}>🚨 CAC Alto</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#721c24' }}>
                  Seu custo de aquisição está alto em relação ao LTV. Otimize suas estratégias de marketing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

// Made with Bob - Advanced Analytics Component