import { Input, Select, Typography, Row, Col } from 'antd';
import { industries } from '../../data/industries';

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
  return (
    <div style={{ marginBottom: 24 }}>
      <Text type="secondary" className="estimator-section-sub">
        Pick your industry to seed a realistic budget. Edit, add, or remove line items, then export
        a clean PDF for yourself, a client, your accountant, or investors.
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
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
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            Industry
          </Text>
          <Select
            size="large"
            showSearch
            placeholder="Select an industry"
            value={industryId ?? undefined}
            onChange={onIndustryChange}
            optionFilterProp="label"
            style={{ width: '100%' }}
            options={industries.map((i) => ({ value: i.id, label: i.label }))}
          />
        </Col>
        <Col xs={24}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            Document title
          </Text>
          <Input
            size="large"
            placeholder="Startup Cost Estimate"
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
          />
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
            Shown under the business name on the exported PDF — retitle it per client or project.
          </Text>
        </Col>
      </Row>
    </div>
  );
}
