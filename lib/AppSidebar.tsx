'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAVY = '#0A3B58'
const GOLD_LIGHT = '#7FB3CB'

/* أيقونات خطية موحّدة تستبدل الإيموجي — لون واحد (يرث currentColor) */
function Icon({ name, size = 20, sw = 1.8 }: { name: string; size?: number; sw?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const }
  switch (name) {
    case 'home':
      return (<svg {...p}><path d="M4 11L12 4L20 11" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d="M6 10V20H18V10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d="M10 20V15H14V20" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>)
    case 'school':
      return (<svg {...p}><path d="M12 4L21 8.5V10H3V8.5L12 4Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /><path d="M5 10V20H19V10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d="M3 20H21" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    case 'book':
      return (<svg {...p}><path d="M12 6.2C10.2 4.7 6.8 4.2 4.3 4.6V17.3C6.8 16.9 10.2 17.4 12 18.9C13.8 17.4 17.2 16.9 19.7 17.3V4.6C17.2 4.2 13.8 4.7 12 6.2Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /><path d="M12 6.2V18.9" stroke="currentColor" strokeWidth={sw} /></svg>)
    case 'chart':
      return (<svg {...p}><path d="M5 20V11" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /><path d="M12 20V4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /><path d="M19 20V14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /><path d="M3 20H21" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    case 'building':
      return (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="1.2" stroke="currentColor" strokeWidth={sw} /><path d="M9 7.2H10M14 7.2H15M9 11H10M14 11H15M9 14.8H10M14 14.8H15" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /><path d="M10 21V17.2H14V21" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>)
    case 'forms':
      return (<svg {...p}><rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth={sw} /><path d="M9 8.5H15M9 12H15M9 15.5H13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    case 'generator':
      return (<svg {...p}><rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth={sw} /><path d="M8 9.5L10 12L8 14.5M12.5 14.5H16" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>)
    case 'upload':
      return (<svg {...p}><path d="M12 15V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d="M5 15v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>)
    case 'plans':
      return (<svg {...p}><rect x="4.5" y="6" width="15" height="13" rx="2.5" stroke="currentColor" strokeWidth={sw} /><path d="M12 6V3.5M12 3.5H10M12 3.5H14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /><circle cx="9" cy="12" r="1.1" fill="currentColor" /><circle cx="15" cy="12" r="1.1" fill="currentColor" /><path d="M9.5 15.5H14.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    case 'print':
      return (<svg {...p}><path d="M7 9V4H17V9" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /><rect x="4" y="9" width="16" height="7" rx="1.5" stroke="currentColor" strokeWidth={sw} /><path d="M7 14H17V20H7V14Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>)
    case 'support':
      return (<svg {...p}><path d="M5 6.5C5 5.4 5.9 4.5 7 4.5H17C18.1 4.5 19 5.4 19 6.5V14C19 15.1 18.1 16 17 16H10L6 19.5V16H7C5.9 16 5 15.1 5 14V6.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>)
    case 'user':
      return (<svg {...p}><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={sw} /><path d="M5.5 19C6 15.7 8.7 13.5 12 13.5C15.3 13.5 18 15.7 18.5 19" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    case 'logout':
      return (<svg {...p}><path d="M14 5H7C5.9 5 5 5.9 5 7V17C5 18.1 5.9 19 7 19H14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d="M16 8.5L19.5 12L16 15.5M19 12H10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>)
    case 'lock':
      return (<svg {...p}><rect x="5.5" y="10.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth={sw} /><path d="M8 10.5V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V10.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" /></svg>)
    default:
      return null
  }
}

const DOMAIN_ICON_NAME: Record<string, string> = { '1': 'building', '2': 'book', '3': 'chart', '4': 'school' }

const PROGRAM_INFO: Record<string, { label: string; icon: string }> = {
  general: { label: 'التعليم العام', icon: 'school' },
  early_childhood: { label: 'الطفولة المبكرة', icon: 'book' },
  special_education: { label: 'برامج التربية الخاصة', icon: 'user' },
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

  // رابط تنقّل موحّد — حالة نشطة أوضح (خلفية + شريط جانبي ذهبي + خط أعرض)
  function NavItem({ href, icon, label, active, accent }: { href: string; icon: string; label: string; active: boolean; accent?: string }) {
    return (
      <Link href={href} className="sidebar-link" style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 13,
        padding: '12px 16px', borderRadius: 12, textDecoration: 'none', marginBottom: 4,
        background: active ? 'rgba(127,179,203,0.16)' : 'transparent',
        color: accent || (active ? '#fff' : 'rgba(255,255,255,0.82)'),
        fontWeight: active ? 700 : 500,
      }}>
        {active && <span style={{ position: 'absolute', insetInlineStart: 0, top: '50%', transform: 'translateY(-50%)', width: 3.5, height: 22, background: GOLD_LIGHT, borderRadius: 99 }} />}
        <span style={{ display: 'flex', flexShrink: 0, color: accent || (active ? GOLD_LIGHT : 'rgba(255,255,255,0.72)') }}><Icon name={icon} size={21} /></span>
        <span style={{ fontSize: 15.5, lineHeight: 1.3 }}>{label}</span>
      </Link>
    )
  }

  const sectionHeader = (text: string) => (
    <p style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 11.5, fontWeight: 700, color: 'rgba(127,179,203,0.55)', padding: '20px 16px 9px', margin: 0, letterSpacing: 1.2 }}>
      {text}
    </p>
  )

  return (
    <>
      {/* شريط علوي ثابت بالجوال فقط — بديل عن الزر العائم القديم اللي كان
          يتراكب فوق محتوى الصفحات (مثل بطاقة الترحيب بالرئيسية). كل الصفحات
          تاخذ هامش علوي كافٍ (body padding-top بالستايل أدناه) عشان محتواها
          ما يختفي تحت الشريط أبداً. */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 54,
        background: NAVY, zIndex: 130, alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', boxShadow: '0 2px 10px rgba(10,59,88,0.18)'
      }}>
        {!mobileOpen && (
          <button onClick={() => setMobileOpen(true)} aria-label="فتح القائمة" style={{
            width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4.5,
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ width: 19, height: 2, background: '#fff', borderRadius: 1 }} />
            <span style={{ width: 19, height: 2, background: '#fff', borderRadius: 1 }} />
            <span style={{ width: 19, height: 2, background: '#fff', borderRadius: 1 }} />
          </button>
        )}
        <img src="/logo.png" alt="شواهدي" style={{ height: 25, filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* خلفية معتمة تقفل الدرج عند الضغط عليها — بالجوال فقط والدرج مفتوح */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="sidebar-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(10,30,45,0.5)', zIndex: 135
        }} />
      )}

      <aside className={`sidebar-desktop${mobileOpen ? ' sidebar-open' : ''}`} style={{
        width: 264, background: 'linear-gradient(178deg, #0C4364 0%, #0A3B58 55%, #082F48 100%)',
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', padding: '26px 0', overflowY: 'auto',
        borderInlineStart: '1px solid rgba(127,179,203,0.12)'
      }}>
        <style>{`
          .sidebar-link { transition: background 0.16s ease, color 0.16s ease; }
          .sidebar-link:hover { background: rgba(255,255,255,0.07) !important; }
          .sidebar-desktop::-webkit-scrollbar { width: 6px; }
          .sidebar-desktop::-webkit-scrollbar-thumb { background: rgba(127,179,203,0.25); border-radius: 99px; }
          @media (max-width: 860px) {
            .mobile-topbar { display: flex !important; }
            body { padding-top: 54px !important; }
            .sidebar-mobile-close { display: flex !important; }
            .sidebar-desktop {
              display: flex !important;
              position: fixed !important;
              top: 0 !important; bottom: 0 !important; right: 0 !important;
              height: 100vh !important;
              width: 82vw !important;
              max-width: 310px !important;
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
          display: 'none', position: 'absolute', top: 18, left: 18, width: 34, height: 34,
          borderRadius: 9, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          fontSize: 16, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', zIndex: 1
        }}>›</button>

        <div style={{ padding: '0 24px', marginBottom: 22 }}>
          <a href="https://www.shawahede.com" title="الصفحة الرئيسية">
            <img src="/logo.png" alt="شواهدي" style={{ height: 40, filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
          </a>
        </div>

        {programInfo && (
          <div style={{ padding: '0 20px', marginBottom: 8 }}>
            <div title={`تتابع مجالات الهيئة لـ: ${programInfo.label}`} style={{
              display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(127,179,203,0.13)',
              border: '1px solid rgba(127,179,203,0.28)', borderRadius: 12, padding: '10px 13px'
            }}>
              <span style={{ display: 'flex', flexShrink: 0, color: GOLD_LIGHT }}><Icon name={programInfo.icon} size={18} /></span>
              <span style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 12.5, fontWeight: 600, color: GOLD_LIGHT, lineHeight: 1.4 }}>
                {programInfo.label}
              </span>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '0 12px' }}>
          {sectionHeader('الاعتماد المدرسي')}

          <NavItem href="/dashboard" icon="home" label="الرئيسية" active={pathname === '/dashboard'} />

          {domains.map(domain => {
            const isActive = activeDomainId === domain.id
            const locked = isTrial && (isProgramSchool ? domain.code !== '4' : (allowedDomains != null && !allowedDomains.includes(domain.id)))
            if (locked) {
              return (
                <div key={domain.id} title="يتطلب الاشتراك" className="sidebar-link" style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '11px 16px', borderRadius: 12,
                  marginBottom: 3, cursor: 'not-allowed', opacity: 0.5, color: 'rgba(255,255,255,0.6)'
                }}>
                  <span style={{ display: 'flex', flexShrink: 0 }}><Icon name={DOMAIN_ICON_NAME[domain.code] || 'book'} size={20} /></span>
                  <span style={{ fontSize: 14.5, fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{domain.name_ar}</span>
                  <span style={{ display: 'flex', flexShrink: 0, opacity: 0.8 }}><Icon name="lock" size={15} /></span>
                </div>
              )
            }
            return (
              <Link key={domain.id} href={`/dashboard?domain=${domain.id}`} prefetch={false} className="sidebar-link" style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 13, padding: '11px 16px', borderRadius: 12,
                textDecoration: 'none', marginBottom: 3,
                background: isActive ? 'rgba(127,179,203,0.16)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', fontWeight: isActive ? 700 : 500
              }}>
                {isActive && <span style={{ position: 'absolute', insetInlineStart: 0, top: '50%', transform: 'translateY(-50%)', width: 3.5, height: 20, background: GOLD_LIGHT, borderRadius: 99 }} />}
                <span style={{ display: 'flex', flexShrink: 0, color: isActive ? GOLD_LIGHT : 'rgba(255,255,255,0.7)' }}><Icon name={DOMAIN_ICON_NAME[domain.code] || 'book'} size={20} /></span>
                <span style={{ fontSize: 14.5, flex: 1, lineHeight: 1.4 }}>{domain.name_ar}</span>
              </Link>
            )
          })}

          {sectionHeader('الأدوات الذكية')}

          <NavItem href="/forms" icon="forms" label="النماذج الجاهزة" active={pathname === '/forms'} />
          <NavItem href="/forms/generator" icon="generator" label="مولّد النماذج" active={pathname === '/forms/generator'} />
          {/* دُمج رابطا "خطة التحسين والتنفيذ وواقع المدرسة" و"الخطة التشغيلية
              الذكية" برابط واحد /forms/build-plans — الصفحتان القديمتان بقيتا
              شغّالتين بالكود (غير محذوفتين) لكن ما عادتا مرتبطتين من هنا. */}
          <NavItem href="/forms/build-plans" icon="plans" label="بناء الخطط الذكية" active={pathname === '/forms/build-plans'} />
          <NavItem href="/forms/smart-upload" icon="upload" label="الرفع الذكي للشواهد" active={pathname === '/forms/smart-upload'} />
          <NavItem href="/forms/activity-report" icon="forms" label="مولّد تقارير الأنشطة" active={pathname === '/forms/activity-report'} />
          <NavItem href="/print" icon="print" label="التقرير الكامل" active={pathname === '/print'} />
        </nav>

        <div style={{ padding: '0 12px', marginTop: 8, borderTop: '1px solid rgba(127,179,203,0.14)', paddingTop: 12 }}>
          {sectionHeader('الحساب والدعم')}

          <NavItem href="/account" icon="user" label="حسابي" active={pathname === '/account'} />

          <a href="https://wa.me/966555826838?text=السلام عليكم، أحتاج مساعدة في منصة شواهدي"
            target="_blank" rel="noreferrer" className="sidebar-link" style={{
            display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', borderRadius: 12,
            textDecoration: 'none', marginBottom: 4, color: '#4ade80', fontWeight: 500
          }}>
            <span style={{ display: 'flex', flexShrink: 0 }}><Icon name="support" size={21} /></span>
            <span style={{ fontSize: 15.5 }}>الدعم الفني</span>
          </a>

          <button onClick={handleLogout} className="sidebar-link" style={{
            display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '12px 16px',
            borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.62)', fontSize: 15.5, fontWeight: 500, fontFamily: 'Tajawal, sans-serif'
          }}>
            <span style={{ display: 'flex', flexShrink: 0 }}><Icon name="logout" size={21} /></span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}
