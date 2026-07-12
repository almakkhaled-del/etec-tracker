'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAVY = '#0B1F3A'
const GOLD_LIGHT = '#E8C275'
const DOMAIN_ICONS: Record<string, string> = { '1': '🏫', '2': '📚', '3': '📊', '4': '🏢' }

type Domain = { id: number; code: string; name_ar: string; order_num: number; pct?: number }

export default function AppSidebar({ activeDomainId }: { activeDomainId?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: schoolUser } = await supabase.from('school_users').select('school_id').eq('auth_id', user.id).single()
      if (!schoolUser) return

      const { data: domainsData } = await supabase.from('domains').select('*').order('order_num')
      const { data: standards } = await supabase.from('standards').select('id, domain_id')
      const { data: indicators } = await supabase.from('indicators').select('id, standard_id')
      const { data: evidences } = await supabase.from('evidences').select('id, indicator_id').eq('school_id', schoolUser.school_id)

      if (domainsData && standards && indicators) {
        const evByIndicator: Record<number, number> = {}
        evidences?.forEach(e => { evByIndicator[e.indicator_id] = (evByIndicator[e.indicator_id] || 0) + 1 })
        const stdByDomain: Record<number, number[]> = {}
        standards.forEach(s => { if (!stdByDomain[s.domain_id]) stdByDomain[s.domain_id] = []; stdByDomain[s.domain_id].push(s.id) })
        const indByStd: Record<number, number[]> = {}
        indicators.forEach(i => { if (!indByStd[i.standard_id]) indByStd[i.standard_id] = []; indByStd[i.standard_id].push(i.id) })

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

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = (
    <>
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <Link href="/dashboard">
          <img src="/logo.png" alt="شواهدي" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '0 14px' }}>
        <Link href="/dashboard" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 4,
          background: pathname === '/dashboard' ? 'rgba(232,194,117,0.14)' : 'transparent',
          color: pathname === '/dashboard' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>🏠</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>الرئيسية</span>
        </Link>

        <p style={{ fontFamily: 'IBM Plex Sans Arabic, Tajawal, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', padding: '18px 14px 8px', margin: 0, letterSpacing: 1 }}>
          المجالات
        </p>

        {domains.map(domain => {
          const isActive = activeDomainId === domain.id || pathname === `/domain/${domain.id}`
          return (
            <Link key={domain.id} href={`/domain/${domain.id}`} className="sidebar-link" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
              textDecoration: 'none', marginBottom: 2,
              background: isActive ? 'rgba(232,194,117,0.14)' : 'transparent',
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
          background: pathname === '/forms' ? 'rgba(232,194,117,0.14)' : 'transparent',
          color: pathname === '/forms' ? GOLD_LIGHT : 'rgba(255,255,255,0.78)'
        }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>النماذج الجاهزة</span>
        </Link>

        <Link href="/print" className="sidebar-link" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
          textDecoration: 'none', marginBottom: 2,
          background: pathname === '/print' ? 'rgba(232,194,117,0.14)' : 'transparent',
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
    </>
  )

  return (
    <>
      <style>{`
        .sidebar-link:hover { background: rgba(255,255,255,0.06) !important; }
        @media (max-width: 860px) { .sidebar-desktop { display: none !important; } }
        @media (min-width: 861px) { .mobile-fab, .mobile-drawer, .mobile-overlay { display: none !important; } }

        .mobile-fab {
          position: fixed; bottom: 22px; left: 22px; z-index: 200;
          width: 54px; height: 54px; border-radius: 50%;
          background: #0B1F3A; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(11,31,58,0.35);
        }
        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(11,31,58,0.5);
          z-index: 199; opacity: 0; pointer-events: none; transition: opacity 0.25s;
        }
        .mobile-overlay.open { opacity: 1; pointer-events: auto; }
        .mobile-drawer {
          position: fixed; top: 0; right: 0; height: 100vh; width: 260px;
          background: #0B1F3A; z-index: 201;
          transform: translateX(100%); transition: transform 0.28s ease;
          display: flex; flex-direction: column; padding: 24px 0; overflow-y: auto;
        }
        .mobile-drawer.open { transform: translateX(0); }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="sidebar-desktop" style={{
        width: 252, background: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', padding: '28px 0', overflowY: 'auto'
      }}>
        {SidebarContent}
      </aside>

      {/* زر عائم للجوال */}
      <button className="mobile-fab" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="#E8C275" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* الخلفية المعتمة */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* القائمة المنزلقة */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 12px' }}>
          <button onClick={() => setMobileOpen(false)} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
            width: 32, height: 32, color: '#fff', fontSize: 16, cursor: 'pointer'
          }}>✕</button>
        </div>
        {SidebarContent}
      </div>
    </>
  )
}
