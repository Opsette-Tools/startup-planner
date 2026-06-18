import { createFileRoute } from "@tanstack/react-router";
import { EstimatorApp } from "../components/estimator/EstimatorApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Startup Cost Estimator — Opsette" },
      {
        name: "description",
        content:
          "Build a realistic startup budget by industry. Edit line items, see one-time vs recurring costs, and export a clean PDF summary.",
      },
      { property: "og:title", content: "Startup Cost Estimator — Opsette" },
      {
        property: "og:description",
        content:
          "Industry-seeded startup budgeting tool with editable line items and PDF export.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <EstimatorApp />;
}
