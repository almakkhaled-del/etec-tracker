// طبقة تجريد لبوابة الدفع الإلكتروني
//
// الفكرة: كل الكود اللي يلمس "الدفع" (صفحة الاشتراك، الـ API routes) يتعامل فقط
// مع الدوال والثوابت بهذا الملف — بدون ما يعرف تفاصيل أي بوابة دفع بعينها.
// بمجرد ما توصلنا بيانات تفعيل البوابة (Moyasar / Tap / PayTabs / HyperPay ...)،
// التعديل يصير في هذا الملف فقط، بدون أي تغيير على الصفحات أو الـ API routes.
//
// حالياً PAYMENT_GATEWAY_CONFIGURED = false، فـ createCheckoutSession ترجع null
// دائماً، والواجهة تتراجع تلقائياً لخيار "تواصل عبر واتساب" الموجود مسبقاً.

export const PAYMENT_GATEWAY_CONFIGURED = false

export const ANNUAL_PLAN = {
  name: 'المتكاملة',
  amount: 599,
  currency: 'SAR',
  label: 'ريال / عام دراسي',
}

export type CheckoutSession = {
  url: string
  reference: string
}

/**
 * ينشئ جلسة دفع (checkout session) لدى البوابة، ويرجع رابط الدفع.
 * schoolId: معرّف المدرسة — يُستخدم لاحقاً لربط عملية الدفع بالمدرسة عند نجاحها.
 *
 * TODO بعد اختيار البوابة، مثال بسيط لو كانت Moyasar:
 *
 *   const res = await fetch('https://api.moyasar.com/v1/invoices', {
 *     method: 'POST',
 *     headers: {
 *       Authorization: 'Basic ' + Buffer.from(process.env.MOYASAR_SECRET_KEY + ':').toString('base64'),
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify({
 *       amount: ANNUAL_PLAN.amount * 100, // هللات
 *       currency: ANNUAL_PLAN.currency,
 *       description: `اشتراك شواهدي — ${ANNUAL_PLAN.name}`,
 *       success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe/success`,
 *       back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe`,
 *       metadata: { school_id: schoolId },
 *     }),
 *   })
 *   const data = await res.json()
 *   return { url: data.url, reference: data.id }
 */
export async function createCheckoutSession(schoolId: string): Promise<CheckoutSession | null> {
  if (!PAYMENT_GATEWAY_CONFIGURED) return null
  return null
}
