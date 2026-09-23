type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="card panel stat">
      <p className="muted">{label}</p>
      <p className="stat-value">{value}</p>
    </article>
  );
}
