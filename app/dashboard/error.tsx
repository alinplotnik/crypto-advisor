'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

// Catches uncaught exceptions thrown while rendering the dashboard
// (e.g. an unexpected Supabase failure) and shows a recoverable fallback
// instead of the default Next.js error screen.
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Dashboard render failed', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <section className="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-card-foreground">
          Something went wrong
        </h2>
        <p className="mb-4 text-muted-foreground">
          We couldn&apos;t load your dashboard. Please try again.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
