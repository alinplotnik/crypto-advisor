'use client'

import { useState } from 'react'

// This component renders the upvote and downvote buttons for content items. It manages the voting state locally for an optimistic UI experience and sends the vote to the server in the background when a button is clicked.
type Props = {
  section: 'news' | 'prices' | 'insight' | 'meme'
  contentId: string
}

export default function VoteButtons({ section, contentId }: Props) {
  const [voted, setVoted] = useState<1 | -1 | null>(null)

  async function vote(value: 1 | -1) {
    // Optimistic UI: update immediately, fire the request in background
    setVoted(value)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, contentId, vote: value }),
    })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => vote(1)}
        className={`rounded-lg px-3 py-1 text-sm transition ${
          voted === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        onClick={() => vote(-1)}
        className={`rounded-lg px-3 py-1 text-sm transition ${
          voted === -1 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  )
}