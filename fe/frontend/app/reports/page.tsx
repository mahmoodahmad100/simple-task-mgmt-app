import Link from "next/link";
import { ReportsSummary } from "@/components/reports/ReportsSummary";

export default function ReportsPage() {
  return (
    <main className="stack">
      <nav>
        <Link href="/" className="button">
          Back
        </Link>
      </nav>
      <ReportsSummary />
    </main>
  );
}
