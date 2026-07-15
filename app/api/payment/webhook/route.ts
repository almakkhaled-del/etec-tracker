import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// نقطة استقبال إشعارات بوابة الدفع (Webhook) — تُستدعى من خوادم البوابة نفسها
// (مو من المتصفح)، فتحتاج مفتاح service_role عشان تكتب في قاعدة البيانات بدون
// المرور بسياسات RLS العادية (المستخدم العادي أصلاً ما يقدر يكتب بجدول payments).
//
// ⚠️ قبل التفعيل الفعلي، لازم نضيف SUPABASE_SERVICE_ROLE_KEY في متغيرات البيئة
// (Vercel > Settings > Environment Variables) — تجده في Supabase Dashboard > Project Settings > API.
// هذا المفتاح سري جداً، لا يُستخدم إلا هنا على الخادم، ولا يظهر أبداً في كود العميل.
//
// ⚠️ كل بوابة دفع لها طريقتها الخاصة للتحقق من أن الطلب فعلاً منها (signature/secret) —
// لازم نضيف هذا التحقق أول شيء بالدالة قبل الوثوق بأي بيانات بالـ body، وإلا أي حد
// يقدر يرسل طلب مزوّر يفعّل اشتراك مجاني. راجع توثيق البوابة المختارة لمعرفة الآلية بالضبط.

export async function POST(req: NextRequest) {
  try {
    // إنشاء العميل يتم هنا داخل الدالة (لا في أعلى الملف) عمداً — حتى لا يفشل
    // بناء المشروع (build) في حال المتغير غير موجود بعد بمتغيرات البيئة.
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'البوابة غير مفعّلة بعد (SUPABASE_SERVICE_ROLE_KEY غير موجود)' }, { status: 503 })
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await req.json()

    // TODO: تحقق من توقيع/سر البوابة هنا قبل أي شيء آخر — مثال عام:
    // const signature = req.headers.get('x-gateway-signature')
    // if (!isValidSignature(signature, body)) return NextResponse.json({ error: 'توقيع غير صالح' }, { status: 401 })

    // TODO: شكل الحقول أدناه افتراضي مؤقت — يتغيّر حسب شكل payload البوابة الفعلي بعد اختيارها
    const schoolId: string | undefined = body.metadata?.school_id || body.school_id
    const gatewayReference: string | undefined = body.id || body.reference
    const isSuccessful = body.status === 'paid' || body.status === 'succeeded' || body.status === 'captured'

    if (!schoolId || !gatewayReference) {
      return NextResponse.json({ received: true, ignored: 'missing school_id or reference' })
    }

    if (!isSuccessful) {
      await supabaseAdmin.from('payments').upsert({
        school_id: schoolId, gateway_reference: gatewayReference, status: 'failed',
      }, { onConflict: 'gateway_reference' })
      return NextResponse.json({ received: true })
    }

    // تفادي معالجة نفس عملية الدفع مرتين لو البوابة أعادت إرسال نفس الإشعار
    const { data: existing } = await supabaseAdmin
      .from('payments').select('id, status').eq('gateway_reference', gatewayReference).maybeSingle()
    if (existing?.status === 'paid') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)

    await supabaseAdmin.from('payments').upsert({
      school_id: schoolId, amount: 599, currency: 'SAR', status: 'paid',
      gateway_reference: gatewayReference, paid_at: new Date().toISOString(),
    }, { onConflict: 'gateway_reference' })

    await supabaseAdmin.from('schools').update({
      subscription_status: 'active',
      subscription_start: new Date().toISOString(),
      subscription_end: end.toISOString(),
    }).eq('id', schoolId)

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}
