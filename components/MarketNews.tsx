import { getFallbackNews } from '@/lib/fallback-news'
import NewsList from './NewsList'

// This component fetches and displays market news related to the user's selected crypto assets. It attempts to fetch live news from an RSS feed, but falls back to static news if the feed is unavailable. News items that mention the user's selected assets are prioritized at the top of the list.
// Keywords used to match news items to the user's selected assets
const ASSET_KEYWORDS: Record<string, string[]> = {
  Bitcoin: ['bitcoin', 'btc'],
  Ethereum: ['ethereum', 'eth'],
  Solana: ['solana', 'sol'],
  Cardano: ['cardano', 'ada'],
  Dogecoin: ['dogecoin', 'doge'],
  XRP: ['xrp', 'ripple'],
}

type NewsItem = {
  id: string
  title: string
  url: string
  source: string
}

// Minimal RSS parsing without external libraries
function parseRss(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

  for (const block of itemBlocks) {
    const title =
      block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
    const link = block
      .match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1]
      ?.trim()

    if (title && link) {
      items.push({ id: link, title, url: link, source: sourceName })
    }
  }
  return items
}

async function fetchNews(assets: string[]): Promise<{ items: NewsItem[]; live: boolean }> {
  try {
    const res = await fetch('https://cointelegraph.com/rss', {
      next: { revalidate: 300 }, // cache for 5 minutes
    })
    if (!res.ok) return { items: getFallbackNews(assets), live: false }

    const xml = await res.text()
    const allItems = parseRss(xml, 'Cointelegraph')

    // Items mentioning the user's assets come first; general news fills the rest
    const keywords = assets.flatMap((a) => ASSET_KEYWORDS[a] ?? [])
    const matching = allItems.filter((item) =>
      keywords.some((kw) => item.title.toLowerCase().includes(kw))
    )
    const general = allItems.filter((item) => !matching.includes(item))
    const items = [...matching, ...general].slice(0, 20)

    return items.length > 0 ? { items, live: true } : { items: getFallbackNews(assets), live: false }
  } catch {
    return { items: getFallbackNews(assets), live: false }
  }
}

export default async function MarketNews({ assets }: { assets: string[] }) {
  const { items, live } = await fetchNews(assets)

  return (
    <section className="rounded-2xl bg-gray-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          📰 Market News
          {!live && (
            <span className="ml-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            live news unavailable           
            </span>
          )}
        </h2>
      </div>
      <NewsList items={items} />
      {!live && (
        <a
            href="https://cointelegraph.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-lg bg-gray-800 py-2 text-center text-sm text-emerald-400 transition hover:bg-gray-700"
            >
            Browse the latest news on Cointelegraph →
        </a>
        )}
    </section>
  )
}