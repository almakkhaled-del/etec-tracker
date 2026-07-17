// طبقة تجريد لبوابة الدفع الإلكتروني — Geidea (جيديا) HPP Checkout
//
// الفكرة: كل الكود اللي يلمس "الدفع" (صفحة الاشتراك، الـ API routes) يتعامل فقط
// مع الدوال والثوابت بهذا الملف. البوابة المعتمدة: جيديا — بيئة السعودية.
// التوثيق: https://docs.geidea.net/docs/geidea-checkout-v2
//
// ── التفعيل ──────────────────────────────────────────────────────────────
// بمجرد وصول بيانات التاجر من جيديا، أضف في متغيرات البيئة
// (Vercel > Settings > Environment Variables + ملف .env.local محلياً):
//
//   GEIDEA_MERCHANT_PUBLIC_KEY = المفتاح العام للتاجر (Merchant Public Key)
//   GEIDEA_API_PASSWORD        = كلمة مرور الـ API (سرية — server فقط!)
//   NEXT_PUBLIC_SITE_URL       = https://www.shawahede.com
//
// لا حاجة لأي تعديل بالكود — isGatewayConfigured() تكتشف المتغيرات تلقائياً،
// وقبل وجودها تتراجع الواجهة لخيار "تواصل عبر واتساب" الحالي.
//
// ⚠️ هذا الملف يُستورد أيضاً من صفحة العميل (subscribe) لأجل ANNUAL_PLAN فقط —
// لذلك لا تقرأ أسرار البيئة على مستوى الوحدة (module level)، فقط داخل الدوال
// التي تعمل حصراً على الخادم.

import { createHmac } from 'crypto'
import { ANNUAL_PLAN } from './plan'

// إعادة تصدير للـ API routes — مكونات العميل تستورد من '@/lib/plan' مباشرة
export { ANNUAL_PLAN }

// بيئة السعودية لدى جيديا (تختلف عن مصر والإمارات)
const GEIDEA_API_BASE = 'https://api.ksamerchant.geidea.net'
const GEIDEA_HPP_BASE = 'https://www.ksamerchant.geidea.net'

export type CheckoutSession = {
  url: string
  reference: string // merchantReferenceId — نستخدمه لربط الدفع بالمدرسة
}

export function isGatewayConfigured(): boolean {
  return Boolean(process.env.GEIDEA_MERCHANT_PUBLIC_KEY && process.env.GEIDEA_API_PASSWORD)
}

// صيغة الوقت المطلوبة بتوثيق جيديا: "Y/m/d H:i:s" مثال: 2026/07/17 14:05:33
function geideaTimestamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
}

// توقيع إنشاء الجلسة (من توثيق جيديا):
// Base64( HMAC-SHA256( publicKey + amount("0.00") + currency + merchantReferenceId + timestamp, apiPassword ) )
export function generateSessionSignature(
  publicKey: string, amount: number, currency: string,
  merchantReferenceId: string, apiPassword: string, timestamp: string
): string {
  const amountStr = amount.toFixed(2)
  const data = `${publicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`
  return createHmac('sha256', apiPassword).update(data).digest('base64')
}

// توقيع الـ callback (من توثيق جيديا — قسم Webhook/Callback Notifications):
// Base64( HMAC-SHA256( publicKey + amount + currency + orderId + status + merchantReferenceId + timestamp, apiPassword ) )
export function generateCallbackSignature(
  publicKey: string, amount: number, currency: string, orderId: string,
  status: string, merchantReferenceId: string, apiPassword: string, timestamp: string
): string {
  const amountStr = amount.toFixed(2)
  const data = `${publicKey}${amountStr}${currency}${orderId}${status}${merchantReferenceId}${timestamp}`
  return createHmac('sha256', apiPassword).update(data).digest('base64')
}

/**
 * ينشئ جلسة دفع لدى جيديا ويرجع رابط صفحة الدفع المستضافة (HPP).
 * تُستدعى من الخادم فقط (create-session route) — أبداً من المتصفح.
 *
 * schoolId يُضمَّن داخل merchantReferenceId بصيغة SCH-<uuid>-<timestamp>
 * والـ webhook يفكّه لاحقاً ليعرف أي مدرسة تُفعَّل.
 */
export async function createCheckoutSession(
  schoolId: string,
  customer?: { email?: string; phone?: string }
): Promise<CheckoutSession | null> {
  if (!isGatewayConfigured()) return null

  const publicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY!
  const apiPassword = process.env.GEIDEA_API_PASSWORD!
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shawahede.com'

  const merchantReferenceId = `SCH-${schoolId}-${Date.now()}`
  const timestamp = geideaTimestamp()
  const signature = generateSessionSignature(
    publicKey, ANNUAL_PLAN.amount, ANNUAL_PLAN.currency, merchantReferenceId, apiPassword, timestamp
  )

  const body: Record<string, any> = {
    amount: ANNUAL_PLAN.amount.toFixed(2),
    currency: ANNUAL_PLAN.currency,
    timestamp,
    merchantReferenceId,
    signature,
    paymentOperation: 'Pay',
    language: 'ar',
    // callbackUrl: إشعار خادم-لخادم بنتيجة الدفع (المصدر الموثوق للتفعيل)
    callbackUrl: `${siteUrl}/api/payment/webhook`,
    // returnUrl: رجوع المستخدم نفسه بعد إتمام الدفع (عرض فقط — التفعيل يتم بالـ webhook)
    returnUrl: `${siteUrl}/subscribe/success`,
  }
  if (customer?.email || customer?.phone) {
    body.customer = {
      ...(customer.email ? { email: customer.email } : {}),
      ...(customer.phone ? { phoneNumber: customer.phone, phonecountrycode: '+966' } : {}),
    }
  }

  const res = await fetch(`${GEIDEA_API_BASE}/payment-intent/api/v2/direct/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${publicKey}:${apiPassword}`).toString('base64'),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data || data.responseCode !== '000' || !data.session?.id) {
    throw new Error(data?.detailedResponseMessage || data?.responseMessage || `فشل إنشاء جلسة الدفع (${res.status})`)
  }

  // وضع التحويل (Redirection Mode) من توثيق جيديا:
  // https://www.ksamerchant.geidea.net/hpp/checkout/?<sessionId>
  return {
    url: `${GEIDEA_HPP_BASE}/hpp/checkout/?${data.session.id}`,
    reference: merchantReferenceId,
  }
}

/** يستخرج معرّف المدرسة من merchantReferenceId بصيغة SCH-<uuid>-<timestamp> */
export function schoolIdFromReference(reference: string | undefined | null): string | null {
  if (!reference) return null
  const m = reference.match(/^SCH-([0-9a-fA-F-]{36})-\d+$/)
  return m ? m[1] : null
}
