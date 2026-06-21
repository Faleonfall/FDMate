import { useAuth } from "./features/auth/useAuth";
import { SignInScreen } from "./features/auth/SignInScreen";
import { useTheme } from "./lib/useTheme";
import { DayLogScreen } from "./screens/DayLogScreen";
import { AppHeader } from "./ui/AppHeader";

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
