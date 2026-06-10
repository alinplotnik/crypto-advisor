import VoteButtons from './VoteButtons'
import { COINGECKO_IDS, fetchPrices } from '@/lib/coingecko'

export default async function CoinPrices({ assets }: { assets: string[] }) {
  const prices = await fetchPrices(assets)

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-card-foreground">💰 Coin Prices</h2>
        <VoteButtons section="prices" contentId={`prices-${new Date().toISOString().slice(0, 10)}`} />
      </div>

      {!prices ? (
        <p className="text-muted-foreground">Couldn&apos;t load prices right now. Try again soon.</p>
      ) : (
        <ul className="space-y-3">
          {assets.map((asset) => {
            const data = prices![COINGECKO_IDS[asset]]
            if (!data) return null
            const change = data.usd_24h_change
            return (
              <li key={asset} className="flex items-center justify-between">
                <span className="text-foreground">{asset}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-foreground">
                    ${data.usd.toLocaleString()}
                  </span>
                  <span className={change >= 0 ? 'text-primary' : 'text-destructive'}>
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