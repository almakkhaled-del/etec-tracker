import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export type SchoolData = {
  id: string
  name: string
  school_number: string | null
  region: string | null
  city: string | null
  school_type: string
  program: 'general' | 'early_childhood' | 'special_education'
  inclusion_pattern: 'full_inclusion' | 'spatial_inclusion' | 'independent' | null
  principal_name: string | null
  phone: string | null
  email: string | null
  subscription_status: string
  subscription_start: string | null
  subscription_end: string
  allowed_domain_id: number | null
  allowed_domains: string | null
}

// opts (اختيارية — كل الصفحات الحالية تشتغل بدون تغيير):
//   allowExpired: صفحة الاشتراك تحتاجها — منتهي الاشتراك لازم يقدر يدفع!
//     بدونها كان يصير loop: expired ← subscribe ← expired ...
//   nextPath: يُمرَّر لصفحة الدخول (?next=) ليرجع المستخدم لنفس الصفحة بعد الدخول.
export function useSchool(opts?: { allowExpired?: boolean; nextPath?: string }) {
  const router = useRouter()
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const loginUrl = opts?.nextPath ? `/login?next=${encodeURIComponent(opts.nextPath)}` : '/login'
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); router.push(loginUrl); return }

      const { data: schoolUser } = await supabase
        .from('school_users')
        .select('school_id, role')
        .eq('auth_id', user.id)
        .single()

      if (!schoolUser) { setLoading(false); router.push(loginUrl); return }

      setRole(schoolUser.role)

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolUser.school_id)
        .single()

      if (!schoolData) { setLoading(false); router.push(loginUrl); return }

      const isExpired = new Date(schoolData.subscription_end) < new Date()
      if ((isExpired || schoolData.subscription_status === 'expired') && !opts?.allowExpired) {
        setLoading(false)
        router.push('/expired')
        return
      }

      setSchool(schoolData)
      setLoading(false)
    }
    load()
  }, [])

  // للحساب المجاني: مسموح مجالات محددة فقط. للمدفوع: كل المجالات.
  const isTrial = school?.subscription_status === 'trial'
  const allowedDomainId = isTrial ? (school?.allowed_domain_id ?? 4) : null // null = الكل مسموح (توافق قديم)

  // قائمة المجالات المسموحة للتجريبي (من allowed_domains). للمدفوع: null = الكل
  const allowedDomains: number[] | null = isTrial
    ? (school?.allowed_domains
        ? school.allowed_domains.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
        : [4])
    : null

  return { school, role, loading, isTrial, allowedDomainId, allowedDomains }
}

