import { useState } from 'react';
import { 
  Button, 
  DatePicker, 
  DatePickerInput,
  Select,
  SelectItem,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@carbon/react';
import { Download, DocumentPdf, Table as TableIcon } from '@carbon/icons-react';

const ReportsView = ({ transactions }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  // Filtrar transações por período
  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    return transactions.filter(t => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Gerar relatório resumido
  const generateSummaryReport = () => {
    const entradas = filteredTransactions.filter(t => t.type === 'entrada');
    const saidas = filteredTransactions.filter(t => t.type === 'saida');
    
    const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
    
    // Por categoria
    const categorias = {};
    filteredTransactions.forEach(t => {
      if (!categorias[t.category]) {
        categorias[t.category] = { entradas: 0, saidas: 0, total: 0 };
      }
      if (t.type === 'entrada') {
        categorias[t.category].entradas += t.amount;
      } else {
        categorias[t.category].saidas += t.amount;
      }
      categorias[t.category].total = categorias[t.category].entradas - categorias[t.category].saidas;
    });

    return {
      periodo: {
        inicio: startDate || 'Início',
        fim: endDate || 'Atual'
      },
      totais: {
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: totalEntradas - totalSaidas,
        numeroTransacoes: filteredTransactions.length
      },
      categorias: Object.entries(categorias).map(([nome, dados]) => ({
        categoria: nome,
        ...dados
      }))
    };
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Descrição'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.date),
      t.type === 'entrada' ? 'Entrada' : 'Saída',
      t.category,
      t.amount.toFixed(2),
      t.description || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Exportar relatório resumido
  const exportSummaryReport = () => {
    const report = generateSummaryReport();
    
    const content = `
RELATÓRIO FINANCEIRO
====================

Período: ${report.periodo.inicio} até ${report.periodo.fim}

RESUMO GERAL
------------
Total de Entradas: ${formatCurrency(report.totais.entradas)}
Total de Saídas: ${formatCurrency(report.totais.saidas)}
Saldo Líquido: ${formatCurrency(report.totais.saldo)}
Número de Transações: ${report.totais.numeroTransacoes}

ANÁLISE POR CATEGORIA
---------------------
${report.categorias.map(c => `
${c.categoria}:
  Entradas: ${formatCurrency(c.entradas)}
  Saídas: ${formatCurrency(c.saidas)}
  Saldo: ${formatCurrency(c.total)}
`).join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_resumido_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const summaryReport = generateSummaryReport();

  // Preparar dados para tabela
  const tableHeaders = [
    { key: 'categoria', header: 'Categoria' },
    { key: 'entradas', header: 'Entradas' },
    { key: 'saidas', header: 'Saídas' },
    { key: 'saldo', header: 'Saldo' }
  ];

  const tableRows = summaryReport.categorias.map((cat, index) => ({
    id: `${index}`,
    categoria: cat.categoria,
    entradas: formatCurrency(cat.entradas),
    saidas: formatCurrency(cat.saidas),
    saldo: formatCurrency(cat.total)
  }));

  return (
    <div>
      {/* Filtros */}
      <div className="apptio-widget" style={{ marginBottom: '2rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">🔍 Filtros de Relatório</h3>
        </div>
        <div className="apptio-widget-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <DatePicker
              datePickerType="single"
              value={startDate}
              onChange={(dates) => {
                if (dates && dates.length > 0) {
                  const date = dates[0];
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setStartDate(`${year}-${month}-${day}`);
                }
              }}
            >
              <DatePickerInput
                id="start-date"
                labelText="Data Inicial"
                placeholder="dd/mm/yyyy"
              />
            </DatePicker>

            <DatePicker
              datePickerType="single"
              value={endDate}
              onChange={(dates) => {
                if (dates && dates.length > 0) {
                  const date = dates[0];
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setEndDate(`${year}-${month}-${day}`);
                }
              }}
            >
              <DatePickerInput
                id="end-date"
                labelText="Data Final"
                placeholder="dd/mm/yyyy"
              />
            </DatePicker>

            <Select
              id="report-type"
              labelText="Tipo de Relatório"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <SelectItem value="summary" text="Resumo Executivo" />
              <SelectItem value="detailed" text="Detalhado por Transação" />
              <SelectItem value="category" text="Por Categoria" />
            </Select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              kind="primary"
              renderIcon={Download}
              onClick={exportToCSV}
            >
              Exportar CSV
            </Button>
            <Button
              kind="secondary"
              renderIcon={DocumentPdf}
              onClick={exportSummaryReport}
            >
              Exportar Resumo
            </Button>
            <Button
              kind="tertiary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="apptio-grid apptio-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="apptio-kpi-card success">
          <div className="apptio-kpi-label">Total de Entradas</div>
          <div className="apptio-kpi-value">{formatCurrency(summaryReport.totais.entradas)}</div>
          <div className="apptio-kpi-change positive">
            <span>Período selecionado</span>
          </div>
        </div>

        <div className="apptio-kpi-card danger">
          <div className="apptio-kpi-label">Total de Saídas</div>
          <div className="apptio-kpi-value">{formatCurrency(summaryReport.totais.saidas)}</div>
          <div className="apptio-kpi-change negative">
            <span>Período selecionado</span>
          </div>
        </div>

        <div className={`apptio-kpi-card ${summaryReport.totais.saldo >= 0 ? 'info' : 'danger'}`}>
          <div className="apptio-kpi-label">Saldo Líquido</div>
          <div className="apptio-kpi-value">{formatCurrency(summaryReport.totais.saldo)}</div>
          <div className={`apptio-kpi-change ${summaryReport.totais.saldo >= 0 ? 'positive' : 'negative'}`}>
            <span>{summaryReport.totais.saldo >= 0 ? 'Superávit' : 'Déficit'}</span>
          </div>
        </div>

        <div className="apptio-kpi-card warning">
          <div className="apptio-kpi-label">Transações</div>
          <div className="apptio-kpi-value">{summaryReport.totais.numeroTransacoes}</div>
          <div className="apptio-kpi-change neutral">
            <span>Total no período</span>
          </div>
        </div>
      </div>

      {/* Relatório por Categoria */}
      <div className="apptio-widget" style={{ marginBottom: '2rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">📊 Análise por Categoria</h3>
        </div>
        <div className="apptio-widget-content">
          {tableRows.length > 0 ? (
            <DataTable rows={tableRows} headers={tableHeaders}>
              {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                <Table {...getTableProps()} size="lg">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
              Nenhuma transação encontrada no período selecionado
            </div>
          )}
        </div>
      </div>

      {/* Informações do Relatório */}
      <div className="apptio-widget">
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">ℹ️ Informações do Relatório</h3>
        </div>
        <div className="apptio-widget-content">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Período Analisado:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
                De {summaryReport.periodo.inicio} até {summaryReport.periodo.fim}
              </p>
            </div>

            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>Formatos de Exportação:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#6c757d' }}>
                <li>CSV: Ideal para análise em Excel ou Google Sheets</li>
                <li>TXT: Relatório resumido em texto simples</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: '#e7f5ff', border: '1px solid #339af0', borderRadius: '8px' }}>
              <strong style={{ color: '#1971c2' }}>💡 Dica:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#1971c2' }}>
                Use os filtros de data para gerar relatórios mensais, trimestrais ou anuais. 
                Exporte os dados para análises mais profundas em ferramentas externas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

// Made with Bob - Reports Component