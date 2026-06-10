import VoteButtons from './VoteButtons'

// Map onboarding asset names to CoinGecko coin ids
const COINGECKO_IDS: Record<string, string> = {
  Bitcoin: 'bitcoin',
  Ethereum: 'ethereum',
  Solana: 'solana',
  Cardano: 'cardano',
  Dogecoin: 'dogecoin',
  XRP: 'ripple',
}

type PriceData = Record<string, { usd: number; usd_24h_change: number }>

export default async function CoinPrices({ assets }: { assets: string[] }) {
  const ids = assets.map((a) => COINGECKO_IDS[a]).filter(Boolean)

  let prices: PriceData | null = null
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // cache for 60s to respect rate limits
    )
    if (res.ok) prices = await res.json()
  } catch {
    // Network error -> fall through to the error state below
  }

  return (
    <section className="rounded-2xl bg-gray-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">💰 Coin Prices</h2>
        <VoteButtons section="prices" contentId={`prices-${new Date().toISOString().slice(0, 10)}`} />
      </div>

      {!prices ? (
        <p className="text-gray-400">Couldn&apos;t load prices right now. Try again soon.</p>
      ) : (
        <ul className="space-y-3">
          {assets.map((asset) => {
            const data = prices![COINGECKO_IDS[asset]]
            if (!data) return null
            const change = data.usd_24h_change
            return (
              <li key={asset} className="flex items-center justify-between">
                <span className="text-gray-200">{asset}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-white">
                    ${data.usd.toLocaleString()}
                  </span>
                  <span className={change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}