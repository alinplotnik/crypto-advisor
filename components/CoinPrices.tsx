import VoteButtons from './VoteButtons'
import { COINGECKO_IDS, fetchPrices } from '@/lib/coingecko'

export default async function CoinPrices({ assets }: { assets: string[] }) {
  const prices = await fetchPrices(assets)

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