import { useState } from 'react';
import { Input, Select, Typography, Row, Col } from 'antd';
import { industries } from '../../data/industries';
import { haptic } from '@/lib/haptics';

const { Text } = Typography;

interface Props {
  businessName: string;
  documentTitle: string;
  industryId: string | null;
  onBusinessNameChange: (name: string) => void;
  onDocumentTitleChange: (title: string) => void;
  onIndustryChange: (id: string) => void;
}

export function BusinessHeader({
  businessName,
  documentTitle,
  industryId,
  onBusinessNameChange,
  onDocumentTitleChange,
  onIndustryChange,
}: Props) {
  // Explicitly control open state so the panel always closes on select — the
  // default close-on-select doesn't fire reliably here on mobile.
  const [industryOpen, setIndustryOpen] = useState(false);

  return (
    <div style={{ marginBottom: 'var(--ops-space-xl)' }}>
      <Text type="secondary" className="estimator-section-sub">
        Pick your industry to seed a realistic budget. Edit, add, or remove line items, then export
        a clean PDF for yourself, a client, your accountant, or investors.
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong className="estimator-field-label">
            Business name
          </Text>
          <Input
            size="large"
            placeholder="e.g. Northbeam Coffee Co."
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text strong className="estimator-field-label">
            Industry
          </Text>
          <Select
            size="large"
            placeholder="Select an industry"
            value={industryId ?? undefined}
            open={industryOpen}
            onDropdownVisibleChange={setIndustryOpen}
            onChange={(id) => {
              haptic('tap');
              setIndustryOpen(false);
              onIndustryChange(id);
            }}
            popupClassName="industry-dropdown"
            listHeight={420}
            style={{ width: '100%' }}
            options={industries.map((i) => ({ value: i.id, label: i.label }))}
          />
        </Col>
        <Col xs={24}>
          <Text strong className="estimator-field-label">
            Document title
          </Text>
          <Input
            size="large"
            placeholder="Startup Cost Estimate"
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
          />
          <Text type="secondary" className="estimator-hint">
            Shown under the business name on the exported PDF — retitle it per client or project.
          </Text>
        </Col>
      </Row>
    </div>
  );
}
