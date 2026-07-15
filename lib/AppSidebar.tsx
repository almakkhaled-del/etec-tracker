'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAVY = '#0A3B58'
const GOLD_LIGHT = '#7FB3CB'
const DOMAIN_ICONS: Record<string, string> = { '1': '🏫', '2': '📚', '3': '📊', '4': '🏢' }

const PROGRAM_INFO: Record<string, { label: string; icon: string }> = {
  general: { label: 'التعليم العام', icon: '🏫' },
  early_childhood: { label: 'الطفولة المبكرة', icon: '🧸' },
  special_education: { label: 'برامج التربية الخاصة', icon: '🤝' },
}

type Domain = { id: number; code: string; name_ar: string; order_num: number; pct?: number }

export default function AppSidebar({ activeDomainId }: { activeDomainId?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [isTrial, setIsTrial] = useState(false)
  const [allowedDomains, setAllowedDomains] = useState<number[] | null>(null)
  const [program, setProgram] = useState<string | null>(null)
  const [schoolType, setSchoolType] = useState<string>('government')

  // درج قابل للطي بالجوال — قبل هذا التعديل كان الشريط الجانبي يختفي تماماً
  // بدون بديل بكل الصفحات ما عدا لوحة التحكم (اللي فيها بار سفلي منفصل خاص
  // بها فقط). زر عائم (سهم) يفتح الدرج، وزر داخل الدرج (سهم بالاتجاه
  // المعاكس) أو الخلفية المعتمة يقفله. يقفل تلقائياً عند الانتقال لصفحة جديدة.
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: schoolUser } = await supabase.from('school_users').select('school_id').eq('auth_id', user.id).single()
      if (!schoolUser) return
      setSchoolId(schoolUser.school_id)

      const { data: schoolData } = await supabase.from('schools').select('subscription_status, allowed_domains, program, school_type').eq('id', schoolUser.school_id).single()
      const schoolProgram = schoolData?.program || 'general'
      const usingProgram = schoolProgram === 'early_childhood' || schoolProgram === 'special_education'
      if (schoolData) {
        setProgram(schoolProgram)
        setSchoolType(schoolData.school_type || 'government')
        const trial = schoolData.subscription_status === 'trial'
        setIsTrial(trial)
        if (trial) {
          if (usingProgram) {
            setAllowedDomains(null) // القفل عند البرنامجين الجديدين يتحقق من الكود لا من رقم المجال
          } else {
            const list = schoolData.allowed_domains
              ? schoolData.allowed_domains.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n))
              : [4]
            setAllowedDomains(list)
          }
        } else {
          setAllowedDomains(null)
        }
      }

      const domainsTable = usingProgram ? 'program_domains' : 'domains'
      const standardsTable = usingProgram ? 'program_standards' : 'standards'
      const indicatorsTable = usingProgram ? 'program_indicators' : 'indicators'
      const evField = usingProgram ? 'program_indicator_id' : 'indicator_id'

      let domainsQuery = supabase.from(domainsTable).select('*').order('order_num')
      if (usingProgram) domainsQuery = domainsQuery.eq('program', schoolProgram)
      const { data: domainsData } = await domainsQuery
      const { data: standards } = await supabase.from(standardsTable).select('id, domain_id')
      const { data: indicators } = await supabase.from(indicatorsTable).select('id, standard_id')
      const { data: evidences } = await supabase.from('evidences').select(`id, ${evField}`).eq('school_id', schoolUser.school_id)

      if (domainsData && standards && indicators) {
        const evByIndicator: Record<number, number> = {}
        evidences?.forEach((e: any) => { const key = e[evField]; if (key != null) evByIndicator[key] = (evByIndicator[key] || 0) + 1 })
        const stdByDomain: Record<number, number[]> = {}
        standards.forEach((s: any) => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })
        const indByStd: Record<number, number[]> = {}
        indicators.forEach((i: any) => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

        const enriched = domainsData.map(d => {
          const stdIds = stdByDomain[d.id] || []
          const indIds = stdIds.flatMap(sid => indByStd[sid] || [])
          const completed = indIds.filter(id => (evByIndicator[id] || 0) > 0).length
          const pct = indIds.length ? Math.round((completed / indIds.length) * 100) : 0
          return { ...d, pct }
        })
        setDomains(enriched)
      }
    }
    load()
  }, [])

  const isProgramSchool = program === 'early_childhood' || program === 'special_education'
  const programInfo = program ? (PROGRAM_INFO[program] || PROGRAM_INFO.general) : null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* زر فتح الدرج — عائم، يظهر فقط بالجوال، ويختفي والدرج مفتوح */}
      {!mobileOpen && (
        <button onClick={() => setMobileOpen(true)} aria-label="فتح القائمة" className="sidebar-mobile-toggle" style={{
          display: 'none', position: 'fixed', top: 14, right: 14, zIndex: 120,
          width: 42, height: 42, borderRadius: 12, background: NAVY, border: 'none',
          color: '#fff', fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,59,88,0.28)',
          alignItems: 'center', justifyContent: 'center'
        }}>‹</button>
      )}

      {/* خلفية معتمة تقفل الدرج عند الضغط عليها — بالجوال فقط والدرج مفتوح */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="sidebar-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(10,30,45,0.5)', zIndex: 135
        }} />
      )}

      <aside className={`sidebar-desktop${mobileOpen ? ' sidebar-open' : ''}`} style={{
        width: 252, background: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', padding: '28px 0', overflowY: 'auto'
      }}>
        <style>{`
          .sidebar-link:hover { background: rgba(255,255,255,0.06) !important; }
          @media (max-width: 860px) {
            .sidebar-mobile-toggle { display: flex !important; }
            .sidebar-mobile-close { display: flex !important; }
            .sidebar-desktop {
              display: flex !important;
              position: fixed !important;
              top: 0 !important; bottom: 0 !important; right: 0 !important;
              height: 100vh !important;
              width: 80vw !important;
              max-width: 300px !important;
              z-index: 140;
              transform: translateX(100%);
              transition: transform 0.25s ease;
              box-shadow: -8px 0 28px rgba(0,0,0,0.28);
            }
            .sidebar-desktop.sidebar-open { transform: translateX(0); }
          }
        `}</style>

        {/* زر إغلاق الدرج — داخل الدرج نفسه، يظهر فقط بالجوال */}
        <button onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" className="sidebar-mobile-close" style={{
          display: 'none', position: 'absolute', top: 18, left: 18, width: 32, height: 32,
          borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          fontSize: 15, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', zIndex: 1
        }}>›</button>

      <div style={{ padding: '0 24px', marginBottom: 20 }}>
        <a href="https://www.shawahede.com" title="الصفحة الرئيسية">
          <img src="/logo.png" alt="شواهدي" style={{ height: 36, filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
        </a>
      </div>

      {programInfo && (
        <div style={{ padding: '0 24px', marginBottom: 24 }}>
          <div title={`تتابع مجالات الهيئة لـ: ${programInfo.label}`} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(127,179,203,0.12)',
            border: '1px solid rgba(127,179,203,0.25)', borderRadius: 10, padding: '8px 12px'
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{programInfo.icon}</span>
            <span style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 11.5, fontWeight: 600, color: GOLD_LIGHT, lineHeight: 1.4 }}>
              {programInfo.label}
            </span>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: '0 14px' }}>
        <Link href="/dashboard" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 4,
          background: pathname === '/dashboard' ? 'rgba(127,179,203,0.14)' : 'transparent',
          color: pathname === '/dashboard' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>🏠</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>الرئيسية</span>
        </Link>

        <p style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', padding: '18px 14px 8px', margin: 0, letterSpacing: 1 }}>
          المجالات
        </p>

        {domains.map(domain => {
          const isActive = activeDomainId === domain.id
          const locked = isTrial && (isProgramSchool ? domain.code !== '4' : (allowedDomains != null && !allowedDomains.includes(domain.id)))
          if (locked) {
            return (
              <div key={domain.id} title="يتطلب الاشتراك" className="sidebar-link" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
                marginBottom: 2, cursor: 'not-allowed', opacity: 0.45,
                color: 'rgba(255,255,255,0.6)'
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{DOMAIN_ICONS[domain.code]}</span>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{domain.name_ar}</span>
                <span style={{ fontSize: 12, flexShrink: 0 }}>🔒</span>
              </div>
            )
          }
          return (
            <Link key={domain.id} href={`/dashboard?domain=${domain.id}`} prefetch={false} className="sidebar-link" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
              textDecoration: 'none', marginBottom: 2,
              background: isActive ? 'rgba(127,179,203,0.14)' : 'transparent',
              color: isActive ? GOLD_LIGHT : 'rgba(255,255,255,0.72)'
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{DOMAIN_ICONS[domain.code]}</span>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{domain.name_ar}</span>
              <span style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif', fontSize: 11, opacity: 0.7, flexShrink: 0 }}>{domain.pct ?? 0}%</span>
            </Link>
          )
        })}

        <p style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', padding: '18px 14px 8px', margin: 0, letterSpacing: 1 }}>
          أخرى
        </p>

        <Link href="/forms" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2,
          background: pathname === '/forms' ? 'rgba(127,179,203,0.14)' : 'transparent',
          color: pathname === '/forms' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>النماذج الجاهزة</span>
        </Link>

        <Link href="/forms/generator" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2,
          background: pathname === '/forms/generator' ? 'rgba(127,179,203,0.14)' : 'transparent',
          color: pathname === '/forms/generator' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>🧾</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>مولّد النماذج</span>
        </Link>

        {/* دُمج رابطا "خطة التحسين والتنفيذ وواقع المدرسة" و"الخطة التشغيلية
            الذكية" برابط واحد /forms/build-plans — الصفحتان القديمتان بقيتا
            شغّالتين بالكود (غير محذوفتين) لكن ما عادتا مرتبطتين من هنا. */}
        <Link href="/forms/build-plans" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2,
          background: pathname === '/forms/build-plans' ? 'rgba(127,179,203,0.14)' : 'transparent',
          color: pathname === '/forms/build-plans' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>بناء الخطط</span>
        </Link>

        <Link href="/print" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2,
          background: pathname === '/print' ? 'rgba(127,179,203,0.14)' : 'transparent',
          color: pathname === '/print' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>🖨️</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>التقرير الكامل</span>
        </Link>

        <a href="https://wa.me/966555826838?text=السلام عليكم، أحتاج مساعدة في منصة شواهدي"
          target="_blank" rel="noreferrer" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2, color: '#4ade80'
        }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>الدعم الفني</span>
        </a>
      </nav>

      <div style={{ padding: '0 14px' }}>
        <button onClick={handleLogout} className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px',
          borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'Tajawal, sans-serif'
        }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
      </aside>
    </>
  )
}




