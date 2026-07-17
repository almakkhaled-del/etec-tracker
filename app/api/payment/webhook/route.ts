import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateCallbackSignature, schoolIdFromReference, ANNUAL_PLAN } from '@/lib/payment'

// نقطة استقبال إشعارات جيديا (Callback/Webhook) — تُستدعى من خوادم جيديا نفسها
// (مو من المتصفح) بعد اكتمال أو فشل الدفع. هذا هو المصدر الموثوق الوحيد لتفعيل
// الاشتراك — صفحة النجاح اللي يرجع لها المستخدم للعرض فقط.
//
// التوثيق: https://docs.geidea.net/docs/sample-callback-responses
// شكل الحمولة: { order: { orderId, amount, currency, status, merchantReferenceId, ... },
//                signature, timestamp? }
//
// الحماية (طبقتان):
// 1) توقيع جيديا: Base64(HMAC-SHA256(publicKey+amount+currency+orderId+status+refId+timestamp, apiPassword))
// 2) مطابقة المبلغ والعملة مع قيمة الباقة عندنا — حسب تحذير جيديا الصريح بالتوثيق.
//
// ⚠️ قبل التفعيل الفعلي تأكد من وجود متغيرات البيئة في Vercel:
//   SUPABASE_SERVICE_ROLE_KEY (للكتابة بجدولي payments/schools متجاوزاً RLS)
//   GEIDEA_MERCHANT_PUBLIC_KEY + GEIDEA_API_PASSWORD (للتحقق من التوقيع)

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'البوابة غير مفعّلة بعد (SUPABASE_SERVICE_ROLE_KEY غير موجود)' }, { status: 503 })
    }
    const publicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY
    const apiPassword = process.env.GEIDEA_API_PASSWORD
    if (!publicKey || !apiPassword) {
      return NextResponse.json({ error: 'البوابة غير مفعّلة بعد (مفاتيح جيديا غير موجودة)' }, { status: 503 })
    }

    const body = await req.json()

    // جيديا ترسل تفاصيل الطلب داخل كائن order (وبعض الإصدارات ترسلها بالجذر مباشرة)
    const order = body.order ?? body
    const orderId: string | undefined = order.orderId || order.id
    const reference: string | undefined = order.merchantReferenceId || body.merchantReferenceId
    const amount = Number(order.amount)
    const currency: string | undefined = order.currency
    const status: string = order.status || ''
    const detailedStatus: string = order.detailedStatus || ''

    if (!orderId || !reference) {
      return NextResponse.json({ received: true, ignored: 'missing orderId or merchantReferenceId' })
    }

    // ── التحقق من التوقيع ──────────────────────────────────────────────
    // نرفض أي إشعار توقيعه غير صالح — وإلا أي أحد يقدر يرسل طلباً مزوّراً
    // يفعّل اشتراكاً مجانياً. ملاحظة: موضع timestamp قد يكون بالجذر أو داخل
    // order حسب إصدار الحمولة، نجرب الاثنين قبل الرفض.
    const signature: string | undefined = body.signature
    const timestamps = [body.timestamp, order.timestamp].filter(Boolean) as string[]
    const signatureValid = Boolean(signature) && timestamps.some(ts =>
      generateCallbackSignature(publicKey, amount, currency || '', orderId, status, reference, apiPassword, ts) === signature
    )
    if (!signatureValid) {
      // نسجّل الإشعار للفحص اليدوي بدل تجاهله بصمت — أول أسبوع تشغيل مهم
      // نراقب هل صيغة التوقيع الفعلية من جيديا مطابقة للتوثيق.
      console.error('[geidea-webhook] rejected: invalid signature', { orderId, reference, status })
      return NextResponse.json({ error: 'توقيع غير صالح' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const schoolId = schoolIdFromReference(reference)
    if (!schoolId) {
      return NextResponse.json({ received: true, ignored: 'reference not in SCH-<id>-<ts> format' })
    }

    const isSuccessful = status === 'Paid' || detailedStatus === 'Paid'

    if (!isSuccessful) {
      await supabaseAdmin.from('payments').upsert({
        school_id: schoolId, gateway_reference: orderId, status: 'failed',
      }, { onConflict: 'gateway_reference' })
      return NextResponse.json({ received: true })
    }

    // ── مطابقة المبلغ والعملة (تحذير صريح بتوثيق جيديا) ─────────────────
    if (amount !== ANNUAL_PLAN.amount || currency !== ANNUAL_PLAN.currency) {
      console.error('[geidea-webhook] rejected: amount/currency mismatch', { orderId, amount, currency })
      return NextResponse.json({ error: 'المبلغ أو العملة لا يطابق قيمة الباقة' }, { status: 400 })
    }

    // تفادي معالجة نفس عملية الدفع مرتين لو جيديا أعادت إرسال نفس الإشعار
    const { data: existing } = await supabaseAdmin
      .from('payments').select('id, status').eq('gateway_reference', orderId).maybeSingle()
    if (existing?.status === 'paid') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)

    await supabaseAdmin.from('payments').upsert({
      school_id: schoolId, amount: ANNUAL_PLAN.amount, currency: ANNUAL_PLAN.currency, status: 'paid',
      gateway_reference: orderId, paid_at: new Date().toISOString(),
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
