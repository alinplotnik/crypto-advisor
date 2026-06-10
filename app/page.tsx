import { redirect } from 'next/navigation'

// The root route has no content of its own: logged-in users land on their
// dashboard, and the auth proxy sends everyone else to /login.
export default function Home() {
  redirect('/dashboard')
}
