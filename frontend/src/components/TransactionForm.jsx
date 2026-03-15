import { useState } from 'react';
import {
  Form,
  Stack,
  Select,
  SelectItem,
  TextInput,
  NumberInput,
  DatePicker,
  DatePickerInput,
  TextArea,
  Button,
  ButtonSet
} from '@carbon/react';

const TransactionForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    type: 'entrada',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmountChange = (e) => {
    setFormData(prev => ({
      ...prev,
      amount: e.target.value
    }));
  };

  return (
    <Form onSubmit={handleSubmit} className="apptio-form">
      <Stack gap={6}>
        <div className="apptio-form-row">
          <div>
            <Select
              id="type"
              name="type"
              labelText="Tipo de Transação"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <SelectItem value="entrada" text="Entrada" />
              <SelectItem value="saida" text="Saída" />
            </Select>
          </div>

          <div>
            <TextInput
              id="category"
              name="category"
              labelText="Categoria"
              placeholder="Ex: Vendas, Salários, Marketing..."
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="apptio-form-row">
          <div>
            <NumberInput
              id="amount"
              name="amount"
              label="Valor (R$)"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleAmountChange}
              min={0}
              step={0.01}
              hideSteppers
              required
            />
          </div>

          <div>
            <DatePicker
              datePickerType="single"
              value={formData.date}
              onChange={(dates) => {
                if (dates && dates.length > 0) {
                  // dates[0] já é um Date object do Carbon DatePicker
                  // Extrair componentes diretamente sem criar novo Date
                  const date = dates[0];
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const localDateString = `${year}-${month}-${day}`;
                  
                  console.log('Data selecionada:', localDateString);
                  
                  setFormData(prev => ({
                    ...prev,
                    date: localDateString
                  }));
                }
              }}
            >
              <DatePickerInput
                id="date"
                name="date"
                labelText="Data da Transação"
                placeholder="dd/mm/yyyy"
                required
              />
            </DatePicker>
          </div>
        </div>

        <div>
          <TextArea
            id="description"
            name="description"
            labelText="Descrição (Opcional)"
            placeholder="Adicione detalhes sobre esta transação..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <ButtonSet style={{ marginTop: '1rem' }}>
          <Button 
            type="submit" 
            kind="primary"
          >
            {initialData ? 'Atualizar Transação' : 'Adicionar Transação'}
          </Button>
          {onCancel && (
            <Button type="button" kind="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default TransactionForm;

// Made with Bob - Apptio Cloudability Style
