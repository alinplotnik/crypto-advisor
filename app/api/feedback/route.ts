import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This API route handles user feedback (upvotes/downvotes) on different content sections. It requires the user to be authenticated and saves their feedback in the database, allowing them to change their vote if they vote again on the same item.
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section, contentId, vote } = await request.json()

  // Validate input against allowed values
  const validSections = ['news', 'prices', 'insight', 'meme']
  if (!validSections.includes(section) || ![1, -1].includes(vote) || !contentId) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Upsert: voting again on the same item updates the existing vote
  const { error } = await supabase.from('feedback').upsert(
    {
      user_id: user.id,
      section,
      content_id: String(contentId),
      vote,
    },
    { onConflict: 'user_id,section,content_id' }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}