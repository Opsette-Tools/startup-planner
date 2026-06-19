export type Category = 'one-time' | 'recurring';
export type Frequency = 'monthly' | 'annual';

export interface Expense {
  id: string;
  name: string;
  category: Category;
  frequency?: Frequency;
  amount: number;
}

export interface EstimatorState {
  businessName: string;
  documentTitle: string;
  industryId: string | null;
  expenses: Expense[];
}
