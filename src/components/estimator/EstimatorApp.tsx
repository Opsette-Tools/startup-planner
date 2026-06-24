import { useReducer, useMemo, useEffect } from 'react';
import { Row, Col, Card, Typography, Modal, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ThemeProvider } from '@/lib/theme';
import Shell from '@/components/Shell';
import { estimatorReducer, initialState } from './estimator.reducer';
import { loadState, saveState, clearState } from './estimator.storage';
import { industries } from '../../data/industries';
import type { Expense } from './estimator.types';
import { uuid } from '@/lib/uuid';
import { haptic } from '@/lib/haptics';
import { BusinessHeader } from './BusinessHeader';
import { ExpenseTable } from './ExpenseTable';
import { AddExpenseForm } from './AddExpenseForm';
import { SummaryPanel } from './SummaryPanel';
import { ExportButton } from './ExportButton';
import { MobileTotalBar } from './MobileTotalBar';
import '../../styles/estimator.css';

const { Text } = Typography;

function seedExpensesFor(industryId: string): Expense[] {
  const ind = industries.find((i) => i.id === industryId);
  if (!ind) return [];
  return ind.expenses.map((e) => ({ ...e, id: uuid() }));
}

function Estimator() {
  // Lazy-init from localStorage so a refresh / accidental close keeps the work.
  const [state, dispatch] = useReducer(estimatorReducer, initialState, loadState);

  // Persist on every change. Cheap (one small JSON blob) so no debounce needed.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleStartOver = () => {
    Modal.confirm({
      title: 'Start over?',
      content: 'This clears your business details and every line item. This can’t be undone.',
      okText: 'Start over',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        haptic('warning');
        clearState();
        dispatch({ type: 'RESET' });
      },
    });
  };

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

      <Row gutter={[24, 24]} className="estimator-grid">
        <Col xs={24} lg={16}>
          <Card
            title="Expenses"
            variant="outlined"
            styles={{ body: { padding: 0 } }}
            extra={
              state.expenses.length > 0 ? (
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleStartOver}
                  className="estimator-card-hint"
                >
                  Start over
                </Button>
              ) : (
                <Text type="secondary" className="estimator-card-hint">
                  Click any field to edit
                </Text>
              )
            }
          >
            <div className="estimator-addrow">
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
          <div id="budget-summary">
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
          </div>
        </Col>
      </Row>

      <MobileTotalBar expenses={state.expenses} />
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
