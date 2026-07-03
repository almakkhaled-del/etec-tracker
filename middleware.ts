import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// المسارات المحمية — يحتاج المستخدم يكون مسجلاً
const PROTECTED = ['/dashboard', '/domain', '/standard', '/indicator', '/print', '/forms', '/expired']

// المسارات العامة — لا تحتاج تسجيل
const PUBLIC = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // هل المسار محمي؟
  const isProtected = PROTECTED.some(path => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  // ابحث عن Supabase session cookie
  // Supabase يخزن الجلسة في كوكيز اسمها: sb-<project-ref>-auth-token
  const cookies = request.cookies
  const hasSession = [...cookies.getAll()].some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    // احفظ الصفحة المطلوبة عشان نرجع لها بعد الدخول
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * يطابق كل المسارات ما عدا:
     * - _next/static (ملفات ثابتة)
     * - _next/image (صور)
     * - favicon.ico
     * - public files (صور، ملفات)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|docx|pdf)$).*)',
  ],
}
