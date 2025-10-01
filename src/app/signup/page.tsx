import { SignUp } from '@clerk/nextjs';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          signInUrl="/signin"
          forceRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
