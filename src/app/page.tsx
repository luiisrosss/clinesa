import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to signin by default, AppLayout will handle authenticated users.
  redirect('/signin');
}
