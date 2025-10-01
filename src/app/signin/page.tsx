import { SignIn } from '@clerk/nextjs';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          signUpUrl="/signup"
          forceRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
