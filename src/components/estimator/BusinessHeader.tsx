import { Input, Select, Typography, Row, Col } from 'antd';
import { industries } from '../../data/industries';

const { Title, Text } = Typography;

interface Props {
  businessName: string;
  industryId: string | null;
  onBusinessNameChange: (name: string) => void;
  onIndustryChange: (id: string) => void;
}

export function BusinessHeader({
  businessName,
  industryId,
  onBusinessNameChange,
  onIndustryChange,
}: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={2} className="estimator-section-title">
        Startup Cost Estimator
      </Title>
      <Text type="secondary" className="estimator-section-sub">
        Pick your industry to seed a realistic budget. Edit, add, or remove line items, then export
        a clean PDF for your records, accountant, or investors.
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
      </Row>
    </div>
  );
}
