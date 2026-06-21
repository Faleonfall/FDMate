import { ChevronLeftIcon, ChevronRightIcon } from "../../../ui/AppIcons";

type RangeNavigatorProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function RangeNavigator({
  label,
  onPrev,
  onNext,
  onToday,
}: RangeNavigatorProps) {
  return (
    <div className="range-nav">
      <button
        className="range-nav-arrow"
        type="button"
        onClick={onPrev}
        aria-label="Previous"
      >
        <ChevronLeftIcon className="range-nav-icon" />
      </button>
      <span className="range-nav-label">{label}</span>
      <button
        className="range-nav-arrow"
        type="button"
        onClick={onNext}
        aria-label="Next"
      >
        <ChevronRightIcon className="range-nav-icon" />
      </button>
      <button className="range-nav-today" type="button" onClick={onToday}>
        Today
      </button>
    </div>
  );
}
