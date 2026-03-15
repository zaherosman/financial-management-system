import { useState } from 'react';
import { Grid, Column, Select, SelectItem, Toggle } from '@carbon/react';
import { LineChart, SimpleBarChart } from '@carbon/charts-react';
import { TrendUp, TrendDown, Warning } from '@carbon/icons-react';

const ForecastView = ({ transactions, kpis }) => {
  const [forecastPeriod, setForecastPeriod] = useState('3');
  const [includeSeasonality, setIncludeSeasonality] = useState(true);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular previsões baseadas em dados históricos
  const calculateForecast = () => {
    if (!transactions || transactions.length === 0) {
      return {
        revenue: [],
        expenses: [],
        cashFlow: [],
        metrics: {
          avgMonthlyRevenue: 0,
          avgMonthlyExpenses: 0,
          projectedRevenue: 0,
          projectedExpenses: 0,
          projectedProfit: 0,
          confidence: 0
        }
      };
    }

    // Agrupar transações por mês
    const monthlyData = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      if (t.type === 'entrada') {
        monthlyData[month].revenue += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    const months = Object.keys(monthlyData).sort();
    const revenueData = months.map(m => monthlyData[m].revenue);
    const expensesData = months.map(m => monthlyData[m].expenses);

    // Calcular médias
    const avgRevenue = revenueData.reduce((a, b) => a + b, 0) / revenueData.length;
    const avgExpenses = expensesData.reduce((a, b) => a + b, 0) / expensesData.length;

    // Calcular tendência (regressão linear simples)
    const calculateTrend = (data) => {
      const n = data.length;
      const sumX = (n * (n + 1)) / 2;
      const sumY = data.reduce((a, b) => a + b, 0);
      const sumXY = data.reduce((sum, y, i) => sum + (i + 1) * y, 0);
      const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    };

    const revenueTrend = calculateTrend(revenueData);
    const expensesTrend = calculateTrend(expensesData);

    // Gerar previsões
    const periods = parseInt(forecastPeriod);
    const forecastRevenue = [];
    const forecastExpenses = [];
    const forecastCashFlow = [];

    for (let i = 1; i <= periods; i++) {
      const nextPeriod = months.length + i;
      
      // Aplicar tendência
      let projRevenue = revenueTrend.intercept + revenueTrend.slope * nextPeriod;
      let projExpenses = expensesTrend.intercept + expensesTrend.slope * nextPeriod;

      // Aplicar sazonalidade (se habilitado)
      if (includeSeasonality) {
        const seasonalityFactor = 1 + (Math.sin(i * Math.PI / 6) * 0.1); // Variação de ±10%
        projRevenue *= seasonalityFactor;
        projExpenses *= seasonalityFactor;
      }

      // Garantir valores positivos
      projRevenue = Math.max(0, projRevenue);
      projExpenses = Math.max(0, projExpenses);

      const monthLabel = `Mês +${i}`;
      
      forecastRevenue.push({
        group: 'Receita Projetada',
        key: monthLabel,
        value: projRevenue
      });
      
      forecastExpenses.push({
        group: 'Despesas Projetadas',
        key: monthLabel,
        value: projExpenses
      });
      
      forecastCashFlow.push({
        group: 'Fluxo de Caixa',
        key: monthLabel,
        value: projRevenue - projExpenses
      });
    }

    // Calcular confiança da previsão (baseado na consistência dos dados)
    const revenueVariance = revenueData.reduce((sum, val) => sum + Math.pow(val - avgRevenue, 2), 0) / revenueData.length;
    const revenueStdDev = Math.sqrt(revenueVariance);
    const coefficientOfVariation = (revenueStdDev / avgRevenue) * 100;
    const confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation));

    const totalProjectedRevenue = forecastRevenue.reduce((sum, item) => sum + item.value, 0);
    const totalProjectedExpenses = forecastExpenses.reduce((sum, item) => sum + item.value, 0);

    return {
      revenue: forecastRevenue,
      expenses: forecastExpenses,
      cashFlow: forecastCashFlow,
      metrics: {
        avgMonthlyRevenue: avgRevenue,
        avgMonthlyExpenses: avgExpenses,
        projectedRevenue: totalProjectedRevenue,
        projectedExpenses: totalProjectedExpenses,
        projectedProfit: totalProjectedRevenue - totalProjectedExpenses,
        confidence: confidence.toFixed(1)
      }
    };
  };

  const forecast = calculateForecast();

  // Dados combinados para gráfico de linha
  const combinedForecastData = [
    ...forecast.revenue,
    ...forecast.expenses
  ];

  const lineChartOptions = {
    title: 'Projeção de Receitas e Despesas',
    axes: {
      bottom: { title: 'Período', mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Valor (R$)', scaleType: 'linear' }
    },
    curve: 'curveMonotoneX',
    height: '400px',
    theme: 'white',
    color: {
      scale: {
        'Receita Projetada': '#28a745',
        'Despesas Projetadas': '#d73a49'
      }
    }
  };

  const cashFlowChartOptions = {
    title: 'Projeção de Fluxo de Caixa',
    axes: {
      bottom: { title: 'Período', mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', title: 'Fluxo de Caixa (R$)', scaleType: 'linear' }
    },
    height: '400px',
    theme: 'white',
    color: { scale: { 'Fluxo de Caixa': '#4a90e2' } }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return '#28a745';
    if (confidence >= 50) return '#ffc107';
    return '#d73a49';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 70) return 'Alta';
    if (confidence >= 50) return 'Média';
    return 'Baixa';
  };

  return (
    <div>
      {/* Controles de Forecast */}
      <div className="apptio-widget" style={{ marginBottom: '2rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">⚙️ Configurações de Previsão</h3>
        </div>
        <div className="apptio-widget-content">
          <Grid>
            <Column lg={8} md={4} sm={4}>
              <Select
                id="forecast-period"
                labelText="Período de Previsão"
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(e.target.value)}
              >
                <SelectItem value="3" text="3 meses" />
                <SelectItem value="6" text="6 meses" />
                <SelectItem value="12" text="12 meses" />
                <SelectItem value="24" text="24 meses" />
              </Select>
            </Column>
            <Column lg={8} md={4} sm={4}>
              <Toggle
                id="seasonality-toggle"
                labelText="Incluir Sazonalidade"
                labelA="Não"
                labelB="Sim"
                toggled={includeSeasonality}
                onToggle={(checked) => setIncludeSeasonality(checked)}
              />
              <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
                Considera variações sazonais nas projeções
              </p>
            </Column>
          </Grid>
        </div>
      </div>

      {/* Métricas de Previsão */}
      <div className="apptio-grid apptio-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="apptio-kpi-card success">
          <div className="apptio-kpi-label">Receita Projetada</div>
          <div className="apptio-kpi-value">{formatCurrency(forecast.metrics.projectedRevenue)}</div>
          <div className="apptio-kpi-change positive">
            <TrendUp size={16} />
            <span>Próximos {forecastPeriod} meses</span>
          </div>
        </div>

        <div className="apptio-kpi-card danger">
          <div className="apptio-kpi-label">Despesas Projetadas</div>
          <div className="apptio-kpi-value">{formatCurrency(forecast.metrics.projectedExpenses)}</div>
          <div className="apptio-kpi-change negative">
            <TrendDown size={16} />
            <span>Próximos {forecastPeriod} meses</span>
          </div>
        </div>

        <div className={`apptio-kpi-card ${forecast.metrics.projectedProfit >= 0 ? 'info' : 'danger'}`}>
          <div className="apptio-kpi-label">Lucro Projetado</div>
          <div className="apptio-kpi-value">{formatCurrency(forecast.metrics.projectedProfit)}</div>
          <div className={`apptio-kpi-change ${forecast.metrics.projectedProfit >= 0 ? 'positive' : 'negative'}`}>
            {forecast.metrics.projectedProfit >= 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
            <span>{forecast.metrics.projectedProfit >= 0 ? 'Superávit' : 'Déficit'}</span>
          </div>
        </div>

        <div className="apptio-kpi-card warning">
          <div className="apptio-kpi-label">Confiança da Previsão</div>
          <div className="apptio-kpi-value" style={{ color: getConfidenceColor(forecast.metrics.confidence) }}>
            {forecast.metrics.confidence}%
          </div>
          <div className="apptio-kpi-change neutral">
            <span>{getConfidenceLabel(forecast.metrics.confidence)}</span>
          </div>
        </div>
      </div>

      {/* Gráficos de Previsão */}
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="apptio-chart-widget" style={{ marginBottom: '1.5rem' }}>
            <div className="apptio-chart-header">
              <h3 className="apptio-chart-title">📈 Projeção de Receitas e Despesas</h3>
              <p className="apptio-chart-subtitle">Previsão baseada em tendências históricas</p>
            </div>
            {combinedForecastData.length > 0 ? (
              <LineChart data={combinedForecastData} options={lineChartOptions} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                Dados insuficientes para gerar previsões
              </div>
            )}
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="apptio-chart-widget" style={{ marginBottom: '1.5rem' }}>
            <div className="apptio-chart-header">
              <h3 className="apptio-chart-title">💰 Projeção de Fluxo de Caixa</h3>
              <p className="apptio-chart-subtitle">Saldo projetado para os próximos períodos</p>
            </div>
            {forecast.cashFlow.length > 0 ? (
              <SimpleBarChart data={forecast.cashFlow} options={cashFlowChartOptions} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                Dados insuficientes para gerar previsões
              </div>
            )}
          </div>
        </Column>
      </Grid>

      {/* Análise e Recomendações */}
      <div className="apptio-widget">
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">🎯 Análise de Cenários e Recomendações</h3>
        </div>
        <div className="apptio-widget-content">
          <Grid>
            <Column lg={8} md={4} sm={4}>
              <div style={{ padding: '1.5rem', background: '#e7f5ff', border: '1px solid #339af0', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1971c2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendUp size={20} />
                  Cenário Otimista (+20%)
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Receita:</span>
                    <strong>{formatCurrency(forecast.metrics.projectedRevenue * 1.2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lucro:</span>
                    <strong style={{ color: '#28a745' }}>
                      {formatCurrency(forecast.metrics.projectedRevenue * 1.2 - forecast.metrics.projectedExpenses)}
                    </strong>
                  </div>
                </div>
              </div>
            </Column>

            <Column lg={8} md={4} sm={4}>
              <div style={{ padding: '1.5rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#856404', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Warning size={20} />
                  Cenário Pessimista (-20%)
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Receita:</span>
                    <strong>{formatCurrency(forecast.metrics.projectedRevenue * 0.8)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lucro:</span>
                    <strong style={{ color: forecast.metrics.projectedRevenue * 0.8 - forecast.metrics.projectedExpenses >= 0 ? '#28a745' : '#d73a49' }}>
                      {formatCurrency(forecast.metrics.projectedRevenue * 0.8 - forecast.metrics.projectedExpenses)}
                    </strong>
                  </div>
                </div>
              </div>
            </Column>
          </Grid>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>💡 Recomendações Estratégicas</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6c757d' }}>
              {forecast.metrics.projectedProfit < 0 && (
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Atenção:</strong> Projeção indica déficit. Considere reduzir custos ou aumentar receitas.
                </li>
              )}
              {forecast.metrics.confidence < 50 && (
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Dados Limitados:</strong> Confiança baixa. Colete mais dados históricos para previsões mais precisas.
                </li>
              )}
              <li style={{ marginBottom: '0.5rem' }}>
                Mantenha uma reserva de emergência de pelo menos {formatCurrency(forecast.metrics.avgMonthlyExpenses * 3)} (3 meses de despesas).
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Revise suas previsões mensalmente e ajuste estratégias conforme necessário.
              </li>
              <li>
                Considere diversificar fontes de receita para reduzir riscos.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastView;

// Made with Bob - Forecast Component