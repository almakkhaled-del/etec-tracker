'use client'
import { useState } from 'react'
import { TEMPLATES, TemplateId } from './templates.config'
import { NAVY, GOLD, CREAM } from './SharedFormUI'
import OperationalPlanForm from './OperationalPlanForm'
import CommitteeDecisionForm from './CommitteeDecisionForm'
import MeetingMinutesForm from './MeetingMinutesForm'
import OrientationWeekForm from './OrientationWeekForm'
import SchoolStatusReportForm from './SchoolStatusReportForm'
import ImprovementPlanBuildForm from './ImprovementPlanBuildForm'
import ImprovementPlanExecuteForm from './ImprovementPlanExecuteForm'

interface FormsGeneratorPageProps { schoolPrincipalName: string; schoolName?: string }

export default function FormsGeneratorPage({ schoolPrincipalName, schoolName }: FormsGeneratorPageProps) {
  const [selected, setSelected] = useState<TemplateId | null>(null)
  const selectedMeta = TEMPLATES.find(t => t.id === selected)

  return (
    <main className="page-main" style={{ padding: '24px 28px', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {TEMPLATES.map(t => {
          const isSelected = selected === t.id
          const isDisabled = t.status === 'coming_soon'
          return (
            <button
              key={t.id}
              disabled={isDisabled}
              onClick={() => setSelected(t.id)}
              style={{
                textAlign: 'right', border: `1.5px solid ${isSelected ? GOLD : 'rgba(10,59,88,0.1)'}`,
                borderRadius: 14, padding: 14, background: isSelected ? 'rgba(31,110,150,0.06)' : '#fff',
                cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1,
                fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.title}</span>
                {isDisabled && (
                  <span style={{ fontSize: 10, background: CREAM, color: '#7A8896', borderRadius: 20, padding: '2px 8px' }}>قريباً</span>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#7A8896', margin: 0, fontFamily: 'IBM Plex Sans Arabic, sans-serif', lineHeight: 1.6 }}>{t.description}</p>
            </button>
          )
        })}
      </div>

      {selectedMeta?.status === 'ready' && (
        <div>
          {selected === 'operational_plan' && <OperationalPlanForm schoolName={schoolName} schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'committee_decision' && <CommitteeDecisionForm schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'meeting_minutes' && <MeetingMinutesForm schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'orientation_week_plan' && <OrientationWeekForm schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'school_status_report' && <SchoolStatusReportForm schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'improvement_plan_build' && <ImprovementPlanBuildForm schoolPrincipalName={schoolPrincipalName} />}
          {selected === 'improvement_plan_execute' && <ImprovementPlanExecuteForm schoolPrincipalName={schoolPrincipalName} />}
        </div>
      )}
    </main>
  )
}
