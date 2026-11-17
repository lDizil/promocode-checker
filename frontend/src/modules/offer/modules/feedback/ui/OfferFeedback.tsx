import type { FeedbackResponse } from '../api/feedback.dto.ts'
import { useOfferFeedback } from '../hooks/useOfferFeedback.ts'
import { FailReasonSheet } from './FailReasonSheet.tsx'
import { FeedbackBar } from './FeedbackBar.tsx'

export interface OfferFeedbackProps {
  offerId: string
  /** Ended offers hide the bar (DESIGN_SPEC 3.18). */
  disabled?: boolean
  /** Receives the server verdict after a real successful submission, queued or immediate. */
  onSubmitted?: (response: FeedbackResponse) => void
}

/**
 * Ready composite for the OfferCard footer (DESIGN_SPEC 3.18 + 3.19 + 5.2):
 * the bar, the reason sheet and the TanStack Query mutation behind them.
 */
export function OfferFeedback({ offerId, disabled = false, onSubmitted }: OfferFeedbackProps) {
  const feedback = useOfferFeedback(offerId, onSubmitted)

  return (
    <>
      <FeedbackBar
        state={disabled ? 'disabled' : feedback.state}
        fresh={feedback.fresh}
        queued={feedback.queued}
        reasonLabel={feedback.reasonLabel}
        pending={feedback.pending}
        onWorked={feedback.submitWorked}
        onFailed={() => feedback.setSheetOpen(true)}
        onChange={feedback.change}
      />
      <FailReasonSheet
        key={feedback.sheetOpen ? 'open' : 'closed'}
        open={feedback.sheetOpen}
        onOpenChange={feedback.setSheetOpen}
        onSubmit={feedback.submitFailed}
        pending={feedback.pending}
        error={feedback.error}
      />
    </>
  )
}
