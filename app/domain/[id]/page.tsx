'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// هذه الصفحة أصبحت تحويلاً للوحة الرئيسية التي تفتح المجال in-place
export default function DomainRedirect() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard?domain=${id}`)
  }, [id, router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FBF8F2', fontFamily: 'Tajawal, sans-serif', direction: 'rtl'
    }}>
      <p style={{ color: '#8A8270' }}>جاري التحويل...</p>
    </div>
  )
}
