'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Brand from '@/components/Brand'

// This is the onboarding page where new users can select their crypto interests, investor type, and preferred content. The selections are saved to the database and used to personalize the user dashboard.
const ASSETS = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Dogecoin', 'XRP']
const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector', 'DeFi Enthusiast']
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun']

export default function OnboardingPage() {
  const router = useRouter()
  const [assets, setAssets] = useState<string[]>([])
  const [investorType, setInvestorType] = useState<string | null>(null)
  const [contentTypes, setContentTypes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Toggle an item in a multi-select list
  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const isValid = assets.length > 0 && investorType && contentTypes.length > 0

  async function handleSubmit() {
    setSaving(true)
    setError(null)

    const res = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assets, investorType, contentTypes }),
    })

    if (!res.ok) {
      setError('Something went wrong, please try again')
      setSaving(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-6">
          <Brand />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Let&apos;s get to know you</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              Your answers shape your daily dashboard
            </p>
          </div>
        </div>

        <Question title="Which crypto assets interest you?">
          {ASSETS.map((asset) => (
            <Chip
              key={asset}
              label={asset}
              selected={assets.includes(asset)}
              onClick={() => toggle(assets, setAssets, asset)}
            />
          ))}
        </Question>

        <Question title="What type of investor are you?">
          {INVESTOR_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              selected={investorType === type}
              onClick={() => setInvestorType(type)}
            />
          ))}
        </Question>

        <Question title="What content would you like to see?">
          {CONTENT_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              selected={contentTypes.includes(type)}
              onClick={() => toggle(contentTypes, setContentTypes, type)}
            />
          ))}
        </Question>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!isValid || saving}
          className="w-full rounded-md bg-primary p-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Build my dashboard'}
        </button>
      </div>
    </main>
  )
}

// Small presentational helpers
function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 font-medium text-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
      }`}
    >
      {label}
    </button>
  )
}