import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export type SchoolData = {
  id: string
  name: string
  school_number: string | null
  region: string | null
  school_type: string
  principal_name: string | null
  subscription_status: string
  subscription_end: string
}

export function useSchool() {
  const router = useRouter()
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: schoolUser } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('auth_id', user.id)
        .single()

      if (!schoolUser) { router.push('/login'); return }

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolUser.school_id)
        .single()

      if (!schoolData) { router.push('/login'); return }

      const isExpired = new Date(schoolData.subscription_end) < new Date()
      if (isExpired || schoolData.subscription_status === 'expired') {
        router.push('/expired')
        return
      }

      setSchool(schoolData)
      setLoading(false)
    }
    load()
  }, [])

  return { school, loading }
}
