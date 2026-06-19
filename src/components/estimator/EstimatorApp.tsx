import { useReducer, useMemo } from 'react';
import { Row, Col, Card, Typography, Modal } from 'antd';
import { ThemeProvider } from '@/lib/theme';
import Shell from '@/components/Shell';
import { estimatorReducer, initialState } from './estimator.reducer';
import { industries } from '../../data/industries';
import type { Expense } from './estimator.types';
import { BusinessHeader } from './BusinessHeader';
import { ExpenseTable } from './ExpenseTable';
import { AddExpenseForm } from './AddExpenseForm';
import { SummaryPanel } from './SummaryPanel';
import { ExportButton } from './ExportButton';
import '../../styles/estimator.css';

const { Text } = Typography;

function seedExpensesFor(industryId: string): Expense[] {
  const ind = industries.find((i) => i.id === industryId);
  if (!ind) return [];
  return ind.expenses.map((e) => ({ ...e, id: crypto.randomUUID() }));
}

function Estimator() {
  const [state, dispatch] = useReducer(estimatorReducer, initialState);

  const industryLabel = useMemo(
    () => industries.find((i) => i.id === state.industryId)?.label ?? '',
    [state.industryId],
  );

  const handleIndustryChange = (id: string) => {
    const apply = () =>
      dispatch({ type: 'SET_INDUSTRY', industryId: id, expenses: seedExpensesFor(id) });

    if (state.expenses.length > 0 && state.industryId && state.industryId !== id) {
      Modal.confirm({
        title: 'Replace current line items?',
        content: 'Switching industries will replace your current list with the seeded items.',
        okText: 'Replace',
        cancelText: 'Cancel',
        onOk: apply,
      });
    } else {
      apply();
    }
  };

  return (
    <main className="estimator-main">
      <BusinessHeader
        businessName={state.businessName}
        documentTitle={state.documentTitle}
        industryId={state.industryId}
        onBusinessNameChange={(name) => dispatch({ type: 'SET_BUSINESS_NAME', name })}
        onDocumentTitleChange={(title) => dispatch({ type: 'SET_DOCUMENT_TITLE', title })}
        onIndustryChange={handleIndustryChange}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title="Expenses"
            variant="outlined"
            styles={{ body: { padding: 0 } }}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Click any field to edit
              </Text>
            }
          >
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
              <AddExpenseForm onAdd={(expense) => dispatch({ type: 'ADD_EXPENSE', expense })} />
            </div>
            <ExpenseTable
              expenses={state.expenses}
              onUpdate={(id, patch) => dispatch({ type: 'UPDATE_EXPENSE', id, patch })}
              onRemove={(id) => dispatch({ type: 'REMOVE_EXPENSE', id })}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <SummaryPanel
            expenses={state.expenses}
            footer={
              <ExportButton
                businessName={state.businessName}
                documentTitle={state.documentTitle}
                industryLabel={industryLabel}
                expenses={state.expenses}
              />
            }
          />
        </Col>
      </Row>
    </main>
  );
}

export function EstimatorApp() {
  return (
    <ThemeProvider>
      <Shell>
        <Estimator />
      </Shell>
    </ThemeProvider>
  );
}
