'use client'
import { useSchool } from '@/lib/useSchool'
import AppSidebar from '@/lib/AppSidebar'
import Link from 'next/link'
import FormsGeneratorPage from '@/components/forms-generator/FormsGeneratorPage'

export default function Page() {
  const { school } = useSchool()

  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F2', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

          <header style={{ background: '#fff', borderBottom: '1px solid rgba(11,31,58,0.08)', padding: '0 28px', height: 80, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <Link href="/forms" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(11,31,58,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#8A8270', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>← النماذج</Link>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A', margin: '0 0 1px' }}>مولّد النماذج</p>
              <p style={{ fontSize: 12, color: '#8A8270', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>اختر النموذج وعبّي بياناته — الملف جاهز بالكامل</p>
            </div>
          </header>

          <FormsGeneratorPage schoolName={school?.name || ''} schoolPrincipalName={school?.principal_name || ''} />

        </div>
      </div>
    </div>
  )
}
