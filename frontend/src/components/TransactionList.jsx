import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button
} from '@carbon/react';
import { Edit, TrashCan } from '@carbon/icons-react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    // Parse date string (YYYY-MM-DD) directly without timezone conversion
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  if (transactions.length === 0) {
    return (
      <div className="apptio-empty-state">
        <div className="apptio-empty-icon">📊</div>
        <h3 className="apptio-empty-title">Nenhuma transação registrada</h3>
        <p className="apptio-empty-text">
          Adicione sua primeira transação para começar a acompanhar suas finanças
        </p>
      </div>
    );
  }

  const headers = [
    { key: 'type', header: 'Tipo' },
    { key: 'category', header: 'Categoria' },
    { key: 'amount', header: 'Valor' },
    { key: 'date', header: 'Data' },
    { key: 'description', header: 'Descrição' },
    { key: 'actions', header: 'Ações' }
  ];

  const rows = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description
  }));

  return (
    <div className="apptio-table-widget">
      <div className="apptio-table-header">
        <h3 className="apptio-table-title">Transações Recentes</h3>
        <p className="apptio-table-subtitle">
          {transactions.length} {transactions.length === 1 ? 'transação registrada' : 'transações registradas'}
        </p>
      </div>
      
      <DataTable rows={rows} headers={headers}>
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
              {rows.map((row) => {
                const transaction = transactions.find(t => t.id === row.id);
                return (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    <TableCell>
                      <span className={`apptio-badge ${transaction.type === 'entrada' ? 'success' : 'danger'}`}>
                        {transaction.type === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: transaction.type === 'entrada' 
                            ? 'var(--apptio-green)' 
                            : 'var(--apptio-red)'
                        }} />
                        <strong style={{ 
                          color: 'var(--apptio-text-primary)',
                          fontWeight: '600'
                        }}>
                          {transaction.category}
                        </strong>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        color: transaction.type === 'entrada' 
                          ? 'var(--apptio-green)' 
                          : 'var(--apptio-red)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        fontFamily: 'monospace'
                      }}>
                        {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        color: 'var(--apptio-text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(transaction.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        color: 'var(--apptio-text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        {transaction.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Edit}
                          iconDescription="Editar"
                          hasIconOnly
                          onClick={() => onEdit(transaction)}
                        />
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Excluir"
                          hasIconOnly
                          onClick={() => onDelete(transaction.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default TransactionList;

// Made with Bob - Apptio Cloudability Style
