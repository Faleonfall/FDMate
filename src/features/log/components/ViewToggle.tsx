export type ViewMode = "daily" | "weekly" | "monthly";

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
];

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="view-toggle-option"
          data-active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
