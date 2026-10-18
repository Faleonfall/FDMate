import { SignInScreen } from "./components/app/SignInScreen";
import { DayLogScreen } from "./components/diary/DayLogScreen";
import { AppHeader } from "./components/app/AppHeader";
import { useAuth } from "./hooks/app/useAuth";
import { useTheme } from "./hooks/app/useTheme";

export default function App() {
  const { preference, cycleThemePreference } = useTheme();
  const { user, loading, signIn, logOut } = useAuth();

  return (
    <div className="app-shell">
      <AppHeader
        themePreference={preference}
        onCycleThemePreference={cycleThemePreference}
        {...(user ? { onSignOut: () => void logOut() } : {})}
      />
      {loading ? null : user ? (
        <DayLogScreen uid={user.uid} />
      ) : (
        <SignInScreen onSignIn={() => void signIn()} />
      )}
    </div>
  );
}
