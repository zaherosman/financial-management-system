import { useState } from 'react';
import { 
  Button, 
  Modal,
  Tile,
  InlineNotification,
  Loading,
  Tag
} from '@carbon/react';
import { 
  Connect, 
  Checkmark, 
  Warning,
  Renew
} from '@carbon/icons-react';

const BankConnection = ({ onTransactionsImported }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connections, setConnections] = useState([]);

  const connectBank = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obter token do backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/open-finance/connect-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao obter token de conexão');
      }

      const { token } = await response.json();

      // 2. Verificar se o Pluggy SDK está carregado
      if (!window.PluggyConnect) {
        throw new Error('SDK do Pluggy não carregado. Verifique a configuração.');
      }

      // 3. Abrir widget do Pluggy
      const pluggyConnect = new window.PluggyConnect({
        connectToken: token,
        onSuccess: async (itemData) => {
          console.log('Banco conectado:', itemData);
          await syncTransactions(itemData.item.id);
          setShowModal(false);
        },
        onError: (error) => {
          console.error('Erro ao conectar:', error);
          setError('Erro ao conectar com o banco: ' + error.message);
        },
        onClose: () => {
          setLoading(false);
        }
      });

      pluggyConnect.open();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const syncTransactions = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/open-finance/sync/${itemId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao sincronizar transações');
      }

      const data = await response.json();
      
      setSuccess(`${data.count} transações importadas com sucesso!`);
      
      // Adicionar conexão à lista
      setConnections(prev => [...prev, {
        id: itemId,
        bankName: data.bankName || 'Banco',
        lastSync: new Date().toISOString(),
        transactionCount: data.count
      }]);

      // Notificar componente pai
      if (onTransactionsImported) {
        onTransactionsImported(data.transactions);
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resyncConnection = async (itemId) => {
    await syncTransactions(itemId);
  };

  return (
    <div>
      {/* Notificações */}
      {error && (
        <InlineNotification
          kind="error"
          title="Erro"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem', maxWidth: '100%' }}
        />
      )}
      {success && (
        <InlineNotification
          kind="success"
          title="Sucesso"
          subtitle={success}
          onCloseButtonClick={() => setSuccess(null)}
          style={{ marginBottom: '1rem', maxWidth: '100%' }}
        />
      )}

      {/* Widget de Integração */}
      <div className="apptio-widget" style={{ marginBottom: '2rem' }}>
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">🏦 Open Finance - Integração Bancária</h3>
        </div>
        <div className="apptio-widget-content">
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              Conecte suas contas bancárias e importe transações automaticamente usando Open Finance Brasil.
            </p>
            <div style={{ 
              padding: '1rem', 
              background: '#e7f5ff', 
              border: '1px solid #339af0', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1971c2' }}>✨ Recursos:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#495057' }}>
                <li>Importação automática de transações</li>
                <li>Categorização inteligente</li>
                <li>Sincronização em tempo real</li>
                <li>Suporte para 200+ bancos brasileiros</li>
              </ul>
            </div>
          </div>

          <Button
            renderIcon={Connect}
            onClick={connectBank}
            disabled={loading}
            style={{ marginBottom: '1rem' }}
          >
            {loading ? 'Conectando...' : 'Conectar Banco'}
          </Button>

          {loading && (
            <div style={{ marginTop: '1rem' }}>
              <Loading description="Processando..." withOverlay={false} small />
            </div>
          )}
        </div>
      </div>

      {/* Lista de Conexões */}
      {connections.length > 0 && (
        <div className="apptio-widget">
          <div className="apptio-widget-header">
            <h3 className="apptio-widget-title">🔗 Conexões Ativas</h3>
          </div>
          <div className="apptio-widget-content">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {connections.map((conn) => (
                <Tile key={conn.id} style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0 }}>{conn.bankName}</h4>
                        <Tag type="green" size="sm">
                          <Checkmark size={16} /> Conectado
                        </Tag>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                        Última sincronização: {new Date(conn.lastSync).toLocaleString('pt-BR')}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6c757d' }}>
                        {conn.transactionCount} transações importadas
                      </p>
                    </div>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={Renew}
                      onClick={() => resyncConnection(conn.id)}
                      disabled={loading}
                    >
                      Sincronizar
                    </Button>
                  </div>
                </Tile>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aviso sobre configuração */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Warning size={20} style={{ color: '#856404', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚙️ Configuração Necessária</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
              Para usar esta funcionalidade, você precisa:
            </p>
            <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#856404' }}>
              <li>Criar uma conta gratuita no <a href="https://pluggy.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>Pluggy</a></li>
              <li>Obter suas credenciais (Client ID e Client Secret)</li>
              <li>Adicionar as credenciais no arquivo <code>.env</code> do backend</li>
              <li>Adicionar o script do Pluggy no <code>index.html</code></li>
            </ol>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#856404' }}>
              📚 Consulte o arquivo <code>OPEN_FINANCE_INTEGRATION.md</code> para instruções detalhadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankConnection;

// Made with Bob - Open Finance Integration