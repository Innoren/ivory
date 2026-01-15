import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.delete('session')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: true }) // Still return success even if cookie deletion fails
  }
}
