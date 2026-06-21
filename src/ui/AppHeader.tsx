import type { ThemePreference } from "../lib/theme";
import { LogoutIcon, ThemeIcon } from "./AppIcons";

type AppHeaderProps = {
  themePreference: ThemePreference;
  onCycleThemePreference: () => void;
  onSignOut?: () => void;
};

export function AppHeader({
  themePreference,
  onCycleThemePreference,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-brand">
          <h1 className="hero-title">FDMate</h1>
        </div>
        <div className="hero-actions">
          <button
            className="icon-button"
            type="button"
            onClick={onCycleThemePreference}
            aria-label={`Theme: ${themePreference}`}
            title={`Theme: ${themePreference}`}
          >
            <ThemeIcon preference={themePreference} />
          </button>
          {onSignOut ? (
            <button
              className="icon-button"
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
