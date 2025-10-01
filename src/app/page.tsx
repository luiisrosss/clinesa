import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the landing page, which is now the sign-in page.
  redirect('/signin');
}
