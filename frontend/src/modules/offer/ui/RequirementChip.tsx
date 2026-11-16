import { Icon, type IconGlyph } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import type { Requirement } from '../model/offer.ts'
import styles from './RequirementChip.module.css'

export type RequirementKind = Requirement | 'no_card'

const PRESENTATION: Record<RequirementKind, { icon: IconGlyph; text: string; tone: 'neutral' | 'danger' | 'success' }> =
  {
    card: { icon: icons.CreditCard, text: 'Карта РФ', tone: 'neutral' },
    foreign_card: { icon: icons.CreditCard, text: 'Зарубежная карта', tone: 'danger' },
    phone: { icon: icons.Smartphone, text: 'Телефон', tone: 'neutral' },
    kyc: { icon: icons.IdCard, text: 'Подтверждение личности', tone: 'neutral' },
    corporate_domain: { icon: icons.AtSign, text: 'Корпоративная почта', tone: 'neutral' },
    student_status: { icon: icons.GraduationCap, text: 'Статус студента', tone: 'neutral' },
    no_card: { icon: icons.Check, text: 'Без карты', tone: 'success' },
  }

export interface RequirementChipProps {
  requirement: RequirementKind
  className?: string
}

/** DESIGN_SPEC 3.23: requirement chips on the free-offer page. */
export function RequirementChip({ requirement, className }: RequirementChipProps) {
  const { icon, text, tone } = PRESENTATION[requirement]
  return (
    <span className={[styles.chip, className].filter(Boolean).join(' ')} data-tone={tone}>
      <Icon icon={icon} size={16} />
      {text}
    </span>
  )
}
