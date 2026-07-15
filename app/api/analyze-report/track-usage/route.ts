import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// يسجّل استخدام ميزة تحليل التقرير (Gemini أو Claude) لمدرسة الجلسة الحالية.
// هذا للمراقبة فقط من لوحة الأدمن — لا يمنع ولا يوقف أي مدرسة عن الاستخدام
// مهما زاد العدد (حسب طلب صاحب المشروع صراحة: المساعدة ما تُقفل عن أي مدرسة).
// يتحقق من الهوية بنفس طريقة مسارات الدفع، فلا يقدر أحد يسجّل استخدام لمدرسة غيره.
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

    const { data: newCount, error } = await supabase.rpc('increment_ai_usage', { p_school_id: schoolUser.school_id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ count: newCount })
  } catch (e: any) {
    // ما نطيح التحليل نفسه لو فشل التسجيل لأي سبب — التتبع ثانوي، مو أساسي.
    return NextResponse.json({ error: e.message || 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}
