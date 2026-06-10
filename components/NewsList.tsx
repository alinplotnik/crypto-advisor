'use client'

import { useState } from 'react'
import VoteButtons from './VoteButtons'

type NewsItem = {
  id: string
  title: string
  url: string
  source: string
}

const PAGE_SIZE = 5

export default function NewsList({ items }: { items: NewsItem[] }) {
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  // Cycle to the next batch of articles; wraps around to the start
  function refresh() {
    setPage((p) => (p + 1) % totalPages)
  }

  return (
    <div>
      <ul className="space-y-4">
        {visible.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground underline-offset-4 hover:underline"
              >
                {item.title}
              </a>
              <p className="text-xs text-muted-foreground">{item.source}</p>
            </div>
            <VoteButtons section="news" contentId={item.id} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <button
          onClick={refresh}
          className="mt-4 w-full rounded-md bg-secondary py-2 text-sm text-secondary-foreground transition hover:bg-accent"
        >
          🔄 Show me other articles
        </button>
      )}
    </div>
  )
}