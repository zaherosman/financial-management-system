import { useState } from 'react';
import { 
  Button, 
  Tile,
  InlineNotification,
  Loading,
  Tag
} from '@carbon/react';
import { 
  Connect, 
  Checkmark, 
  Warning,
  Renew,
  TrashCan
} from '@carbon/icons-react';
import { PluggyConnect } from 'react-pluggy-connect';

const BankConnection = ({ onTransactionsImported }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectToken, setConnectToken] = useState(null);

  // Obter token de conexão do backend
  const getConnectToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pluggy/connect-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao obter token de conexão');
      }

      const data = await response.json();
      setConnectToken(data.accessToken);
      setLoading(false);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Callback quando conexão é bem-sucedida
  const onSuccess = async (itemData) => {
    console.log('Banco conectado:', itemData);
    setConnectToken(null); // Fechar o widget
    await syncTransactions(itemData.item.id);
  };

  // Callback quando há erro
  const onError = (error) => {
    console.error('Erro ao conectar:', error);
    setError('Erro ao conectar com o banco: ' + error.message);
    setConnectToken(null);
  };

  // Callback quando widget é fechado
  const onClose = () => {
    setConnectToken(null);
    setLoading(false);
  };

  // Sincronizar transações de um item
  const syncTransactions = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      // Obter informações do item
      const itemResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pluggy/items/${itemId}`
      );

      if (!itemResponse.ok) {
        throw new Error('Erro ao buscar informações da conta');
      }

      const itemData = await itemResponse.json();

      // Sincronizar transações
      const syncResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pluggy/items/${itemId}/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pageSize: 100
          })
        }
      );

      if (!syncResponse.ok) {
        throw new Error('Erro ao sincronizar transações');
      }

      const syncData = await syncResponse.json();
      
      setSuccess(
        `${syncData.imported} transações importadas com sucesso! ` +
        (syncData.duplicates > 0 ? `(${syncData.duplicates} duplicadas ignoradas)` : '')
      );
      
      // Adicionar ou atualizar conexão na lista
      setConnections(prev => {
        const existing = prev.find(c => c.id === itemId);
        if (existing) {
          return prev.map(c => 
            c.id === itemId 
              ? {
                  ...c,
                  lastSync: new Date().toISOString(),
                  transactionCount: (c.transactionCount || 0) + syncData.imported
                }
              : c
          );
        } else {
          return [...prev, {
            id: itemId,
            bankName: itemData.item?.connector?.name || 'Banco',
            lastSync: new Date().toISOString(),
            transactionCount: syncData.imported,
            status: itemData.item?.status
          }];
        }
      });

      // Notificar componente pai
      if (onTransactionsImported) {
        onTransactionsImported();
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ressincronizar uma conexão existente
  const resyncConnection = async (itemId) => {
    await syncTransactions(itemId);
  };

  // Remover uma conexão
  const removeConnection = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja remover esta conexão?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pluggy/items/${itemId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao remover conexão');
      }

      const data = await response.json();
      
      setConnections(prev => prev.filter(c => c.id !== itemId));
      setSuccess(`Conexão removida com sucesso! ${data.transactionsRemoved} transações foram removidas.`);
      
      // Notificar componente pai
      if (onTransactionsImported) {
        onTransactionsImported();
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erro ao remover conexão:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            onClick={getConnectToken}
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

      {/* Pluggy Connect Widget */}
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={onSuccess}
          onError={onError}
          onClose={onClose}
        />
      )}

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
                    <div style={{ flex: 1 }}>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Renew}
                        onClick={() => resyncConnection(conn.id)}
                        disabled={loading}
                      >
                        Sincronizar
                      </Button>
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        renderIcon={TrashCan}
                        onClick={() => removeConnection(conn.id)}
                        disabled={loading}
                      >
                        Remover
                      </Button>
                    </div>
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
              <li>Adicionar as credenciais no arquivo <code>.env</code> do backend:
                <pre style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
PLUGGY_CLIENT_ID=seu_client_id{'\n'}
PLUGGY_CLIENT_SECRET=seu_client_secret{'\n'}
PLUGGY_ENVIRONMENT=sandbox
                </pre>
              </li>
              <li>Reiniciar o servidor backend</li>
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

// Made with Bob - Pluggy Integration