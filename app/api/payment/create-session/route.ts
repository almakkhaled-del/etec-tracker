import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCheckoutSession, PAYMENT_GATEWAY_CONFIGURED, ANNUAL_PLAN } from '@/lib/payment'

// ينشئ جلسة دفع للمدرسة صاحبة الجلسة الحالية (يُستدعى من صفحة /subscribe).
// يتحقق من هوية المستخدم عبر التوكن المرسل بهيدر Authorization، ثم يحدد مدرسته
// عبر school_users (بحماية RLS نفسها)، فلا يقدر يطلب جلسة دفع لمدرسة غيره.
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 })

    const { data: schoolUser } = await supabase
      .from('school_users').select('school_id').eq('auth_id', user.id).single()
    if (!schoolUser) return NextResponse.json({ error: 'لا توجد مدرسة مرتبطة بهذا الحساب' }, { status: 404 })

    if (!PAYMENT_GATEWAY_CONFIGURED) {
      return NextResponse.json({ configured: false, plan: ANNUAL_PLAN })
    }

    const session = await createCheckoutSession(schoolUser.school_id)
    if (!session) return NextResponse.json({ configured: false, plan: ANNUAL_PLAN })

    return NextResponse.json({ configured: true, url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}
