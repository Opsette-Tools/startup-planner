import { Modal, Typography } from "antd";
import { OpsetteFooterLogo } from "@/components/opsette-share";

const { Paragraph, Title } = Typography;

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="About StartUp Planner">
      <Title level={5} style={{ marginTop: 0 }}>A business tool from Opsette</Title>
      <Paragraph>
        StartUp Planner helps you build a realistic startup budget. Pick your
        industry to seed common line items, then edit the numbers, add your own,
        and split costs into one-time, monthly, and annual.
      </Paragraph>
      <Paragraph>
        When you're ready, export a clean, branded PDF — title it for yourself or
        for a client, and share it as a launch budget or proposal. Nothing is
        saved; the export is how you keep your numbers.
      </Paragraph>
      <OpsetteFooterLogo />
    </Modal>
  );
}
