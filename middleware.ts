import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.getAll().some(c =>
    c.name.includes('supabase') || c.name.includes('sb-')
  )

  if (!hasSession && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
