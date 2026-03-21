import { useState, useEffect } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Modal,
  TextInput,
  Toggle,
  InlineNotification,
  Loading,
  Tag
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import { sellerService } from '../services/api';

function SellerManagement() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    active: true
  });

  // Carregar vendedores
  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getAll();
      setSellers(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar vendedores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  // Abrir modal para adicionar
  const handleAdd = () => {
    setEditingSeller(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: '',
      active: true
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      email: seller.email || '',
      phone: seller.phone || '',
      region: seller.region || '',
      active: seller.active !== undefined ? seller.active : true
    });
    setIsModalOpen(true);
  };

  // Salvar vendedor
  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingSeller) {
        await sellerService.update(editingSeller.id, formData);
        setSuccess('Vendedor atualizado com sucesso!');
      } else {
        await sellerService.create(formData);
        setSuccess('Vendedor criado com sucesso!');
      }
      setIsModalOpen(false);
      await loadSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao salvar vendedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar vendedor
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este vendedor? Isso também removerá todo o estoque relacionado.')) {
      return;
    }

    try {
      setLoading(true);
      await sellerService.delete(id);
      setSuccess('Vendedor excluído com sucesso!');
      await loadSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao excluir vendedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefone' },
    { key: 'region', header: 'Região' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Ações' }
  ];

  const rows = sellers.map(seller => ({
    id: seller.id,
    name: seller.name,
    email: seller.email || '-',
    phone: seller.phone || '-',
    region: seller.region || '-',
    status: (
      <Tag type={seller.active ? 'green' : 'gray'}>
        {seller.active ? 'Ativo' : 'Inativo'}
      </Tag>
    ),
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Edit}
          iconDescription="Editar"
          hasIconOnly
          onClick={() => handleEdit(seller)}
        />
        <Button
          kind="danger--ghost"
          size="sm"
          renderIcon={TrashCan}
          iconDescription="Excluir"
          hasIconOnly
          onClick={() => handleDelete(seller.id)}
        />
      </div>
    )
  }));

  return (
    <div className="apptio-widget">
      <div className="apptio-widget-header">
        <h3 className="apptio-widget-title">👥 Gerenciamento de Vendedores</h3>
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={handleAdd}
        >
          Adicionar Vendedor
        </Button>
      </div>

      <div className="apptio-widget-content">
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

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Loading description="Carregando..." withOverlay={false} />
          </div>
        )}

        {!loading && (
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <TableContainer>
                <Table {...getTableProps()}>
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
              </TableContainer>
            )}
          </DataTable>
        )}

        {!loading && sellers.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#525252' }}>
            Nenhum vendedor cadastrado. Clique em "Adicionar Vendedor" para começar.
          </div>
        )}
      </div>

      {/* Modal de Adicionar/Editar */}
      <Modal
        open={isModalOpen}
        modalHeading={editingSeller ? 'Editar Vendedor' : 'Adicionar Vendedor'}
        primaryButtonText="Salvar"
        secondaryButtonText="Cancelar"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSave}
        primaryButtonDisabled={!formData.name}
      >
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="name"
            labelText="Nome do Vendedor *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: João Silva"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="email"
            labelText="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Ex: joao@empresa.com"
            type="email"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="phone"
            labelText="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Ex: (11) 98765-4321"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="region"
            labelText="Região"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="Ex: São Paulo - SP"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Toggle
            id="active"
            labelText="Status"
            labelA="Inativo"
            labelB="Ativo"
            toggled={formData.active}
            onToggle={(checked) => setFormData({ ...formData, active: checked })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default SellerManagement;

// Made with Bob