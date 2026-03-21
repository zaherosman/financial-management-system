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
  NumberInput,
  InlineNotification,
  Loading
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import { productService } from '../services/api';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    category: ''
  });

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Abrir modal para adicionar
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: 0,
      category: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price || 0,
      category: product.category || ''
    });
    setIsModalOpen(true);
  };

  // Salvar produto
  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        await productService.create(formData);
        setSuccess('Produto criado com sucesso!');
      }
      setIsModalOpen(false);
      await loadProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao salvar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar produto
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto? Isso também removerá todo o estoque relacionado.')) {
      return;
    }

    try {
      setLoading(true);
      await productService.delete(id);
      setSuccess('Produto excluído com sucesso!');
      await loadProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao excluir produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    { key: 'name', header: 'Nome' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Categoria' },
    { key: 'price', header: 'Preço' },
    { key: 'actions', header: 'Ações' }
  ];

  const rows = products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category || 'Geral',
    price: `R$ ${parseFloat(product.price || 0).toFixed(2)}`,
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Edit}
          iconDescription="Editar"
          hasIconOnly
          onClick={() => handleEdit(product)}
        />
        <Button
          kind="danger--ghost"
          size="sm"
          renderIcon={TrashCan}
          iconDescription="Excluir"
          hasIconOnly
          onClick={() => handleDelete(product.id)}
        />
      </div>
    )
  }));

  return (
    <div className="apptio-widget">
      <div className="apptio-widget-header">
        <h3 className="apptio-widget-title">📦 Gerenciamento de Produtos</h3>
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={handleAdd}
        >
          Adicionar Produto
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

        {!loading && products.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#525252' }}>
            Nenhum produto cadastrado. Clique em "Adicionar Produto" para começar.
          </div>
        )}
      </div>

      {/* Modal de Adicionar/Editar */}
      <Modal
        open={isModalOpen}
        modalHeading={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
        primaryButtonText="Salvar"
        secondaryButtonText="Cancelar"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSave}
        primaryButtonDisabled={!formData.name || !formData.sku}
      >
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="name"
            labelText="Nome do Produto *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Notebook Dell"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="sku"
            labelText="SKU *"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Ex: NB-DELL-001"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="category"
            labelText="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Eletrônicos"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <NumberInput
            id="price"
            label="Preço (R$)"
            value={formData.price}
            onChange={(e, { value }) => setFormData({ ...formData, price: value })}
            min={0}
            step={0.01}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="description"
            labelText="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada do produto"
          />
        </div>
      </Modal>
    </div>
  );
}

export default ProductManagement;

// Made with Bob