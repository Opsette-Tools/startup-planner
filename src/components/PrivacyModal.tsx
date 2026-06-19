import { Modal, Typography } from "antd";
import { OpsetteFooterLogo } from "@/components/opsette-share";

const { Paragraph, Title } = Typography;

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Privacy">
      <Title level={5} style={{ marginTop: 0 }}>Your numbers stay on your device</Title>
      <Paragraph>
        StartUp Planner is a stateless tool. Your business name, line items, and
        totals live only in your browser tab while you work — nothing is uploaded
        to a server, and nothing is saved between visits.
      </Paragraph>
      <Paragraph>
        No cookies, no tracking, no analytics, no account required. The PDF you
        export is generated entirely in your browser.
      </Paragraph>
      <OpsetteFooterLogo />
    </Modal>
  );
}
