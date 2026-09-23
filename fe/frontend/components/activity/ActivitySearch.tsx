type ActivitySearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ActivitySearch({ value, onChange }: ActivitySearchProps) {
  return (
    <label className="field">
      <span>Search activity</span>
      <input
        className="input"
        placeholder="Search by action or info"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
