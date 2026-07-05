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
  principal_name: string | null
  phone: string | null
  email: string | null
  subscription_status: string
  subscription_start: string | null
  subscription_end: string
  allowed_domain_id: number | null
}

export function useSchool() {
  const router = useRouter()
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); router.push('/login'); return }

      const { data: schoolUser } = await supabase
        .from('school_users')
        .select('school_id, role')
        .eq('auth_id', user.id)
        .single()

      if (!schoolUser) { setLoading(false); router.push('/login'); return }

      setRole(schoolUser.role)

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolUser.school_id)
        .single()

      if (!schoolData) { setLoading(false); router.push('/login'); return }

      const isExpired = new Date(schoolData.subscription_end) < new Date()
      if (isExpired || schoolData.subscription_status === 'expired') {
        setLoading(false)
        router.push('/expired')
        return
      }

      setSchool(schoolData)
      setLoading(false)
    }
    load()
  }, [])

  // للحساب المجاني: مسموح مجال واحد فقط. للمدفوع: كل المجالات.
  const isTrial = school?.subscription_status === 'trial'
  const allowedDomainId = isTrial ? (school?.allowed_domain_id ?? 4) : null // null = الكل مسموح

  return { school, role, loading, isTrial, allowedDomainId }
}
