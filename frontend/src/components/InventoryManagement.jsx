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
  Select,
  SelectItem,
  NumberInput,
  InlineNotification,
  Loading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile
} from '@carbon/react';
import { Add, Edit, TrashCan, Inventory } from '@carbon/icons-react';
import { inventoryService, productService, sellerService } from '../services/api';

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    sellerId: '',
    quantity: 0,
    operation: 'set'
  });

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, productsData, sellersData, summaryData] = await Promise.all([
        inventoryService.getAll(),
        productService.getAll(),
        sellerService.getAll(),
        inventoryService.getSummary()
      ]);
      setInventory(inventoryData);
      setProducts(productsData);
      setSellers(sellersData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Abrir modal para adicionar/atualizar estoque
  const handleAdd = () => {
    setFormData({
      productId: '',
      sellerId: '',
      quantity: 0,
      operation: 'set'
    });
    setIsModalOpen(true);
  };

  // Salvar estoque
  const handleSave = async () => {
    try {
      setLoading(true);
      await inventoryService.updateStock(
        formData.productId,
        formData.sellerId,
        formData.quantity,
        formData.operation
      );
      setSuccess('Estoque atualizado com sucesso!');
      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao atualizar estoque: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar registro de inventário
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de estoque?')) {
      return;
    }

    try {
      setLoading(true);
      await inventoryService.delete(id);
      setSuccess('Registro excluído com sucesso!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao excluir registro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inventoryHeaders = [
    { key: 'productName', header: 'Produto' },
    { key: 'productSku', header: 'SKU' },
    { key: 'sellerName', header: 'Vendedor' },
    { key: 'quantity', header: 'Quantidade' },
    { key: 'actions', header: 'Ações' }
  ];

  const inventoryRows = inventory.map(item => ({
    id: item.id,
    productName: item.productName,
    productSku: item.productSku,
    sellerName: item.sellerName,
    quantity: item.quantity,
    actions: (
      <Button
        kind="danger--ghost"
        size="sm"
        renderIcon={TrashCan}
        iconDescription="Excluir"
        hasIconOnly
        onClick={() => handleDelete(item.id)}
      />
    )
  }));

  const productHeaders = [
    { key: 'productName', header: 'Produto' },
    { key: 'productSku', header: 'SKU' },
    { key: 'totalQuantity', header: 'Estoque Total' },
    { key: 'sellersWithStock', header: 'Vendedores' }
  ];

  const productRows = summary?.productsSummary?.map(item => ({
    id: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    totalQuantity: item.totalQuantity,
    sellersWithStock: item.sellersWithStock
  })) || [];

  const sellerHeaders = [
    { key: 'sellerName', header: 'Vendedor' },
    { key: 'totalProducts', header: 'Produtos' },
    { key: 'totalQuantity', header: 'Quantidade Total' }
  ];

  const sellerRows = summary?.sellersSummary?.map(item => ({
    id: item.sellerId,
    sellerName: item.sellerName,
    totalProducts: item.totalProducts,
    totalQuantity: item.totalQuantity
  })) || [];

  return (
    <div>
      {/* Notificações */}
      {error && (
        <InlineNotification
          kind="error"
          title="Erro"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
        />
      )}
      {success && (
        <InlineNotification
          kind="success"
          title="Sucesso"
          subtitle={success}
          onCloseButtonClick={() => setSuccess(null)}
          style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
        />
      )}

      {/* Cards de Resumo */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Tile style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.5rem' }}>
              Total de Produtos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#161616' }}>
              {summary.totalProducts}
            </div>
          </Tile>
          <Tile style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.5rem' }}>
              Total de Vendedores
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#161616' }}>
              {summary.totalSellers}
            </div>
          </Tile>
          <Tile style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.5rem' }}>
              Registros de Estoque
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#161616' }}>
              {summary.totalInventoryRecords}
            </div>
          </Tile>
        </div>
      )}

      {/* Tabs */}
      <div className="apptio-widget">
        <div className="apptio-widget-header">
          <h3 className="apptio-widget-title">📊 Controle de Estoque</h3>
          <Button
            kind="primary"
            size="sm"
            renderIcon={Add}
            onClick={handleAdd}
          >
            Atualizar Estoque
          </Button>
        </div>

        <div className="apptio-widget-content">
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Loading description="Carregando..." withOverlay={false} />
            </div>
          )}

          {!loading && (
            <Tabs>
              <TabList aria-label="Visualizações de estoque">
                <Tab>Todos os Registros</Tab>
                <Tab>Por Produto</Tab>
                <Tab>Por Vendedor</Tab>
              </TabList>
              <TabPanels>
                {/* Tab 1: Todos os Registros */}
                <TabPanel>
                  <DataTable rows={inventoryRows} headers={inventoryHeaders}>
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
                  {inventoryRows.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#525252' }}>
                      Nenhum registro de estoque encontrado.
                    </div>
                  )}
                </TabPanel>

                {/* Tab 2: Por Produto */}
                <TabPanel>
                  <DataTable rows={productRows} headers={productHeaders}>
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
                </TabPanel>

                {/* Tab 3: Por Vendedor */}
                <TabPanel>
                  <DataTable rows={sellerRows} headers={sellerHeaders}>
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
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </div>
      </div>

      {/* Modal de Atualizar Estoque */}
      <Modal
        open={isModalOpen}
        modalHeading="Atualizar Estoque"
        primaryButtonText="Salvar"
        secondaryButtonText="Cancelar"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSave}
        primaryButtonDisabled={!formData.productId || !formData.sellerId}
      >
        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="productId"
            labelText="Produto *"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          >
            <SelectItem value="" text="Selecione um produto" />
            {products.map(product => (
              <SelectItem key={product.id} value={product.id} text={`${product.name} (${product.sku})`} />
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="sellerId"
            labelText="Vendedor *"
            value={formData.sellerId}
            onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
          >
            <SelectItem value="" text="Selecione um vendedor" />
            {sellers.filter(s => s.active).map(seller => (
              <SelectItem key={seller.id} value={seller.id} text={seller.name} />
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="operation"
            labelText="Operação"
            value={formData.operation}
            onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
          >
            <SelectItem value="set" text="Definir quantidade" />
            <SelectItem value="add" text="Adicionar ao estoque" />
            <SelectItem value="subtract" text="Remover do estoque" />
          </Select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <NumberInput
            id="quantity"
            label="Quantidade"
            value={formData.quantity}
            onChange={(e, { value }) => setFormData({ ...formData, quantity: value })}
            min={0}
            step={1}
          />
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '4px', fontSize: '0.875rem' }}>
          <strong>Dica:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li><strong>Definir:</strong> Define a quantidade exata no estoque</li>
            <li><strong>Adicionar:</strong> Soma a quantidade ao estoque atual</li>
            <li><strong>Remover:</strong> Subtrai a quantidade do estoque atual</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default InventoryManagement;

// Made with Bob