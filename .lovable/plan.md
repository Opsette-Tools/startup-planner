# Business Startup Cost Estimator — Build Plan

A single-page React tool built inside the existing TanStack Start shell (one route: `/`). All UI uses Ant Design, all state is local React state, no backend, no Tailwind, no persistence. Output is static and deploy-ready.

## Scope confirmation

- One route only: `src/routes/index.tsx` renders the entire estimator.
- No auth, no Lovable Cloud, no API calls, no localStorage.
- Tailwind classes in existing placeholder are removed; styling comes from Ant Design + a small CSS module for layout polish.
- TanStack Start stays as the host framework (it's what the project ships with); the user's "no TanStack" rule is interpreted as "no TanStack Query / Router state libraries for app state" — routing/SSR shell is untouched. I'll flag this in the first build message so the user can correct me if they meant strip TanStack entirely.

## File structure

```text
src/
  routes/
    index.tsx                  # Mounts <EstimatorApp />
  components/estimator/
    EstimatorApp.tsx           # Top-level layout, owns all state via useReducer
    BusinessHeader.tsx         # Business name input + industry Select
    ExpenseTable.tsx           # Editable AntD Table (inline edit, delete)
    AddExpenseForm.tsx         # Add custom line item
    SummaryPanel.tsx           # Totals card (one-time, monthly, annual, year 1)
    ExportButton.tsx           # Triggers PDF generation
    pdf/generatePdf.ts         # jsPDF + jspdf-autotable export
    estimator.types.ts         # Expense, Category, Frequency types
    estimator.reducer.ts       # useReducer actions (set industry, edit, add, remove)
  data/
    industries.js              # 15 industries, 8–12 seeded items each
  styles/
    estimator.css              # Small layout/typography polish (no Tailwind)
```

## Data model

```ts
type Category = 'one-time' | 'recurring';
type Frequency = 'monthly' | 'annual';

interface Expense {
  id: string;             // uuid (crypto.randomUUID)
  name: string;
  category: Category;
  frequency?: Frequency;  // required iff category === 'recurring'
  amount: number;         // USD
}
```

`industries.js` exports:

```js
export const industries = [
  { id: 'restaurant', label: 'Restaurant / Food Service', expenses: [ /* 8–12 items */ ] },
  // ... 15 total
];
```

Industries: Freelance/Consulting, Restaurant/Food Service, Retail, E-commerce, Real Estate, Salon/Beauty, Fitness/Personal Training, Photography, Legal Services, Landscaping, Childcare, Auto Repair, Healthcare/Wellness, Tech Startup, Construction/Trades.

## State management

Single `useReducer` in `EstimatorApp.tsx`. Actions:

- `SET_BUSINESS_NAME`
- `SET_INDUSTRY` → replaces `expenses` with cloned seed items (each given fresh ids)
- `UPDATE_EXPENSE` (id, partial fields)
- `ADD_EXPENSE` (new custom row)
- `REMOVE_EXPENSE` (id)
- `RESET`

No persistence — fully stateless per spec.

## Features

1. **Industry selector** — AntD `Select` with search, 15 options. Changing it warns via `Modal.confirm` if user has edits, then reseeds.
2. **Expense table** — AntD `Table` with inline editable cells (name, category Select, frequency Select shown only when recurring, amount `InputNumber` with currency formatter). Row delete via icon. Category column color-coded with AntD `Tag`.
3. **Add line item** — Compact form above table, validates name + amount.
4. **Summary panel** — Sticky `Card` (right column on desktop, bottom on mobile) showing:
   - Total One-Time
   - Total Monthly Recurring
   - Total Annual Recurring
   - **Year 1 Total** = one-time + (monthly × 12) + annual
   Uses AntD `Statistic`.
5. **PDF export** — `jspdf` + `jspdf-autotable`. Header (business name, industry, date), itemized table grouped by category, totals block. Filename: `{business-name}-startup-costs.pdf`.
6. **Responsive** — AntD `Row`/`Col` with `xs={24} lg={16}` for table and `xs={24} lg={8}` for summary. Table uses horizontal scroll on small screens.

## Design

- AntD `ConfigProvider` with a customized theme: neutral palette (slate/charcoal primary `#1f2937`, subtle accent), `borderRadius: 6`, denser table sizing.
- Typography hierarchy: page title (AntD `Typography.Title` level 2), section subheads level 4, muted helper text via `Typography.Text type="secondary"`.
- Header strip with Opsette wordmark placeholder + module name "Startup Cost Estimator" so it reads as a module of a larger suite.
- No emoji, no gradients. Card-based layout on a light gray app background.

## Dependencies to add

- `antd`
- `@ant-design/icons`
- `jspdf`
- `jspdf-autotable`

(React is already present. No Tailwind usage in new code — existing `styles.css` remains for the root shell but estimator components won't use Tailwind utility classes.)

## Out of scope

- Saving/loading estimates
- Multi-currency
- Authentication, sharing, collaboration
- Backend of any kind
