import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This API route handles the submission of user preferences during onboarding. It requires the user to be authenticated and saves their preferences in the database, marking the onboarding process as completed.
export async function POST(request: Request) {
  const supabase = await createClient()

  // Make sure the request comes from a logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { assets, investorType, contentTypes } = await request.json()

  // Basic validation
  if (!assets?.length || !investorType || !contentTypes?.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Upsert: insert on first time, update if the user redoes onboarding
  const { error: prefError } = await supabase
    .from('preferences')
    .upsert(
      {
        user_id: user.id,
        assets,
        investor_type: investorType,
        content_types: contentTypes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (prefError) {
    return NextResponse.json({ error: prefError.message }, { status: 500 })
  }

  // Mark onboarding as completed on the profile
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}