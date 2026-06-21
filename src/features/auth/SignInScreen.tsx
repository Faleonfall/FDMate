type SignInScreenProps = {
  onSignIn: () => void;
};

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  return (
    <main className="sign-in">
      <div className="sign-in-card">
        <div className="sign-in-mark" aria-hidden="true">
          FD
        </div>
        <button
          className="app-button app-button--primary"
          type="button"
          onClick={onSignIn}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
